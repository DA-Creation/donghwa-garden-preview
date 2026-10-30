#!/usr/bin/env python3
"""Independent GET-only verification of registered Cafe24 image replacements."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import datetime, hashlib, io, json, sys
from PIL import Image, ImageChops, ImageStat, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent / 'cafe24-local-tools'))
import cafe24_local as api

IDS = list(range(32, 48))
CHANGED = [p for p in IDS if p != 38]
IMAGE_FIELDS = ['detail_image', 'list_image', 'tiny_image', 'small_image']
GUARDS = ['product_no', 'product_name', 'guard', 'description_sha256', 'mobile_description_sha256']
OUT = ROOT / 'evidence' / 'after-assets'
OUT.mkdir(parents=True, exist_ok=True)

def sha(b): return hashlib.sha256(b).hexdigest()
def read(p): return json.loads(p.read_text())
def write(p, d): p.write_text(json.dumps(d, ensure_ascii=False, indent=2))
def now(): return datetime.datetime.now().astimezone().isoformat()

baseline = {p['product_no']: p for p in read(ROOT / 'backups/product-images-before.json')['products']}
originals = {(p['product_no'], p['field']): p for p in read(ROOT / 'backups/original-image-manifest.json')['files']}
uploads = {p['product_no']: p for p in read(ROOT / 'upload-manifest.json')['products']}
published = {p['product_no']: p for p in read(ROOT / 'publish-result.json')['products']}
env, token = api.load_env(), api.load_tokens()
assert env['CAFE24_MALL_ID'] == 'dacreation'
assert not api.token_is_expiring(token), 'Parent must refresh; this verifier performs GET only.'
headers = api.auth_headers(env, token)

def get_product(pid):
    fields = ['product_no', 'product_name', 'image_upload_type', 'display', 'selling', 'price',
              'description', 'mobile_description'] + IMAGE_FIELDS
    q = urlencode({'shop_no': 1, 'fields': ','.join(fields)})
    data, _ = api.request_json('GET', f'{api.api_base(env)}/admin/products/{pid}?{q}', headers=headers)
    p = data['product']
    item = {'product_no': p['product_no'], 'product_name': p['product_name'],
            'image_upload_type': p.get('image_upload_type'),
            'images': {f: p.get(f) for f in IMAGE_FIELDS},
            'guard': {k: p.get(k) for k in ['display', 'selling', 'price']},
            'description_sha256': sha((p.get('description') or '').encode()),
            'mobile_description_sha256': sha((p.get('mobile_description') or '').encode())}
    old = baseline[pid]
    checks = {f'{k}_unchanged': item[k] == old[k] for k in GUARDS}
    checks['detail_image_url_unchanged'] = item['images']['detail_image'] == old['images']['detail_image']
    if pid == 38:
        checks['all_product38_fields_unchanged'] = item == old
    else:
        checks['three_thumbnail_urls_replaced'] = all(item['images'][k] != old['images'][k] for k in IMAGE_FIELDS[1:])
        checks['matches_publication_record'] = item == published[pid]['after']
        checks['individual_image_upload_type'] = item['image_upload_type'] == 'B'
    return {'product_no': pid, 'after': item, 'checks': checks, 'passed': all(checks.values())}

with ThreadPoolExecutor(max_workers=3) as pool:
    products = list(pool.map(get_product, IDS))
print('GET verified products:', len(products), 'passed:', sum(p['passed'] for p in products), flush=True)
current = {p['product_no']: p['after'] for p in products}

def get_image(pair):
    pid, field = pair
    url = current[pid]['images'][field]
    req = Request(url, method='GET', headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(req, timeout=45) as response:
        data, status, mime = response.read(), response.status, response.headers.get('Content-Type')
    im = Image.open(io.BytesIO(data)); fmt = im.format; im.verify()
    actual = Image.open(io.BytesIO(data)).convert('RGB')
    rec = {'product_no': pid, 'field': field, 'url': url, 'status': status, 'mime': mime,
           'sha256': sha(data), 'bytes': len(data), 'dimensions': list(actual.size), 'format': fmt, 'decoded': True}
    if pid == 38 or field == 'detail_image':
        rec['check_type'] = 'preserved_original'
        rec['unchanged_original_bytes'] = rec['sha256'] == originals[(pid, field)]['sha256']
        rec['passed'] = status == 200 and rec['unchanged_original_bytes']
    else:
        upload = uploads[pid]
        source = (ROOT / upload['upload_path']).read_bytes()
        assert sha(source) == upload['upload_sha256']
        expected = Image.open(io.BytesIO(source)).convert('RGB')
        width = min(256, actual.width, expected.width)
        size = (width, round(width * expected.height / expected.width))
        diff = ImageStat.Stat(ImageChops.difference(actual.resize(size, Image.Resampling.LANCZOS), expected.resize(size, Image.Resampling.LANCZOS)))
        rec.update({'check_type': 'replacement_visually_matches_upload', 'source_sha256': sha(source),
                    'exact_upload_bytes': sha(source) == sha(data),
                    'same_aspect_ratio': abs(actual.width / actual.height - expected.width / expected.height) < 0.001,
                    'sufficient_resolution': min(actual.size) >= (400 if field == 'list_image' else 40),
                    'mean_abs_difference_normalized': diff.mean, 'rms_normalized': diff.rms})
        rec['passed'] = status == 200 and rec['same_aspect_ratio'] and rec['sufficient_resolution'] and max(diff.mean) < 2.5 and max(diff.rms) < 5
        ext = 'jpg' if fmt == 'JPEG' else fmt.lower()
        dest = OUT / str(pid) / f'{field}.{ext}'
        dest.parent.mkdir(exist_ok=True)
        dest.write_bytes(data)
        rec['local'] = str(dest.relative_to(ROOT))
    return rec

with ThreadPoolExecutor(max_workers=8) as pool:
    images = list(pool.map(get_image, [(pid, f) for pid in IDS for f in IMAGE_FIELDS]))
thumbs = [r for r in images if r['check_type'] == 'replacement_visually_matches_upload']
preserved = [r for r in images if r['check_type'] == 'preserved_original']
print('CDN verified images:', len(images), 'passed:', sum(r['passed'] for r in images), flush=True)

# Audit contact sheet: each panel is the actual public list_image response.
cell, margin, cols = 288, 16, 5
font = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 18)
small = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 16)
labels = {}
for pid in CHANGED:
    lines, line = [], ''
    for char in f'{pid}  {current[pid]["product_name"]}':
        if font.getlength(line + char) > cell:
            lines.append(line); line = char
        else: line += char
    lines.append(line)
    labels[pid] = lines
label_h = max(map(len, labels.values())) * 22 + 36
canvas = Image.new('RGB', (cols * cell + (cols + 1) * margin, 3 * (cell + label_h + margin) + margin), 'white')
draw = ImageDraw.Draw(canvas)
for i, pid in enumerate(CHANGED):
    rec = next(r for r in thumbs if r['product_no'] == pid and r['field'] == 'list_image')
    im = Image.open(ROOT / rec['local']).convert('RGB')
    im.thumbnail((cell, cell), Image.Resampling.LANCZOS)
    x, y = margin + (i % cols) * (cell + margin), margin + (i // cols) * (cell + label_h + margin)
    canvas.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))
    for line_no, line in enumerate(labels[pid]):
        draw.text((x, y + cell + 5 + line_no * 22), line, fill='black', font=font)
    draw.text((x, y + cell + label_h - 24), f'Public list_image · {rec["dimensions"][0]}×{rec["dimensions"][1]}', fill='#555555', font=small)
contact = ROOT / 'evidence' / 'after-contact-sheet.jpg'
canvas.save(contact, 'JPEG', quality=94)

result = {'checked_at': now(), 'method': 'Independent GET-only API read plus public CDN decode/source comparison; no remote writes or auth refresh.',
          'scope': {'products': IDS, 'replaced_product_ids': CHANGED, 'preserve_product_id': 38},
          'summary': {'api_products': len(products), 'api_products_passed': sum(p['passed'] for p in products),
                      'replacement_image_fields': len(thumbs), 'replacement_image_fields_passed': sum(r['passed'] for r in thumbs),
                      'preserved_image_fields': len(preserved), 'preserved_image_fields_passed': sum(r['passed'] for r in preserved),
                      'replacement_exact_byte_matches': sum(r['exact_upload_bytes'] for r in thumbs),
                      'maximum_normalized_channel_mae': max(max(r['mean_abs_difference_normalized']) for r in thumbs),
                      'maximum_normalized_channel_rms': max(max(r['rms_normalized']) for r in thumbs),
                      'product38_unchanged': next(p for p in products if p['product_no'] == 38)['passed'],
                      'all_detail_images_unchanged_by_url_and_bytes': all(p['checks']['detail_image_url_unchanged'] for p in products) and all(r['passed'] for r in images if r['field'] == 'detail_image'),
                      'all_nonimage_guards_unchanged': all(all(p['checks'][f'{k}_unchanged'] for k in GUARDS) for p in products)},
          'passed': all(p['passed'] for p in products) and all(r['passed'] for r in images),
          'products': products, 'images': images, 'contact_sheet': str(contact.relative_to(ROOT)),
          'public_market_html': {'status': 'independent read-only audit pending', 'evidence': 'evidence/public-market-after.json'},
          'browser_qa': 'Owned by root; not performed by this verifier.'}
write(ROOT / 'verification-after.json', result)
print(json.dumps(result['summary'], ensure_ascii=False))
assert result['passed'], 'See verification-after.json for failed checks.'
