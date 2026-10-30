/* Product-story hero candidate review. Assets and manifest are relative to this script. */
(() => {
  'use strict';
  const script = document.currentScript;
  if (!script || !script.src) return;
  const base = new URL('./', script.src);
  const productNo = new URLSearchParams(location.search).get('product_no') ||
    (location.pathname.match(/\/product\/[^/]+\/(\d+)(?:\/|$)/) || [])[1];
  if (!productNo || !/^\d+$/.test(productNo)) return;
  const styleId = 'dhg-hero-candidates-style';
  const ready = document.readyState === 'loading'
    ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    : Promise.resolve();

  function assetURL(value, video = false) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, base);
      const localAsset = /^(https?:)$/.test(url.protocol) &&
        url.origin === base.origin && url.pathname.startsWith(base.pathname);
      const hostedVideo = video && url.protocol === 'https:' &&
        url.origin === 'https://da-creation.github.io' &&
        url.pathname.startsWith('/donghwa-garden-preview/media/hero-review-20261029/') &&
        /\.mp4$/i.test(url.pathname);
      return localAsset || hostedVideo ? url.href : null;
    } catch (_) { return null; }
  }

  function loadManifest() {
    return new Promise(resolve => {
      const loader = document.createElement('script');
      const url = new URL('manifest.js', base);
      url.searchParams.set('v', Date.now().toString());
      loader.src = url.href;
      loader.async = true;
      let finished = false;
      const finish = value => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        loader.onload = loader.onerror = null;
        loader.remove();
        resolve(value);
      };
      const timeout = setTimeout(() => finish(null), 10000);
      window.DHG_HERO_CANDIDATES = undefined;
      loader.onload = () => finish(window.DHG_HERO_CANDIDATES || null);
      loader.onerror = () => finish(null);
      document.head.appendChild(loader);
    });
  }

  function installStyle() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '.dhg-hero-candidates{position:relative;display:block;width:100%;min-width:0;margin:0;overflow:hidden;line-height:normal;isolation:isolate;background:#000}',
      '.dhg-hero-candidates__track{display:flex;width:100%;min-width:0;aspect-ratio:16/9;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:auto;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:auto;direction:ltr}',
      '.dhg-hero-candidates__track::-webkit-scrollbar{display:none}',
      '.dhg-hero-candidates__slide{position:relative;display:block;flex:0 0 100%;width:100%;min-width:0;height:100%;margin:0;scroll-snap-align:start;scroll-snap-stop:always;overflow:hidden}',
      '.dhg-hero-candidates__media{display:block!important;width:100%!important;height:100%!important;aspect-ratio:16/9!important;object-fit:contain!important;object-position:center;margin:0!important;border:0!important;background:#000;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none}',
      '.dhg-hero-candidates__filename{position:absolute;z-index:2;right:8px;bottom:8px;max-width:calc(100% - 130px);margin:0;padding:0;color:#fff!important;font:500 11px/1.35 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;text-align:right;overflow-wrap:anywhere;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.7);pointer-events:none}',
      '.dhg-hero-candidates__controls{position:absolute;z-index:3;left:5px;bottom:2px;display:flex;align-items:center;gap:0;color:#fff;line-height:1}',
      '.dhg-hero-candidates__button{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;min-width:32px;min-height:32px;margin:0;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none;color:#fff!important;font:400 25px/1 sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.9);cursor:pointer;touch-action:manipulation}',
      '.dhg-hero-candidates__button:disabled{opacity:.3;cursor:default}',
      '.dhg-hero-candidates__counter{display:block;min-width:34px;color:#fff!important;text-align:center;font:500 11px/1 sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.9);pointer-events:none}',
      '.dhg-hero-candidates__play{position:absolute;z-index:3;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;margin:0;padding:0;border:1px solid rgba(255,255,255,.8);border-radius:50%;background:rgba(0,0,0,.3);color:#fff!important;font:500 12px/1 sans-serif;cursor:pointer;touch-action:manipulation}',
      '.dhg-hero-candidates__button:focus-visible,.dhg-hero-candidates__play:focus-visible,.dhg-hero-candidates__track:focus-visible{outline:2px solid #fff;outline-offset:-3px}',
      '.dhg-hero-candidates [hidden]{display:none!important}',
      '.dhg-hero-candidates__error{position:absolute;left:12px;right:12px;top:50%;transform:translateY(-50%);margin:0;color:#fff;text-align:center;font:13px/1.5 sans-serif}',
      '@media(prefers-reduced-motion:reduce){.dhg-hero-candidates__track{scroll-behavior:auto!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  async function mount() {
    await ready;
    let figure = document.querySelector(
      '[data-module="productStory"] figure.pv-figma-intro-card'
    );
    let original = figure && figure.querySelector('img.pv-figma-intro-card__gif');
    const nativeRequested = script.dataset.nativeTarget === '39' && productNo === '39';
    const nativeContainer = nativeRequested && !original
      ? document.querySelector('#prdDetail .cont') || document.querySelector('#prdDetail')
      : null;
    if ((!original && !nativeContainer) ||
        (figure && figure.querySelector('.dhg-hero-candidates')) ||
        (nativeContainer && nativeContainer.querySelector('[data-dhg-native-hero-candidates]'))) return;

    const manifest = await loadManifest();
    const product = manifest && manifest.products && manifest.products[productNo];
    if (!product || !Array.isArray(product.candidates)) return;
    const usedIds = new Set();
    const candidates = product.candidates.reduce((valid, candidate) => {
      if (!candidate || !['image', 'video'].includes(candidate.type)) return valid;
      const src = assetURL(candidate.src, candidate.type === 'video');
      const id = String(candidate.id || '');
      const filename = typeof candidate.filename === 'string' ? candidate.filename : '';
      if (!src || !id || !filename || usedIds.has(id)) return valid;
      usedIds.add(id);
      valid.push({ id, filename, type: candidate.type, src, poster: assetURL(candidate.poster) });
      return valid;
    }, []);
    if (!candidates.length ||
        (original && (!original.isConnected || figure.querySelector('.dhg-hero-candidates'))) ||
        (nativeContainer && (!nativeContainer.isConnected ||
          nativeContainer.querySelector('[data-dhg-native-hero-candidates]')))) return;

    const requestedIndex = candidates.findIndex(c => c.id === String(product.selected));
    let activeIndex = requestedIndex < 0 ? 0 : requestedIndex;
    let manualPlayback = -1;
    let visible = false;
    let scrollFrame = 0;
    let resizeFrame = 0;
    let disposed = false;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.createElement('div');
    root.className = 'dhg-hero-candidates';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', '캐러셀');
    root.setAttribute('aria-label', '상품 히어로 이미지와 영상 후보');
    root.style.visibility = 'hidden';
    const track = document.createElement('div');
    track.className = 'dhg-hero-candidates__track';
    track.tabIndex = 0;
    track.setAttribute('aria-label', '좌우로 넘겨 후보 비교');
    const controls = document.createElement('div');
    controls.className = 'dhg-hero-candidates__controls';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'dhg-hero-candidates__button';
    previous.textContent = '‹';
    previous.setAttribute('aria-label', '이전 후보');
    const counter = document.createElement('span');
    counter.className = 'dhg-hero-candidates__counter';
    counter.setAttribute('role', 'status');
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'dhg-hero-candidates__button';
    next.textContent = '›';
    next.setAttribute('aria-label', '다음 후보');
    controls.append(previous, counter, next);
    const slides = candidates.map((candidate, index) => {
      const slide = document.createElement('div');
      slide.className = 'dhg-hero-candidates__slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', '슬라이드');
      slide.setAttribute('aria-label', (index + 1) + '/' + candidates.length + ' · ' + candidate.filename);
      const media = document.createElement(candidate.type === 'video' ? 'video' : 'img');
      media.className = 'dhg-hero-candidates__media';
      const playButton = document.createElement('button');
      playButton.type = 'button';
      playButton.className = 'dhg-hero-candidates__play';
      playButton.textContent = '재생';
      playButton.setAttribute('aria-label', candidate.filename + ' 영상 재생');
      playButton.hidden = true;
      if (candidate.type === 'video') {
        media.muted = true;
        media.defaultMuted = true;
        media.setAttribute('muted', '');
        media.playsInline = true;
        media.setAttribute('playsinline', '');
        media.setAttribute('webkit-playsinline', '');
        media.loop = true;
        media.controls = false;
        media.preload = 'none';
        media.tabIndex = -1;
        media.setAttribute('aria-label', candidate.filename);
        if (candidate.poster) media.poster = candidate.poster;
        playButton.addEventListener('click', () => {
          manualPlayback = index;
          updatePlayback();
        });
      } else {
        media.alt = '후보 ' + candidate.id + ' · ' + candidate.filename;
        media.draggable = false;
        media.loading = index === activeIndex ? 'eager' : 'lazy';
        media.decoding = 'async';
        media.src = candidate.src;
      }
      const filename = document.createElement('span');
      filename.className = 'dhg-hero-candidates__filename';
      filename.textContent = candidate.filename;
      media.addEventListener('error', () => {
        if (slide.querySelector('.dhg-hero-candidates__error')) return;
        playButton.hidden = true;
        const message = document.createElement('p');
        message.className = 'dhg-hero-candidates__error';
        message.textContent = '후보 파일을 불러오지 못했습니다.';
        slide.appendChild(message);
      });
      slide.append(media, filename, playButton);
      track.appendChild(slide);
      return { candidate, slide, media, playButton };
    });
    root.append(track, controls);
    installStyle();
    if (!original) {
      const section = document.createElement('section');
      section.dataset.module = 'productStory';
      section.dataset.dhgNativeHeroCandidates = '39';
      section.setAttribute('aria-label', '상품 히어로 후보');
      figure = document.createElement('figure');
      figure.className = 'pv-figma-intro-card';
      figure.style.margin = '0';
      original = document.createElement('img');
      original.className = 'pv-figma-intro-card__gif';
      original.alt = '';
      figure.appendChild(original);
      section.appendChild(figure);
      nativeContainer.prepend(section);
    }
    original.replaceWith(root);

    function updatePlayback() {
      if (disposed || !root.isConnected) return;
      slides.forEach((item, index) => {
        item.slide.setAttribute('aria-hidden', String(index !== activeIndex));
        if (item.candidate.type !== 'video') return;
        const video = item.media;
        const active = index === activeIndex;
        item.playButton.tabIndex = active ? 0 : -1;
        const canPlay = active && visible && !document.hidden &&
          (!reducedMotion.matches || manualPlayback === index);
        video.autoplay = canPlay;
        if (!canPlay) {
          video.pause();
          item.playButton.hidden = !active || !visible || document.hidden;
          return;
        }
        if (!video.getAttribute('src')) {
          video.preload = 'metadata';
          video.src = item.candidate.src;
        }
        video.muted = true;
        const attempt = video.play();
        item.playButton.hidden = true;
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(() => {
            if (!disposed && index === activeIndex && visible && !document.hidden) {
              item.playButton.hidden = false;
            }
          });
        }
      });
    }

    function updateSelection(index) {
      const nextIndex = Math.max(0, Math.min(candidates.length - 1, index));
      if (nextIndex !== activeIndex) manualPlayback = -1;
      activeIndex = nextIndex;
      previous.disabled = activeIndex === 0;
      next.disabled = activeIndex === candidates.length - 1;
      counter.textContent = (activeIndex + 1) + ' / ' + candidates.length;
      counter.setAttribute('aria-label', '후보 ' + candidates[activeIndex].id + ', ' + (activeIndex + 1) + '/' + candidates.length);
      updatePlayback();
    }

    function positionSelected() {
      if (!track.clientWidth) return;
      track.scrollLeft = activeIndex * track.clientWidth;
      root.style.visibility = '';
    }

    function moveTo(index) {
      const target = Math.max(0, Math.min(candidates.length - 1, index));
      // Immediate positioning keeps selection, playback and filename in sync.
      updateSelection(target);
      track.scrollTo({ left: target * track.clientWidth, behavior: 'auto' });
    }
    previous.addEventListener('click', () => moveTo(activeIndex - 1));
    next.addEventListener('click', () => moveTo(activeIndex + 1));
    root.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      let target;
      if (event.key === 'ArrowLeft') target = activeIndex - 1;
      else if (event.key === 'ArrowRight') target = activeIndex + 1;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = candidates.length - 1;
      else return;
      event.preventDefault();
      moveTo(target);
    });
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        if (track.clientWidth) updateSelection(Math.round(track.scrollLeft / track.clientWidth));
      });
    }, { passive: true });
    const viewport = root.getBoundingClientRect();
    visible = viewport.bottom > 0 && viewport.top < innerHeight &&
      viewport.right > 0 && viewport.left < innerWidth;
    const intersection = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      updatePlayback();
    }, { threshold: 0.01 }) : null;
    if (intersection) intersection.observe(root);
    const resize = 'ResizeObserver' in window ? new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(positionSelected);
    }) : null;
    if (resize) resize.observe(track);
    const onResize = () => positionSelected();
    if (!resize) addEventListener('resize', onResize, { passive: true });
    const onVisibility = () => updatePlayback();
    document.addEventListener('visibilitychange', onVisibility);
    const onMotionChange = () => updatePlayback();
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
    else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
    updateSelection(activeIndex);
    positionSelected();
    requestAnimationFrame(positionSelected);
    addEventListener('pageshow', event => {
      if (!event.persisted || disposed) return;
      const bounds = root.getBoundingClientRect();
      visible = bounds.bottom > 0 && bounds.top < innerHeight &&
        bounds.right > 0 && bounds.left < innerWidth;
      positionSelected();
      updatePlayback();
    });
    addEventListener('pagehide', event => {
      slides.forEach(item => { if (item.candidate.type === 'video') item.media.pause(); });
      if (event.persisted) return;
      disposed = true;
      if (intersection) intersection.disconnect();
      if (resize) resize.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(resizeFrame);
      document.removeEventListener('visibilitychange', onVisibility);
      removeEventListener('resize', onResize);
      if (reducedMotion.removeEventListener) reducedMotion.removeEventListener('change', onMotionChange);
      else if (reducedMotion.removeListener) reducedMotion.removeListener(onMotionChange);
    });
  }
  mount().catch(() => { /* Leave the original hero untouched on setup failures. */ });
})();

