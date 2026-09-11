(() => {
  const section = document.querySelector('.subscription-principles');
  if (!section) return;
  const cards = [...section.querySelectorAll(':scope > article')];
  const followingSection = section.nextElementSibling;
  const staticLayout = matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;
  function update() {
    pending = false;
    if (section.closest('[hidden]')) return;
    const headerBottom = Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 16;
    const actionTop = document.querySelector('.subscription-island-cta')?.getBoundingClientRect().top;
    const readingBottom = Number.isFinite(actionTop) ? actionTop - 16 : innerHeight - 100;
    // Tall cards scroll through the reading area before pinning, even on short screens.
    cards.forEach(card => {
      const pinTop = Math.min(headerBottom, readingBottom - card.offsetHeight);
      card.style.setProperty('--principle-pin-top', `${pinTop}px`);
    });
    const positions = [...cards, followingSection].map(card => card?.getBoundingClientRect().top);
    cards.forEach((card, index) => {
      const next = cards[index + 1] || followingSection;
      const top = parseFloat(getComputedStyle(card).top) || 0;
      const progress = !staticLayout.matches && next
        ? Math.min(1, Math.max(0, 1 - (positions[index + 1] - top) / card.offsetHeight))
        : 0;
      const eased = progress * progress * (3 - 2 * progress);
      card.style.setProperty('--principle-opacity', String(1 - eased));
      card.style.setProperty('--principle-scale', String(1 - eased * .08));
    });
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  staticLayout.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(section);
  new MutationObserver(schedule).observe(section.closest('main'), { attributes: true, attributeFilter: ['hidden'] });
  schedule();
})();
