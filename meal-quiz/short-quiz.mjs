const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const shortQuestions={
  10:['하루의 움직임','최근 일주일,<br>얼마나 움직였나요?','빠른 걷기처럼 조금 숨찬 활동을 떠올려주세요.<br>달리기처럼 많이 숨찬 시간은 두 배로 세어봐요.'],
  11:['하루의 쉼','하루가 끝나면,<br>잠은 얼마나 자나요?','평소 모습에 가까운 것 하나만 골라주세요.'],
};
export function shortQuestion(s,step,choice){
  const rows=step===10?[
    ['none','거의 움직이지 않아요','숨이 차는 활동은 거의 없어요'],
    ['light','가끔, 짧게 움직여요','일주일 합쳐 30분 미만'],
    ['some','틈틈이 움직이는 편이에요','일주일 합쳐 30~149분'],
    ['enough','꾸준히 움직이고 있어요','일주일 합쳐 150분 이상'],
    ['unknown','잘 모르겠어요','시간을 재본 적은 없어요'],
    ['limited','통증이나 활동 제한이 있어요','내 몸에 맞는 범위가 필요해요'],
  ]:[
    ['under6','6시간도 못 잘 때가 많아요','평소 6시간 미만'],
    ['6to7','조금 더 자고 싶어요','평소 6시간 이상 ~ 7시간 미만'],
    ['7to9','7~9시간 정도 자요','대체로 이 정도 자는 편이에요'],
    ['over9','9시간보다 길게 자요','충분히 누워 있는 편이에요'],
    ['irregular','그날그날 달라요','일정에 따라 들쭉날쭉해요'],
    ['unknown','잘 모르겠어요','정확히 재본 적은 없어요'],
  ];
  return `<div class="choice-list">${rows.map(x=>choice(step===10?'quickActivity':'sleep',...x)).join('')}</div>`;
}
const select=(s,key,label,options,required=true)=>`<label class="field">${label}<select name="${key}" ${required?'required':''}><option value="">선택해주세요</option>${options.map(([v,t])=>`<option value="${v}" ${s[key]===v?'selected':''}>${t}</option>`).join('')}</select></label>`;
const number=(s,key,label,max,required=true)=>`<label class="field">${label}<input type="number" name="${key}" min="0" max="${max}" step="${key==='proteinGrams'?'0.1':'1'}" inputmode="decimal" value="${esc(s[key]??'')}" ${required?'required':''}></label>`;
export function detailForm(s,kind){
  return `<form id="life-detail-form" data-kind="${kind}"><p class="field-note">선택 입력이에요. 닫아도 지금의 결과는 그대로 볼 수 있어요.</p>
  ${select(s,'age','연령대',[['19-29','19–29세'],['30-49','30–49세'],['50-64','50–64세'],['65+','65세 이상'],['under19','19세 미만']])}
  ${kind==='protein'?select(s,'referenceSex','영양 기준표의 성별',[['female','여성 기준'],['male','남성 기준']]):''}
  ${select(s,'healthContext','식사·운동에 별도 조절이 필요한가요?',[['general','특별한 조절 없이 생활해요'],['personal','임신·수유·질환·치료 등으로 조절이 필요해요']])}
  ${kind==='protein'?`${number(s,'proteinGrams','기록한 하루의 총 단백질 (g)',300)}<p class="field-note">식사 기록 앱·영양표로 확인한 하루 전체 합계예요. 밥·간식·음료도 포함해요. 모르면 입력하지 않고 닫아도 괜찮아요.</p>`:`${number(s,'moderateMinutes','최근 7일 중강도 활동 합계 (분)',2520)}${number(s,'vigorousMinutes','최근 7일 고강도 활동 합계 (분)',2520)}<p class="field-note">중강도는 대화는 되지만 노래는 어려운 정도, 고강도는 몇 마디 뒤 숨을 고르는 정도예요. 하지 않았다면 0을 넣고 같은 시간을 중복해 세지 않아요. 근력 운동 시간은 별도로 봐요.</p>`}
  <div class="dialog-actions"><button class="button-primary" type="submit">이 기록으로 계산하기</button><button class="button-secondary" type="button" data-action="close-dialog">지금 결과로 돌아가기</button></div></form>`;
}
