(() => {
  const section = document.querySelector('.subscription-principles');
  if (!section) return;
  const cards = [...section.querySelectorAll(':scope > article')];
  if (!cards.length) return;
  const runway = document.createElement('div');
  runway.className = 'principles-runway';
  const stage = document.createElement('div');
  stage.className = 'principles-stage';
  cards[0].before(runway);
  runway.append(stage);
  cards.forEach(card => stage.append(card));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const heading = section.querySelector(':scope > h2');
  let revealedAt;
  let pending = false;
  const clamp = value => Math.min(1, Math.max(0, value));
  function update() {
    pending = false;
    if (section.closest('[hidden]')) return;
    const header = document.querySelector('.site-header');
    const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 122) + 16;
    // Measure content rather than the previous fixed stage height after a resize.
    const cardHeights = cards.map(card => {
      const style = getComputedStyle(card);
      const edges = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
        .reduce((sum, key) => sum + (parseFloat(style[key]) || 0), 0);
      return Math.ceil(edges + [...card.children].reduce((sum, child) => {
        const css = getComputedStyle(child);
        return sum + child.offsetHeight + (parseFloat(css.marginTop) || 0) + (parseFloat(css.marginBottom) || 0);
      }, 0));
    });
    const contentHeight = Math.max(...cardHeights);
    // The title scrolls away; long cards read within the clipped stage below it.
    const top = headerBottom;
    const height = Math.min(contentHeight, Math.max(160, innerHeight - top - 92));
    section.classList.add('has-flowing-heading');
    cards.forEach((card, index) => card.style.setProperty('--card-content-height', `${cardHeights[index]}px`));
    const enabled = !reduced.matches;
    section.classList.toggle('has-card-scene', enabled);
    // Trigger the title and first card together after two thirds of their group is visible.
    const groupTop = heading.getBoundingClientRect().top - (parseFloat(getComputedStyle(section).getPropertyValue('--principles-enter-y') || '24px'));
    const groupBottom = runway.getBoundingClientRect().top + height;
    const groupHeight = Math.max(1, groupBottom - groupTop);
    const visibleHeight = Math.max(0, Math.min(innerHeight - 80, groupBottom) - Math.max(headerBottom, groupTop));
    const immediate = reduced.matches || document.body.classList.contains('is-hero-editing');
    if (groupTop >= innerHeight) revealedAt = undefined;
    if (revealedAt === undefined && visibleHeight >= Math.min(groupHeight, innerHeight - headerBottom - 80) * 2 / 3) revealedAt = performance.now();
    if (revealedAt === undefined && runway.getBoundingClientRect().top < top) revealedAt = performance.now() - 750;
    const reveal = immediate ? 1 : revealedAt === undefined ? 0 : clamp((performance.now() - revealedAt) / 750);
    const revealEase = 1 - Math.pow(1 - reveal, 3);
    section.style.setProperty('--principles-enter-opacity', String(revealEase));
    section.style.setProperty('--principles-enter-y', `${24 * (1 - revealEase)}px`);
    if (revealedAt !== undefined && reveal < 1) schedule();
    // Cohort now precedes this section, so it must not be wrapped or pinned here.
    section.classList.remove('has-blind-exit');
    if (!enabled) {
      section.style.setProperty('--principles-heading-opacity', '1');
      section.style.removeProperty('--principles-blind-cut');
      section.style.removeProperty('--principles-blind-lift');
      stage.style.removeProperty('--cards-top');
      stage.style.removeProperty('--cards-height');
      cards.forEach(card => { card.style.removeProperty('--card-y'); card.style.removeProperty('--card-opacity'); });
      return;
    }
    stage.style.setProperty('--cards-top', `${top}px`);
    stage.style.setProperty('--cards-height', `${height}px`);
    const step = Math.max(height, innerHeight * .75);
    // Retain one reading beat per card; the final card exits in normal flow.
    runway.style.height = `${height + step * cards.length}px`;
    const distance = top - runway.getBoundingClientRect().top;
    section.style.removeProperty('--principles-blind-cut');
    section.style.removeProperty('--principles-blind-lift');
    section.style.setProperty('--principles-heading-opacity', '1');
    cards.forEach((card, index) => {
      const entry = index === 0 ? 1 : clamp((distance - step * (index - .7)) / (step * .7));
      const next = index === cards.length - 1 ? 0 : clamp((distance - step * (index + .3)) / (step * .7));
      // Read the part below the viewport before the next card begins its entrance.
      const overflow = Math.max(0, cardHeights[index] - height);
      const readProgress = clamp((distance - step * index) / (step * .3));
      card.style.setProperty('--card-y', `${(1 - entry) * (innerHeight - top) - overflow * readProgress}px`);
      card.style.setProperty('--card-opacity', String(entry * (1 - next)));
      card.style.pointerEvents = entry > .98 && next < .98 ? '' : 'none';
    });
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  cards.forEach(card => new ResizeObserver(schedule).observe(card));
  section.querySelectorAll('details').forEach(details => details.addEventListener('toggle', schedule));
  new ResizeObserver(schedule).observe(heading);
  new MutationObserver(schedule).observe(section.closest('main'), { attributes: true, attributeFilter: ['hidden'] });
  schedule();
})();


