(() => {
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toast = document.querySelector('[data-toast]');
  const appShell = document.querySelector('.app-shell');
  const siteLogoImage = document.querySelector('.site-logo img');
  const assetRoot = new URL('./', siteLogoImage?.currentSrc || siteLogoImage?.src || new URL('../b/assets/', document.baseURI)).href;
  const resolveAssetPath = (path) => path?.startsWith('../b/assets/')
    ? new URL(path.slice('../b/assets/'.length), assetRoot).href
    : path;
  const loginScreen = document.querySelector('[data-login-screen]');
  const loginContent = loginScreen?.querySelector('.login-screen__content');
  const loginProviderPanel = loginScreen?.querySelector('[data-login-panel="providers"]');
  const loginEmailPanel = loginScreen?.querySelector('[data-login-panel="email"]');
  let toastTimer;
  let loginOpener = null;
  let bodyOverflowBeforeLogin = '';

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  document.querySelector('[data-promo-close]')?.addEventListener('click', () => {
    document.querySelector('[data-promo]')?.classList.add('is-closed');
  });

  const setLoginMode = (mode = 'providers') => {
    const emailMode = mode === 'email';
    if (loginProviderPanel) loginProviderPanel.hidden = mode !== 'providers';
    const guestPanel = loginScreen?.querySelector('[data-login-panel="guest"]');
    if (guestPanel) guestPanel.hidden = mode !== 'guest';
    loginScreen?.querySelectorAll('[data-account-tab]').forEach((tab) => {
      const active = tab.dataset.accountTab === (mode === 'guest' ? 'guest' : 'providers');
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    if (loginEmailPanel) loginEmailPanel.hidden = !emailMode;
    loginScreen?.classList.toggle('is-email-mode', emailMode);
    if (emailMode) {
      window.requestAnimationFrame(() => loginEmailPanel?.querySelector('input')?.focus({ preventScroll: true }));
    }
  };

  document.querySelectorAll('[data-account-tab]').forEach((tab) => tab.addEventListener('click', () => setLoginMode(tab.dataset.accountTab)));
  document.querySelector('[data-guest-order-form]')?.addEventListener('submit', (event) => { event.preventDefault(); showToast('비회원 주문조회 서비스는 준비 중입니다.'); });

  const openLoginScreen = (opener) => {
    if (!loginScreen || !loginScreen.hidden) return;
    closeRecipeUploadSheet({ restoreFocus: false });
    loginOpener = opener || document.activeElement;
    bodyOverflowBeforeLogin = document.body.style.overflow;
    setLoginMode('providers');
    loginScreen.hidden = false;
    if (appShell) {
      appShell.classList.add('is-login-open');
      appShell.inert = true;
    }
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => loginScreen.querySelector('[data-login-close]')?.focus());
  };

  const closeLoginScreen = () => {
    if (!loginScreen || loginScreen.hidden) return;
    loginScreen.hidden = true;
    document.body.style.overflow = bodyOverflowBeforeLogin;
    setLoginMode('providers');
    loginEmailPanel?.querySelector('form')?.reset();
    if (appShell) {
      appShell.classList.remove('is-login-open');
      appShell.inert = false;
    }
    loginOpener?.focus?.();
    loginOpener = null;
  };

  document.querySelectorAll('[data-login]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openLoginScreen(link);
    });
  });
  document.querySelectorAll('[data-login-close]').forEach((button) => button.addEventListener('click', closeLoginScreen));
  document.querySelectorAll('[data-login-provider]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.loginProvider === 'email') {
      setLoginMode('email');
      return;
    }
    showToast(`${button.textContent.trim()} 연결을 준비하고 있어요.`);
  }));
  document.querySelector('[data-login-email-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('이메일 로그인 서비스는 준비 중입니다.');
  });
  document.querySelectorAll('[data-login-helper]').forEach((button) => button.addEventListener('click', () => {
    showToast(`${button.dataset.loginHelper} 화면을 준비하고 있어요.`);
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !loginScreen?.hidden) closeLoginScreen();
  });
  loginScreen?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...loginScreen.querySelectorAll('button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), a[href]:not([hidden])')]
      .filter((control) => control.offsetParent !== null);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const marketPromo = document.querySelector('[data-market-promo]');
  const marketPromoTrack = marketPromo?.querySelector('[data-market-promo-track]');
  const marketPromoSlides = marketPromo ? [...marketPromo.querySelectorAll('[data-market-promo-slide]')] : [];
  const marketPromoDots = marketPromo ? [...marketPromo.querySelectorAll('[data-market-promo-dot]')] : [];
  let marketPromoIndex = 0;
  let marketPromoTimer;

  const showMarketPromo = (nextIndex) => {
    if (!marketPromoTrack || marketPromoSlides.length === 0) return;
    marketPromoIndex = (nextIndex + marketPromoSlides.length) % marketPromoSlides.length;
    marketPromoTrack.style.transform = `translate3d(-${marketPromoIndex * 100}%, 0, 0)`;
    marketPromoSlides.forEach((slide, index) => {
      const active = index === marketPromoIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.tabIndex = active ? 0 : -1;
    });
    marketPromoDots.forEach((dot, index) => {
      const active = index === marketPromoIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const stopMarketPromo = () => window.clearInterval(marketPromoTimer);
  const startMarketPromo = () => {
    stopMarketPromo();
    if (reducedMotion || document.hidden || marketPromoSlides.length < 2) return;
    marketPromoTimer = window.setInterval(() => showMarketPromo(marketPromoIndex + 1), 4500);
  };

  marketPromoDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showMarketPromo(Number(dot.dataset.marketPromoDot));
      startMarketPromo();
    });
  });
  marketPromo?.addEventListener('mouseenter', stopMarketPromo);
  marketPromo?.addEventListener('mouseleave', startMarketPromo);
  marketPromo?.addEventListener('focusin', stopMarketPromo);
  marketPromo?.addEventListener('focusout', () => window.setTimeout(() => {
    if (!marketPromo.contains(document.activeElement)) startMarketPromo();
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMarketPromo();
    else startMarketPromo();
  });
  showMarketPromo(0);
  startMarketPromo();

  const marketCountdowns = [...document.querySelectorAll('[data-market-countdown]')].map((element) => {
    const match = element.textContent.match(/(\d+)일\s+(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const seconds = Number(match[1]) * 86400 + Number(match[2]) * 3600 + Number(match[3]) * 60 + Number(match[4]);
    return { element, endsAt: Date.now() + seconds * 1000 };
  }).filter(Boolean);

  const renderMarketCountdowns = () => {
    marketCountdowns.forEach(({ element, endsAt }) => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      if (remaining === 0) {
        element.textContent = '마감';
        element.setAttribute('aria-label', '할인 행사 마감');
        return;
      }
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
      element.textContent = `◷ ${days}일 ${time}`;
      element.setAttribute('aria-label', `${days}일 ${hours}시간 ${minutes}분 ${seconds}초 남음`);
    });
  };

  if (marketCountdowns.length) {
    renderMarketCountdowns();
    window.setInterval(renderMarketCountdowns, 1000);
  }

  document.querySelectorAll('[data-plan-detail]').forEach((button) => {
    button.addEventListener('click', () => {
      const planName = button.dataset.planName || '선택한 밥상';
      showToast(`${planName}의 이번 주 구성을 준비하고 있어요.`);
    });
  });

  document.querySelectorAll('.reel-card > button').forEach((button) => {
    button.addEventListener('click', () => showToast('영상 상세 화면을 준비하고 있어요.'));
  });

  document.querySelectorAll('.custom-card__phone button').forEach((button) => {
    button.addEventListener('click', () => {
      const isAdd = button.textContent.trim() === '+';
      button.textContent = isAdd ? '✓' : '+';
      button.setAttribute('aria-pressed', String(isAdd));
      showToast(isAdd ? '이번 주 상자에 담았어요.' : '다시 담을 수 있어요.');
    });
  });

  const revealElements = [...document.querySelectorAll('.reveal')];
  const meters = [...document.querySelectorAll('.meter')];

  const animateCount = (element) => {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    const target = Number(element.dataset.count || 0);
    if (reducedMotion) {
      element.textContent = target.toLocaleString('ko-KR');
      return;
    }
    const startedAt = performance.now();
    const duration = target > 100 ? 1150 : 900;
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(target * eased).toLocaleString('ko-KR');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        if (entry.target.matches('.meter')) entry.target.classList.add('is-animated');
        observer.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: '0px 0px -5% 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
    meters.forEach((meter) => revealObserver.observe(meter));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
    meters.forEach((meter) => meter.classList.add('is-animated'));
    document.querySelectorAll('[data-count]').forEach(animateCount);
  }

  const homeView = document.querySelector('.home-view');
  const reviewFeed = document.querySelector('[data-review-feed]');
  const benefitsHero = document.querySelector('[data-benefits-hero]');
  const benefitsFeed = document.querySelector('[data-benefits-feed]');
  const homeFooter = document.querySelector('.site-footer[data-app-view="home"]');
  const reviewColumns = [...document.querySelectorAll('[data-review-column]')];
  const reviewSentinel = document.querySelector('[data-review-sentinel]');
  const reviewFilterButtons = [...document.querySelectorAll('[data-review-filter]')];
  const reviewTotal = 105178;
  const reviewBatchSize = 10;
  const reviewPhotos = [
    { src: resolveAssetPath('../b/assets/meal-box.png'), alt: '동화가든 제철 한 상 후기' },
    { src: resolveAssetPath('../b/assets/spicy-tofu.jpg'), alt: '얼큰한 순두부 집밥 후기' },
    { src: resolveAssetPath('../b/assets/white-kimchi.jpg'), alt: '백김치와 제철 반찬 후기' },
    { src: resolveAssetPath('../b/assets/guide.jpg'), alt: '동화가든 재료로 차린 집밥' },
    { src: resolveAssetPath('../b/assets/soft-tofu.jpg'), alt: '동화가든 순두부 배송 후기' },
    { src: resolveAssetPath('../b/assets/soy-milk.png'), alt: '고소한 두유와 아침 식탁 후기' }
  ];
  const experienceTexts = [
    '다양한 제철 재료가 먹기 좋은 양으로 와서 냉장고가 복잡하지 않아요. 매주 새로운 식탁을 차리는 재미가 생겼습니다.',
    '포장이 깔끔하고 재료가 정말 신선해요. 필요한 품목만 골라 바꿀 수 있어서 이번 주도 알차게 먹었어요.',
    '퇴근 후 순두부찌개 하나만 끓여도 든든한 한 상이 완성돼요. 남기지 않고 먹을 수 있는 양이라 더 좋습니다.',
    '평소에는 잘 사지 않던 채소도 자연스럽게 먹게 돼요. 다음 상자에는 어떤 제철 재료가 올지 기다려집니다.',
    '아이와 함께 먹기 좋은 순한 반찬이 많고, 배송 전에 구성을 확인할 수 있어 편해요.',
    '재료 상태가 좋고 하나씩 정갈하게 담겨 왔어요. 신선한 집밥을 자주 차리게 됐습니다.',
    '소량으로 여러 가지가 도착해 장보는 부담이 줄었어요. 이번 구성도 빠짐없이 맛있게 먹었습니다.',
    '처음 받아봤는데 구성과 품질 모두 만족해요. 주변에도 추천하고 싶은 정기배송이에요.'
  ];
  const diaryTexts = [
    '몽글몽글 순두부에 제철 채소를 더해 따뜻한 저녁을 차렸어요.',
    '오늘은 백김치와 채소전을 곁들인 간단한 집밥 한 상.',
    '받은 채소로 파스타를 만들었더니 색도 맛도 훨씬 풍성해졌어요.',
    '두유와 구운 채소로 든든하게 시작한 아침입니다.',
    '냉장고 속 재료로 얼큰한 찌개와 계란말이를 만들었어요.',
    '주말 점심은 제철 채소 비빔밥. 간단하지만 정말 맛있었어요.',
    '채소 듬뿍 넣은 따뜻한 국 한 그릇으로 오늘도 잘 먹었습니다.',
    '가족과 함께 먹은 동화가든 집밥 기록을 남겨요.'
  ];
  const reviewNames = ['김*은', '박*진', '이*원', '정*희', '안*주', '서*아', '임*이', '최*선', '강*민', '윤*서', '한*별', '조*현'];
  const reviewPlans = ['순두부 밥상 베이직', '순두부 밥상 패밀리', '발효 건강 밥상', '강릉 이웃 밥상'];
  const reviewState = { filter: 'all', loaded: 0, busy: false, generation: 0 };

  const reviewTotalForFilter = (filter) => {
    if (filter === 'experience') return 62418;
    if (filter === 'diary') return 42760;
    return reviewTotal;
  };

  const rawReviewIndex = (logicalIndex, filter) => {
    if (filter === 'experience') return Math.floor(logicalIndex / 7) * 12 + (logicalIndex % 7);
    if (filter === 'diary') return Math.floor(logicalIndex / 5) * 12 + 7 + (logicalIndex % 5);
    return logicalIndex;
  };

  const reviewDate = (index) => {
    const date = new Date(2026, 7, 18 - index);
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  };

  const makeReviewCard = (logicalIndex, filter) => {
    const index = rawReviewIndex(logicalIndex, filter);
    const isDiary = index % 12 >= 7;
    const hasPhoto = index % 9 !== 6;
    const photo = reviewPhotos[index % reviewPhotos.length];
    const name = reviewNames[index % reviewNames.length];
    const best = !isDiary && (index < 6 || index % 31 === 0);
    const article = document.createElement('article');
    article.className = `feed-review-card${isDiary ? ' feed-review-card--diary' : ''}${hasPhoto ? '' : ' feed-review-card--no-photo'}`;
    const category = isDiary ? '집밥일기' : '이용후기';
    const text = isDiary ? diaryTexts[index % diaryTexts.length] : experienceTexts[index % experienceTexts.length];
    article.innerHTML = `
      ${best ? '<span class="feed-review-card__best">BEST</span>' : ''}
      ${hasPhoto ? `<img class="feed-review-card__photo" src="${photo.src}" alt="${photo.alt}" loading="lazy">` : ''}
      <div class="feed-review-card__body">
        ${isDiary || !best ? `<span class="feed-review-card__category">${category}</span>` : ''}
        ${isDiary ? '' : '<p class="feed-review-card__stars" aria-label="별점 5점">★★★★★</p>'}
        ${isDiary ? '' : `<b class="feed-review-card__round">${reviewPlans[index % reviewPlans.length]} ${(index % 55) + 1}회차</b>`}
        <div class="feed-review-card__meta"><b>${name}</b><time datetime="${reviewDate(index).replaceAll('.', '-')}">${reviewDate(index)}</time></div>
        <p class="feed-review-card__text">${text}</p>
      </div>`;
    return article;
  };

  const finishReviewLoading = () => {
    if (!reviewSentinel) return;
    reviewSentinel.classList.add('is-complete');
    reviewSentinel.removeAttribute('aria-label');
    reviewSentinel.innerHTML = '<p>등록된 후기를 모두 불러왔어요.</p>';
  };

  const loadReviewBatch = () => {
    if (!reviewFeed || reviewFeed.hidden || reviewState.busy) return;
    const total = reviewTotalForFilter(reviewState.filter);
    if (reviewState.loaded >= total) {
      finishReviewLoading();
      return;
    }
    reviewState.busy = true;
    const generation = reviewState.generation;
    window.setTimeout(() => {
      if (generation !== reviewState.generation) return;
      const end = Math.min(reviewState.loaded + reviewBatchSize, total);
      for (let index = reviewState.loaded; index < end; index += 1) {
        reviewColumns[index % 2]?.appendChild(makeReviewCard(index, reviewState.filter));
      }
      reviewState.loaded = end;
      reviewState.busy = false;
      if (reviewState.loaded >= total) finishReviewLoading();
    }, reducedMotion ? 0 : 180);
  };

  const resetReviewFeed = (filter) => {
    reviewState.filter = filter;
    reviewState.loaded = 0;
    reviewState.busy = false;
    reviewState.generation += 1;
    reviewColumns.forEach((column) => { column.innerHTML = ''; });
    if (reviewSentinel) {
      reviewSentinel.classList.remove('is-complete');
      reviewSentinel.setAttribute('aria-label', '후기 불러오는 중');
      reviewSentinel.innerHTML = '<div class="review-skeleton"><i></i><span></span><span></span><span></span></div><div class="review-skeleton"><i></i><span></span><span></span><span></span></div>';
    }
    loadReviewBatch();
  };

  reviewFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      reviewFilterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      resetReviewFeed(button.dataset.reviewFilter || 'all');
    });
  });

  if ('IntersectionObserver' in window && reviewSentinel) {
    const reviewObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadReviewBatch();
    }, { rootMargin: '500px 0px' });
    reviewObserver.observe(reviewSentinel);
  }

  const setHomeTabMode = (name) => {
    const reviewMode = name === 'reviews';
    const benefitsMode = name === 'benefits';
    homeView?.classList.toggle('is-review-mode', reviewMode);
    homeView?.classList.toggle('is-benefits-mode', benefitsMode);
    if (reviewFeed) reviewFeed.hidden = !reviewMode;
    if (benefitsHero) benefitsHero.hidden = !benefitsMode;
    if (benefitsFeed) benefitsFeed.hidden = !benefitsMode;
    if (homeFooter) homeFooter.hidden = reviewMode || benefitsMode;
    if (reviewMode && reviewState.loaded === 0) loadReviewBatch();
  };

  const tabs = [...document.querySelectorAll('[data-section-tab]')];
  const sectionTabNav = document.querySelector('.section-tabs');
  const tabTargets = {
    guide: document.querySelector('.section--empathy'),
    reviews: sectionTabNav,
    benefits: sectionTabNav
  };
  const setActiveTab = (name) => {
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.sectionTab === name));
    setHomeTabMode(name);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      const name = tab.dataset.sectionTab;
      const url = new URL(tab.href, window.location.href);
      window.history.pushState({ tab: name }, '', url.href);
      setActiveTab(name);
      tabTargets[name]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-open-review]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const url = new URL(link.href, window.location.href);
      window.history.pushState({ tab: 'reviews' }, '', url.href);
      setActiveTab('reviews');
      sectionTabNav?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const tabNameFromUrl = () => {
    const type = new URLSearchParams(window.location.search).get('tabType');
    if (type === 'review') return 'reviews';
    if (type === 'faq') return 'benefits';
    return 'guide';
  };

  const applyTabRoute = ({ scroll = true } = {}) => {
    const name = tabNameFromUrl();
    setActiveTab(name);
    const hasTabRoute = new URLSearchParams(window.location.search).has('tabType');
    if (scroll && hasTabRoute) {
      window.requestAnimationFrame(() => {
        tabTargets[name]?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    }
  };

  setActiveTab(tabNameFromUrl());

  const faqItems = [...document.querySelectorAll('.faq-list details')];
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  const appViews = [...document.querySelectorAll('[data-app-view]')];
  const viewLinks = [...document.querySelectorAll('[data-nav-view]')];
  const bottomLinks = [...document.querySelectorAll('.bottom-nav [data-nav-view]')];
  const siteHeader = document.querySelector('.site-header');
  const viewNames = new Set(['home', 'ustore', 'recipes', 'refrigerator']);
  const viewScrollPositions = { home: 0, ustore: 0, recipes: 0, refrigerator: 0 };
  const viewTitles = {
    home: '동화가든 | 매주 도착하는 강릉의 한 상',
    ustore: '마켓 | 동화가든',
    recipes: '오늘 뭐 먹지 | 동화가든',
    refrigerator: '나의 냉장고 | 동화가든'
  };
  const fridgeModal = document.querySelector('[data-fridge-modal]');
  const marketSearchBar = document.querySelector('.market-search-bar');
  const marketSearchInput = marketSearchBar?.querySelector('input');
  const marketHeaderSearchInput = document.querySelector('[data-market-header-search]');
  const marketMain = document.querySelector('.subview--market');
  const marketDetailView = document.querySelector('[data-market-product-detail]');
  const marketBasketView = document.querySelector('[data-market-basket-view]');
  const marketCollectionView = document.querySelector('[data-market-collection-view]');
  const marketCollectionTitle = marketCollectionView?.querySelector('[data-market-collection-title]');
  const marketCollectionGrid = marketCollectionView?.querySelector('[data-market-collection-grid]');
  const marketCollectionSearch = marketCollectionView?.querySelector('[data-market-collection-search]');
  const marketCollectionEmpty = marketCollectionView?.querySelector('[data-market-collection-empty]');
  const marketBasketTitle = marketBasketView?.querySelector('#market-basket-title');
  const marketDetailImage = marketDetailView?.querySelector('[data-market-detail-image]');
  const marketDetailStoryImage = marketDetailView?.querySelector('[data-market-detail-story-image]');
  const marketDetailOverlayTitle = marketDetailView?.querySelector('[data-market-detail-overlay-title]');
  const marketDetailTitle = marketDetailView?.querySelector('[data-market-detail-title]');
  const marketDetailDescription = marketDetailView?.querySelector('[data-market-detail-description]');
  const marketDetailDiscount = marketDetailView?.querySelector('[data-market-detail-discount]');
  const marketDetailOldPrice = marketDetailView?.querySelector('[data-market-detail-old-price]');
  const marketDetailPrice = marketDetailView?.querySelector('[data-market-detail-price]');
  const marketDetailCtaPrice = marketDetailView?.querySelector('[data-market-detail-cta-price]');
  const marketDetailRating = marketDetailView?.querySelector('[data-market-detail-rating]');
  const marketDetailReviewCount = marketDetailView?.querySelector('[data-market-detail-review-count]');
  const marketDetailOrigin = marketDetailView?.querySelector('[data-market-detail-origin]');
  const marketDetailShipping = marketDetailView?.querySelector('[data-market-detail-shipping]');
  const marketDetailDispatch = marketDetailView?.querySelector('[data-market-detail-dispatch]');
  const marketDetailStoryTitle = marketDetailView?.querySelector('[data-market-detail-story-title]');
  const marketDetailStoryCopy = marketDetailView?.querySelector('[data-market-detail-story-copy]');
  const marketCartModal = document.querySelector('[data-market-cart-modal]');
  const marketCartTitle = marketCartModal?.querySelector('[data-market-cart-title]');
  const marketCartShipping = marketCartModal?.querySelector('[data-market-cart-shipping]');
  const marketCartTotal = marketCartModal?.querySelector('[data-market-cart-total]');
  const marketCartQuantity = marketCartModal?.querySelector('[data-market-cart-quantity]');
  const marketCartConfirmLabel = marketCartModal?.querySelector('[data-market-cart-confirm-label]');
  const marketCartDecrease = marketCartModal?.querySelector('[data-market-cart-decrease]');
  let currentView = 'home';
  let marketFeedScrollY = 0;
  let marketDetailOpener = null;
  let activeMarketProduct = null;
  let marketBasketOpener = null;
  let marketBasketScrollY = 0;
  let marketCollectionOpener = null;
  let marketCollectionScrollY = 0;
  let marketCartOpener = null;
  let marketCartUnitPrice = 0;
  let marketCartCount = 1;
  let bodyOverflowBeforeMarketCart = '';
  let appWasInertBeforeMarketCart = false;

  // Keep each list history entry independent, including file:// Back-link fallback.
  const marketReturnStorageKey = 'dhgarden-market-returns-v1';
  const marketReturnRoute = (url) => url.pathname + url.search + url.hash;
  const cleanMarketReturnUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('marketReturn');
    url.searchParams.delete('marketScroll');
    return url;
  };
  const readMarketReturns = () => {
    try {
      const records = JSON.parse(window.sessionStorage.getItem(marketReturnStorageKey) || '[]');
      return Array.isArray(records) ? records : [];
    } catch { return []; }
  };
  const rememberMarketPosition = () => {
    cancelMarketPositionRestore();
    const url = cleanMarketReturnUrl();
    const token = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const snapshot = {
      token, route: marketReturnRoute(url), y: Math.max(0, window.scrollY),
      rails: [...marketMain.querySelectorAll('.market-product-rail, .market-categories')].map(rail => rail.scrollLeft),
      sort: document.querySelector('[data-market-sort]')?.value || '',
      collectionSearch: marketCollectionSearch?.value || '',
      collectionScrollY: marketCollectionScrollY,
      basketScrollY: marketBasketScrollY,
      promoClosed: Boolean(document.querySelector('[data-promo]')?.classList.contains('is-closed'))
    };
    window.history.replaceState({ ...window.history.state, marketDetailReturn: snapshot }, '', url.href);
    try {
      window.sessionStorage.setItem(marketReturnStorageKey, JSON.stringify([...readMarketReturns(), snapshot].slice(-12)));
    } catch { /* History plus the numeric URL fallback still work without storage. */ }
    url.searchParams.set('marketReturn', token);
    url.searchParams.set('marketScroll', String(snapshot.y));
    return marketReturnRoute(url);
  };
  let cancelMarketPositionRestore = () => {};
  const restoreMarketPosition = () => {
    cancelMarketPositionRestore();
    const params = new URLSearchParams(window.location.search);
    if (currentView !== 'ustore' || params.has('product')) return;
    const url = cleanMarketReturnUrl();
    const route = marketReturnRoute(url);
    const token = params.get('marketReturn');
    let snapshot = token ? readMarketReturns().find(record => record?.token === token && record.route === route)
      : window.history.state?.marketDetailReturn;
    if (!snapshot && token && /^\d+(?:\.\d+)?$/.test(params.get('marketScroll') || '')) {
      snapshot = { token, route, y: Number(params.get('marketScroll')) };
    }
    if (!snapshot || snapshot.route !== route || !Number.isFinite(snapshot.y) || snapshot.y < 0) return;
    window.history.replaceState({ ...window.history.state, marketDetailReturn: snapshot }, '', url.href);
    viewScrollPositions.ustore = snapshot.y;
    if (Number.isFinite(snapshot.collectionScrollY)) marketCollectionScrollY = snapshot.collectionScrollY;
    if (Number.isFinite(snapshot.basketScrollY)) marketBasketScrollY = snapshot.basketScrollY;
    const sort = document.querySelector('[data-market-sort]');
    if (sort && snapshot.sort && [...sort.options].some(option => option.value === snapshot.sort)) {
      sort.value = snapshot.sort;
      sort.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (marketCollectionSearch && typeof snapshot.collectionSearch === 'string') {
      marketCollectionSearch.value = snapshot.collectionSearch;
      filterMarketCollection();
    }
    if (typeof snapshot.promoClosed === 'boolean') {
      document.querySelector('[data-promo]')?.classList.toggle('is-closed', snapshot.promoClosed);
    }

    let active = true;
    let observer;
    let timeout;
    const stop = () => {
      active = false;
      observer?.disconnect();
      window.clearTimeout(timeout);
      ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => window.removeEventListener(type, stop));
      window.removeEventListener('load', apply);
    };
    const apply = () => {
      if (!active) return;
      if (marketReturnRoute(cleanMarketReturnUrl()) !== route) return stop();
      marketMain.querySelectorAll('.market-product-rail, .market-categories').forEach((rail, index) => {
        if (Number.isFinite(snapshot.rails?.[index])) rail.scrollLeft = snapshot.rails[index];
      });
      window.scrollTo({ top: snapshot.y, behavior: 'instant' });
      updateMarketSearchHeader();
    };
    cancelMarketPositionRestore = stop;
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => window.addEventListener(type, stop, { passive: true }));
    // Run after route rendering/focus, then briefly track late image/font layout.
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (!active) return;
      apply();
      if (!active) return;
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(apply);
        observer.observe(marketMain);
      }
      timeout = window.setTimeout(stop, 1500);
    }));
    window.addEventListener('load', apply);
    document.fonts?.ready.then(apply);
  };

  const whiteKimchiDetail = './product-details/dg-09.html';
  const importedMarketDetails = {
  "dg-01": "./product-details/dg-01.html",
  "dg-02": "./product-details/dg-02.html",
  "dg-04": "./product-details/dg-04.html",
  "dg-05": whiteKimchiDetail,
  "dg-06": "./product-details/dg-06.html",
  "dg-07": "./product-details/dg-07.html",
  "dg-09": whiteKimchiDetail,
  "dg-10": "./product-details/dg-10.html",
  "dg-11": "./product-details/dg-11.html",
  "dg-12": "./product-details/dg-12.html",
  "dg-13": "./product-details/dg-13.html",
  "dg-14": "./product-details/dg-14.html",
  "dg-16": "./product-details/dg-16.html"
};

  const marketProductCards = [...document.querySelectorAll('.subview--market .market-product')];
  const marketProductItems = new Map();

  const marketAllGrid = document.querySelector('[data-market-all-products]');
  const marketAllCards = [...(marketAllGrid?.querySelectorAll('.market-product') || [])];
  const marketProductCount = document.querySelector('[data-market-product-count]');
  if (marketProductCount) marketProductCount.textContent = `총 ${marketAllCards.length}개`;
  document.querySelector('[data-market-sort]')?.addEventListener('change', (event) => {
    // Keep curated source order for recommendations. Until registration dates are
    // available, prioritize explicitly marked new products and retain tie order.
    const cards = [...marketAllCards];
    if (event.target.value === 'newest') {
      cards.sort((a, b) => Number(b.dataset.marketNew === 'true') - Number(a.dataset.marketNew === 'true'));
    }
    marketAllGrid?.append(...cards);
  });

  const inferMarketOrigin = (title = '') => {
    const match = title.match(/(강릉|영광|속초|경산|영천|감곡|포항|해남|전남|제주|국산|국내산)/);
    return match?.[1] || '국내 제조';
  };

  marketProductCards.forEach((card, index) => {
    const imageNode = card.querySelector('.market-product__visual img');
    const image = imageNode?.getAttribute('src') || resolveAssetPath('../b/assets/market/product-016.png');
    const fileKey = image.split('/').pop()?.replace(/\.[^.]+$/, '') || `product-${index + 1}`;
    let key = card.dataset.marketProductKey || fileKey;
    let duplicateIndex = 2;
    while (marketProductItems.has(key)) key = `${fileKey}-${duplicateIndex++}`;
    const title = card.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim() || `상품 ${index + 1}`;
    const reviewText = card.querySelector(':scope > em')?.textContent.trim() || '';
    const reviewMatch = reviewText.match(/★\s*([0-9.]+)\s*\(([^)]+)\)/);
    const shippingBadge = card.querySelector('.market-product__visual > span')?.textContent.trim();
    let detailTrigger = card.querySelector('.market-product__detail-link');
    if (!detailTrigger) {
      detailTrigger = document.createElement('button');
      detailTrigger.type = 'button';
      detailTrigger.className = 'market-product__detail-link';
      detailTrigger.textContent = '상품 상세 보기';
      card.append(detailTrigger);
    }
    detailTrigger.setAttribute('aria-label', `${title} 상품 상세 보기`);
    const data = {
      key,
      detailPage: importedMarketDetails[card.dataset.marketProductKey] || null,
      card,
      detailTrigger,
      image,
      imageAlt: imageNode?.getAttribute('alt') || title,
      title,
      description: card.querySelector(':scope > p')?.textContent.replace(/\s+/g, ' ').trim() || `${imageNode?.getAttribute('alt') || '제철 식재료'}의 맛과 신선함을 그대로 담았어요.`,
      discount: card.querySelector(':scope > small b')?.textContent.trim() || '',
      oldPrice: card.querySelector(':scope > small del')?.textContent.trim() || '',
      price: card.querySelector(':scope > strong')?.textContent.trim() || '0원',
      rating: reviewMatch?.[1] || '–',
      reviewCount: reviewMatch?.[2] || '0',
      origin: inferMarketOrigin(title),
      shipping: card.querySelector('.market-product__shipping') ? '동화가든 배송' : (shippingBadge || '배송비 별도')
    };
    card.dataset.marketProductKey = key;
    marketProductItems.set(key, data);
  });

  const marketCollections = new Map();
  document.querySelectorAll('.subview--market .market-showcase').forEach((section) => {
    const className = [...section.classList].find((name) => name.startsWith('market-showcase--'));
    const key = className?.replace('market-showcase--', '');
    const button = section.querySelector('.market-showcase__heading > button');
    const title = section.querySelector('.market-showcase__heading h2')?.textContent.replace(/\s+/g, ' ').trim();
    if (!key || !button || !title) return;
    button.dataset.marketCollection = key;
    button.setAttribute('aria-label', `${title} 전체 상품 보기`);
    marketCollections.set(key, {
      key,
      title,
      productKeys: [...section.querySelectorAll('.market-product')]
        .map((card) => card.dataset.marketProductKey)
        .filter(Boolean)
    });
  });

  const formatWon = (amount) => `${amount.toLocaleString('ko-KR')}원`;

  const tomorrowShippingLabel = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `동화가든에서 ${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]}) 출고`;
  };

  const renderMarketCart = () => {
    const total = marketCartUnitPrice * marketCartCount;
    if (marketCartQuantity) marketCartQuantity.textContent = String(marketCartCount);
    if (marketCartTotal) marketCartTotal.textContent = formatWon(total);
    if (marketCartConfirmLabel) marketCartConfirmLabel.textContent = `${formatWon(total)} 담기`;
    if (marketCartDecrease) marketCartDecrease.disabled = marketCartCount <= 1;
  };

  const closeMarketCartModal = ({ restoreFocus = true } = {}) => {
    if (!marketCartModal || marketCartModal.hidden) return;
    marketCartModal.hidden = true;
    document.body.style.overflow = bodyOverflowBeforeMarketCart;
    if (appShell) appShell.inert = appWasInertBeforeMarketCart;
    const opener = marketCartOpener;
    marketCartOpener = null;
    if (restoreFocus) opener?.focus?.();
  };

  const openMarketCartModal = (opener, productData = null) => {
    if (!marketCartModal) return;
    const product = opener.closest('.market-product');
    const title = productData?.title || product?.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim() || '선택한 상품';
    const priceText = productData?.price || product?.querySelector(':scope > strong')?.textContent || '0';
    marketCartUnitPrice = Number(priceText.replace(/[^0-9]/g, '')) || 0;
    marketCartCount = 1;
    marketCartOpener = opener;
    if (marketCartTitle) marketCartTitle.textContent = title;
    if (marketCartShipping) marketCartShipping.textContent = tomorrowShippingLabel();
    renderMarketCart();
    bodyOverflowBeforeMarketCart = document.body.style.overflow;
    appWasInertBeforeMarketCart = Boolean(appShell?.inert);
    marketCartModal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (appShell) appShell.inert = true;
    window.requestAnimationFrame(() => marketCartModal.querySelector('.market-cart-sheet__close')?.focus());
  };

  const updateMarketSearchHeader = () => {
    if (!appShell || currentView !== 'ustore' || !marketSearchBar || marketMain?.classList.contains('is-detail-view') || marketMain?.classList.contains('is-cart-view') || marketMain?.classList.contains('is-collection-view')) {
      appShell?.classList.remove('is-market-search-sticky');
      return;
    }
    const headerBottom = siteHeader?.getBoundingClientRect().bottom || 59;
    const searchHasPassedHeader = marketSearchBar.getBoundingClientRect().bottom <= headerBottom + 1;
    appShell.classList.toggle('is-market-search-sticky', searchHasPassedHeader);
  };

  marketSearchInput?.addEventListener('input', () => {
    if (marketHeaderSearchInput) marketHeaderSearchInput.value = marketSearchInput.value;
  });
  marketHeaderSearchInput?.addEventListener('input', () => {
    if (marketSearchInput) marketSearchInput.value = marketHeaderSearchInput.value;
  });
  window.addEventListener('scroll', updateMarketSearchHeader, { passive: true });
  window.addEventListener('resize', updateMarketSearchHeader);

  document.querySelectorAll('[data-market-cart-close]').forEach((button) => button.addEventListener('click', () => closeMarketCartModal()));
  marketCartModal?.querySelector('[data-market-cart-decrease]')?.addEventListener('click', () => {
    marketCartCount = Math.max(1, marketCartCount - 1);
    renderMarketCart();
  });
  marketCartModal?.querySelector('[data-market-cart-increase]')?.addEventListener('click', () => {
    marketCartCount = Math.min(99, marketCartCount + 1);
    renderMarketCart();
  });
  marketCartModal?.querySelector('[data-market-cart-confirm]')?.addEventListener('click', () => {
    const count = marketCartCount;
    closeMarketCartModal();
    showToast(`${count}개를 장바구니에 담았어요.`);
  });
  marketCartModal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...marketCartModal.querySelectorAll('.market-cart-sheet button:not([disabled])')];
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !marketCartModal?.hidden) {
      event.preventDefault();
      closeMarketCartModal();
    }
  });

  const renderMarketProductDetail = (item) => {
    if (!item || !marketDetailView) return;
    activeMarketProduct = item;
    if (marketDetailImage) {
      marketDetailImage.src = item.image;
      marketDetailImage.alt = item.imageAlt;
    }
    if (marketDetailStoryImage) {
      marketDetailStoryImage.src = item.image;
      marketDetailStoryImage.alt = `${item.title} 상세 이미지`;
    }
    if (marketDetailOverlayTitle) marketDetailOverlayTitle.textContent = item.title;
    if (marketDetailTitle) marketDetailTitle.textContent = item.title;
    if (marketDetailDescription) marketDetailDescription.textContent = item.description;
    if (marketDetailDiscount) {
      marketDetailDiscount.textContent = item.discount;
      marketDetailDiscount.hidden = !item.discount;
    }
    if (marketDetailOldPrice) {
      marketDetailOldPrice.textContent = item.oldPrice;
      marketDetailOldPrice.hidden = !item.oldPrice;
    }
    if (marketDetailPrice) marketDetailPrice.textContent = item.price;
    if (marketDetailCtaPrice) marketDetailCtaPrice.textContent = item.price;
    if (marketDetailRating) marketDetailRating.textContent = item.rating;
    if (marketDetailReviewCount) marketDetailReviewCount.textContent = `${item.reviewCount}건`;
    if (marketDetailOrigin) marketDetailOrigin.textContent = item.origin;
    if (marketDetailShipping) marketDetailShipping.textContent = item.shipping;
    if (marketDetailDispatch) marketDetailDispatch.textContent = tomorrowShippingLabel().replace('동화가든에서 ', '지금 주문 시 ');
    if (marketDetailStoryTitle) marketDetailStoryTitle.textContent = `${item.imageAlt}의 본점 맛을 그대로 담았어요`;
    if (marketDetailStoryCopy) marketDetailStoryCopy.textContent = `${item.description} 동화가든의 조리법과 정성을 담아 집에서도 간편하게 즐길 수 있도록 준비했어요.`;
    document.title = `${item.title} | 동화가든 마켓`;
  };

  const closeMarketProductDetail = ({ restoreScroll = true, restoreFocus = true } = {}) => {
    if (!marketMain?.classList.contains('is-detail-view')) return;
    marketMain.classList.remove('is-detail-view');
    appShell?.classList.remove('is-market-product-detail');
    if (marketDetailView) marketDetailView.hidden = true;
    document.title = viewTitles.ustore;
    const opener = marketDetailOpener;
    marketDetailOpener = null;
    activeMarketProduct = null;
    if (restoreScroll) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: marketFeedScrollY, behavior: 'auto' });
        if (restoreFocus) opener?.focus?.({ preventScroll: true });
        updateMarketSearchHeader();
      });
    } else if (restoreFocus && currentView === 'ustore') {
      window.requestAnimationFrame(() => opener?.focus?.({ preventScroll: true }));
    }
  };

  const openMarketProductDetail = (item, { pushHistory = true, opener = null } = {}) => {
    if (!marketMain || !marketDetailView || !item) return;
    const returnTo = pushHistory ? rememberMarketPosition() : null;
    if (item.detailPage) {
      // Replace legacy deep links so Back returns to the list without redirect loops.
      if (pushHistory) {
        const destination = new URL(item.detailPage, window.location.href);
        destination.searchParams.set('returnTo', returnTo);
        window.location.assign(destination.href);
      } else window.location.replace(item.detailPage);
      return;
    }
    const alreadyOpen = marketMain.classList.contains('is-detail-view');
    if (!alreadyOpen) marketFeedScrollY = pushHistory ? window.scrollY : viewScrollPositions.ustore;
    marketDetailOpener = opener || item.detailTrigger || marketDetailOpener;
    closeMarketCartModal({ restoreFocus: false });
    closeMarketBasketView({ restoreScroll: false, restoreFocus: false });
    closeMarketCollectionView({ restoreScroll: false, restoreFocus: false });
    renderMarketProductDetail(item);
    marketMain.classList.add('is-detail-view');
    appShell?.classList.add('is-market-product-detail');
    appShell?.classList.remove('is-market-search-sticky');
    marketDetailView.hidden = false;
    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'ustore');
      url.searchParams.set('product', item.key);
      url.searchParams.delete('marketScreen');
      url.searchParams.delete('collection');
      url.searchParams.delete('recipeScreen');
      url.searchParams.delete('recipe');
      window.history.pushState({ view: 'ustore', product: item.key }, '', url.href);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => marketDetailOverlayTitle?.focus());
  };

  const syncMarketProductDetailFromUrl = () => {
    const key = currentView === 'ustore' ? new URLSearchParams(window.location.search).get('product') : null;
    if (key) {
      const item = marketProductItems.get(key);
      if (!item) {
        const url = new URL(window.location.href);
        url.searchParams.delete('product');
        window.history.replaceState({ view: 'ustore' }, '', url.href);
        closeMarketProductDetail({ restoreScroll: false });
        return;
      }
      openMarketProductDetail(item, { pushHistory: false });
      return;
    }
    closeMarketProductDetail();
  };

  marketProductCards.forEach((card) => {
    const open = () => {
      const item = marketProductItems.get(card.dataset.marketProductKey);
      if (item) openMarketProductDetail(item, { opener: item.detailTrigger });
    };
    card.querySelector('.market-product__detail-link')?.addEventListener('click', open);
  });

  marketDetailView?.querySelector('[data-market-detail-back]')?.addEventListener('click', () => {
    const url = new URL(window.location.href);
    if (window.history.state?.product) {
      window.history.back();
      return;
    }
    url.searchParams.delete('product');
    window.history.replaceState({ view: 'ustore' }, '', url.href);
    closeMarketProductDetail();
  });
  marketDetailView?.querySelector('[data-market-detail-add]')?.addEventListener('click', (event) => {
    if (activeMarketProduct) openMarketCartModal(event.currentTarget, activeMarketProduct);
  });
  marketDetailView?.querySelector('[data-market-detail-gift]')?.addEventListener('click', () => showToast('선물하기 화면을 준비하고 있어요.'));
  marketDetailView?.querySelector('[data-market-detail-share]')?.addEventListener('click', async () => {
    if (navigator.share && activeMarketProduct) {
      try {
        await navigator.share({ title: activeMarketProduct.title, url: window.location.href });
      } catch (error) {
        if (error?.name !== 'AbortError') showToast('공유 링크를 준비하지 못했어요.');
      }
      return;
    }
    showToast('상품 링크를 공유할 수 있게 준비했어요.');
  });
  marketDetailView?.querySelector('[data-market-detail-reviews]')?.addEventListener('click', () => showToast('상품 후기를 불러오고 있어요.'));
  marketDetailView?.querySelector('[data-market-detail-event-close]')?.addEventListener('click', () => {
    marketDetailView.querySelector('[data-market-detail-event]')?.setAttribute('hidden', '');
  });
  marketDetailView?.querySelector('[data-market-detail-event-link]')?.addEventListener('click', () => showToast('이번 주 제철 상품을 확인하고 있어요.'));

  const closeMarketBasketView = ({ restoreScroll = false, restoreFocus = false } = {}) => {
    const wasOpen = Boolean(marketMain?.classList.contains('is-cart-view'));
    marketMain?.classList.remove('is-cart-view');
    appShell?.classList.remove('is-market-cart-view');
    if (marketBasketView) marketBasketView.hidden = true;
    if (!wasOpen) return;
    const opener = marketBasketOpener;
    marketBasketOpener = null;
    document.title = marketMain?.classList.contains('is-detail-view') && activeMarketProduct
      ? `${activeMarketProduct.title} | 동화가든 마켓`
      : viewTitles.ustore;
    if (restoreScroll) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: marketBasketScrollY, behavior: 'auto' });
        if (restoreFocus) opener?.focus?.({ preventScroll: true });
        updateMarketSearchHeader();
      });
    } else if (restoreFocus) {
      window.requestAnimationFrame(() => opener?.focus?.({ preventScroll: true }));
    }
  };

  const openMarketBasketView = (opener = null, { pushHistory = true } = {}) => {
    if (!marketMain || !marketBasketView) return;
    const alreadyOpen = marketMain.classList.contains('is-cart-view');
    if (!alreadyOpen) marketBasketScrollY = currentView === 'ustore' ? window.scrollY : 0;
    marketBasketOpener = opener || marketBasketOpener;
    closeMarketCartModal({ restoreFocus: false });
    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'ustore');
      url.searchParams.set('marketScreen', 'cart');
      url.searchParams.delete('product');
      url.searchParams.delete('recipeScreen');
      url.searchParams.delete('recipe');
      window.history.pushState({ view: 'ustore', marketScreen: 'cart' }, '', url.href);
    }
    if (currentView !== 'ustore') showView('ustore', { restoreScroll: false, showNotice: false });
    marketMain.classList.add('is-cart-view');
    appShell?.classList.add('is-market-cart-view');
    appShell?.classList.remove('is-market-search-sticky');
    marketBasketView.hidden = false;
    document.title = '장바구니 | 동화가든';
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => marketBasketTitle?.focus());
  };

  const syncMarketBasketViewFromUrl = () => {
    const requested = currentView === 'ustore' && new URLSearchParams(window.location.search).get('marketScreen') === 'cart';
    if (requested) {
      openMarketBasketView(null, { pushHistory: false });
      return;
    }
    closeMarketBasketView({ restoreScroll: false, restoreFocus: false });
  };

  const goToMarketFeedFromBasket = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'ustore');
    url.searchParams.delete('marketScreen');
    url.searchParams.delete('product');
    window.history.replaceState({ view: 'ustore' }, '', url.href);
    closeMarketBasketView({ restoreScroll: false, restoreFocus: false });
    closeMarketProductDetail({ restoreScroll: false, restoreFocus: false });
    showView('ustore', { animate: false, restoreScroll: false, showNotice: false });
  };

  document.querySelectorAll('[data-market-basket-open]').forEach((button) => {
    button.addEventListener('click', () => openMarketBasketView(button));
  });
  marketBasketView?.querySelector('[data-market-basket-back]')?.addEventListener('click', () => {
    if (window.history.state?.marketScreen === 'cart') {
      window.history.back();
      return;
    }
    goToMarketFeedFromBasket();
  });
  marketBasketView?.querySelector('[data-market-basket-shop]')?.addEventListener('click', goToMarketFeedFromBasket);
  marketBasketView?.querySelector('[data-market-basket-subscription]')?.addEventListener('click', () => showToast('정기배송 장바구니는 준비 중이에요.'));
  marketBasketView?.querySelectorAll('[data-market-basket-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = marketProductItems.get(button.dataset.marketBasketAdd);
      if (item) openMarketCartModal(button, item);
    });
  });
  marketBasketView?.querySelectorAll('[data-market-basket-detail]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = marketProductItems.get(button.dataset.marketBasketDetail);
      if (!item) return;
      openMarketProductDetail(item, { opener: button });
    });
  });

  const filterMarketCollection = () => {
    if (!marketCollectionGrid) return;
    const query = marketCollectionSearch?.value.replace(/\s+/g, '').toLocaleLowerCase('ko-KR') || '';
    let visibleCount = 0;
    marketCollectionGrid.querySelectorAll('.market-product').forEach((card) => {
      const matches = !query || (card.dataset.marketSearchText || '').includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    if (marketCollectionEmpty) marketCollectionEmpty.hidden = visibleCount !== 0;
  };

  const renderMarketCollection = (definition) => {
    if (!definition || !marketCollectionGrid) return;
    if (marketCollectionTitle) marketCollectionTitle.textContent = definition.title;
    marketCollectionGrid.replaceChildren();
    if (marketCollectionSearch) marketCollectionSearch.value = '';

    const orderedKeys = [
      ...definition.productKeys,
      ...[...marketProductItems.keys()].filter((key) => !definition.productKeys.includes(key))
    ];

    orderedKeys.forEach((key) => {
      const item = marketProductItems.get(key);
      if (!item) return;
      const card = item.card.cloneNode(true);
      card.classList.add('market-product--grid');
      card.dataset.marketProductKey = key;
      card.dataset.marketSearchText = `${item.title} ${item.description} ${item.imageAlt}`.replace(/\s+/g, '').toLocaleLowerCase('ko-KR');
      const addButton = card.querySelector(':scope > [data-market-add]');
      const detailButton = card.querySelector(':scope > .market-product__detail-link');
      addButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        openMarketCartModal(addButton, item);
      });
      detailButton?.addEventListener('click', () => openMarketProductDetail(item, { opener: detailButton }));
      marketCollectionGrid.append(card);
    });
    filterMarketCollection();
  };

  const closeMarketCollectionView = ({ restoreScroll = false, restoreFocus = false } = {}) => {
    const wasOpen = Boolean(marketMain?.classList.contains('is-collection-view'));
    marketMain?.classList.remove('is-collection-view');
    appShell?.classList.remove('is-market-collection-view');
    if (marketCollectionView) marketCollectionView.hidden = true;
    if (!wasOpen) return;
    const opener = marketCollectionOpener;
    marketCollectionOpener = null;
    document.title = viewTitles.ustore;
    if (restoreScroll) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: marketCollectionScrollY, behavior: 'auto' });
        if (restoreFocus) opener?.focus?.({ preventScroll: true });
        updateMarketSearchHeader();
      });
    } else if (restoreFocus) {
      window.requestAnimationFrame(() => opener?.focus?.({ preventScroll: true }));
    }
  };

  const openMarketCollectionView = (key, { pushHistory = true, opener = null } = {}) => {
    const definition = marketCollections.get(key);
    if (!marketMain || !marketCollectionView || !definition) return;
    const alreadyOpen = marketMain.classList.contains('is-collection-view');
    if (!alreadyOpen) marketCollectionScrollY = currentView === 'ustore' ? window.scrollY : 0;
    marketCollectionOpener = opener || marketCollectionOpener;
    closeMarketCartModal({ restoreFocus: false });
    renderMarketCollection(definition);
    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'ustore');
      url.searchParams.set('marketScreen', 'collection');
      url.searchParams.set('collection', key);
      url.searchParams.delete('product');
      url.searchParams.delete('recipeScreen');
      url.searchParams.delete('recipe');
      window.history.pushState({ view: 'ustore', marketScreen: 'collection', collection: key }, '', url.href);
    }
    if (currentView !== 'ustore') showView('ustore', { restoreScroll: false, showNotice: false });
    marketMain.classList.add('is-collection-view');
    appShell?.classList.add('is-market-collection-view');
    appShell?.classList.remove('is-market-search-sticky');
    marketCollectionView.hidden = false;
    document.title = `${definition.title} | 동화가든 마켓`;
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => marketCollectionTitle?.focus());
  };

  const syncMarketCollectionFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const requested = currentView === 'ustore' && params.get('marketScreen') === 'collection';
    if (!requested) {
      closeMarketCollectionView({ restoreScroll: false, restoreFocus: false });
      return;
    }
    const key = params.get('collection') || 'rescue';
    if (!marketCollections.has(key)) {
      const url = new URL(window.location.href);
      url.searchParams.set('collection', 'rescue');
      window.history.replaceState({ view: 'ustore', marketScreen: 'collection', collection: 'rescue' }, '', url.href);
      openMarketCollectionView('rescue', { pushHistory: false });
      return;
    }
    openMarketCollectionView(key, { pushHistory: false });
  };

  const goToMarketFeedFromCollection = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'ustore');
    url.searchParams.delete('marketScreen');
    url.searchParams.delete('collection');
    url.searchParams.delete('product');
    window.history.replaceState({ view: 'ustore' }, '', url.href);
    closeMarketCollectionView({ restoreScroll: true, restoreFocus: true });
  };

  marketMain?.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-market-collection]');
    if (!button || !marketMain.contains(button)) return;
    openMarketCollectionView(button.dataset.marketCollection, { opener: button });
  });
  marketCollectionView?.querySelector('[data-market-collection-back]')?.addEventListener('click', () => {
    if (window.history.state?.marketScreen === 'collection') {
      window.history.back();
      return;
    }
    goToMarketFeedFromCollection();
  });
  marketCollectionSearch?.addEventListener('input', filterMarketCollection);

  const viewNameFromUrl = () => {
    const requested = new URLSearchParams(window.location.search).get('view');
    return viewNames.has(requested) ? requested : 'home';
  };

  const closeFridgeModal = () => {
    if (!fridgeModal) return;
    fridgeModal.hidden = true;
    document.body.style.overflow = '';
  };

  const openFridgeModal = () => {
    if (!fridgeModal) return;
    fridgeModal.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const showView = (name, { animate = true, restoreScroll = true, showNotice = true } = {}) => {
    if (!viewNames.has(name)) name = 'home';
    const changed = currentView !== name;
    const routeParams = new URLSearchParams(window.location.search);
    const marketProductRequested = name === 'ustore' && Boolean(routeParams.get('product'));
    const marketBasketRequested = name === 'ustore' && routeParams.get('marketScreen') === 'cart';
    const marketCollectionRequested = name === 'ustore' && routeParams.get('marketScreen') === 'collection';
    const wasMarketDetail = currentView === 'ustore' && Boolean(marketMain?.classList.contains('is-detail-view'));
    const wasMarketBasket = currentView === 'ustore' && Boolean(marketMain?.classList.contains('is-cart-view'));
    const wasMarketCollection = currentView === 'ustore' && Boolean(marketMain?.classList.contains('is-collection-view'));
    const recipeScreen = name === 'recipes' ? routeParams.get('recipeScreen') : null;
    const wasRecipeSubView = currentView === 'recipes' && Boolean(recipesMain?.classList.contains('is-diary-view') || recipesMain?.classList.contains('is-detail-view'));
    const diaryRequested = recipeScreen === 'diary';
    const detailRequested = recipeScreen === 'detail';
    const returningToRecipeFeed = Boolean(wasRecipeSubView && name === 'recipes' && !diaryRequested && !detailRequested);
    const returningToMarketFeed = Boolean((wasMarketDetail || wasMarketBasket || wasMarketCollection) && name === 'ustore' && !marketProductRequested && !marketBasketRequested && !marketCollectionRequested);
    if (!wasRecipeSubView && !wasMarketDetail && !wasMarketBasket && !wasMarketCollection) viewScrollPositions[currentView] = window.scrollY;
    currentView = name;
    closeFridgeModal();
    if (name !== 'ustore') closeMarketCartModal({ restoreFocus: false });
    if (name !== 'ustore' || !marketBasketRequested) closeMarketBasketView({ restoreScroll: false, restoreFocus: false });
    if (name !== 'ustore' || !marketProductRequested) closeMarketProductDetail({ restoreScroll: false });
    if (name !== 'ustore' || !marketCollectionRequested) closeMarketCollectionView({ restoreScroll: false, restoreFocus: false });
    if (name !== 'recipes' || !diaryRequested) {
      closeRecipeDiaryView({ restoreScroll: false, fromHistory: true });
    }
    if (name !== 'recipes' || !detailRequested) {
      closeRecipeDetailView({ restoreScroll: false, fromHistory: true });
    }
    if (name !== 'recipes') {
      closeRecipeUploadSheet({ restoreFocus: false });
      closeRecipeLoginModal({ restoreFocus: false });
    }

    appViews.forEach((view) => {
      const active = view.dataset.appView === name;
      view.hidden = !active;
      view.setAttribute('aria-hidden', String(!active));
      view.classList.remove('is-entering');
      if (active && animate && changed) {
        window.requestAnimationFrame(() => view.classList.add('is-entering'));
      }
    });

    bottomLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.navView === name));
    appShell?.classList.toggle('is-recipes-view', name === 'recipes');
    appShell?.classList.toggle('is-market-view', name === 'ustore');
    if (name === 'recipes') startRecipeCarousel();
    else stopRecipeCarousel();
    if (siteHeader) siteHeader.hidden = false;
    document.title = viewTitles[name];

    window.requestAnimationFrame(() => {
      const marketReturnTop = wasMarketCollection ? marketCollectionScrollY : marketFeedScrollY;
      const top = returningToMarketFeed ? marketReturnTop : (returningToRecipeFeed ? recipeFeedScrollY : (restoreScroll ? viewScrollPositions[name] : 0));
      window.scrollTo({ top, behavior: 'auto' });
      if (name === 'home') applyTabRoute({ scroll: true });
      if (name === 'refrigerator' && showNotice && changed) openFridgeModal();
      updateMarketSearchHeader();
    });
  };

  const navigateToView = (name, href, options = {}) => {
    const url = new URL(href, window.location.href);
    window.history.pushState({ view: name }, '', url.href);
    showView(name, { restoreScroll: false, ...options });
  };

  viewLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const name = link.dataset.navView;
      navigateToView(name, link.href);
    });
  });

  document.querySelectorAll('[data-home-anchor]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const id = link.dataset.homeAnchor;
      const url = new URL(`./index.html#${id}`, window.location.href);
      window.history.pushState({ view: 'home', anchor: id }, '', url.href);
      showView('home', { restoreScroll: false, showNotice: false });
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }));
    });
  });

  window.addEventListener('popstate', () => {
    const name = viewNameFromUrl();
    showView(name, { animate: false, restoreScroll: false, showNotice: false });
    syncMarketProductDetailFromUrl();
    syncMarketBasketViewFromUrl();
    syncMarketCollectionFromUrl();
    syncRecipeSubViewFromUrl();
    if (name === 'home') applyTabRoute({ scroll: true });
    restoreMarketPosition();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) restoreMarketPosition();
  });

  document.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeFridgeModal));
  document.querySelectorAll('[data-fridge-help], .fridge-empty-button').forEach((button) => button.addEventListener('click', openFridgeModal));
  document.querySelector('[data-modal-subscribe]')?.addEventListener('click', () => {
    closeFridgeModal();
    const url = new URL('./index.html', window.location.href);
    window.history.pushState({ view: 'home' }, '', url.href);
    showView('home', { restoreScroll: false, showNotice: false });
  });

  const fridgeTabs = [...document.querySelectorAll('[data-fridge-tab]')];
  const fridgePanels = [...document.querySelectorAll('[data-fridge-panel]')];
  fridgeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      fridgeTabs.forEach((item) => item.classList.toggle('is-active', item === tab));
      fridgePanels.forEach((panel) => { panel.hidden = panel.dataset.fridgePanel !== tab.dataset.fridgeTab; });
    });
  });

  document.querySelectorAll('.chip-tabs').forEach((group) => {
    group.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
    }));
  });
  document.querySelectorAll('[data-market-add]').forEach((button) => button.addEventListener('click', () => openMarketCartModal(button)));
  document.querySelectorAll('[data-market-restock]').forEach((button) => button.addEventListener('click', () => showToast('재입고 알림 서비스는 준비 중입니다.')));
  document.querySelectorAll('[data-market-promo-slide]').forEach((button) => button.addEventListener('click', () => showToast('이벤트 혜택을 확인했어요.')));
  document.querySelectorAll('.market-categories').forEach((group) => {
    group.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
    }));
  });
  document.querySelectorAll('.market-all > nav').forEach((group) => {
    group.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
    }));
  });

  const recipeMenuItems = [
    { key: 'fig-sandwich', name: '무화과 샌드위치', title: '달콤 짭짤 제철 한 입 무화과 샌드위치', image: '../b/assets/market/product-042.png', tags: ['무화과', '루꼴라', '햄'] },
    { key: 'peach-yogurt', name: '복숭아 그릭요거트', title: '달콤하고 산뜻한 복숭아 그릭요거트', image: '../b/assets/market/product-038.png', tags: ['복숭아', '요거트', '5분'] },
    { key: 'perilla-noodles', name: '들깨 메밀면', title: '고소하게 비벼 먹는 들깨 메밀면', image: '../b/assets/guide.jpg', tags: ['들깨', '메밀면', '15분'] },
    { key: 'maple-pumpkin', name: '메이플 땅콩호박구이', title: '달콤한 메이플 땅콩호박구이', image: '../b/assets/market/product-016.png', tags: ['땅콩호박', '메이플', '오븐'] },
    { key: 'earl-grey-peach', name: '얼그레이 복숭아 마리네이드', title: '향긋한 얼그레이 복숭아 마리네이드', image: '../b/assets/market/product-038.png', tags: ['복숭아', '얼그레이', '디저트'] },
    { key: 'pumpkin-gnocchi', name: '단호박 감자뇨끼', title: '쫀득하고 부드러운 단호박 감자뇨끼', image: '../b/assets/market/product-016.png', tags: ['단호박', '감자', '뇨끼'] },
    { key: 'potato-rosti', name: '감자 뢰스티', title: '겉바속촉 감자 뢰스티', image: '../b/assets/market/product-092.png', tags: ['감자', '치즈', '팬요리'] },
    { key: 'tomato-noodles', name: '토마토 소면', title: '새콤하게 말아 먹는 토마토 소면', image: '../b/assets/market/product-075.png', tags: ['토마토', '소면', '한 그릇'] },
    { key: 'taco-rice', name: '타코 라이스', title: '채소를 듬뿍 올린 타코 라이스', image: '../b/assets/hero-table.jpg', tags: ['채소', '밥', '타코'] },
    { key: 'pickled-udon', name: '채소 절임우동', title: '아삭한 채소 절임우동', image: '../b/assets/white-kimchi.jpg', tags: ['절임채소', '우동', '10분'] },
    { key: 'cucumber-bibimbap', name: '오이 비빔밥', title: '시원하고 아삭한 오이 비빔밥', image: '../b/assets/market/product-125.png', tags: ['오이', '밥', '고추장'] },
    { key: 'napolitan-pasta', name: '냉털 나폴리탄 파스타', title: '냉장고 채소로 만드는 나폴리탄 파스타', image: '../b/assets/market/product-075.png', tags: ['토마토', '채소', '파스타'] },
    { key: 'tomato-kimchi', name: '토마토 김치', title: '상큼하고 아삭한 토마토 김치', image: '../b/assets/market/product-075.png', tags: ['토마토', '부추', '김치'] },
    { key: 'tomato-eggs', name: '토마토 달걀볶음', title: '포근하고 촉촉한 토마토 달걀볶음', image: '../b/assets/hero-table.jpg', tags: ['토마토', '달걀', '10분'] },
    { key: 'tomato-cold-noodles', name: '토마토 냉국수', title: '한여름에 시원한 토마토 냉국수', image: '../b/assets/guide.jpg', tags: ['토마토', '국수', '냉요리'] },
    { key: 'spinach-tomato-pasta', name: '시금치 토마토 파스타', title: '초록빛 시금치 토마토 파스타', image: '../b/assets/market/product-125.png', tags: ['시금치', '토마토', '파스타'] },
    { key: 'cucumber-somtam', name: '오이 솜땀', title: '새콤달콤 입맛 돋우는 오이 솜땀', image: '../b/assets/white-kimchi.jpg', tags: ['오이', '당근', '라임'] },
    { key: 'tomato-butter-rice', name: '토마토 마늘버터밥', title: '풍미 가득 토마토 마늘버터밥', image: '../b/assets/market/product-138.png', tags: ['토마토', '마늘', '밥'] },
    { key: 'vegetable-bibim-noodles', name: '채소 비빔국수', title: '아삭한 제철 채소 비빔국수', image: '../b/assets/spicy-tofu.jpg', tags: ['채소', '국수', '비빔장'] },
    { key: 'zucchini-perilla-noodles', name: '주키니 들기름면', title: '고소한 주키니 들기름면', image: '../b/assets/market/product-125.png', tags: ['주키니', '들기름', '면'] }
  ];
  recipeMenuItems.forEach((item) => { item.image = resolveAssetPath(item.image); });
  const recipesMain = document.querySelector('.subview--recipes');
  const recipeCarousel = document.querySelector('[data-recipe-carousel]');
  const recipeCarouselTrack = recipeCarousel?.querySelector('[data-recipe-carousel-track]');
  const recipeMenuButtons = [...document.querySelectorAll('.recipe-name-grid button')];
  if (recipeCarouselTrack && recipeMenuItems.length) {
    recipeCarouselTrack.id = 'recipe-carousel-track';
    recipeCarouselTrack.innerHTML = recipeMenuItems.map((item, index) => `
      <article class="recipe-feature${index === 0 ? ' is-active' : ''}" data-recipe-slide data-recipe-key="${item.key}" data-recipe-detail-key="${item.key}" role="button" aria-roledescription="slide" aria-label="${item.title} 상세 보기, ${index + 1} / ${recipeMenuItems.length}" aria-hidden="${index === 0 ? 'false' : 'true'}" tabindex="${index === 0 ? '0' : '-1'}">
        <img src="${item.image}" alt="${item.name}">
        <span class="recipe-feature__popular">인기<br>레시피</span>
        <div class="recipe-feature__copy"><div>${item.tags.map((tag) => `<span>${tag}</span>`).join('')}</div><h3>${item.title}</h3></div>
      </article>`).join('');
  }
  recipeMenuButtons.forEach((button, index) => {
    const item = recipeMenuItems[index];
    if (!item) return;
    button.dataset.recipeTarget = item.key;
    button.setAttribute('aria-controls', 'recipe-carousel-track');
    button.setAttribute('aria-pressed', String(index === 0));
  });
  const recipeSlides = recipeCarousel ? [...recipeCarousel.querySelectorAll('[data-recipe-slide]')] : [];
  const recipeSlideIndexByKey = new Map(recipeSlides.map((slide, index) => [slide.dataset.recipeKey, index]));
  recipeSlides.forEach((slide, index) => { slide.dataset.recipeIndex = String(index); });
  const recipeFirstClone = recipeSlides.length > 1 ? recipeSlides[0].cloneNode(true) : null;
  if (recipeFirstClone && recipeCarouselTrack) {
    recipeFirstClone.removeAttribute('data-recipe-slide');
    recipeFirstClone.removeAttribute('role');
    recipeFirstClone.removeAttribute('aria-roledescription');
    recipeFirstClone.removeAttribute('aria-label');
    recipeFirstClone.removeAttribute('data-recipe-detail-key');
    recipeFirstClone.tabIndex = -1;
    recipeFirstClone.dataset.recipeClone = 'first';
    recipeFirstClone.setAttribute('aria-hidden', 'true');
    recipeFirstClone.inert = true;
    recipeFirstClone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((control) => { control.tabIndex = -1; });
    recipeCarouselTrack.append(recipeFirstClone);
  }
  const recipeRenderedSlides = recipeCarouselTrack ? [...recipeCarouselTrack.children] : recipeSlides;
  let recipeSlideIndex = 0;
  let recipeTrackIndex = 0;
  let recipeCarouselTimer;

  const showRecipeSlide = (nextIndex, { instant = false } = {}) => {
    if (!recipeCarouselTrack || recipeSlides.length === 0) return;
    const previousIndex = recipeSlideIndex;
    const normalizedIndex = (nextIndex + recipeSlides.length) % recipeSlides.length;
    const wrapsForward = Boolean(recipeFirstClone) && previousIndex === recipeSlides.length - 1 && nextIndex === recipeSlides.length;
    recipeSlideIndex = normalizedIndex;
    recipeTrackIndex = wrapsForward ? recipeSlides.length : normalizedIndex;
    if (instant) recipeCarouselTrack.classList.add('is-loop-snap');
    recipeRenderedSlides.forEach((slide) => {
      const slideIndex = Number(slide.dataset.recipeIndex);
      const wasActive = slide.classList.contains('is-active');
      const clone = slide.hasAttribute('data-recipe-clone');
      const active = clone ? recipeTrackIndex === recipeSlides.length : slideIndex === recipeSlideIndex;
      slide.classList.toggle('is-exiting', wasActive && !active);
      slide.classList.toggle('is-active', active);
      if (clone) return;
      slide.setAttribute('aria-hidden', String(!active));
      slide.tabIndex = active ? 0 : -1;
      slide.querySelectorAll('button, a').forEach((control) => { control.tabIndex = active ? 0 : -1; });
    });
    recipeMenuButtons.forEach((button, index) => {
      const active = index === recipeSlideIndex;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    recipeCarouselTrack.style.transform = `translate3d(-${recipeTrackIndex * 100}%,0,0)`;
    if (instant) {
      void recipeCarouselTrack.offsetWidth;
      window.requestAnimationFrame(() => recipeCarouselTrack.classList.remove('is-loop-snap'));
    }
  };
  const finishRecipeTransition = (event) => {
    if (event.target !== recipeCarouselTrack || event.propertyName !== 'transform') return;
    recipeRenderedSlides.forEach((slide) => slide.classList.remove('is-exiting'));
    if (recipeTrackIndex !== recipeSlides.length) return;
    recipeTrackIndex = 0;
    recipeCarouselTrack.classList.add('is-loop-snap');
    recipeCarouselTrack.style.transform = 'translate3d(0,0,0)';
    void recipeCarouselTrack.offsetWidth;
    recipeCarouselTrack.classList.remove('is-loop-snap');
    recipeFirstClone?.classList.remove('is-active', 'is-exiting');
    recipeSlides[0]?.classList.add('is-active');
  };
  recipeCarouselTrack?.addEventListener('transitionend', finishRecipeTransition);
  recipeCarouselTrack?.addEventListener('transitioncancel', finishRecipeTransition);
  const stopRecipeCarousel = () => window.clearInterval(recipeCarouselTimer);
  const startRecipeCarousel = () => {
    stopRecipeCarousel();
    if (reducedMotion || document.hidden || currentView !== 'recipes' || recipesMain?.classList.contains('is-diary-view') || recipesMain?.classList.contains('is-detail-view') || recipeSlides.length < 2) return;
    recipeCarouselTimer = window.setInterval(() => showRecipeSlide(recipeSlideIndex + 1), 4000);
  };
  recipeCarousel?.addEventListener('mouseenter', stopRecipeCarousel);
  recipeCarousel?.addEventListener('mouseleave', startRecipeCarousel);
  recipeCarousel?.addEventListener('focusin', stopRecipeCarousel);
  recipeCarousel?.addEventListener('focusout', () => window.setTimeout(() => {
    if (!recipeCarousel.contains(document.activeElement)) startRecipeCarousel();
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRecipeCarousel();
    else startRecipeCarousel();
  });
  recipeRenderedSlides.forEach((slide) => slide.classList.remove('is-active', 'is-exiting'));
  showRecipeSlide(0);
  startRecipeCarousel();

  const recipeUploadSheet = document.querySelector('[data-recipe-upload-sheet]');
  const recipeLoginModal = document.querySelector('[data-recipe-login-modal]');
  const recipeDiaryView = document.querySelector('[data-recipe-diary-view]');
  const recipeDetailView = document.querySelector('[data-recipe-detail-view]');
  const recipeDetailImage = recipeDetailView?.querySelector('[data-recipe-detail-image]');
  const recipeDetailTitle = recipeDetailView?.querySelector('[data-recipe-detail-title]');
  const recipeDetailTags = recipeDetailView?.querySelector('[data-recipe-detail-tags]');
  const recipeDetailAuthor = recipeDetailView?.querySelector('[data-recipe-detail-author]');
  const recipeDetailAvatar = recipeDetailView?.querySelector('[data-recipe-detail-avatar]');
  const recipeDetailDescription = recipeDetailView?.querySelector('[data-recipe-detail-description]');
  const recipeDetailCount = recipeDetailView?.querySelector('[data-recipe-detail-count]');
  const recipeDetailHashtags = recipeDetailView?.querySelector('[data-recipe-detail-hashtags]');
  const recipeDetailBookmark = recipeDetailView?.querySelector('[data-recipe-detail-bookmark]');
  let recipeUploadOpener = null;
  let recipeLoginOpener = null;
  let recipeDetailOpener = null;
  let activeRecipeDetailKey = '';
  let bodyOverflowBeforeRecipeLogin = '';
  let recipeFeedScrollY = 0;

  const recipeDetailItems = new Map(recipeMenuItems.map((item) => [item.key, {
    ...item,
    author: '동화가든',
    avatar: resolveAssetPath('../b/assets/grandmother.png'),
    bookmarkCount: 0,
    description: `${item.tags.join(', ')}를 활용해 가볍고 맛있게 완성하는 ${item.name} 레시피예요. 재료의 식감과 제철 풍미를 그대로 즐겨보세요.`
  }]));
  const recipeFeedCards = [...document.querySelectorAll('.recipe-personal .recipe-feed-card, .recipe-official .recipe-feed-card, .recipe-latest .recipe-feed-card')];
  recipeFeedCards.forEach((card, index) => {
    const title = card.querySelector('h3')?.textContent.trim() || `레시피 ${index + 1}`;
    const tags = [...card.querySelectorAll(':scope > p > span')].map((tag) => tag.textContent.trim()).filter(Boolean);
    const authorNode = card.querySelector('.recipe-feed-card__author') || card.querySelector(':scope > small');
    const author = authorNode?.textContent.trim() || '동화가든';
    const avatar = authorNode?.querySelector('img')?.getAttribute('src') || '../b/assets/grandmother.png';
    const image = card.querySelector(':scope > div > img')?.getAttribute('src') || '../b/assets/hero-table.jpg';
    const bookmarkCount = Number(card.querySelector(':scope > p em strong')?.textContent.replace(/[^0-9]/g, '')) || 0;
    const key = `feed-${index + 1}`;
    card.dataset.recipeDetailKey = key;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${title} 상세 보기`);
    recipeDetailItems.set(key, {
      key,
      name: title,
      title,
      image,
      tags: tags.length ? tags : ['제철 채소', '집밥'],
      author,
      avatar,
      bookmarkCount,
      description: `${tags.join(', ') || '제철 재료'}로 만드는 ${title}이에요. 손쉽게 따라 하며 든든하고 건강한 한 끼를 완성해보세요.`
    });
  });

  const renderRecipeDetail = (item) => {
    if (!item || !recipeDetailView) return;
    activeRecipeDetailKey = item.key;
    if (recipeDetailImage) {
      recipeDetailImage.src = item.image;
      recipeDetailImage.alt = item.title;
    }
    if (recipeDetailTitle) recipeDetailTitle.textContent = item.title;
    if (recipeDetailTags) recipeDetailTags.replaceChildren(...item.tags.map((tag) => {
      const chip = document.createElement('span');
      chip.textContent = tag;
      return chip;
    }));
    if (recipeDetailAuthor) recipeDetailAuthor.textContent = item.author;
    if (recipeDetailAvatar) {
      recipeDetailAvatar.src = item.avatar;
      recipeDetailAvatar.alt = '';
    }
    if (recipeDetailDescription) recipeDetailDescription.textContent = item.description;
    if (recipeDetailCount) recipeDetailCount.textContent = String(item.bookmarkCount || 0);
    if (recipeDetailHashtags) {
      const tagText = item.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(', ');
      recipeDetailHashtags.textContent = `${tagText}, #간단요리, #건강식`;
    }
    recipeDetailBookmark?.classList.remove('is-active');
    recipeDetailBookmark?.setAttribute('aria-pressed', 'false');
    document.title = `${item.title} | 동화가든`;
  };

  const closeRecipeUploadSheet = ({ restoreFocus = true } = {}) => {
    appShell?.classList.remove('is-recipe-upload-open');
    if (!recipeUploadSheet || recipeUploadSheet.hidden) return;
    recipeUploadSheet.hidden = true;
    recipeUploadOpener?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) recipeUploadOpener?.focus?.();
    recipeUploadOpener = null;
  };

  const closeRecipeLoginModal = ({ restoreFocus = true } = {}) => {
    if (!recipeLoginModal || recipeLoginModal.hidden) return;
    recipeLoginModal.hidden = true;
    document.body.style.overflow = bodyOverflowBeforeRecipeLogin;
    if (appShell) appShell.inert = false;
    if (restoreFocus) recipeLoginOpener?.focus?.();
    recipeLoginOpener = null;
  };

  const openRecipeUploadSheet = (opener) => {
    closeRecipeLoginModal({ restoreFocus: false });
    recipeLoginOpener = null;
    recipeUploadOpener = opener;
    opener?.setAttribute('aria-expanded', 'true');
    if (recipeUploadSheet) recipeUploadSheet.hidden = false;
    appShell?.classList.add('is-recipe-upload-open');
    window.requestAnimationFrame(() => recipeUploadSheet?.querySelector('button')?.focus());
  };

  const openRecipeLoginModal = (opener) => {
    closeRecipeUploadSheet({ restoreFocus: false });
    recipeLoginOpener = opener;
    bodyOverflowBeforeRecipeLogin = document.body.style.overflow;
    if (recipeLoginModal) recipeLoginModal.hidden = false;
    if (appShell) appShell.inert = true;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => recipeLoginModal?.querySelector('.app-modal__close')?.focus());
  };

  const closeRecipeDetailView = ({ restoreScroll = true, fromHistory = false } = {}) => {
    if (!recipesMain?.classList.contains('is-detail-view')) return;
    recipesMain.classList.remove('is-detail-view');
    appShell?.classList.remove('is-recipe-detail-view');
    if (recipeDetailView) recipeDetailView.hidden = true;
    document.title = viewTitles.recipes;
    if (restoreScroll) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: recipeFeedScrollY, behavior: 'auto' });
        recipeDetailOpener?.focus?.({ preventScroll: true });
      });
    }
    recipeDetailOpener = null;
    if (currentView === 'recipes') startRecipeCarousel();
  };

  const openRecipeDetailView = (item, { pushHistory = true, opener = null } = {}) => {
    if (!recipesMain || !recipeDetailView || !item) return;
    const alreadyOpen = recipesMain.classList.contains('is-detail-view');
    if (!alreadyOpen) recipeFeedScrollY = pushHistory ? window.scrollY : viewScrollPositions.recipes;
    recipeDetailOpener = opener || recipeDetailOpener;
    closeRecipeDiaryView({ restoreScroll: false, fromHistory: true });
    renderRecipeDetail(item);
    recipesMain.classList.add('is-detail-view');
    appShell?.classList.add('is-recipe-detail-view');
    recipeDetailView.hidden = false;
    closeRecipeUploadSheet({ restoreFocus: false });
    closeRecipeLoginModal({ restoreFocus: false });
    stopRecipeCarousel();
    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'recipes');
      url.searchParams.set('recipeScreen', 'detail');
      url.searchParams.set('recipe', item.key);
      window.history.pushState({ view: 'recipes', recipeScreen: 'detail', recipeKey: item.key }, '', url.href);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => recipeDetailView.querySelector('[data-recipe-detail-close]')?.focus());
  };

  const closeRecipeDiaryView = ({ restoreScroll = true, fromHistory = false } = {}) => {
    if (!recipesMain?.classList.contains('is-diary-view')) return;
    recipesMain.classList.remove('is-diary-view');
    appShell?.classList.remove('is-recipe-diary-view');
    if (recipeDiaryView) recipeDiaryView.hidden = true;
    if (restoreScroll) window.requestAnimationFrame(() => window.scrollTo({ top: recipeFeedScrollY, behavior: 'auto' }));
    if (currentView === 'recipes') startRecipeCarousel();
  };

  const openRecipeDiaryView = ({ pushHistory = true } = {}) => {
    if (!recipesMain || !recipeDiaryView || recipesMain.classList.contains('is-diary-view')) return;
    recipeFeedScrollY = pushHistory ? window.scrollY : viewScrollPositions.recipes;
    closeRecipeDetailView({ restoreScroll: false, fromHistory: true });
    recipesMain.classList.add('is-diary-view');
    appShell?.classList.add('is-recipe-diary-view');
    recipeDiaryView.hidden = false;
    closeRecipeUploadSheet({ restoreFocus: false });
    closeRecipeLoginModal({ restoreFocus: false });
    stopRecipeCarousel();
    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'recipes');
      url.searchParams.set('recipeScreen', 'diary');
      window.history.pushState({ view: 'recipes', recipeScreen: 'diary' }, '', url.href);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => recipeDiaryView.querySelector('[data-recipe-diary-close]')?.focus());
  };

  const syncRecipeSubViewFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const requested = currentView === 'recipes' ? params.get('recipeScreen') : null;
    if (requested === 'diary') {
      closeRecipeDetailView({ restoreScroll: false, fromHistory: true });
      openRecipeDiaryView({ pushHistory: false });
      return;
    }
    if (requested === 'detail') {
      closeRecipeDiaryView({ restoreScroll: false, fromHistory: true });
      const key = params.get('recipe');
      const item = recipeDetailItems.get(key) || recipeDetailItems.values().next().value;
      openRecipeDetailView(item, { pushHistory: false });
      return;
    }
    closeRecipeDiaryView({ fromHistory: true });
    closeRecipeDetailView({ fromHistory: true });
  };

  document.querySelectorAll('[data-recipe-login-close]').forEach((button) => button.addEventListener('click', () => closeRecipeLoginModal()));
  document.querySelector('[data-recipe-login-open]')?.addEventListener('click', () => {
    const opener = recipeLoginOpener;
    closeRecipeLoginModal({ restoreFocus: false });
    recipeLoginOpener = null;
    openLoginScreen(opener);
  });
  document.querySelectorAll('[data-recipe-upload-target]').forEach((button) => button.addEventListener('click', () => {
    const label = button.querySelector('strong')?.textContent.trim() || '업로드';
    closeRecipeUploadSheet();
    showToast(`${label} 화면을 준비하고 있어요.`);
  }));
  document.querySelector('[data-recipe-diary-open]')?.addEventListener('click', () => openRecipeDiaryView());
  document.querySelector('[data-recipe-diary-close]')?.addEventListener('click', () => {
    const url = new URL(window.location.href);
    if (window.history.state?.recipeScreen === 'diary') {
      window.history.back();
      return;
    }
    url.searchParams.delete('recipeScreen');
    window.history.replaceState({ view: 'recipes' }, '', url.href);
    closeRecipeDiaryView();
  });
  document.querySelector('[data-recipe-detail-close]')?.addEventListener('click', () => {
    const url = new URL(window.location.href);
    if (window.history.state?.recipeScreen === 'detail') {
      window.history.back();
      return;
    }
    url.searchParams.delete('recipeScreen');
    url.searchParams.delete('recipe');
    window.history.replaceState({ view: 'recipes' }, '', url.href);
    closeRecipeDetailView();
  });
  const bindRecipeDetailOpen = (element) => {
    if (!element) return;
    const open = () => {
      const item = recipeDetailItems.get(element.dataset.recipeDetailKey);
      if (item) openRecipeDetailView(item, { opener: element });
    };
    element.addEventListener('click', open);
    element.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  };
  recipeSlides.forEach(bindRecipeDetailOpen);
  recipeFeedCards.forEach(bindRecipeDetailOpen);
  recipeDetailView?.querySelectorAll('.recipe-detail-categories button').forEach((button) => button.addEventListener('click', () => {
    recipeDetailView.querySelectorAll('.recipe-detail-categories button').forEach((item) => item.classList.toggle('is-active', item === button));
  }));
  recipeDetailView?.querySelector('.recipe-detail-search input')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const query = event.currentTarget.value.trim();
    showToast(query ? `'${query}' 레시피를 찾고 있어요.` : '요리나 재료를 입력해주세요.');
  });
  recipeDetailBookmark?.addEventListener('click', () => {
    const item = recipeDetailItems.get(activeRecipeDetailKey);
    if (!item) return;
    const active = recipeDetailBookmark.classList.toggle('is-active');
    recipeDetailBookmark.setAttribute('aria-pressed', String(active));
    item.bookmarkCount = Math.max(0, (item.bookmarkCount || 0) + (active ? 1 : -1));
    if (recipeDetailCount) recipeDetailCount.textContent = String(item.bookmarkCount);
    showToast(active ? '레시피를 북마크했어요.' : '북마크를 해제했어요.');
  });
  recipeDetailView?.querySelector('.recipe-detail-card__author')?.addEventListener('click', () => {
    showToast(`${recipeDetailAuthor?.textContent || '작성자'}의 레시피를 더 보여드릴게요.`);
  });
  recipeDiaryView?.querySelectorAll('.recipe-diary-categories button').forEach((button) => button.addEventListener('click', () => {
    recipeDiaryView.querySelectorAll('.recipe-diary-categories button').forEach((item) => item.classList.toggle('is-active', item === button));
  }));
  document.querySelector('[data-diary-mine]')?.addEventListener('click', (event) => {
    const active = event.currentTarget.classList.toggle('is-active');
    event.currentTarget.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('[data-diary-sort]')?.addEventListener('click', () => showToast('최신 집밥일기부터 보여드려요.'));
  recipeDiaryView?.querySelector('input[type="search"]')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const query = event.currentTarget.value.trim();
    showToast(query ? `'${query}' 집밥일기를 찾고 있어요.` : '요리나 재료를 입력해주세요.');
  });
  recipeDiaryView?.querySelector('.recipe-diary-post header > button')?.addEventListener('click', (event) => {
    const active = event.currentTarget.classList.toggle('is-active');
    event.currentTarget.setAttribute('aria-pressed', String(active));
  });

  document.addEventListener('pointerdown', (event) => {
    if (recipeUploadSheet?.hidden || recipeUploadSheet?.contains(event.target)) return;
    if (event.target.closest?.('[data-recipe-upload]')) return;
    closeRecipeUploadSheet({ restoreFocus: false });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!recipeLoginModal?.hidden) {
      event.preventDefault();
      closeRecipeLoginModal();
      return;
    }
    if (!recipeUploadSheet?.hidden) {
      event.preventDefault();
      closeRecipeUploadSheet();
    }
  });
  recipeLoginModal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...recipeLoginModal.querySelectorAll('.recipe-login-modal__dialog button:not([disabled])')];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  document.querySelectorAll('[data-recipe-action]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.recipeAction || '레시피';
    if (button.hasAttribute('data-recipe-diary-open')) return;
    if (action === '북마크') {
      openRecipeLoginModal(button);
      return;
    }
    if (button.hasAttribute('data-recipe-upload')) {
      if (recipeUploadSheet?.hidden) openRecipeUploadSheet(button);
      else closeRecipeUploadSheet();
      return;
    }
    showToast(`${action} 화면을 준비하고 있어요.`);
  }));
  let recipeCarouselResumeTimer;
  recipeMenuButtons.forEach((button) => button.addEventListener('click', () => {
    const index = recipeSlideIndexByKey.get(button.dataset.recipeTarget);
    if (typeof index !== 'number') return;
    window.clearTimeout(recipeCarouselResumeTimer);
    stopRecipeCarousel();
    showRecipeSlide(index, { instant: Math.abs(index - recipeSlideIndex) > 1 });
    recipeCarousel?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    recipeCarouselResumeTimer = window.setTimeout(startRecipeCarousel, reducedMotion ? 0 : 800);
  }));
  document.querySelector('.recipe-search input')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const query = event.currentTarget.value.trim();
    showToast(query ? `'${query}' 레시피를 찾고 있어요.` : '요리나 재료를 입력해주세요.');
  });

  document.querySelector('[data-story-letter-toggle]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const card = button.closest('[data-story-card]');
    if (!card) return;
    card.classList.add('is-letter-expanded');
    button.setAttribute('aria-expanded', 'true');
    card.querySelector('.story-stage-two')?.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => card.querySelector('[data-story-toggle]')?.focus());
  });

  document.querySelector('[data-story-toggle]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const card = button.closest('[data-story-card]');
    if (!card) return;
    card.classList.add('is-complete');
    button.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => card.querySelector('.story-join-button')?.focus());
  });

  const initialView = viewNameFromUrl();
  currentView = initialView === 'home' ? 'refrigerator' : 'home';
  showView(initialView, { animate: false, restoreScroll: false, showNotice: true });
  syncMarketProductDetailFromUrl();
  syncMarketBasketViewFromUrl();
  syncMarketCollectionFromUrl();
  syncRecipeSubViewFromUrl();
  // Product-header links land on the existing search field or subscription benefit.
  window.requestAnimationFrame(() => {
    if (initialView === 'ustore' && window.location.hash === '#market-search') {
      marketSearchBar?.scrollIntoView({ behavior: 'auto', block: 'center' });
      marketSearchInput?.focus({ preventScroll: true });
    } else if (initialView === 'home' && window.location.hash === '#plans') {
      document.getElementById('plans')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  });
  restoreMarketPosition();
})();
