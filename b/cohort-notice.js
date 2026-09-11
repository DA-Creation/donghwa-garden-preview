
(() => {
 const ribbon = document.querySelector('.cohort-ribbon');
 if (!ribbon) return;
 const dialog = document.getElementById('cohort-notice-dialog');
 const link = ribbon.querySelector('.cohort-ribbon__link');
 let closed = new URLSearchParams(location.search).get('sampleState') === 'closed';
 let opener;
 function render() {
  if (closed) ribbon.querySelectorAll('[data-marquee-text]').forEach(el => el.textContent = '01기 모집 마감 · 다음 기수 알림받기');
 }
 render();
 fetch('./cohort-recruitment.json').then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(config => {
  closed = closed || config.status === 'closed' || Date.now() >= Date.parse(config.closesAt);
  render();
 }).catch(() => {});
 link.addEventListener('click', event => {
  if (!closed) return;
  event.preventDefault();
  opener = link;
  dialog.showModal();
 });
 dialog.querySelector('[data-notice-close]').addEventListener('click', () => dialog.close());
 dialog.addEventListener('close', () => opener?.focus({preventScroll: true}));
 dialog.querySelector('[data-notice-submit]').addEventListener('click', () => {
  dialog.querySelector('[data-notice-status]').textContent = '알림 신청 완료 예시입니다. 실제 알림은 발송되지 않습니다.';
  dialog.querySelector('[data-notice-submit]').hidden = true;
  dialog.querySelector('[data-notice-cancel]').hidden = false;
 });
 dialog.querySelector('[data-notice-cancel]').addEventListener('click', () => {
  dialog.querySelector('[data-notice-status]').textContent = '알림 신청이 취소되었습니다.';
  dialog.querySelector('[data-notice-submit]').hidden = false;
  dialog.querySelector('[data-notice-cancel]').hidden = true;
 });
})();
