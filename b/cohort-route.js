(() => {
  const route = document.querySelector('[data-cohort-route]');
  if (!route) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  const update = () => {
    route.classList.toggle('is-running', inView && !document.hidden && !reducedMotion.matches);
  };
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    update();
  });
  observer.observe(route);
  document.addEventListener('visibilitychange', update);
  reducedMotion.addEventListener('change', update);
  update();
})();
