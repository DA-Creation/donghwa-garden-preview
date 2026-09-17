
(() => {
 const ribbon = document.querySelector('.cohort-ribbon');
 if (!ribbon) return;
 const dialog = document.getElementById('cohort-notice-dialog');
 const link = ribbon.querySelector('.cohort-ribbon__link');
 let closed = new URLSearchParams(location.search).get('sampleState') === 'closed';
 let opener;
 let remainingSeats = null;
 const seatCount = document.querySelector('[data-cohort-seats]');
 function render() {
  if (closed) ribbon.querySelectorAll('[data-marquee-text]').forEach(el => el.textContent = '01기 모집 마감 · 다음 기수 알림받기');
  if (seatCount) seatCount.textContent = closed ? '모집 마감' : remainingSeats === null ? '확인 중' : `${remainingSeats}자리`;
 }
 render();
 fetch('./cohort-recruitment.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(config => {
  remainingSeats = Number.isInteger(config.remainingSeats) && config.remainingSeats >= 0 ? config.remainingSeats : null;
  closed = closed || config.status === 'closed' || remainingSeats === 0 || Date.now() >= Date.parse(config.closesAt);
  render();
 }).catch(() => { if (seatCount && !closed) seatCount.textContent = '확인 필요'; });
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
