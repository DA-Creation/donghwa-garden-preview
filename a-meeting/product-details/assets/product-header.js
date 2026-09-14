(() => {
  'use strict';
  const page = document.getElementById('previewPage');
  const header = page?.querySelector('.pv-product-header');
  if (!header) return;

  const homeLink = header.querySelector('[data-detail-home]');
  const back = header.querySelector('[data-detail-back]');
  const home = new URL(homeLink.href);
  const market = new URL(home.href);
  market.searchParams.set('view', 'ustore');

  let returnUrl = market;
  try {
    const requested = new URL(new URLSearchParams(location.search).get('returnTo') || market.href, location.href);
    if (requested.origin === home.origin && requested.pathname === home.pathname && !requested.searchParams.has('product')) {
      returnUrl = requested;
    }
  } catch {}
  back.href = returnUrl.href;
  back.addEventListener('click', event => {
    // Use real back navigation only when it returns to this local storefront.
    let previous;
    try { previous = new URL(document.referrer); } catch {}
    const projectRoot = new URL('../', home).pathname;
    if (previous && previous.origin === home.origin && previous.pathname.startsWith(projectRoot) && history.length > 1) {
      event.preventDefault();
      history.back();
    }
  });

  const promo = page.querySelector('[data-detail-promo]');
  promo?.querySelector('[data-detail-promo-close]')?.addEventListener('click', () => {
    promo.hidden = true;
    back.focus({ preventScroll: true });
  });

  const productName = page.querySelector('.pv-buy-meta h1')?.textContent.trim();
  const title = header.querySelector('.pv-product-header__title');
  if (productName && title) {
    title.textContent = productName;
    title.title = productName;
  }
  const measureHeader = () => page.style.setProperty('--pv-header-height', header.getBoundingClientRect().height + 'px');
  measureHeader();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureHeader).observe(header);
  else window.addEventListener('resize', measureHeader);
})();