// Give the existing pink explanation card one extra reading beat before invitation.
(() => {
  const cohort = document.querySelector('#cohort');
  const card = cohort?.querySelector(':scope > .cohort-shape-card--reason');
  if (!card) return;
  const runway = document.createElement('div');
  runway.className = 'cohort-reading-runway';
  card.before(runway);
  runway.append(card);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;
  function update() {
    pending = false;
    if (cohort.closest('[hidden]')) return;
    const header = document.querySelector('.site-header');
    const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 0) + 16;
    const nav = document.querySelector('.bottom-nav');
    const bottom = Math.min(innerHeight - 92, nav?.getBoundingClientRect().top - 20 || innerHeight - 92);
    // Fill the readable viewport, but allow taller text to expand in normal flow.
    card.style.setProperty('--cohort-available-height', `${Math.max(0, bottom - headerBottom)}px`);
    const cardHeight = card.offsetHeight;
    const top = Math.max(headerBottom, headerBottom + (bottom - headerBottom - cardHeight) / 2);
    const enabled = !reduced.matches && cardHeight > 0 && top + cardHeight <= bottom;
    runway.classList.toggle('has-cohort-reading', enabled);
    if (enabled) {
      const hold = Math.max(480, innerHeight * .9);
      runway.style.setProperty('--cohort-reading-top', `${top}px`);
      runway.style.height = `${cardHeight + hold}px`;
    } else {
      runway.style.removeProperty('--cohort-reading-top');
      runway.style.removeProperty('height');
    }
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(card);
  new MutationObserver(schedule).observe(cohort.closest('main'), { attributes: true, attributeFilter: ['hidden'] });
  schedule();
})();


// Raise the protein arrow when the complete card clears the fixed navigation.
(() => {
  const card = document.querySelector('.principle-tofu-card');
  if (!card) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  card.classList.add('protein-motion-ready');
  let pending = false;
  function update() {
    pending = false;
    const rect = card.getBoundingClientRect();
    const headerBottom = Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0);
    const bottom = innerHeight - 80;
    const visibleHeight = Math.max(0, Math.min(bottom, rect.bottom) - Math.max(headerBottom, rect.top));
    const readable = rect.width > 0 && parseFloat(getComputedStyle(card).opacity) > .98
      && visibleHeight >= Math.min(rect.height, bottom - headerBottom) * .9;
    if (reduced.matches || readable) card.classList.add('is-protein-filled');
    else if (rect.top >= innerHeight || rect.bottom <= 0) card.classList.remove('is-protein-filled');
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(card);
  schedule();
})();

// Reveal both evidence bars after their card has entered the readable stage.
(() => {
  const card = document.querySelector('.principle-kimchi-card');
  if (!card) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  card.classList.add('evidence-motion-ready');
  let pending = false;
  function update() {
    pending = false;
    const rect = card.getBoundingClientRect();
    const opacity = parseFloat(getComputedStyle(card).opacity);
    const header = Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0);
    const visible = Math.max(0, Math.min(innerHeight - 80, rect.bottom) - Math.max(header, rect.top));
    if (reduced.matches || (rect.width > 0 && opacity > .98 && visible >= Math.min(rect.height, innerHeight - header - 80) * .9)) card.classList.add('is-evidence-visible');
    else if (rect.top >= innerHeight || rect.bottom <= 0 || opacity < .01) card.classList.remove('is-evidence-visible');
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(card);
  new MutationObserver(schedule).observe(card, { attributes: true, attributeFilter: ['style'] });
  schedule();
})();
