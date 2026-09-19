import {
  PEOPLE,FREQUENCIES,STYLES,FOODS,AVOIDS,PRODUCTS,blankAnswers,sanitizeAnswers,
  stepValid,isComplete,toggleMulti,recommend,priceBreakdown,compositionComparison
} from './model.mjs';

const app=document.querySelector('#app');
const actionBar=document.querySelector('#action-bar');
const dialog=document.querySelector('#detail-dialog');
const dialogContent=document.querySelector('#dialog-content');
const storageKey='donghwa-meal-finder-v1';
const stepNames=['식사 인원·횟수','평소 밥상','좋아하는 음식','피하는 음식'];
const money=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
const back='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';
let answers=blankAnswers(),view='intro',step=0,toastTimer;
try {
  const saved=JSON.parse(sessionStorage.getItem(storageKey));
  if(saved?.version===1){answers=sanitizeAnswers(saved.answers||{});view=saved.view==='result'&&isComplete(answers)?'result':saved.view==='quiz'?'quiz':'intro';step=Math.floor(Math.min(3,Math.max(0,Number(saved.step)||0)));}
} catch {}
const save=()=>{try{sessionStorage.setItem(storageKey,JSON.stringify({version:1,answers,view,step}));}catch{}};
const label=(list,value)=>list.find(item=>item.id===value)?.label||'';
const labels=(list,values)=>values.map(value=>label(list,value)).join(', ');
function notify(message) {
  const el=document.querySelector('#toast');
  el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('visible'),2500);
}
function navigate(next,nextStep=0,{replace=false}={}) {
  clearTimeout(toastTimer);document.querySelector('#toast').classList.remove('visible');document.querySelector('#toast').textContent='';
  view=next;step=nextStep;save();
  history[replace?'replaceState':'pushState']({view,step},'',view==='intro'?'#start':view==='result'?'#result':'#question-'+(step+1));
  render();window.scrollTo({top:0,behavior:'instant'});
  requestAnimationFrame(()=>app.querySelector('h1')?.focus({preventScroll:true}));
}
window.addEventListener('popstate',event=>{
  const state=event.state;
  if(!state)return navigate('intro',0,{replace:true});
  view=state.view==='result'&&!isComplete(answers)?'quiz':state.view;
  if(!['intro','quiz','result'].includes(view))view='intro';
  step=Math.min(3,Math.max(0,state.step||0));save();render();window.scrollTo(0,0);
});
function radioChoices(name,options,value,compact=false) {
  return '<div class="'+(compact?'compact-choices':'choice-list')+'">'+options.map(option=>`
    <label class="choice ${compact?'compact-choice':''}">
      <input type="radio" name="${name}" value="${option.id}" ${value===option.id?'checked':''}>
      ${option.icon?'<span class="choice-icon" aria-hidden="true">'+option.icon+'</span>':''}
      <span class="choice-copy"><strong>${option.label}</strong>${option.detail?'<small>'+option.detail+'</small>':''}</span>
      <span class="radio-mark" aria-hidden="true"></span>
    </label>`).join('')+'</div>';
}
function intro() {
  app.innerHTML=`<section class="intro finder-intro fade-in">
    <p class="eyebrow">동화가든 정기배송</p>
    <h1 class="hand" tabindex="-1">나에게 맞는<br><em>정기배송 식단</em> 찾기</h1>
    <p class="intro-description">몇 명이, 어떻게, 무엇을 즐겨 먹는지.<br>평소 식사에 맞는 구성을 골라드릴게요.</p>
    <div class="intro-meta"><span>4단계</span><i aria-hidden="true"></i><span>약 1분</span><i aria-hidden="true"></i><span>가입 없이 바로 확인</span></div>
    <figure class="intro-art"><img src="./assets/meal-box.png" alt="순두부와 국, 반찬을 함께 차린 동화가든 밥상" width="282" height="282"><figcaption>상차림 예시</figcaption></figure>
  </section>`;
  actionBar.innerHTML='<div class="action-bar"><button class="button-primary" data-action="start">내 식단 찾기 '+arrow+'</button></div>';
}
function question() {
  const titles=['함께 먹는 사람과<br>집밥 횟수를 알려주세요.','평소 집에서는<br>어떻게 차려 드세요?','좋아하거나 자주 먹는<br>음식을 골라주세요.','잘 먹지 않는<br>음식이 있나요?'];
  const descriptions=['같은 구성으로 함께 식사할 인원을 골라주세요.','가장 가까운 한 가지를 골라주세요.','최대 3개까지 고를 수 있어요.','해당하는 것을 모두 골라주세요.'];
  let body='';
  if(step===0)body=`<fieldset><legend>몇 명이 함께 드시나요?</legend>${radioChoices('people',PEOPLE,answers.people,true)}</fieldset>
    <fieldset><legend>하루에 몇 끼를 집에서 드시나요?</legend>${radioChoices('frequency',FREQUENCIES,answers.frequency,true)}</fieldset>`;
  if(step===1)body='<fieldset><legend class="sr-only">평소 식사 구성</legend>'+radioChoices('style',STYLES,answers.style)+'</fieldset>';
  if(step===2)body=`<fieldset><legend class="sr-only">좋아하거나 자주 먹는 음식, 최대 3개 선택</legend><div class="food-grid">${FOODS.map(food=>`
    <label class="food-card">
      <input type="checkbox" name="foods" value="${food.id}" ${answers.foods.includes(food.id)?'checked':''}>
      <span class="food-check" aria-hidden="true">✓</span><span class="food-emoji" aria-hidden="true">${food.icon}</span>
      <span class="food-name">${food.label}</span><span class="food-tag">${food.detail}</span>
    </label>`).join('')}</div></fieldset><p class="selection-info" id="selection-info" aria-live="polite">${answers.foods.length} / 3 선택</p>`;
  if(step===3)body=`<fieldset><legend class="sr-only">피하는 음식</legend><div class="choice-list avoid-list">${AVOIDS.map(item=>`
    <label class="choice multi"><input type="checkbox" name="avoids" value="${item.id}" ${answers.avoids.includes(item.id)?'checked':''}><span class="choice-copy"><strong>${item.label}</strong></span><span class="radio-mark" aria-hidden="true"></span></label>`).join('')}</div></fieldset>
    <p class="helper">정해진 구성을 고르는 테스트예요. 음식 교체나 맵기 조절은 제공하지 않아요.</p>
    <p class="helper allergy-note">알레르기가 있다면 상품별 원재료 표시를 꼭 확인해주세요.</p>`;
  app.innerHTML=`<div class="stepper"><div class="stepper-top"><span>${stepNames[step]}</span><span><b>${step+1}</b> / 4</span></div><div class="progress" role="progressbar" aria-label="테스트 진행" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${step+1}"><span style="width:${(step+1)*25}%"></span></div></div>
    <section class="question fade-in"><h1 class="question-title" tabindex="-1">${titles[step]}</h1><p class="question-description">${descriptions[step]}</p><form id="quiz-form">${body}</form></section>`;
  actionBar.innerHTML=`<div class="action-bar"><div class="action-row"><button class="back-button" data-action="back" aria-label="이전 단계">${back}</button><button id="next-button" class="button-primary" data-action="next" ${stepValid(step,answers)?'':'disabled'}>${step===3?'내 추천 구성 보기':'다음'} ${arrow}</button></div></div>`;
}
function priceRows(product) {
  const cost=priceBreakdown(product);
  return `<dl class="price-lines"><div><dt>정기배송 상품가</dt><dd>${money(cost.goods)}</dd></div>
    <div><dt>배송비</dt><dd>${cost.shipping===null?'지역 배송 안내 확인':cost.shipping===0?'무료':money(cost.shipping)}</dd></div>
    <div class="price-total"><dt>1회 결제금액</dt><dd>${cost.delivered===null?money(cost.goods)+' + 배송비 확인':money(cost.delivered)}</dd></div></dl>`;
}
const sourceNote='<p class="price-source">미리보기 · 2026년 8월 구성안의 제안 가격입니다.</p>';
function allProductsRow(product,{reason='',rank=''}={}) {
  return `<button class="option-row" data-product="${product.id}" aria-label="${product.name} 구성 자세히 보기"><span class="option-row-copy">${rank?'<small>'+rank+'</small>':''}<strong>${product.name}</strong><span>${reason||product.tagline}</span><b>${money(product.price)} <em>/ 회${product.shipping===0?' · 무료배송':product.shipping===null?' · 강릉 전용':' · 배송비 3,500원'}</em></b></span>${arrow}</button>`;
}
function result() {
  const ranking=recommend(answers);
  const top=ranking[0];
  const summary=label(PEOPLE,answers.people)+' · '+label(FREQUENCIES,answers.frequency)+' · '+label(STYLES,answers.style);
  if(!top) {
    app.innerHTML=`<section class="result-hero no-match"><p class="eyebrow">추천 결과</p><h1 tabindex="-1">지금 구성에는<br>두부·콩 음식이 들어 있어요.</h1><p class="result-description">선택하신 기피 음식을 제외하면<br>추천할 수 있는 구성이 없어요.</p><button class="button-secondary" data-action="edit-avoids">피하는 음식 다시 선택하기</button></section>
      <section class="result-section"><h2>어떤 구성이 있는지 살펴보세요.</h2><p class="section-description">음식을 빼거나 다른 음식으로 바꿀 수는 없어요.</p><button class="button-secondary" data-action="catalog">전체 구성 보기</button></section>`;
    actionBar.innerHTML='<div class="action-bar"><button class="button-primary" data-action="answers">내 답변 확인하기</button></div>';
    return;
  }
  const product=top.product,cost=priceBreakdown(product),comparison=compositionComparison(product,answers);
  const selectedPreferences=answers.foods.filter(f=>f!=='any').map(f=>label(FOODS,f));
  app.innerHTML=`<article class="result fade-in">
    <section class="result-hero finder-result-hero"><p class="eyebrow">내 식사에 맞는 정기배송</p>
      <div class="result-context"><span>${esc(summary)}</span><button data-action="answers" class="text-button">수정</button></div>
      <h1 tabindex="-1">${product.name}</h1><p class="result-tagline">${product.tagline}</p>
      <p class="hero-price">${money(product.price)}<span> / 회</span></p>
      <p class="hero-delivery">${product.shipping===0?'배송비 무료':'배송비 '+money(product.shipping)+' · 배송 포함 '+money(cost.delivered)}</p>
      ${sourceNote}
      <div class="tag-list">${selectedPreferences.map(text=>'<span>'+text+'</span>').join('')||'<span>골고루 먹는 밥상</span>'}</div>
    </section>
    <section class="result-section"><p class="section-number">01 · 추천 이유</p><h2>이 구성을 고른 이유</h2>
      <ol class="reason-list">${top.reasons.map(reason=>'<li>'+reason+'</li>').join('')}</ol>
      ${answers.people==='4'?'<p class="helper">패밀리의 안내 인원은 3~4인입니다. 5인 이상이라면 양을 확인해주세요.</p>':''}
      ${['3','4'].includes(answers.people)&&product.id!=='family'?'<p class="helper">선호 음식에 맞춘 추천입니다. 여러 명이 드실 양인지는 전체 구성을 확인해주세요.</p>':''}
      ${answers.avoids.some(a=>a!=='none')?'<p class="helper">표기된 구성에 기피 음식이 있는 옵션은 제외했어요. 국·반찬의 세부 원재료는 회차별로 확인해주세요.</p>':''}
    </section>
    <section class="result-section composition"><p class="section-number">02 · 한 번에 받는 구성</p><h2>이렇게 담아 보내드려요.</h2>
      <ul class="composition-list">${product.items.map(item=>'<li><span>'+item+'</span><span aria-hidden="true">✓</span></li>').join('')}</ul>
      <p class="helper">국·반찬 메뉴는 배송 회차에 따라 달라질 수 있어요.<br>밥은 별도이며, 음식 교체나 맵기 조절은 제공하지 않아요.</p>
    </section>
    <section class="result-section"><p class="section-number">03 · 구성별 가격</p><h2>상품가와 배송비를 한눈에.</h2>
      <div class="price-comparison"><div><span>단품으로 각각 사면</span><strong>${money(product.retail)}</strong></div><div><span>정기배송 상품가</span><strong>${money(product.price)}</strong></div></div>
      <p class="saving-copy">상품가 기준 <strong>${money(cost.goodsSaving)}</strong> 낮아요.</p>
      ${priceRows(product)}
      <p class="comparison-note">구성안의 단품 합산가와 정기배송 상품가 비교입니다. 단품 배송비는 비교에 포함하지 않았어요.</p>
    </section>
    <section class="result-section"><p class="section-number">04 · 평소 식사와 비교하면</p><h2>식탁에 더해지는 음식</h2>
      <div class="meal-comparison"><div><span>평소 식사</span><strong>${comparison.before}</strong></div><span class="compare-arrow" aria-hidden="true">↓</span><div><span>이번 추천</span><strong>${comparison.after}</strong></div></div>
      <p class="section-description">${comparison.text}</p>
      <details class="nutrition-basis"><summary>가격·영양 비교 기준</summary><p>외식 한 끼와 정기배송 한 상자의 양은 달라요. 현재 자료에는 구성별 끼니 수와 영양 성분이 없어, 외식 대비 절약액이나 단백질·나트륨 차이를 숫자로 표시하지 않았어요.</p><p>위 가격 비교는 같은 구성의 상품가만 비교했어요. 실제 메뉴와 영양 정보는 주문 전 상품 안내에서 확인해주세요.</p></details>
    </section>
    <section class="result-section alternatives"><p class="section-number">05 · 함께 비교해보세요</p><h2>이런 구성도 있어요.</h2>
      ${ranking.slice(1,3).map((entry,i)=>allProductsRow(entry.product,{reason:entry.reasons[0],rank:'다른 추천 '+(i+1)})).join('')}
      <button class="button-secondary catalog-button" data-action="catalog">전체 10개 구성 살펴보기</button>
    </section>
    <div class="result-utilities"><button class="text-button" data-action="answers">답변 다시 보기</button><button class="text-button" data-action="restart">처음부터 다시 하기</button></div>
  </article>`;
  actionBar.innerHTML=`<div class="action-bar"><button class="button-primary" data-product="${product.id}">추천 구성 자세히 보기 ${arrow}</button></div>`;
}
function render() {
  if(view==='intro')intro();else if(view==='quiz')question();else result();
}
function openDialog(title,body,classes='') {
  dialogContent.innerHTML=`<div class="dialog-inner ${classes}"><div class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close" aria-label="닫기">✕</button></div>${body}</div>`;
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('[data-action="close"]').focus({preventScroll:true});
  dialog.scrollTop=0;
}
function showProduct(id) {
  const product=PRODUCTS.find(p=>p.id===id);if(!product)return;
  openDialog(product.name,`<p class="detail-tagline">${product.tagline}</p>${product.target?'<span class="pill">'+product.target+' 구성</span>':''}
    ${product.region?'<p class="region-note">강릉 지역 전용 상품입니다. 배송 가능 지역과 비용은 신청 전에 확인해주세요.</p>':''}
    <h3 class="detail-label">한 번에 받는 구성</h3><ul class="composition-list">${product.items.map(item=>'<li>'+item+'</li>').join('')}</ul>
    ${priceRows(product)}${product.monthly?'<p class="helper">월 구독 제안가 '+money(product.monthly)+' · 배송 일정은 신청 안내에서 확인</p>':''}
    ${sourceNote}<p class="helper">국·반찬의 세부 메뉴는 회차별로 달라질 수 있어요. 구성 변경과 맵기 조절은 제공하지 않아요.</p>
    <div class="dialog-actions"><a class="button-primary" href="https://dacreation.cafe24.com/subscription/apply.html" target="_blank" rel="noopener">정기배송 신청 안내 ${arrow}</a><button class="button-secondary" data-action="catalog">다른 구성과 비교하기</button></div>
    <p class="link-caption">동화가든 신청 안내 페이지로 이동합니다.</p>`);
}
function showCatalog() {
  openDialog('정기배송 전체 구성','<p>정해진 구성 중에서 골라 이용하는 상품이에요.</p>'+PRODUCTS.filter(p=>!p.region).map(p=>allProductsRow(p)).join('')+
    '<h3 class="detail-label">강릉 지역에서 받는다면</h3>'+allProductsRow(PRODUCTS.find(p=>p.id==='local'))+sourceNote,'catalog-dialog');
}
function showAnswers() {
  const values=[
    label(PEOPLE,answers.people)+' · '+label(FREQUENCIES,answers.frequency),
    label(STYLES,answers.style),labels(FOODS,answers.foods),labels(AVOIDS,answers.avoids)
  ];
  openDialog('내가 고른 답변',values.map((value,index)=>`<button class="answer-row" data-edit="${index}"><span><small>${stepNames[index]}</small><strong>${esc(value)||'선택 전'}</strong></span><span>수정</span></button>`).join('')+'<p class="helper">답변을 바꾸면 추천 구성도 다시 계산해드려요.</p>');
}
app.addEventListener('submit',event=>event.preventDefault());
app.addEventListener('change',event=>{
  const input=event.target;if(!(input instanceof HTMLInputElement))return;
  if(['people','frequency','style'].includes(input.name))answers[input.name]=input.value;
  if(['foods','avoids'].includes(input.name)) {
    const name=input.name;
    const next=toggleMulti(answers[name],input.value,{exclusive:name==='foods'?'any':'none',max:name==='foods'?3:6});
    if(next===answers[name])notify('좋아하는 음식은 최대 3개까지 골라주세요.');
    answers[name]=next;
    app.querySelectorAll('input[name="'+name+'"]').forEach(el=>el.checked=next.includes(el.value));
    if(name==='foods')document.querySelector('#selection-info').textContent=next.length+' / 3 선택';
  }
  save();document.querySelector('#next-button').disabled=!stepValid(step,answers);
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action],[data-product],[data-edit]');
  if(!button)return;
  if(button.dataset.product)return showProduct(button.dataset.product);
  if(button.dataset.edit!==undefined){dialog.close();return navigate('quiz',Number(button.dataset.edit));}
  switch(button.dataset.action) {
    case 'start':navigate('quiz',0);break;
    case 'back':navigate(step===0?'intro':'quiz',Math.max(0,step-1));break;
    case 'next':if(stepValid(step,answers)){if(step===3){if(isComplete(answers))navigate('result');else navigate('quiz',[0,1,2,3].find(s=>!stepValid(s,answers)));}else navigate('quiz',step+1);}break;
    case 'restart':answers=blankAnswers();dialog.close();navigate('intro');break;
    case 'answers':showAnswers();break;
    case 'catalog':showCatalog();break;
    case 'close':dialog.close();break;
    case 'edit-avoids':navigate('quiz',3);break;
  }
});
document.querySelector('#home-button').addEventListener('click',()=>navigate('intro'));
document.querySelector('#restart-button').addEventListener('click',()=>{
  if(view==='intro'){answers=blankAnswers();save();return;}
  openDialog('처음부터 다시 할까요?','<p>선택한 답변이 초기화됩니다.</p><div class="dialog-actions"><button class="button-primary" data-action="restart">처음부터 다시 하기</button><button class="button-secondary" data-action="close">계속 보기</button></div>');
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
new ResizeObserver(entries=>{
  document.documentElement.style.setProperty('--footer-height',Math.ceil(entries[0].target.getBoundingClientRect().height)+'px');
}).observe(document.querySelector('#site-footer'));
navigate(view,step,{replace:true});
