(() => {
  const section = document.querySelector('.subscription-principles');
  if (!section) return;
  const cards = [...section.querySelectorAll(':scope > article')];
  const followingSection = section.nextElementSibling;
  const staticLayout = matchMedia('(max-height: 740px), (prefers-reduced-motion: reduce)');
  let pending = false;
  function update() {
    pending = false;
    if (section.closest('[hidden]')) return;
    const top = parseFloat(getComputedStyle(cards[0]).top) || 0;
    const positions = [...cards, followingSection].map(card => card?.getBoundingClientRect().top);
    cards.forEach((card, index) => {
      const next = cards[index + 1] || followingSection;
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
