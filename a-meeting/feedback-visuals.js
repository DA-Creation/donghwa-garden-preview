(() => {
  const portrait = document.querySelector('.grandma-invitation');
  const charts = [...document.querySelectorAll('.meal-time-chart, .making-journey')];
  if (portrait && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => portrait.classList.toggle('is-illustration-visible', entry.isIntersecting), { threshold: .2 }).observe(portrait);
  }
  // Card transforms change their visible area, so reveal only the active chart.
  let pending = false;
  function update() {
    pending = false;
    const top = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    const bottom = document.querySelector('.bottom-nav')?.getBoundingClientRect().top || innerHeight;
    charts.forEach(chart => {
      const rect = chart.getBoundingClientRect();
      const card = chart.closest('article');
      const visible = parseFloat(getComputedStyle(card).opacity) > .95 && rect.top >= top && rect.bottom <= bottom;
      if (visible) chart.classList.add('is-chart-visible');
      else if (rect.top > innerHeight || parseFloat(getComputedStyle(card).opacity) < .05) chart.classList.remove('is-chart-visible');
    });
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  schedule();
})();
