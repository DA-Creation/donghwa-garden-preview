(() => {
  // Navigation state only: Cafe24 owns login, product, basket and checkout actions.
  function routeSection(url, allowReturnUrl = true) {
    const path = url.pathname.replace(/^\/skin-[^/]+/, '') || '/';
    if (allowReturnUrl && /^\/member\/login\.html$/.test(path)) {
      const returnUrl = url.searchParams.get('returnUrl');
      if (returnUrl) {
        try {
          const destination = new URL(returnUrl, url.origin);
          if (destination.origin === url.origin && destination.pathname !== path) {
            const section = routeSection(destination, false);
            if (section) return section;
          }
        } catch (_) { /* Leave malformed return paths to Cafe24. */ }
      }
    }
    if (path === '/meal-test.html' || path.startsWith('/meal-quiz/')) return 'test';
    if (path === '/subscription/apply.html') return 'apply';
    if ((/^\/product\/detail\.html$/.test(path) && url.searchParams.get('product_no') === '50') || /^\/product\/[^/]+\/50(?:\/|$)/.test(path)) return 'apply';
    if (/^\/product\//.test(path) || /^\/order\/basket\.html$/.test(path)) return 'market';
    if (/^\/(?:myshop|member)\//.test(path)) return 'account';
    if (path === '/' || path === '/index.html') return 'subscription';
    return '';
  }

  function updateNavigation() {
    const section = routeSection(new URL(window.location.href));
    document.querySelectorAll('.dhg-shared-bottom-nav [data-dhg-nav]').forEach(link => {
      const active = link.dataset.dhgNav === section;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation, { once: true });
  } else {
    updateNavigation();
  }
  window.addEventListener('pageshow', updateNavigation);
  window.addEventListener('popstate', updateNavigation);
})();
