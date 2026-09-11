(() => {
  const market = new URL('../index.html?view=ustore', location.href);
  let returnUrl = market;
  try {
    const requested = new URL(new URLSearchParams(location.search).get('returnTo') || market.href, location.href);
    if (requested.origin === market.origin && requested.pathname === market.pathname && !requested.searchParams.has('product')) returnUrl = requested;
  } catch {}
  document.querySelector('[data-return-to-market]')?.setAttribute('href', returnUrl.href);
  let previous;
  try { previous = new URL(document.referrer); } catch {}
  const fromList = previous && previous.origin === location.origin && previous.pathname === market.pathname && !previous.searchParams.has('product');
  document.querySelector('[data-return-to-market]')?.addEventListener('click', event => {
    if (fromList) { event.preventDefault(); history.back(); }
  });
  document.querySelector('.pv-logo')?.addEventListener('click', () => location.assign(market.href));
})();

// Match the sold-out state already shown on the market cards.
if (/\/dg-(04|07)\.html$/.test(location.pathname)) {
  const actions = document.querySelectorAll('.pv-mobile-buy__actions [data-purchase-open]');
  actions.forEach((button, index) => { if (index === 0 && actions.length > 1) button.hidden = true; });
  document.querySelector('.pv-mobile-buy__actions > i')?.remove();
  document.querySelectorAll('[data-purchase-open], [data-preview-add]').forEach(button => {
    button.textContent = '재입고 알림';
    button.removeAttribute('aria-haspopup');
    button.removeAttribute('aria-controls');
    button.addEventListener('click', event => {
      event.preventDefault(); event.stopImmediatePropagation();
      let status = document.querySelector('.market-restock-status');
      if (!status) {
        status = document.createElement('p'); status.className = 'market-restock-status';
        status.setAttribute('role', 'status'); document.body.append(status);
      }
      status.textContent = '재입고 알림 서비스는 준비 중입니다.';
      window.setTimeout(() => status.remove(), 3000);
    }, true);
  });
}
