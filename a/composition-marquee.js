(() => {
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.composition-marquee').forEach(row => {
    const track = row.querySelector('.composition-marquee__track');
    let frame;
    function changeSpeed(target) {
      cancelAnimationFrame(frame);
      const animation = track.getAnimations().find(item => item.animationName === 'composition-drift');
      if (!animation || reduced.matches) return;
      const from = animation.playbackRate;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - start) / 250);
        animation.updatePlaybackRate(from + (target - from) * (1 - (1 - progress) ** 3));
        if (progress < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }
    row.addEventListener('pointerenter', event => {
      if (hover.matches && event.pointerType !== 'touch') changeSpeed(.25);
    });
    row.addEventListener('pointerleave', () => changeSpeed(1));
    hover.addEventListener('change', () => changeSpeed(1));
    reduced.addEventListener('change', () => { cancelAnimationFrame(frame); changeSpeed(1); });
  });
})();
