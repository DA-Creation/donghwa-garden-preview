(() => {
  const guide = document.querySelector('#guide');
  const runway = guide?.querySelector('.subscription-promise__runway');
  const scene = guide?.querySelector('.subscription-promise__scene');
  if (!scene || !runway) return;
  const lines = [...scene.querySelectorAll('.subscription-promise__detail-line')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = x => Math.max(0, Math.min(1, x));
  const phase = (p, a, b) => { const x = clamp((p - a) / (b - a)); return x * x * (3 - 2 * x); };
  guide.classList.add('has-scroll-scene');
  const header = document.querySelector('.site-header');
  const home = guide.closest('.subscription-home');
  const sections = [...home.children].filter(el => el.tagName === 'SECTION' || el.classList.contains('cohort-reveal-runway'));
  function updateHeader() {
    if (!header) return;
    const bar = header.getBoundingClientRect();
    const center = bar.top + bar.height / 2;
    // Respect the visible curtain edge, not its original layout rectangle.
    // Later/higher layers win while sections overlap during their sticky exits.
    const behind = !home.hidden && sections.map((el, order) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const cut = el.classList.contains('has-blind-exit')
        ? parseFloat(style.getPropertyValue('--principles-blind-cut')) || 0 : 0;
      return { el, order, z: parseFloat(style.zIndex) || 0,
        visible: rect.top <= center && rect.bottom - cut > center };
    }).filter(item => item.visible).sort((a, b) => b.z - a.z || b.order - a.order)[0]?.el;
    const rgb = behind && getComputedStyle(behind).backgroundColor.match(/[\d.]+/g)?.map(Number);
    const dark = rgb && (rgb.length < 4 || rgb[3] > .5)
      && .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2] < 105;
    header.classList.toggle('is-over-dark-section', Boolean(dark));
  }
  let queued = false;
  function update() {
    queued = false;
    updateHeader();
    if (reduced.matches) {
      guide.style.removeProperty('--promise-paper');
      lines.forEach(line => line.style.removeProperty('opacity'));
      return;
    }
    if (guide.closest('[hidden]')) return;
    const top = parseFloat(getComputedStyle(scene).top) || 0;
    const rect = runway.getBoundingClientRect();
    const progress = clamp((top - rect.top) / Math.max(1, runway.offsetHeight - 2 * scene.offsetHeight));
    // Entry begins as the portrait approaches its pinned position.
    const arrival = phase(top - rect.top, -scene.offsetHeight * .65, 0);
    const expand = phase(progress, .06, .20);
    const titleIn = phase(progress, 0, .045);
    const titleOut = phase(progress, .42, .48);
    const detail = phase(progress, .49, .55);
    const set = (key, value) => scene.style.setProperty(`--promise-${key}`, value);
    set('image-opacity', arrival);
    set('image-y', `${60 * (1 - arrival)}px`);
    set('image-scale', 1.08 - .08 * expand);
    set('inset-top', `${12 * (1 - expand)}%`);
    set('inset-x', `${8 * (1 - expand)}%`);
    set('inset-bottom', `${12 * (1 - expand)}%`);
    set('radius', `${36 * (1 - expand)}px`);
    set('copy-opacity', titleIn * (1 - titleOut));
    set('copy-y', `${28 * (1 - titleIn) - 22 * titleOut}px`);
    // Four discrete reading beats: only the current line reaches full white.
    const activeLine = progress < .58 ? -1 : Math.min(3, Math.floor((progress - .58) / .09));
    lines.forEach((line, index) => { line.style.opacity = index === activeLine ? '1' : '.6'; });
    guide.style.setProperty('--promise-paper', progress >= .95 ? '#181616' : '#fff');
    set('detail-opacity', detail);
    set('detail-y', `${32 * (1 - detail)}px`);
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  new ResizeObserver(schedule).observe(scene);
  reduced.addEventListener('change', schedule);
  new MutationObserver(schedule).observe(guide.closest('.subscription-home'), { attributes: true, attributeFilter: ['hidden'] });
  schedule();
})();
