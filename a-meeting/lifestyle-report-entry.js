(() => {
  const savingReport = new URLSearchParams(location.search).get('report') === 'save';
  if (!savingReport && location.hash !== '#login') return;
  const screen = document.querySelector('[data-login-screen]');
  const welcome = screen?.querySelector('.account-welcome');
  const title = screen?.querySelector('#login-screen-title');
  const opener = document.querySelector('[data-login]');
  if (!welcome || !title || !opener) return;

  if (savingReport) {
    title.innerHTML = '내 생활 리포트<br><em>저장하기</em>';
    const note = document.createElement('p');
    note.textContent = '회원 계정 저장은 아직 연결 전이에요.';
    const back = document.createElement('a');
    back.href = '../meal-quiz/';
    back.textContent = '내 리포트로 돌아가기';
    const returnLine = document.createElement('p');
    returnLine.append(back);
    welcome.append(note, returnLine);
  }
  opener.click();
})();
