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
