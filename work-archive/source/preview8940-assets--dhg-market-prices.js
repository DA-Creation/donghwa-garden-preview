(() => {
 const amount = value => {
  const match = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
 };
 function formatPrices(root=document) {
  root.querySelectorAll('.dhg-native-spec').forEach(spec => {
   if(spec.dataset.priceFormatted)return;
   const rows=Array.from(spec.children).map(el=>{
    const title=el.querySelector('.title');
    const label=(title?.textContent||'').replace(/[\s:]/g,'');
    const copy=el.cloneNode(true);copy.querySelector('.title')?.remove();
    return {el,title,label,value:amount(copy.textContent)};
   });
   const sale=rows.find(r=>r.label==='판매가');
   const discount=rows.find(r=>/^(할인판매가|할인가|최적할인가)$/.test(r.label));
   const custom=rows.find(r=>r.label==='소비자가'||r.label==='정가');
   if(!sale?.value)return;
   spec.dataset.priceFormatted='true';
   const current=discount?.value && discount.value<sale.value ? discount : sale;
   const original=current===discount ? sale.value : (custom?.value || amount(spec.dataset.originalPrice));
   sale.el.classList.add('dhg-price-row');sale.title?.classList.add('dhg-price-label');
   current.el.classList.add('dhg-price-row');current.title?.classList.add('dhg-price-label');
   if(original>current.value){
    const old=document.createElement('li');old.className='dhg-price-original';
    const del=document.createElement('del');del.textContent=original.toLocaleString('ko-KR')+'원';old.append(del);
    current.el.before(old);
    const rate=document.createElement('strong');rate.className='dhg-price-rate';rate.textContent=Math.round((1-current.value/original)*100)+'%';current.el.prepend(rate);
    if(current!==sale)sale.el.classList.add('dhg-price-replaced');
    custom?.el.classList.add('dhg-price-replaced');
   }
  });
 }
 formatPrices();
 const main=document.querySelector('.market-reference');
 if(main)new MutationObserver(()=>formatPrices()).observe(main,{childList:true,subtree:true});
})();
