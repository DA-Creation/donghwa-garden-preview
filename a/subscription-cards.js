(() => {
  const section = document.querySelector('.subscription-principles');
  if (!section) return;
  const followingSection = section.nextElementSibling;
  const cohortRunway = document.createElement('div');
  cohortRunway.className = 'cohort-reveal-runway';
  followingSection.before(cohortRunway);
  cohortRunway.append(followingSection);
  const cards = [...section.querySelectorAll(':scope > article')];
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
    // Center the heading and card in the usable space between fixed navigation.
    const headingHeight = heading.offsetHeight;
    const headingGap = innerHeight <= 850 ? 20 : 40;
    const readingBottom = innerHeight - 92;
    const headingTop = Math.max(headerBottom, (headerBottom + readingBottom - contentHeight - headingHeight - headingGap) / 2);
    const groupTopWhenPinned = headingTop + headingHeight + headingGap;
    const pinHeading = groupTopWhenPinned + contentHeight <= innerHeight - 92;
    const top = pinHeading ? groupTopWhenPinned : headerBottom;
    const height = Math.min(contentHeight, Math.max(160, innerHeight - top - 92));
    section.classList.toggle('has-flowing-heading', !pinHeading);
    cards.forEach((card, index) => card.style.setProperty('--card-content-height', `${cardHeights[index]}px`));
    section.style.setProperty('--principles-heading-top', `${headingTop}px`);
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
    cohortRunway.classList.toggle('has-blind-reveal', enabled);
    section.classList.toggle('has-blind-exit', enabled);
    if (!enabled) {
      section.style.setProperty('--principles-heading-opacity', '1');
      section.style.removeProperty('--principles-blind-cut');
      section.style.removeProperty('--principles-blind-lift');
      cohortRunway.style.height = '';
      cohortRunway.style.marginTop = '';
      cards.forEach(card => { card.style.removeProperty('--card-y'); card.style.removeProperty('--card-opacity'); });
      return;
    }
    stage.style.setProperty('--cards-top', `${top}px`);
    stage.style.setProperty('--cards-height', `${height}px`);
    const step = Math.max(height, innerHeight * .75);
    // The next card waits behind the last card while its dark curtain lifts.
    const firstCohortCard = followingSection.querySelector('.cohort-shape-card');
    const cohortPadding = parseFloat(getComputedStyle(followingSection).paddingTop) || 0;
    const pinTop = Math.max(headerBottom, headerBottom + (innerHeight - 80 - headerBottom - firstCohortCard.offsetHeight) / 2 - 80) - cohortPadding;
    // Continue past the viewport top, including the rounded lower edge.
    const liftTravel = Math.max(1, innerHeight - 80 + 32);
    const sectionPadding = parseFloat(getComputedStyle(section).paddingBottom) || 0;
    followingSection.style.setProperty('--cohort-pin-top', `${pinTop}px`);
    const overlap = height + liftTravel + sectionPadding + top - pinTop;
    runway.style.height = `${height + step * cards.length + liftTravel}px`;
    cohortRunway.style.height = `${followingSection.offsetHeight + liftTravel}px`;
    cohortRunway.style.marginTop = `${-overlap}px`;
    const distance = top - runway.getBoundingClientRect().top;
    const lift = Math.max(0, Math.min(liftTravel, distance - step * cards.length));
    const boundary = innerHeight - 80 - lift;
    const cut = lift > 0 ? Math.max(0, section.getBoundingClientRect().bottom - boundary) : 0;
    section.style.setProperty('--principles-blind-cut', `${cut}px`);
    section.style.setProperty('--principles-blind-lift', `${-lift}px`);
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
    const fullyVisible = rect.width > 0 && rect.top >= headerBottom && rect.bottom <= bottom;
    if (reduced.matches || fullyVisible) card.classList.add('is-protein-filled');
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
