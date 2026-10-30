from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
import json,re
ROOT=Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_GET(self):
  url=urlsplit(self.path)
  if url.path=='/thumbnail-manifest.json':
   data={str(i):str((ROOT/'thumbnails'/f'product-{i}.png').stat().st_mtime_ns) for i in range(30,48) if (ROOT/'thumbnails'/f'product-{i}.png').exists()}
   body=json.dumps(data).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
  if url.path in ['/','/index.html']:
   self.send_response(302);self.send_header('Location','/skin-skin5/product/list.html?cate_no=42');self.end_headers();return
  if url.path=='/skin-skin5/product/list.html':
   html=(ROOT/'index.html').read_text();sort=parse_qs(url.query).get('sort_method',[''])[0]
   if sort in ['1','3','4']:
    from bs4 import BeautifulSoup
    soup=BeautifulSoup(html,'html.parser');grid=soup.select_one('[data-native-products]');cards=list(grid.select(':scope>.market-product'))
    def price(c):
     matches=re.findall(r'([\d,]+)원',c.select_one('.dhg-native-spec').get_text());return int(matches[-1].replace(',','')) if matches else 0
    cards.sort(key=(lambda c:c.select_one('h3').get_text()) if sort=='1' else price,reverse=sort=='4')
    for c in cards:grid.append(c)
    html=str(soup)
   body=html.encode();self.send_response(200);self.send_header('Content-Type','text/html;charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
  return super().do_GET()
 def log_message(self,*a):pass
if __name__=='__main__':
 print('http://127.0.0.1:8940/skin-skin5/product/list.html?cate_no=42',flush=True)
 ThreadingHTTPServer(('127.0.0.1',8940),Handler).serve_forever()
