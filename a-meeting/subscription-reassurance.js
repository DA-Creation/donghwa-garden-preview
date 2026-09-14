(() => {
  const runway = document.querySelector('#plans .reassure-usage-benefits');
  if (!runway) return;
  const cards = [...runway.querySelectorAll('.reassure-usage-benefit')];
  const stage = document.createElement('div');
  stage.className = 'reassure-stack-stage';
  runway.append(stage);
  cards.forEach(card => stage.append(card));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = n => Math.min(1, Math.max(0, n));
  let frame = 0;
  const localPreview = ['localhost', '127.0.0.1'].includes(location.hostname);
  let pinned = localPreview && new URLSearchParams(location.search).get('details') === '1';
  const revealControls = [];
  if (localPreview) {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'reassure-preview-pin';
    const sync = () => {
      pin.textContent = pinned ? '상세 고정 해제' : '상세 고정';
      pin.setAttribute('aria-pressed', String(pinned));
    };
    pin.addEventListener('click', () => {
      pinned = !pinned;
      const url = new URL(location.href);
      if (pinned) url.searchParams.set('details', '1');
      else url.searchParams.delete('details');
      history.replaceState(null, '', url);
      revealControls.forEach(reveal => reveal(pinned));
      sync();
    });
    sync();
    document.body.append(pin);
  }
  cards.forEach(card => {
    const summary = card.querySelector('summary');
    const panel = card.querySelector('.reassure-usage-benefit__panel');
    card.open = true;
    card.classList.add('has-hover-details');
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    summary.setAttribute('aria-expanded', 'false');
    function reveal(open) {
      open = pinned || open;
      card.classList.toggle('is-detail-visible', open);
      panel.inert = !open;
      panel.setAttribute('aria-hidden', String(!open));
      summary.setAttribute('aria-expanded', String(open));
    }
    revealControls.push(reveal);
    reveal(pinned);
    card.addEventListener('pointerenter', event => { if (hover.matches && event.pointerType !== 'touch') reveal(true); });
    card.addEventListener('pointerleave', () => { if (hover.matches) reveal(false); });
    summary.addEventListener('click', event => {
      event.preventDefault();
      if (!hover.matches || event.detail === 0) reveal(!card.classList.contains('is-detail-visible'));
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Escape') { reveal(false); summary.focus({preventScroll:true}); }
    });
    card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) reveal(false); });
    // Touch users can tap the card to return without an extra close button.
    panel.addEventListener('click', event => {
      if (!hover.matches && !event.target.closest('a, button, input')) reveal(false);
    });
  });
  function update() {
    frame = 0;
    const headerBottom = Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 122) + 16;
    const height = Math.max(240, Math.min(700, innerHeight - headerBottom - 100));
    const top = Math.max(headerBottom, (innerHeight - 80 - height + headerBottom) / 2);
    const enabled = !reduced.matches && innerHeight - headerBottom - 80 >= 240;
    runway.classList.toggle('has-reassure-stack', enabled);
    runway.style.setProperty('--reassure-stack-height', `${height}px`);
    runway.style.setProperty('--reassure-stack-top', `${top}px`);
    const step = Math.max(height, innerHeight * .75);
    runway.style.height = enabled ? `${height + step * cards.length}px` : '';
    const distance = top - runway.getBoundingClientRect().top;
    cards.forEach((card, index) => {
      const entry = !enabled || index === 0 ? 1 : clamp((distance - step * (index - .7)) / (step * .7));
      const next = !enabled || index === cards.length - 1 ? 0 : clamp((distance - step * (index + .3)) / (step * .7));
      card.style.setProperty('--reassure-card-y', `${(1 - entry) * (innerHeight - top)}px`);
      card.style.setProperty('--reassure-card-opacity', String(entry * (1 - next)));
      card.inert = entry < .98 || next > .98;
      card.style.pointerEvents = card.inert ? 'none' : '';
      if (card.inert && !pinned) {
        card.classList.remove('is-detail-visible');
        const panel = card.querySelector('.reassure-usage-benefit__panel');
        panel.inert = true;
        panel.setAttribute('aria-hidden', 'true');
        card.querySelector('summary').setAttribute('aria-expanded','false');
      }
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  schedule();
})();
