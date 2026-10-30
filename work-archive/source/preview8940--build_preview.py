from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlparse
import urllib.request,concurrent.futures,hashlib,re,json
ROOT=Path(__file__).resolve().parent
ORIGIN='https://dacreation.cafe24.com'
URL=ORIGIN+'/skin-skin5/product/list.html?cate_no=42'
soup=BeautifulSoup((ROOT/'source-market.html').read_text(),'html.parser')
assets=ROOT/'assets';assets.mkdir(exist_ok=True)
# Preserve the deployed UI scripts. Commerce handoffs use the original product links.
keepjs={'dhg-signup-bar.js','dhg-desktop-refinement.js','dhg-wide-event-v2.js','dhg-secondary-header.js','cafe24-market.js','dhg-shared-shell.js','dhg-market-prices.js'}
for i,tag in enumerate(list(soup.find_all('script',src=False))):
 if i not in {3,4,5,7,8,9,10,14}:tag.decompose()
for tag in list(soup.find_all('script',src=True)):
 if Path(urlparse(tag['src']).path).name not in keepjs:tag.decompose()
fetches={}
for tag in soup.find_all(['script','link']):
 attr='src' if tag.name=='script' else 'href'
 if attr not in tag.attrs:continue
 if tag.name=='link' and 'stylesheet' not in tag.get('rel',[]):continue
 url=urljoin(URL,tag[attr]);ext='.js' if tag.name=='script' else '.css'
 name=Path(urlparse(url).path).name
 if not name.endswith(ext):name='optimized-'+hashlib.sha256(url.encode()).hexdigest()[:10]+ext
 local='/assets/'+name
 fetches[url]=(name,ext)
 tag[attr]=local

def fetch(item):
 url,(name,ext)=item
 p=assets/name
 if not p.exists() or name=='cafe24-market.js':
  text=urllib.request.urlopen(url,timeout=25).read().decode('utf-8','replace')
  if ext=='.css':
   text=re.sub(r'url\(\s*([\x27\"]?)([^)\x27\"]+)\1\s*\)',lambda m:'url("'+(m.group(2) if m.group(2).startswith(('data:','#')) else urljoin(url,m.group(2)))+'")',text)
  p.write_text(text)
 return name
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for n in pool.map(fetch,fetches.items()):print(n)
# All original navigation still goes to the actual destination, except the new local detail.
for tag in soup.find_all(True):
 for attr in ['src','href','action','poster']:
  value=tag.get(attr)
  if not value or value.startswith(('data:','#','javascript:','mailto:','tel:','/assets/')):continue
  if tag.name=='script' and attr=='src':continue
  if tag.name=='link' and 'stylesheet' in tag.get('rel',[]):continue
  tag[attr]=urljoin(URL,value)
  if tag.name=='a' and attr=='href' and urlparse(tag[attr]).netloc=='dacreation.cafe24.com' and urlparse(tag[attr]).path=='/skin-skin5/product/list.html':
   tag[attr]='/skin-skin5/product/list.html'+('?' + urlparse(tag[attr]).query if urlparse(tag[attr]).query else '?cate_no=42')
# Raw DOM cards are cloned by the original cafe24-market.js, retaining each image mapping.
products=[]
for card in soup.select('[data-native-products] > .market-product'):
 id=int(card['id'].split('_')[-1])
 if not 30<=id<=47:card.decompose();continue
 card['data-preview-product']=str(id)
 image=card.select_one('.market-product__visual img')
 original=image['src'];image['data-original-src']=original;image['data-generated-src']=f'/thumbnails/product-{id}.png';image['data-product-thumbnail']=str(id)
 image['src']=f'/thumbnails/product-{id}.png' if (ROOT/'thumbnails'/f'product-{id}.png').exists() else original
 if id==39:
  for a in card.select('a[href]'):a['href']='http://127.0.0.1:8939/skin-skin5/product-full/dg-08.html?product_no=39'
 products.append({'product_no':id,'name':card.select_one('h3').get_text(' ',strip=True),'original_thumbnail_url':original,'generated_thumbnail_url':f'/thumbnails/product-{id}.png'})
# CSS embedded in deployed HTML has root-relative font paths.
for tag in soup.find_all('style'):
 if tag.string:tag.string=re.sub(r'url\(([\x27\"]?)(/[^)\x27\"]+)\1\)',lambda m:'url("'+ORIGIN+m.group(2)+'")',tag.string)
# No redesign: preview logic only replaces thumbnail URLs and maintains local filter state.
script=soup.new_tag('script',src='/assets/thumbnail-preview.js');script['defer']='';soup.body.append(script)
(ROOT/'index.html').write_text(str(soup))
(ROOT/'products.json').write_text(json.dumps(products,ensure_ascii=False,indent=2))
(ROOT/'thumbnails').mkdir(exist_ok=True)
(ROOT/'mobile.html').write_text('''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>동화가든 마켓 · 모바일</title><style>html,body{margin:0;background:#eee}iframe{display:block;width:390px;max-width:100%;height:844px;max-height:100vh;margin:0 auto;border:0;background:white}</style><iframe title="동화가든 마켓 390px 미리보기" src="/skin-skin5/product/list.html?cate_no=42"></iframe></html>''')
print('Built',len(products),'products')
