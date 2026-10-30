/* Extend desktop presentation without replacing Cafe24 search or mobile filters. */
(() => {
 const desktop=matchMedia('(min-width:1024px)');
 const main=document.querySelector('.market-reference');
 const input=document.querySelector('#market-search input[name="keyword"]');
 const title=document.querySelector('#market-all-title');
 let nativeTitle=/\/product\/search.html$/.test(location.pathname)?document.querySelector('.dhg-page-heading h1,.dhg-page-heading h2,.titleArea h2'):null;
 let originalNativeTitle=nativeTitle?.textContent;
 function setTitle(node,query){
   node.classList.add('dhg-search-result-title');
   const keyword=document.createElement('span');keyword.className='dhg-search-keyword';keyword.textContent="'"+query+"'";
   node.replaceChildren(keyword,document.createTextNode('에 대한 검색결과'));
 }
 function update(){
   if(/\/product\/search.html$/.test(location.pathname)){
     const current=document.querySelector(".dhg-page-heading h1,.dhg-page-heading h2,.titleArea h2");
     if(current!==nativeTitle){nativeTitle=current;originalNativeTitle=current?.textContent;}
   }
   if(nativeTitle){
     const query=(new URLSearchParams(location.search).get('keyword')||'').trim();
     if(desktop.matches&&query)setTitle(nativeTitle,query);
     else {nativeTitle.classList.remove('dhg-search-result-title');nativeTitle.textContent=originalNativeTitle;}
   }
   if(!main||!input||!title)return;
   const query=input.value.trim();
   title.classList.remove('dhg-search-result-title');
   if(!desktop.matches||!query)return;
   setTitle(title,query);
   const all=document.querySelector('[data-market-category="all"]')?.getAttribute('aria-pressed')==='true';
   if(all){
     document.querySelector('[data-market-shelves]').hidden=true;
     document.querySelector('[data-market-tab-panel]').hidden=false;
     const norm=s=>s.toLowerCase().replace(/\s+/g,'');
     let count=0;
     document.querySelectorAll('[data-native-products] > .market-product').forEach(card=>{
       card.hidden=!norm(card.querySelector('h3')?.textContent||'').includes(norm(query));
       if(!card.hidden)count++;
     });
     document.querySelector('[data-native-empty]').hidden=count!==0;
     document.querySelector('[data-native-product-count]').textContent=`총 ${count}개`;
   }
 }
 document.addEventListener('input',event=>{if(event.target.matches('#market-search input,[data-market-header-search]'))queueMicrotask(update);});
 document.addEventListener('click',event=>{if(event.target.closest('[data-market-category]'))queueMicrotask(update);});
 desktop.addEventListener('change',()=>{if(input)input.dispatchEvent(new Event('input',{bubbles:true}));else update();});
 document.addEventListener('DOMContentLoaded',update);
 update();
})();
