(() => {
 const ribbon = document.querySelector('.cohort-ribbon');
 if (!ribbon) return;
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 let visible = false;
 const update = () => ribbon.classList.toggle('is-in-view', visible && !document.hidden && !reduced.matches);
 if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(ribbon);
 } else { visible = true; update(); }
 document.addEventListener('visibilitychange', update);
 reduced.addEventListener('change', update);
})();
