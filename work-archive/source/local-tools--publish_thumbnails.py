#!/usr/bin/env python3
"""Scoped Cafe24 product-thumbnail publication. Credentials stay in local tools only."""
from pathlib import Path
import argparse, base64, hashlib, json, sys, datetime, time, io
from urllib.request import urlopen
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent / 'cafe24-local-tools'))
import cafe24_local as cafe24

IDS = {32,33,34,35,36,37,39,40,41,42,43,44,45,46,47}
FIELDS = ['list_image','tiny_image','small_image']
def sha(data): return hashlib.sha256(data).hexdigest()
def readjson(path): return json.loads(path.read_text())
def save(path, value): path.write_text(json.dumps(value, ensure_ascii=False, indent=2))
def now(): return datetime.datetime.now().astimezone().isoformat()
def summary(p):
    return {'product_no':p['product_no'],'product_name':p['product_name'],
        'image_upload_type':p.get('image_upload_type'),
        'images':{k:p.get(k) for k in ['detail_image']+FIELDS},
        'guard':{k:p.get(k) for k in ['display','selling','price']},
        'description_sha256':sha((p.get('description') or '').encode()),
        'mobile_description_sha256':sha((p.get('mobile_description') or '').encode())}
def get(env, pid):
    data,_=cafe24.api_request(env,'GET',f'/admin/products/{pid}',query={'shop_no':1})
    return summary(data['product'])
def same_non_thumbnail(a,b):
    for key in ['product_no','product_name','guard','description_sha256','mobile_description_sha256']:
        assert a[key]==b[key],f'Non-image field changed: {a["product_no"]} {key}'
    assert a['images']['detail_image']==b['images']['detail_image'],'Detail image changed'

def verify_image(published, source, field):
    actual=Image.open(io.BytesIO(published)).convert('RGB')
    expected=Image.open(io.BytesIO(source)).convert('RGB')
    assert abs(actual.width/actual.height-expected.width/expected.height)<0.001,'Image was cropped'
    assert min(actual.size)>=(400 if field=='list_image' else 40),'Image too small'
    width=min(256,actual.width,expected.width)
    size=(width,round(width*expected.height/expected.width))
    diff=ImageStat.Stat(ImageChops.difference(actual.resize(size,Image.Resampling.LANCZOS),expected.resize(size,Image.Resampling.LANCZOS)))
    # Cafe24 can asynchronously resize/recompress uploaded media (observed33:1254→1024).
    assert max(diff.mean)<2.5 and max(diff.rms)<5,'Published image differs visually from selected source'
    return {'sha256':sha(published),'bytes':len(published),'dimensions':list(actual.size),
        'exact_upload_bytes':sha(published)==sha(source),'mean_abs_difference_normalized':diff.mean,'rms_normalized':diff.rms}

def prepare():
    selected=readjson(ROOT/'deployment-selection.json')['products']
    assert {p['product_no'] for p in selected}==IDS
    out=ROOT/'uploads';out.mkdir(exist_ok=True)
    records=[]
    for p in selected:
        src=Path(p['source_path'])
        if not src.is_absolute(): src=ROOT.parent/src
        assert sha(src.read_bytes())==p['sha256']
        im=Image.open(src);im.load()
        if 'A' in im.getbands(): assert im.getchannel('A').getextrema()==(255,255),'Unexpected transparency'
        dest=out/f'product-{p["product_no"]}-latest.jpg'
        im.convert('RGB').save(dest,'JPEG',quality=95,subsampling=0,optimize=True)
        records.append({'product_no':p['product_no'],'selected_version':p['selected_version'],
            'source_sha256':p['sha256'],'upload_path':str(dest.relative_to(ROOT)),
            'upload_sha256':sha(dest.read_bytes()),'bytes':dest.stat().st_size,'dimensions':list(im.size),
            'encoding':'JPEG quality95, no resize/crop/content edits'})
    save(ROOT/'upload-manifest.json',{'created_at':now(),'products':records})
    print('Prepared',len(records),'thumbnails;',sum(p['bytes'] for p in records),'bytes')

def publish(ids):
    assert set(ids)<=IDS and 38 not in ids
    env=cafe24.load_env();assert env['CAFE24_MALL_ID']=='dacreation'
    backups={p['product_no']:p for p in readjson(ROOT/'backups/product-images-before.json')['products']}
    originals=readjson(ROOT/'backups/original-image-manifest.json')
    for f in originals['files']:
        assert sha((ROOT/f['local']).read_bytes())==f['sha256'],'Backup corrupt or missing'
    records={p['product_no']:p for p in readjson(ROOT/'upload-manifest.json')['products']}
    logpath=ROOT/'publish-result.json'
    log=readjson(logpath) if logpath.exists() else {'started_at':now(),'products':[]}
    completed={p['product_no']:p for p in log['products']}
    # Preserve the complete 38 control before each batch.
    assert get(env,38)==backups[38],'Preserved product38 differs from baseline'
    for pid in ids:
        before=get(env,pid);baseline=backups[pid]
        if pid in completed:
            assert before==completed[pid]['after'],'Previously published item changed concurrently'
            print('Already verified',pid,flush=True);continue
        rec=records[pid];data=(ROOT/rec['upload_path']).read_bytes()
        assert sha(data)==rec['upload_sha256']
        recovered=False
        if before != baseline:
            # A previous successful POST may have become visible after the immediate GET.
            # Recover only when all immutable fields and the exact requested image bytes match.
            same_non_thumbnail(baseline,before)
            assert all(before['images'][k]!=baseline['images'][k] for k in FIELDS),f'Concurrent image change {pid}'
            after=before;recovered=True
        else:
            encoded='data:image/jpeg;base64,'+base64.b64encode(data).decode('ascii')
            request={'image_upload_type':'B',**{field:encoded for field in FIELDS}}
            # No blind POST retry: inspect product state if request outcome is unknown.
            cafe24.api_request(env,'POST',f'/admin/products/{pid}/images',
                payload={'shop_no':1,'request':request},retry=False)
            for delay in [0,1,2,4,8]:
                if delay:time.sleep(delay)
                after=get(env,pid);same_non_thumbnail(before,after)
                if all(after['images'][k]!=before['images'][k] for k in FIELDS):break
            assert all(after['images'][k]!=before['images'][k] for k in FIELDS),'Image processing has not become visible; inspect state before retry'
        checks=[]
        for field in FIELDS:
            with urlopen(after['images'][field],timeout=30) as response: published=response.read()
            checks.append({'field':field,**verify_image(published,data,field)})
        log['products'].append({'product_no':pid,'published_at':now(),'after':after,'image_checks':checks,'recovered_verified_post':recovered})
        save(logpath,log)
        print('Published and verified',pid,after['product_name'],flush=True)
    assert get(env,38)==backups[38],'Product38 changed'
    log['checked_at']=now();log['product38_unchanged']=True;save(logpath,log)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','publish']);p.add_argument('--products',type=int,nargs='+')
    a=p.parse_args()
    if a.mode=='prepare':prepare()
    else:
        assert a.products,'Explicit product IDs required'
        publish(a.products)
