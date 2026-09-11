(() => {
  'use strict';

  const body = document.body;
  const params = new URLSearchParams(window.location.search);
  const themes = new Set(['a', 'b']);
  const states = new Set(['open', 'closed']);
  const dialogViews = new Set(['join', 'joined', 'notify', 'notified']);
  const dialog = document.getElementById('cohort-demo-dialog');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sampleTools = document.querySelector('.sample-tools > details');
  if (sampleTools) sampleTools.open = window.matchMedia('(min-width: 880px)').matches;

  let theme = themes.has(params.get('sampleTheme')) ? params.get('sampleTheme') : 'b';
  let state = states.has(params.get('sampleState')) ? params.get('sampleState') : 'open';
  let hasMembership = false;
  let hasNotice = false;
  let currentDialogView = '';
  let dialogOpener = null;
  let previousOverflow = '';

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const updateUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('sampleTheme', theme);
    url.searchParams.set('sampleState', state);
    window.history.replaceState(window.history.state, '', url);
  };

  const render = (announce = false) => {
    const isOpen = state === 'open';
    document.title = '동화가든 | 기수 모집 샘플';
    body.dataset.sampleTheme = theme;
    body.dataset.sampleState = state;

    document.querySelectorAll('button[data-sample-theme]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.sampleTheme === theme));
    });
    document.querySelectorAll('button[data-sample-state]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.sampleState === state));
    });
    document.querySelectorAll('[data-sample-show]').forEach((element) => {
      element.hidden = element.dataset.sampleShow !== state;
    });

    setText('[data-cohort-number]', '01기');
    setText('[data-cohort-status]', isOpen ? '모집 중' : '모집 마감');
    setText('[data-cohort-countdown]', isOpen ? '마감 7일 남음' : '9월 18일 마감');
    setText('[data-marquee-text]', isOpen
      ? '01기 모집 마감 7일 남음'
      : '01기 모집 마감 · 다음 기수 알림받기');
    setText('[data-cohort-action-label]', isOpen
      ? '01기 정기배송 신청하기'
      : '다음 기수 알림받기');
    setText('[data-sample-notice]', hasNotice ? '알림 신청됨' : '알림 신청 전');

    document.querySelectorAll('[data-sample-membership]').forEach((button) => {
      button.disabled = !hasMembership;
      button.setAttribute('aria-disabled', String(!hasMembership));
    });
    if (announce) {
      setText('[data-sample-live]', isOpen ? '모집 중 화면' : '모집 마감 화면');
    }
  };

  const focusDialogHeading = () => {
    const view = dialog?.querySelector(`[data-dialog-view="${currentDialogView}"]`);
    const heading = view?.querySelector('[data-dialog-focus], h2, h3');
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      if (!heading.id) heading.id = `cohort-demo-heading-${currentDialogView}`;
      dialog.setAttribute('aria-labelledby', heading.id);
      heading.focus({ preventScroll: true });
    }
  };

  const setDialogView = (view) => {
    if (!dialog || !dialogViews.has(view)) return;
    currentDialogView = view;
    dialog.querySelectorAll('[data-dialog-view]').forEach((panel) => {
      panel.hidden = panel.dataset.dialogView !== view;
    });
    dialog.dataset.currentView = view;
    if (dialog.open) focusDialogHeading();
  };

  const openDialog = (view, opener) => {
    if (!dialog) return;
    dialogOpener = opener || document.activeElement;
    setDialogView(view);
    if (!dialog.open) {
      previousOverflow = body.style.overflow;
      dialog.showModal();
      body.style.overflow = 'hidden';
    }
    focusDialogHeading();
  };

  const closeDialog = () => {
    if (dialog?.open) dialog.close();
  };

  dialog?.addEventListener('close', () => {
    body.style.overflow = previousOverflow;
    if (dialogOpener instanceof HTMLElement && dialogOpener.isConnected
      && !dialogOpener.matches(':disabled') && !dialogOpener.closest('[hidden]')) {
      dialogOpener.focus({ preventScroll: true });
    }
    dialogOpener = null;
  });

  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      closeDialog();
    }
  });

  // The sample never submits a form or sends personal information.
  dialog?.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  const handledControls = [
    'button[data-sample-theme]', 'button[data-sample-state]', '[data-jump-to]',
    '[data-cohort-action]', '[data-demo-next]', '[data-demo-close]',
    '[data-demo-cancel-notice]', '[data-open-membership]', '[data-ribbon-pause]',
  ].join(', ');

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest(handledControls);
    if (!control || control.matches(':disabled')) return;
    event.preventDefault();
    event.stopPropagation();

    if (control.hasAttribute('data-ribbon-pause')) {
      const ribbon = control.closest('[data-sample-ribbon], #sample-ribbon');
      if (!ribbon) return;
      const paused = ribbon.classList.toggle('is-paused');
      control.setAttribute('aria-pressed', String(paused));
      control.setAttribute('aria-label', paused
        ? '모집 띠 움직임 재생'
        : '모집 띠 움직임 멈추기');
      const icon = control.querySelector('span');
      if (icon) icon.textContent = paused ? '▶' : 'Ⅱ';
      return;
    }

    if (control.hasAttribute('data-sample-theme')) {
      const nextTheme = control.dataset.sampleTheme;
      if (!themes.has(nextTheme)) return;
      theme = nextTheme;
      render();
      updateUrl();
      return;
    }

    if (control.hasAttribute('data-sample-state')) {
      const nextState = control.dataset.sampleState;
      if (!states.has(nextState)) return;
      state = nextState;
      render(true);
      updateUrl();
      return;
    }

    if (control.hasAttribute('data-jump-to')) {
      const section = document.getElementById(control.dataset.jumpTo);
      if (!section) return;
      if (sampleTools && window.matchMedia('(max-width: 879px)').matches) sampleTools.open = false;
      const heading = section.querySelector('h2, h3');
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      section.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }

    if (control.hasAttribute('data-cohort-action')) {
      const action = control.dataset.cohortAction;
      const wantsNotice = action === 'notify' || state === 'closed';
      openDialog(wantsNotice
        ? (hasNotice ? 'notified' : 'notify')
        : (hasMembership ? 'joined' : 'join'), control);
      return;
    }

    if (control.hasAttribute('data-open-membership')) {
      openDialog(hasMembership ? 'joined' : hasNotice ? 'notified' : 'join', control);
      return;
    }

    if (control.hasAttribute('data-demo-next')) {
      const nextView = control.dataset.demoNext;
      if (nextView === 'joined' && currentDialogView === 'join') {
        hasMembership = true;
      } else if (nextView === 'notified' && currentDialogView === 'notify') {
        hasNotice = true;
      } else {
        return;
      }
      render();
      setDialogView(nextView);
      return;
    }

    if (control.hasAttribute('data-demo-cancel-notice')) {
      hasNotice = false;
      render();
      setDialogView('notify');
      return;
    }

    if (control.hasAttribute('data-demo-close')) closeDialog();
  }, true);

  const ribbons = [...document.querySelectorAll('[data-sample-ribbon], #sample-ribbon')];
  const ribbonVisibility = new Map(ribbons.map((ribbon) => [ribbon, false]));
  const updateRibbonMotion = () => {
    ribbonVisibility.forEach((visible, ribbon) => {
      ribbon.classList.toggle('is-in-view', visible && !document.hidden);
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        ribbonVisibility.set(entry.target, entry.isIntersecting);
      });
      updateRibbonMotion();
    });
    ribbons.forEach((ribbon) => observer.observe(ribbon));
  } else {
    ribbons.forEach((ribbon) => ribbonVisibility.set(ribbon, true));
    updateRibbonMotion();
  }
  document.addEventListener('visibilitychange', updateRibbonMotion);

  render();
})();
