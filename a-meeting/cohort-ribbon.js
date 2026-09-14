(() => {
 const ribbon = document.querySelector('.cohort-ribbon');
 if (!ribbon) return;
 const button = ribbon.querySelector('[data-ribbon-pause]');
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 let visible = false;
 const update = () => ribbon.classList.toggle('is-in-view', visible && !document.hidden && !reduced.matches);
 button.addEventListener('click', () => {
  const paused = ribbon.classList.toggle('is-paused');
  button.setAttribute('aria-pressed', String(paused));
  button.setAttribute('aria-label', paused ? '모집 띠 움직임 재생' : '모집 띠 움직임 멈추기');
  button.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
 });
 if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(ribbon);
 } else { visible = true; update(); }
 document.addEventListener('visibilitychange', update);
 reduced.addEventListener('change', update);
})();
