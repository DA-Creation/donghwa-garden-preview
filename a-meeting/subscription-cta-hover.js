(() => {
  document.querySelectorAll('.subscription-hero-invitation a, .subscription-cta-card__button, .subscription-story > div > .subscription-button').forEach(button => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, active = false, enteredAt = 0;
  const paint = (now = performance.now()) => {
    frame = 0;
    const amount = reduced.matches ? 1 : .18;
    x += (targetX - x) * amount;
    y += (targetY - y) * amount;
    const progress = reduced.matches ? 1 : Math.min(1, (now - enteredAt) / 1000);
    const blend = Math.max(0, (progress - .35) / .65);
    const eased = blend * blend * (3 - 2 * blend);
    const center = button.clientWidth / 2;
    const wave = Math.sin(progress * Math.PI * 2) * button.clientWidth * .12;
    const displayX = (center + wave) * (1 - eased) + x * eased;
    button.style.setProperty('--cta-glow-width', `${button.clientWidth * 2 * (1 - eased) + 210 * eased}px`);
    button.style.setProperty('--cta-glow-x', `${displayX}px`);
    button.style.setProperty('--cta-glow-y', `${button.clientHeight / 2 * (1 - eased) + y * eased}px`);
    if (active && (progress < 1 || Math.abs(targetX - x) > .1 || Math.abs(targetY - y) > .1)) frame = requestAnimationFrame(paint);
  };
  function move(event) {
    if (event.pointerType === 'touch') return;
    const rect = button.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
    if (!active) { x = targetX; y = targetY; enteredAt = performance.now(); }
    active = true;
    if (!frame) frame = requestAnimationFrame(paint);
  }
  button.addEventListener('pointerenter', move);
  button.addEventListener('pointermove', move);
  button.addEventListener('pointerleave', () => { active = false; cancelAnimationFrame(frame); frame = 0; button.style.removeProperty('--cta-glow-width'); });
  button.addEventListener('focus', () => {
    if (!active) { targetX = button.clientWidth / 2; targetY = button.clientHeight / 2; x = targetX; y = targetY; paint(); }
  });
  });
})();
