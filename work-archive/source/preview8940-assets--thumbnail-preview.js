(() => {
  let versions = {}, refreshing = false;
  const seen = new WeakMap();
  function apply() {
    document.querySelectorAll('img[data-product-thumbnail]').forEach(img => {
      const id=img.dataset.productThumbnail;
      const version=versions[id];
      const desired=version ? img.dataset.generatedSrc+'?v='+version : img.dataset.originalSrc;
      if (seen.get(img)===desired) return;
      seen.set(img,desired);
      img.onerror=()=>{img.onerror=null;img.src=img.dataset.originalSrc;};
      img.src=desired;
    });
  }
  async function refresh() {
    if(refreshing||document.hidden)return;
    refreshing=true;
    try {const response=await fetch('/thumbnail-manifest.json',{cache:'no-store'});if(response.ok){versions=await response.json();apply();}}
    catch(_){}finally{refreshing=false;}
  }
  new MutationObserver(apply).observe(document.querySelector('[data-market-shelves]'),{subtree:true,childList:true});
  new MutationObserver(apply).observe(document.querySelector('[data-native-products]'),{subtree:true,childList:true});
  refresh();setInterval(refresh,5000);document.addEventListener('visibilitychange',refresh);
  const filter=localStorage.getItem('dhg-thumbnail-preview-category');
  if(filter)document.querySelector('[data-market-category="'+CSS.escape(filter)+'"]')?.click();
  document.querySelectorAll('[data-market-category]').forEach(button=>button.addEventListener('click',()=>localStorage.setItem('dhg-thumbnail-preview-category',button.dataset.marketCategory)));
  const search=document.querySelector('#market-search');
  search?.addEventListener('submit',event=>{event.preventDefault();search.querySelector('input')?.dispatchEvent(new Event('input',{bubbles:true}));});
})();
