import {foods,goals,reasons,plan,nutrients,initialState,restoreState,activeSteps,isValid,menuValues,comparison,DEMO_NOTICE} from './model.mjs';
import {lifeEnums,lifeNumbers,lifeProfile} from './lifestyle.mjs';
import {lifestyleSections,lifestyleText} from './lifestyle-ui.mjs';
import {shortQuestions,shortQuestion,detailForm} from './short-quiz.mjs';

const $=s=>document.querySelector(s);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>Math.round(value).toLocaleString('ko-KR');
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const back='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg>';
const storageKey='donghwa-lifestyle-quiz-v3';
let state=initialState();
try{state=restoreState(JSON.parse(sessionStorage.getItem(storageKey)));}catch{}
if(state.view==='result' && activeSteps(state).some(s=>!isValid(state,s))){state.view='quiz';state.step=activeSteps(state).find(s=>!isValid(state,s));}
let toastTimeout,returnFocus;
function persist(){try{sessionStorage.setItem(storageKey,JSON.stringify(state));}catch{}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function navigate(view,step=state.step){state.view=view;state.step=step;persist();render();window.scrollTo({top:0,behavior:'instant'});$('#app h1')?.focus({preventScroll:true});}
function refresh(){const scrollY=window.scrollY,focusId=document.activeElement?.id;persist();render(false);if(focusId)document.getElementById(focusId)?.focus({preventScroll:true});window.scrollTo({top:scrollY,behavior:'instant'});}
const selectedNames=()=>state.selected.map(id=>id==='other'?state.other:foods.find(f=>f.id===id)?.name).filter(Boolean);
const currentReason=()=>reasons.find(r=>r.id===state.reason)||reasons[1];
function render(animate=true){
  $('#app').className=animate?'fade-in':'';
  $('#app').innerHTML=state.view==='intro'?intro():state.view==='quiz'?quiz():result();
  renderAction();
}
function intro(){return `<section class="intro">
  <h1 tabindex="-1" class="hand">애덜아,<br><em>밥 잘 챙겨 먹니?</em></h1>
  <p class="intro-description">평소 식사와 생활 습관에 맞는<br>음식과 운동을 추천해드려요.</p>
  <div class="intro-art"><img src="./assets/timeline-fresh-prep-illustration-v2.png" alt="순두부와 반찬으로 차린 밥상을 건네는 일러스트" width="282" height="282"></div>
  </section>`;}
const questionInfo=[
  ['내 입맛 찾기','평소 자주 먹거나 좋아하는<br>배달 음식은 뭐예요?','좋아하는 메뉴는 모두 골라주세요.<br>하나만 골라도 괜찮아요.'],
  ['배달과 나의 거리','일주일에 배달 음식,<br>몇 끼 정도 먹나요?','최근 한 달의 평소 모습을 떠올려주세요.'],
  ['한 끼의 크기','한 번 주문한 음식,<br>보통 어떻게 먹나요?','둘이 한 번 먹거나, 혼자 두 번 먹으면 총 2끼예요.'],
  ['밥상 속 내 마음','배달앱을 켜는 순간,<br>내 마음은?','가장 자주 드는 생각 하나만 골라주세요.'],
  ['평소의 밥상','내 한 끼를 떠올리면,<br>어떤 모습에 가깝나요?','잘하고 못하는 답은 없어요. 평소대로 골라주세요.'],
  null, // Former preparation-time step is now part of the final question.
  ['챙기고 싶은 것','앞으로 내 하루에서<br>달라졌으면 하는 건?','지금 가장 중요한 것, 최대 2개만 골라주세요.'],
  ['작은 변화부터','내 생활에 맞는 집밥,<br>어떻게 시작해볼까요?','준비 시간과 일주일에 챙길 끼니 수를 골라주세요.'],
];
function choice(key,value,text,sub='',icon='',multi=false){const checked=multi?state.goals.includes(value):state[key]===value;const disabled=multi&&state.goals.length===2&&!checked;return `<label class="choice ${multi?'multi':''}"><input id="choice-${escape(key)}-${escape(value)}" type="${multi?'checkbox':'radio'}" name="${escape(key)}" value="${escape(value)}" ${checked?'checked':''} ${disabled?'disabled':''}>${icon?`<span class="choice-icon" aria-hidden="true">${icon}</span>`:''}<span class="choice-copy"><strong>${escape(text)}</strong>${sub?`<small>${escape(sub)}</small>`:''}</span><span class="radio-mark" aria-hidden="true"></span></label>`;}
function quiz(){
  const steps=activeSteps(state),position=steps.indexOf(state.step),q=[...(shortQuestions[state.step]||questionInfo[state.step])];
  if(state.step===3&&state.selected.includes('none')){q[1]='집밥을 챙길 때,<br>내 마음은?';q[2]='평소 식사할 때 가장 자주 드는 생각을 골라주세요.';}
  let content='';
  if(state.step>=8){content=shortQuestion(state,state.step,choice);}
  else if(state.step===0){
    content=`<div class="food-grid">${foods.map(f=>`<label class="food-card"><input id="food-${f.id}" type="checkbox" name="food" value="${f.id}" ${state.selected.includes(f.id)?'checked':''}><span class="food-check" aria-hidden="true">✓</span><span class="food-emoji" aria-hidden="true">${f.emoji}</span><span class="food-name">${f.name}</span><span class="food-tag">${f.tag}</span></label>`).join('')}<label class="food-card"><input id="food-other" type="checkbox" name="food" value="other" ${state.selected.includes('other')?'checked':''}><span class="food-check" aria-hidden="true">✓</span><span class="food-emoji" aria-hidden="true">🥄</span><span class="food-name">다른 메뉴</span><span class="food-tag">내 최애 직접 쓰기</span></label></div>
    ${state.selected.includes('other')?`<label class="field">내가 좋아하는 메뉴<input id="other-menu" name="other" placeholder="예: 초밥" maxlength="40" value="${escape(state.other)}"></label>`:''}
    <button class="none-choice" data-action="none" aria-pressed="${state.selected.includes('none')}">배달 음식은 거의 안 먹어요</button>
    <p class="helper">선택한 메뉴로 취향을 찾고, 마지막에 한 끼씩 비교해봐요.</p>`;
  }else if(state.step===1){content=`<div class="choice-list">${[[0,'거의 안 먹어요','배달보다 다른 식사가 익숙해요'],[1,'일주일에 1끼','가끔 생각날 때'],[2,'일주일에 2끼','바쁜 날의 든든한 지원군'],[3,'일주일에 3끼','이틀에 한 번쯤'],[5,'일주일에 5끼 이상','평일에도 자주 함께해요'],['unknown','그때그때 달라요','정해진 패턴은 없어요']].map(x=>choice('frequency',...x)).join('')}</div>`;
  }else if(state.step===2){content=`<div class="choice-list">${[[1,'혼자 한 번에 먹어요','한 주문을 총 1끼로'],[2,'혼자 두 번에 나눠 먹어요','한 주문을 총 2끼로'],['shared','둘이 먹거나 여러 명이 나눠요','메뉴별 기본 인분으로 계산할게요'],['mixed','메뉴마다 달라요','결과에서 메뉴별 금액과 양을 바꿀 수 있어요']].map(x=>choice('portions',...x)).join('')}</div><p class="step-quote">같은 한 끼끼리 비교해야지!</p><p class="helper">음식 전체 금액을 먹는 끼니 수로 나눠요.<br>여럿이 먹는 경우 결과에서 총 인분을 확인해주세요.</p>`;
  }else if(state.step===3){content=`<div class="choice-list">${reasons.map(r=>choice('reason',r.id,r.text,r.sub,r.icon)).join('')}</div>`;
  }else if(state.step===4){content=`<div class="choice-list">${[['carbs','밥이나 면 하나로 간단하게','한 그릇이면 한 끼 해결','🍚'],['meat','고기는 챙겨도 채소는 자주 빠져요','반찬까지 챙기기는 어렵더라고요','🥩'],['balanced','여러 가지 골고루 챙겨요','밥, 단백질 반찬, 채소까지','🥗'],['unknown','끼니마다 달라요','한 가지로 고르기는 어려워요','🥄']].map(x=>choice('balance',...x)).join('')}</div>`;
  }else if(state.step===6){content=`<div class="choice-list">${goals.map(g=>choice('goals',g.id,g.text,'',g.icon,true)).join('')}</div><p class="selection-info" aria-live="polite">${state.goals.length} / 2개 선택${state.goals.length===2?' · 바꾸려면 선택한 항목을 한 번 더 눌러주세요.':''}</p>`;
  }else{content=`<fieldset class="life-fieldset first"><legend>집밥 준비에 쓸 수 있는 시간은?</legend><div class="compact-choices">${[[5,'5분 안팎','데우고 꺼내기'],[10,'10분 안팎','밥과 반찬 차리기'],[20,'20분 정도','간단한 조리까지'],[0,'준비가 어려워요','데우거나 차리기도 어려워요']].map(x=>choice('time',...x)).join('')}</div></fieldset><fieldset class="life-fieldset"><legend>${state.selected.includes('none')?'편하게 챙기고 싶은 집밥은?':'배달 대신 집밥, 몇 끼부터 바꿔볼까요?'}</legend><div class="compact-choices">${[[1,'일주일 1끼부터','부담 없이, 천천히'],[2,'일주일 2끼 정도','바쁜 날의 저녁부터'],[3,'일주일 3끼 정도','조금 더 자주 집밥을'],[0,'아직은 결과만','내 생활 유형부터 볼래요']].map(x=>choice('replace',...x)).join('')}</div></fieldset><p class="helper">두 항목을 고르면 나의 생활 리포트가 완성돼요.</p>`;}
  return `<div class="stepper"><div class="stepper-top"><span>${q[0]}</span><span><b>${String(position+1).padStart(2,'0')}</b> / ${String(steps.length).padStart(2,'0')}</span></div><div class="progress" role="progressbar" aria-label="테스트 진행" aria-valuenow="${position+1}" aria-valuemin="0" aria-valuemax="${steps.length}"><span style="width:${(position+1)/steps.length*100}%"></span></div></div><section class="question"><h1 class="question-title" tabindex="-1">${q[1]}</h1><p class="question-description">${q[2]}</p>${content}</section>`;
}
function renderAction(){
  let content='';
  if(state.view==='intro')content=`<button class="button-primary" data-action="start">테스트 시작하기 ${arrow}</button>`;
  if(state.view==='quiz'){
    let label=state.step===6?'나의 생활 리포트 보기':'다음 질문';
    if(state.step===0&&state.selected.length&&!state.selected.includes('none'))label=`${state.selected.length}개 골랐어요 · 다음`;
    content=`<div class="action-row"><button class="back-button" data-action="back" aria-label="이전 질문">${back}</button><button class="button-primary" data-action="next" ${isValid(state,state.step)?'':'disabled'}>${label} ${arrow}</button></div><p class="action-caption">${state.step===0?'내 취향에서, 내 하루로':state.step===6?'마지막 질문이에요. 바로 결과를 보여드릴게요.':'선택한 답은 언제든 바꿀 수 있어요'}</p>`;
  }
  if(state.view==='result')content=`<button class="button-primary green" data-action="save-result">내 생활 리포트 저장하기 ${arrow}</button><p class="action-caption">로그인 후 마이페이지에서 다시 보기</p>`;
  $('#action-bar').innerHTML=`<div class="action-bar">${content}</div>`;
}
function menuTabs(){return `<div class="menu-tabs" aria-label="비교 메뉴 선택">${[{id:'average',name:'선택 메뉴 평균'},...foods.filter(f=>state.selected.includes(f.id))].map(f=>`<button id="tab-${f.id}" class="menu-tab" data-action="tab" data-value="${f.id}" aria-pressed="${state.compareFood===f.id}">${f.name}</button>`).join('')}</div>`;}
function moneySection(c){
  if(!c)return `<section class="result-section"><p class="section-number">01 · 나의 식사 이야기</p><h2>집밥이 더 편해지는 쪽으로</h2><div class="empty-result">${state.selected.includes('none')?'배달을 거의 드시지 않는다고 답했어요. 배달비 절약액 대신, 내 생활에 맞는 집밥 활용법을 살펴보세요.':'선택한 메뉴의 비교 데이터가 아직 없어요. 취향은 결과에 반영하고, 비용·영양 비교는 자료를 확인한 뒤 제공할게요.'}</div></section>`;
  const max=Math.max(c.before,c.after,1),cap=typeof state.frequency==='number'?state.frequency:3;
  return `<section class="result-section" id="money-section"><p class="section-number">01 · 한 끼를 바꿔보면</p><h2>내가 고른 배달 메뉴와<br>집밥, 얼마가 다를까요?</h2><p class="section-description">선택한 메뉴를 한 끼 기준으로 나눠봤어요.</p>${menuTabs()}<p class="comparison-note">${state.compareFood==='average'?'선택 메뉴를 같은 비중으로 계산한 예시 평균이에요.':'선택 메뉴의 예시 구성으로 비교하고 있어요.'} 주간 식사 수는 비교를 위한 가정이며, 실제 지출 추정치는 아니에요.</p>
  <div class="period-selector"><span>비교해볼 주간 식사 수</span><div class="period-buttons">${[1,2,3].map(n=>`<button id="period-${n}" data-action="period" data-value="${n}" aria-label="일주일 ${n}끼 비교" aria-pressed="${c.weekly===n}" ${n>cap?'disabled':''}>${n}끼</button>`).join('')}</div></div>
  ${c.meals?`<div class="money-card" aria-live="polite"><p class="money-headline">4주 동안 ${c.meals}끼를 바꾸는 예시</p><div class="money-number">${money(Math.abs(c.difference))}<small>원 ${c.difference>=0?'절약':'추가'}</small></div><p class="money-sub">배달 ${money(c.avg.price)}원 / 집밥 ${money(c.unitAfter)}원<br>한 끼 기준 · ${c.difference>=0?'이 조건에서는 집밥 비용이 더 적어요.':'이 조건에서는 구독 비용이 더 커요.'}</p><div class="bar-line"><span>배달 ${c.meals}끼</span><div class="bar-track"><div class="bar-fill" style="width:${c.before/max*100}%">${money(c.before)}원</div></div></div><div class="bar-line"><span>집밥 ${c.meals}끼</span><div class="bar-track"><div class="bar-fill green" style="width:${c.after/max*100}%">${money(c.after)}원</div></div></div><p class="calc-lines">구독 ${c.boxes}묶음 ${money(c.boxes*plan.boxPrice)}원 + 별도 밥 ${money(c.meals*plan.rice)}원<br>배송비 포함 가정 · 1묶음 8끼, 64,000원인 예시 상품${c.leftover?`<br><b>남는 ${c.leftover}끼가 있어도 전체 구독료를 반영했어요.</b>`:''}</p></div>`:`<div class="empty-result" style="margin-top:15px">${cap===0?'배달을 거의 안 드신다고 답해 절약액을 계산하지 않았어요.':'위에서 바꿔볼 끼니 수를 고르면 4주 비용을 비교할 수 있어요.'}</div>`}
  <button class="text-button" data-action="edit">주문 금액·나눠 먹는 양 바꾸기</button><p class="demo-small">${DEMO_NOTICE}</p></section>`;
}
function nutritionSection(c){if(!c)return '';const preferred=state.goals.includes('protein');return `<section class="result-section" id="nutrition-section"><p class="section-number">02 · 한 끼 영양 살펴보기</p><h2>${preferred?'챙기고 싶은 단백질,<br>한 끼에 얼마나 담겼을까요?':'내 한 끼에 담기는 것들'}</h2><p class="section-description">${state.compareFood==='average'?'선택한 메뉴의 평균':escape(foods.find(f=>f.id===state.compareFood)?.name)} · 1인 1끼 기준<br>순두부·국/찌개·반찬·밥으로 차린 예시 한 끼예요.</p><table class="nutrition-table"><caption class="sr-only">1인 1끼 영양성분 비교, 모든 수치는 시연용 예시</caption><thead><tr><th scope="col">1인 1끼 기준</th><th scope="col">배달 예시</th><th scope="col">집밥 예시</th></tr></thead><tbody>${nutrients.map((n,i)=>`<tr class="${preferred&&i===1?'highlight':''}"><td>${n.name}</td><td>${c.avg.nutrients[i].toLocaleString('ko-KR',{maximumFractionDigits:n.decimals})} ${n.unit}</td><td>${plan.nutrients[i]} ${n.unit}</td></tr>`).join('')}</tbody></table><p class="comparison-note">밥과 반찬까지 포함한 한 끼 예시를 비교해요. 실제 영양적 우위는 제품 표시와 섭취량을 확인한 뒤 안내할 수 있어요.</p>${state.balance==='carbs'||state.balance==='meat'?'<div class="insight">여러 반찬을 준비하기 어렵다고 답했어요.<br>한 끼를 차릴 때 어떤 반찬이 함께 오는지 확인해보세요.</div>':''}</section>`;}
function result(){
  const r=currentReason(),c=comparison(state),profile=lifeProfile(state);
  const tags=selectedNames();
  return `<div class="result"><section class="result-hero life-hero"><span class="pill">나의 하루를 돌아보면</span><p class="eyebrow">MY EVERYDAY RHYTHM</p><h1 tabindex="-1">${escape(profile.title).replace('\n','<br>')}</h1><img class="result-art" src="./assets/timeline-fresh-prep-illustration-v2.png" alt="따뜻한 집밥을 건네는 일러스트" width="176" height="176"><p class="result-description">${profile.description}</p><div class="tag-list"><span>#${profile.tag}</span>${tags.slice(0,3).map(n=>`<span>#${escape(n)}</span>`).join('')}</div><p class="result-tip">“잘 먹고, 조금 움직이고, 푹 쉬자.”</p><p class="demo-small">답변으로 살펴본 생활 패턴이에요. 건강 진단 결과는 아니에요.</p></section>
  ${lifestyleSections(state)}
  <section class="lifestyle-bridge"><h2>나를 챙길 여유,<br>밥상에서 조금 덜어볼까요?</h2><p>${r.recommendation}<br>집밥 구독은 그중 식사 준비를 돕는 한 가지 방법이에요.</p></section>
  <div class="sample-banner"><b>이 아래는 상품 비교 시안이에요</b>${DEMO_NOTICE}${state.selected.includes('other')?`<br>‘${escape(state.other)}’는 비교 자료가 없어 수치 계산에서 제외했어요.`:''}</div>
  ${moneySection(c).replace('01 ·','05 ·')+nutritionSection(c).replace('02 ·','06 ·')}
  <section class="result-section recommendation"><p class="section-number">${c ? "07" : "06"} · 나에게 맞는 집밥 시작</p><h2>네가 챙기고 싶은 밥상,<br>할미도 같이 생각해봤다.</h2><p class="section-description">${r.recommendation}</p><img class="recommendation-image" src="./assets/meal-box.png" alt="순두부, 국과 반찬으로 차린 동화가든 한 상의 참고 사진" loading="lazy"><div class="recommendation-card"><span class="pill green">당신의 답변으로 골랐어요</span><h3>${plan.name}</h3><div class="recommended-goals">${goals.filter(g=>state.goals.includes(g.id)).map(g=>`<span>${g.text}</span>`).join('')}</div><p>${state.time===null?'제품별 가열 방법과 보관 조건을 확인하고 내 생활에 맞는지 살펴보세요.':state.time===0?'음식을 데우기 어렵다고 답했어요. 가열이 필요한 구성일 수 있어, 구독 전에 준비 방법을 꼭 살펴보세요.':`준비 시간은 ${state.time}분 안팎을 원하셨어요. 제품별 조리법을 확인하고 내 생활에 맞는지 살펴보세요.`}</p><p>순두부 · 국과 찌개 · 계절 반찬<br>이번 구성과 실제 제공 식수는 구독 전에 확인해요.</p><p class="demo-small">사진은 밥상 참고 이미지로, 확정 배송 구성과 다를 수 있어요.</p></div><div class="dialog-actions"><button class="button-primary green" data-action="product">내 생활에 맞는 집밥 구성 보기</button></div><div class="result-actions"><button class="button-secondary" data-action="save-result">내 결과 저장</button><button class="button-secondary" data-action="copy-result">리포트 복사</button></div><button class="text-button" style="display:block;margin:18px auto 0" data-action="edit-answers">답변 다시 살펴보기</button></section>
  <details class="evidence"><summary>비교 기준과 데이터 안내</summary><p>한 주문의 예시 가격을 먹는 총 끼니 수로 나누고, 선택 메뉴는 같은 비중으로 평균냅니다. 실제 음식의 양과 영양소는 다를 수 있어요. 주문 금액을 수정해도 영양 수치는 예시로 남습니다.</p><p>비용은 4주 기준입니다. 필요한 구독 묶음 전체 금액과 밥값을 포함하며, 쓰고 남는 식사 분량도 표시합니다. 현재는 실제 상품의 가격·영양표가 연결되지 않았습니다.</p><a href="https://various.foodsafetykorea.go.kr/nutrient/" target="_blank" rel="noopener noreferrer">식약처 영양성분 DB ↗</a><a href="https://da-creation.github.io/donghwa-garden-preview/a-meeting/" target="_blank" rel="noopener noreferrer">동화가든 기존 페이지 ↗</a></details><p class="brand-signoff">애덜아, 잘 챙겨 먹어라.</p></div>`;
}
function showDialog(html){returnFocus=document.activeElement;$('#dialog-content').innerHTML=`<div class="dialog-inner">${html}</div>`;$('#detail-dialog').showModal();}
const dialogHeader=title=>`<div class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close-dialog" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>`;
function editDialog(){const chosen=foods.filter(f=>state.selected.includes(f.id));showDialog(`${dialogHeader('내 주문에 맞게 바꾸기')}<p>한 주문의 전체 금액과, 나눠 먹는 총 끼니 수를 적어주세요. 둘이 한 번 먹으면 2끼예요.</p><form id="edit-form">${chosen.map(f=>{const v=menuValues(state,f);return `<div class="edit-menu"><h3>${f.emoji} ${f.name}</h3><div class="field-row"><label class="field">배달비 포함 주문액 (원)<input type="number" name="price-${f.id}" value="${v.orderPrice}" min="0" max="200000" step="1" required inputmode="numeric"></label><label class="field">총 몇 끼인가요?<input type="number" name="portions-${f.id}" value="${v.servings}" min="1" max="12" step="1" required inputmode="numeric"></label></div></div>`}).join('')}<p class="demo-small">가격과 나눠 먹는 양만 바뀌어요. 영양 수치는 여전히 시연용 예시예요.</p><div class="dialog-actions"><button class="button-primary" type="submit">내 조건으로 다시 계산하기</button><button class="text-button" type="button" data-action="reset-numbers">예시 금액·양으로 되돌리기</button></div></form>`);}
function productDialog(){showDialog(`${dialogHeader('나에게 맞는 집밥 구성')}<img class="modal-photo" src="./assets/meal-box.png" alt="동화가든 집밥 참고 사진"><h3>${plan.name}</h3><p>${currentReason().recommendation}</p><dl class="product-facts"><div><dt>제안 구성</dt><dd>순두부 · 국/찌개 · 반찬</dd></div><div><dt>계산용 예시 분량</dt><dd>1묶음, 8끼</dd></div><div><dt>계산용 예시 가격</dt><dd>64,000원 / 묶음</dd></div><div><dt>별도 준비</dt><dd>밥 · 제품별 가열</dd></div><div><dt>실제 배송·가격</dt><dd>판매 구성 확정 후 안내</dd></div></dl><p class="demo-small">${DEMO_NOTICE} 원재료·알레르기 표시, 실제 조리법과 보관 조건은 판매 상품에서 확인해주세요.</p>${state.time===0?'<p class="insight">데우기 어렵다고 답하셨어요. 조리 환경에 맞는지 먼저 확인해주세요.</p>':''}<div class="dialog-actions"><a class="button-primary green" href="https://da-creation.github.io/donghwa-garden-preview/a-meeting/" target="_blank" rel="noopener noreferrer">기존 정기구독 페이지 보기 ${arrow}</a><button class="button-secondary" data-action="close-dialog">내 결과로 돌아가기</button></div>`);}
function resultText(){const profile=lifeProfile(state);return `동화가든 · 나의 생활 리포트\n\n${profile.title.replace('\n',' ')}\n${profile.description}\n\n좋아하는 메뉴: ${selectedNames().join(', ')||'집밥'}\n챙기고 싶은 것: ${goals.filter(g=>state.goals.includes(g.id)).map(g=>g.text).join(', ')}\n\n${lifestyleText(state)}\n\nhttps://da-creation.github.io/donghwa-garden-preview/a-meeting/`;}
function closeDialog(){$('#detail-dialog').close();returnFocus?.focus({preventScroll:true});}
function saveDialog(){
  const loginUrl=location.pathname.includes('/meal-quiz/')?'../a-meeting/?report=save#login':'https://da-creation.github.io/donghwa-garden-preview/a-meeting/?report=save#login';
  showDialog(`${dialogHeader('리포트를 저장하려면 로그인해주세요')}<p>가입·로그인 후 마이페이지에 리포트를 보관하는 기능을 준비하고 있어요.</p><p class="demo-small">현재는 시안으로, 회원 계정에 저장되지는 않아요.<br>리포트는 파일로 내려받을 수 있어요.</p><div class="dialog-actions"><a class="button-primary green" href="${loginUrl}">가입·로그인하기 ${arrow}</a><button class="button-secondary" data-action="download-result">파일로 내려받기</button><button class="text-button" data-action="close-dialog">리포트로 돌아가기</button></div>`);
}
document.addEventListener('click',async e=>{
  const button=e.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='start')navigate('quiz',0);
  if(action==='none'){state.selected=state.selected.includes('none')?[]:['none'];state.frequency=state.selected.includes('none')?0:null;refresh();}
  if(action==='next'){
    if(!isValid(state,state.step))return;
    const steps=activeSteps(state),idx=steps.indexOf(state.step);
    if(idx===steps.length-1){state.compareWeekly=state.selected.includes('none')?0:2;state.compareFood='average';navigate('result');}
    else navigate('quiz',steps[idx+1]);
  }
  if(action==='back'){const steps=activeSteps(state),idx=steps.indexOf(state.step);if(idx>0)navigate('quiz',steps[idx-1]);else navigate('intro');}
  if(action==='tab'){state.compareFood=button.dataset.value;refresh();}
  if(action==='period'){state.compareWeekly=Number(button.dataset.value);refresh();}
  if(action==='edit')editDialog();
  if(action==='life-detail'){const kind=button.dataset.kind==='protein'?'protein':'activity';showDialog(`${dialogHeader(kind==='protein'?'단백질 기록 더하기':'활동 기록 더하기')}${detailForm(state,kind)}`);}
  if(action==='product')productDialog();
  if(action==='close-dialog')closeDialog();
  if(action==='reset-numbers'){state.overrides={};closeDialog();refresh();toast('예시 금액과 기본 양으로 되돌렸어요.');}
  if(action==='edit-answers')navigate('quiz',0);
  if(action==='reset'){closeDialog();state=initialState();navigate('intro');}
  if(action==='save-result')saveDialog();
  if(action==='download-result'){const url=URL.createObjectURL(new Blob([resultText()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='동화가든_내생활리포트.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('생활 리포트를 파일로 저장했어요.');}
  if(action==='copy-result'){try{await navigator.clipboard.writeText(resultText());toast('생활 리포트를 복사했어요.');}catch{toast('복사가 지원되지 않아요. 저장 버튼에서 파일로 내려받아주세요.');}}
});
$('#app').addEventListener('change',e=>{
  const input=e.target;if(!input.matches('input,select'))return;
  if(input.name==='habitDone'){state.habitsDone=state.habitsDone.filter(x=>x!==input.value);if(input.checked)state.habitsDone.push(input.value);refresh();return;}
  state.habitsDone=[];
  if(input.name in lifeEnums){state[input.name]=input.value===''?null:input.name==='planDays'?Number(input.value):input.value;if(input.name==='quickActivity'){state.activityMode=null;state.moderateMinutes=null;state.vigorousMinutes=null;state.strengthDays=null;}refresh();return;}
  if(input.name in lifeNumbers){state[input.name]=input.value===''?null:Number(input.value);persist();if(input.matches('select'))renderAction();return;}
  if(input.name==='food'){
    if(state.selected.includes('none'))state.frequency=null;
    state.selected=state.selected.filter(x=>x!=='none');
    if(input.checked&&!state.selected.includes(input.value))state.selected.push(input.value);
    if(!input.checked)state.selected=state.selected.filter(x=>x!==input.value);
  }else if(input.name==='goals'){
    if(input.checked&&state.goals.length<2)state.goals.push(input.value);
    if(!input.checked)state.goals=state.goals.filter(x=>x!==input.value);
  }else if(['frequency','portions','time','replace'].includes(input.name))state[input.name]=/^\d+$/.test(input.value)?Number(input.value):input.value;
  else if(['reason','balance'].includes(input.name))state[input.name]=input.value;
  refresh();
});
$('#app').addEventListener('input',e=>{if(e.target.name==='other'){state.other=e.target.value;persist();renderAction();}else if(e.target.name in lifeNumbers){state[e.target.name]=e.target.value===''?null:Number(e.target.value);state.habitsDone=[];persist();renderAction();}});
$('#detail-dialog').addEventListener('submit',e=>{
  if(e.target.id==='life-detail-form'){
    e.preventDefault();if(!e.target.reportValidity())return;
    const form=new FormData(e.target),kind=e.target.dataset.kind;
    const update={age:form.get('age'),healthContext:form.get('healthContext'),habitsDone:[]};
    if(kind==='protein')Object.assign(update,{referenceSex:form.get('referenceSex'),proteinMode:'record',proteinGrams:Number(form.get('proteinGrams'))});
    else Object.assign(update,{activityMode:'record',moderateMinutes:Number(form.get('moderateMinutes')),vigorousMinutes:Number(form.get('vigorousMinutes'))});
    state=restoreState({...state,...update});closeDialog();refresh();toast('추가한 기록으로 생활 리포트를 업데이트했어요.');return;
  }
  if(e.target.id!=='edit-form')return;e.preventDefault();if(!e.target.reportValidity())return;
  const form=new FormData(e.target);
  for(const f of foods.filter(x=>state.selected.includes(x.id)))state.overrides[f.id]={price:Number(form.get(`price-${f.id}`)),portions:Number(form.get(`portions-${f.id}`))};
  closeDialog();refresh();toast('입력한 금액과 양을 반영했어요.');
});
$('#detail-dialog').addEventListener('click',e=>{if(e.target===$('#detail-dialog')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeDialog();}});
$('#home-button').addEventListener('click',()=>navigate('intro'));
$('#restart-button').addEventListener('click',()=>showDialog(`${dialogHeader('처음부터 다시 해볼까요?')}<p>지금 고른 답변과 비교 조건이 초기화돼요.</p><div class="dialog-actions"><button class="button-primary" data-action="reset">처음부터 다시 하기</button><button class="button-secondary" data-action="close-dialog">이어서 할게요</button></div>`));
render();
// Keep content clear of both the quiz actions and the persistent site menu.
const footer=$('#site-footer');
const updateFooterHeight=()=>document.documentElement.style.setProperty('--footer-height',`${footer.getBoundingClientRect().height}px`);
updateFooterHeight();
if('ResizeObserver' in window)new ResizeObserver(updateFooterHeight).observe(footer);
else window.addEventListener('resize',updateFooterHeight);
