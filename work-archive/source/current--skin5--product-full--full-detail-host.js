/* Host the unmodified product interaction document as one viewport, not fragments. */
(() => {
 const map={30:'dg-05',34:'dg-03',32:'dg-01',33:'dg-02',35:'dg-04',37:'dg-06',38:'dg-07',40:'dg-09',36:'dg-09',41:'dg-10',46:'dg-10',42:'dg-11',43:'dg-12',44:'dg-13',45:'dg-14',47:'dg-16'};
 const no=new URLSearchParams(location.search).get('product_no')||(location.pathname.match(/\/product\/[^/]+\/(\d+)/)||[])[1];
 if(!map[no]||new URLSearchParams(location.search).get('detail_native')==='1')return;
 const prefix=(location.pathname.match(/^\/skin-[^/]+/)||[''])[0];
 const info=document.querySelector('.xans-product-detail .infoArea');if(!info)return;
 const params=new URLSearchParams({product_no:no,name:info.querySelector('h1')?.textContent.trim()||'',price:info.querySelector('#span_product_price_sale,#span_product_price_text')?.textContent.trim()||'',reviews:document.querySelector('a[name="use_review"] span')?.textContent.trim()||'0'});
 const buy=info.querySelector('.productAction .action_button > a.btnSubmit');
 params.set('soldout',!buy||buy.closest('.displaynone')?'1':'0');
 const frame=document.createElement('iframe');frame.title='상품 상세페이지';frame.className='dhg-full-detail-frame';frame.allow='autoplay';
 frame.style.cssText='position:fixed;z-index:10000;inset:0 auto 0 50%;transform:translateX(-50%);display:block;width:min(390px,100vw);height:100%;height:100dvh;border:0;background:white';
 frame.src=location.origin+prefix+['','product-full',map[no]+'.html'].join('/')+'?'+params.toString()+'&v=20261029-hero5';
 const desktopStyle=document.createElement('style');desktopStyle.textContent='@media(min-width:1024px){.dhg-full-detail-frame{width:100vw!important;max-width:none!important;box-shadow:none!important}}';document.head.append(desktopStyle);
 frame.onload=()=>{document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';};
 document.body.append(frame);
 addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='dhg-native-purchase')return;
  const qty=Number(e.data.quantity);
  if(!Number.isInteger(qty)||qty<1||qty>100||!buy||buy.closest('.displaynone'))return;
  const quantity=info.querySelector('#quantity, input[name="quantity"]');
  if(quantity){quantity.value=String(qty);quantity.dispatchEvent(new Event('change',{bubbles:true}));quantity.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true}));}
  buy.click();
 });
})();
