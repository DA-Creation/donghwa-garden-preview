(() => {
  const process = document.querySelector('.cohort-process');
  if (!process || !('IntersectionObserver' in window)) return;
  process.classList.add('is-ready');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    process.classList.add('is-visible');
    observer.disconnect();
  }, { threshold: .4 });
  observer.observe(process);
})();

// Keep the recruitment link on the existing page instead of resetting the app route.
(() => {
  const link = document.querySelector('.cohort-ribbon__link');
  const cohort = document.querySelector('#cohort');
  if (!link || !cohort) return;
  link.addEventListener('click', event => {
    if (event.defaultPrevented) return; // The existing closed-cohort dialog owns this state.
    event.preventDefault();
    history.replaceState(history.state, '', '#cohort');
    cohort.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  });
})();
