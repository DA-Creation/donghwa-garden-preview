import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
    if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    if(!(await stat(target)).isFile())throw new Error('Not a file');
    const body=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404);res.end('Not found');}
});
const port=Number(process.env.PORT)||8781;
server.listen(port,'127.0.0.1',()=>console.log(`Donghwa meal quiz: http://127.0.0.1:${port}/`));
