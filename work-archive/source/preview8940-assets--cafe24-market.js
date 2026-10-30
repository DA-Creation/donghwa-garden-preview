(() => {
  document.title = '동화가든 마켓';
  // Category 42 is shared with three TRAF products. Subscription plans and
  // their add-on SKUs belong on the subscription page, not in this market.
  const excludedProductIds = new Set(['26', '27', '28']);
  const productGrid = document.querySelector('[data-native-products]');
  const filters = [...document.querySelectorAll('[data-market-category]')];
  const empty = document.querySelector('[data-native-empty]');
  const shelvesEmpty = document.querySelector('[data-market-shelves-empty]');
  const productCount = document.querySelector('[data-native-product-count]');
  const categoryHeading = document.querySelector('#market-all-title');
  const appShell = document.querySelector('.app-shell.is-market-view');
  const marketMain = document.querySelector('.subview--market');
  const marketShelves = document.querySelector('[data-market-shelves]');
  const marketTabPanel = document.querySelector('[data-market-tab-panel]');
  const siteHeader = appShell?.querySelector('.site-header');
  const marketSearchForm = document.querySelector('#market-search');
  const marketSearchInput = marketSearchForm?.querySelector('input[name="keyword"]');
  const marketHeaderSearchInput = document.querySelector('[data-market-header-search]');
  const sortControl = document.querySelector('#selArray');
  const normalizeText = value => value.normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase('ko-KR');
  const cardName = card => card.querySelector('h3')?.textContent.trim() || '';
  const productId = card => {
    const direct = card.id.match(/anchorBoxId_(\d+)/)?.[1];
    if (direct) return direct;
    const href = card.querySelector('a[href*="product_no="], a[href*="/category/"]')?.getAttribute('href') || '';
    return href.match(/[?&]product_no=(\d+)/)?.[1] || href.match(/\/(\d+)\/category\//)?.[1] || '';
  };
  const isMarketExcluded = card => {
    const name = cardName(card);
    return excludedProductIds.has(productId(card)) || /정기배송/.test(name) || /\[추가구성\]/.test(name);
  };
  const cards = [...(productGrid?.querySelectorAll(':scope > .market-product') || [])].filter(card => {
    if (!isMarketExcluded(card)) return true;
    card.remove();
    return false;
  });
  const cardNames = new Map(cards.map(card => [card, cardName(card)]));
  let activeCategory = 'all';

  const categoryMatches = {
    soup: /찌개|순두부|강된장|청국장|비지|국물|국탕|된장국|미역국|콩나물국|육개장|곰탕|설렁탕/,
    side: /김치|고추지|반찬|젓갈|젓무침/,
    soy: /두유/,
    gift: /선물|추석/
  };
  function matchesCategory(key, name) {
    if (key === 'all') return true;
    // '순두부 순물 백김치' is a side dish, despite its tofu keyword.
    if (key === 'soup' && /백\s*김치/.test(name)) return false;
    if (key === 'soup' && /모두부/.test(name)) return true;
    return categoryMatches[key]?.test(name) || false;
  }
  function primaryCategory(card) {
    const name = cardNames.get(card);
    if (matchesCategory('gift', name)) return 'gift';
    if (matchesCategory('soy', name)) return 'soy';
    if (matchesCategory('side', name)) return 'side';
    if (matchesCategory('soup', name)) return 'soup';
    return '';
  }
  function cloneCard(card, grid = false) {
    const clone = card.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('hidden');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.classList.toggle('market-product--grid', grid);
    return clone;
  }

  // These are the mapped Best Item/New Arrival sets from the source shop.
  // Using their actual product IDs avoids the broad seed flags that also mark
  // subscription and add-on SKUs as recommended/new in this migrated catalog.
  const featuredProductIds = {
    popular: ['32', '33', '35', '36', '37', '40', '42', '45'],
    new: ['32', '33']
  };
  const shelfKeys = ['popular', 'new', 'soup', 'side', 'soy', 'gift'];
  const shelfCardMap = new Map();
  shelfKeys.forEach(key => {
    const sourceCards = featuredProductIds[key]
      ? featuredProductIds[key].map(id => cards.find(card => productId(card) === id)).filter(Boolean)
      : cards.filter(card => primaryCategory(card) === key);
    const clones = sourceCards.map(card => cloneCard(card));
    document.querySelector(`[data-market-shelf="${key}"]`)?.append(...clones);
    shelfCardMap.set(key, clones);
  });

  let featuredTabClones = [];
  function clearFeaturedTab() {
    featuredTabClones.forEach(card => card.remove());
    featuredTabClones = [];
  }
  function renderAllShelves(query) {
    let visibleSections = 0;
    document.querySelectorAll('[data-market-shelf-section]').forEach(section => {
      const key = section.dataset.marketShelfSection;
      let count = 0;
      (shelfCardMap.get(key) || []).forEach(card => {
        card.hidden = !normalizeText(cardName(card)).includes(query);
        if (!card.hidden) count++;
      });
      section.hidden = count === 0;
      const countLabel = section.querySelector('[data-market-shelf-count]');
      if (countLabel) countLabel.textContent = `총 ${count}개`;
      if (count) visibleSections++;
    });
    if (shelvesEmpty) shelvesEmpty.hidden = visibleSections !== 0;
  }
  function filterCards() {
    const query = normalizeText(marketSearchInput?.value || '');
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.marketCategory === activeCategory)));
    clearFeaturedTab();
    let count = 0;
    if (activeCategory === 'all') {
      cards.forEach(card => {
        card.hidden = false;
        if (normalizeText(cardNames.get(card)).includes(query)) count++;
      });
      if (marketShelves) marketShelves.hidden = false;
      if (marketTabPanel) marketTabPanel.hidden = true;
      renderAllShelves(query);
    } else {
      if (marketShelves) marketShelves.hidden = true;
      if (marketTabPanel) marketTabPanel.hidden = false;
      if (featuredProductIds[activeCategory]) {
        cards.forEach(card => { card.hidden = true; });
        featuredTabClones = (shelfCardMap.get(activeCategory) || []).map(card => cloneCard(card, true));
        featuredTabClones.forEach(card => {
          card.hidden = !normalizeText(cardName(card)).includes(query);
          if (!card.hidden) count++;
        });
        productGrid?.append(...featuredTabClones);
      } else {
        cards.forEach(card => {
          const name = cardNames.get(card);
          card.hidden = !matchesCategory(activeCategory, name) || !normalizeText(name).includes(query);
          if (!card.hidden) count++;
        });
      }
    }
    if (empty) empty.hidden = count !== 0;
    if (productCount) productCount.textContent = `총 ${count}개`;
    const selected = filters.find(button => button.dataset.marketCategory === activeCategory);
    if (categoryHeading) categoryHeading.textContent = activeCategory === 'all' ? '전체 상품' : selected?.textContent.trim() || '';
    if (sortControl) sortControl.hidden = Boolean(featuredProductIds[activeCategory]);
    marketMain?.classList.toggle('is-filtering-products', activeCategory !== 'all');
  }
  filters.forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.marketCategory;
    filterCards();
  }));
  marketSearchInput?.addEventListener('input', () => {
    if (marketHeaderSearchInput) marketHeaderSearchInput.value = marketSearchInput.value;
    filterCards();
  });
  marketHeaderSearchInput?.addEventListener('input', () => {
    if (marketSearchInput) marketSearchInput.value = marketHeaderSearchInput.value;
    filterCards();
  });
  marketHeaderSearchInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    // Keep Enter as Cafe24's full-catalog search, rather than a prototype result.
    if (marketSearchInput) marketSearchInput.value = marketHeaderSearchInput.value;
    marketSearchForm?.requestSubmit();
  });
  function updateMarketSearchHeader() {
    if (!appShell || !marketSearchForm) return;
    const headerBottom = siteHeader?.getBoundingClientRect().bottom || 52;
    const passedHeader = marketSearchForm.getBoundingClientRect().bottom <= headerBottom + 1;
    appShell.classList.toggle('is-market-search-sticky', passedHeader);
  }
  window.addEventListener('scroll', updateMarketSearchHeader, { passive: true });
  window.addEventListener('resize', updateMarketSearchHeader);
  window.addEventListener('pageshow', () => {
    if (marketHeaderSearchInput && marketSearchInput) marketHeaderSearchInput.value = marketSearchInput.value;
    filterCards();
    updateMarketSearchHeader();
  });
  if (marketHeaderSearchInput && marketSearchInput) marketHeaderSearchInput.value = marketSearchInput.value;
  filterCards();
  updateMarketSearchHeader();
  document.querySelector('#selArray')?.addEventListener('change', event => {
    const url = new URL(event.currentTarget.value, location.href);
    if (url.origin === location.origin) location.href = url.href;
  });
  const track = document.querySelector('[data-market-promo-track]');
  const slides = [...document.querySelectorAll('[data-market-promo-slide]')];
  const dots = [...document.querySelectorAll('[data-market-promo-dot]')];
  let index = 0;
  function show(next) {
    if (!track || !slides.length) return;
    index = (next + slides.length) % slides.length;
    track.style.transform = `translate3d(-${index * 100}%,0,0)`;
    slides.forEach((slide,i) => { slide.classList.toggle('is-active',i === index); slide.setAttribute('aria-hidden',String(i !== index)); slide.tabIndex = i === index ? 0 : -1; });
    dots.forEach((dot,i) => { dot.classList.toggle('is-active',i === index); if(i === index) dot.setAttribute('aria-current','true'); else dot.removeAttribute('aria-current'); });
  }
  dots.forEach((dot,i) => dot.addEventListener('click', () => show(i)));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => {
    if (!document.hidden && !track?.closest('section').matches(':hover,:focus-within')) show(index + 1);
  },4500);
  show(0);
})();
