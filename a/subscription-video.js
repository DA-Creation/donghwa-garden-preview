(() => {
  const video = document.querySelector('.subscription-hero__video');
  if (!video) return;
  const resume = () => {
    if (document.hidden || video.closest('[hidden]')) return;
    video.muted = true;
    video.play().catch(() => {});
  };
  video.controls = false;
  video.addEventListener('canplay', resume);
  video.addEventListener('pause', resume);
  document.addEventListener('visibilitychange', resume);
  document.addEventListener('pointerdown', resume, { passive: true });
  new MutationObserver(resume).observe(video.closest('main'), { attributes: true, attributeFilter: ['hidden'] });
  resume();
})();

(() => {
  const videos = [...document.querySelectorAll('.composition-story__media video')];
  const visible = new Set();
  function resume(video) {
    if (!visible.has(video) || document.hidden || video.closest('[hidden]')) return;
    video.muted = true;
    video.play().catch(() => video.parentElement.classList.remove('is-playing'));
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.target;
      if (entry.isIntersecting) { visible.add(video); resume(video); }
      else { visible.delete(video); video.pause(); }
    }
  }, { rootMargin: '120px 0px' });
  videos.forEach(video => {
    video.addEventListener('playing', () => video.parentElement.classList.add('is-playing'));
    ['pause', 'waiting', 'error', 'emptied'].forEach(event => video.addEventListener(event, () => video.parentElement.classList.remove('is-playing')));
    video.addEventListener('canplay', () => resume(video));
    observer.observe(video);
  });
  document.addEventListener('visibilitychange', () => videos.forEach(video => document.hidden ? video.pause() : resume(video)));
  document.addEventListener('pointerdown', () => visible.forEach(resume), { passive: true });
})();
