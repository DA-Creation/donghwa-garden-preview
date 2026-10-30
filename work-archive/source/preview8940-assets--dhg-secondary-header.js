document.addEventListener('DOMContentLoaded', () => {
 if(document.querySelector('.subscription-home,.is-market-view')||document.documentElement.matches('.dhg-login-unified,.dhg-join-page'))return;
 const header = document.querySelector('.dhg-shared-header');
 const nav = document.querySelector('.dhg-shared-bottom-nav');
 if (!header || !nav) return;
 header.classList.add('dhg-market-style-header');
 const anchor = document.createComment('login-nav-position'); nav.before(anchor);
 const search = document.createElement('form'); search.className = 'dhg-login-header-search';
 search.action = '/skin-skin5/product/search.html'; search.method = 'get'; search.setAttribute('role','search');
 search.innerHTML = '<input type="search" name="keyword" placeholder="상품을 검색해보세요" aria-label="상품 검색"><button type="submit" aria-label="검색"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></button>';
 header.append(search);
 const desktop = matchMedia('(min-width:1024px)');
 function layout() { if (desktop.matches) header.append(nav); else anchor.after(nav); }
 desktop.addEventListener('change', layout); layout();
});
