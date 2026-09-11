(() => {
  const home=document.querySelector('.subscription-home');
  if(!home)return;
  const elements=[...home.querySelectorAll(':scope > section:not(.subscription-hero) > h2, :scope > section:not(.subscription-hero) > p, .empathy-image-grid, .cohort-shape-card, #faq .faq-list, .subscription-cta-card')];
  const empathy = home.querySelector('#empathy');
  const grid = empathy?.querySelector('.empathy-image-grid');
  const groups = [
    { trigger: empathy, items: [...(empathy?.querySelectorAll(':scope > h2, :scope > p') || [])], stagger: 120 },
    { trigger: grid, items: [...(grid?.children || [])], stagger: 100 }
  ].filter(group => group.trigger);
  // SEED mobile bento: top 70%, y 32, duration .6s, power3.out.
  // The storefront stays phone-width even inside a wide desktop viewport.
  const standardElements = elements.filter(el => !empathy?.contains(el) && !el.matches('.subscription-principles > h2')); 
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let queued=false;
  function update(){
    queued=false;
    if(home.hidden)return;
    const height=innerHeight;
    for(const el of standardElements){
      const top=el.getBoundingClientRect().top-(parseFloat(el.style.getPropertyValue('--reveal-offset'))||0);
      const progress=reduced.matches?1:Math.max(0,Math.min(1,(height-20-top)/Math.min(200,height*.22)));
      el.style.setProperty('--reveal-opacity',progress);
      el.style.setProperty('--reveal-offset',`${(1-progress)*28}px`);
      el.classList.add('subscription-scroll-reveal');
    }
    let animating = false;
    const now = performance.now();
    for (const group of groups) {
      const top = group.trigger.getBoundingClientRect().top;
      const visibleImmediately = reduced.matches || document.body.classList.contains('is-hero-editing');
      if (top >= height) group.started = undefined;
      if (top <= height * .7 && group.started === undefined) group.started = now;
      group.items.forEach((el, index) => {
        const progress = visibleImmediately ? 1 : group.started === undefined ? 0
          : Math.max(0, Math.min(1, (now - group.started - index * group.stagger) / 600));
        const eased = 1 - Math.pow(1 - progress, 4);
        el.classList.add('subscription-scroll-reveal');
        el.style.setProperty('--reveal-opacity', eased);
        el.style.setProperty('--reveal-offset', `${32 * (1 - eased)}px`);
        if (!visibleImmediately && group.started !== undefined && progress < 1) animating = true;
      });
    }
    if (animating) schedule();
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(home,{attributes:true,attributeFilter:['hidden']});
  new ResizeObserver(schedule).observe(home);
  schedule();
})();

(() => {
  const headings = [...document.querySelectorAll('.composition-story > h3')];
  if (!('IntersectionObserver' in window)) return;
  headings.forEach(heading => {
    heading.setAttribute('aria-label', heading.textContent);
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    let index = 0;
    texts.forEach(text => {
      const fragment = document.createDocumentFragment();
      text.textContent.split(/(\s+)/).forEach(word => {
        if (!word) return;
        if (/^\s+$/.test(word)) { fragment.append(word); return; }
        const mask = document.createElement('span');
        mask.className = 'composition-copy-word';
        mask.setAttribute('aria-hidden', 'true');
        mask.style.setProperty('--word-index', index++);
        const content = document.createElement('span');
        content.textContent = word;
        mask.append(content);
        fragment.append(mask);
      });
      text.replaceWith(fragment);
    });
  });
  const cards = headings.map(heading => heading.closest('.composition-story'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  cards.forEach(card => card.classList.add('has-composition-reveal'));
  let frame;
  function updateCards() {
    frame = undefined;
    const header = document.querySelector('.site-header');
    const top = Math.max(0, header?.getBoundingClientRect().bottom || 0);
    const bottom = innerHeight - 80;
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      // Re-arm after scrolling back above the card, once it is below the viewport.
      if (!reduced.matches && rect.top >= innerHeight) {
        card.classList.remove('is-composition-visible');
        card.querySelector('h3').classList.remove('is-copy-visible');
        return;
      }
      if (card.classList.contains('is-composition-visible')) return;
      const fullCardVisible = rect.top >= top && rect.bottom <= bottom;
      // On short screens reveal at the top edge when the full card cannot fit.
      const oversized = rect.height > bottom - top && rect.top <= top && rect.bottom > top;
      if (reduced.matches || fullCardVisible || oversized || rect.bottom <= top) {
        card.classList.add('is-composition-visible');
        card.querySelector('h3').classList.add('is-copy-visible');
      }
    });
  }
  function scheduleCards() { if (frame === undefined) frame = requestAnimationFrame(updateCards); }
  addEventListener('scroll', scheduleCards, {passive:true});
  addEventListener('resize', scheduleCards);
  reduced.addEventListener('change', scheduleCards);
  new ResizeObserver(scheduleCards).observe(document.querySelector('.composition-stories'));
  scheduleCards();
})();
