// General reference comparisons, independent of the fictional commerce data.
// Sources and scope are documented in LIFESTYLE-SOURCES.md.
export const sourceLinks = {
  protein:'https://health.seoulmc.or.kr/uploadFiles/2025_%ED%95%9C%EA%B5%AD%EC%9D%B8%EC%98%81%EC%96%91%EC%86%8C%EC%84%AD%EC%B7%A8%EA%B8%B0%EC%A4%80_%ED%99%9C%EC%9A%A9.pdf#page=13',
  foods:'https://www.kentcht.nhs.uk/leaflet/protein-guide-for-patients/',
  activity:'https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines/top-10-things-know',
  intensity:'https://www.cdc.gov/physical-activity-basics/measuring/index.html',
  sleep:'https://www.cdc.gov/sleep/about/index.html',
};
export const lifeDefaults=()=>({quickActivity:null,age:null,referenceSex:null,healthContext:null,proteinHabit:null,proteinMode:'habit',proteinGrams:null,activityMode:null,moderateMinutes:null,vigorousMinutes:null,strengthDays:null,exercise:'walk',planDays:5,sleep:null,sitting:null,habitsDone:[]});
export const lifeEnums={quickActivity:['none','light','some','enough','unknown','limited'],age:['19-29','30-49','50-64','65+','under19','skip'],referenceSex:['female','male','skip'],healthContext:['general','personal'],proteinHabit:['rare','one','two','three','unknown'],proteinMode:['habit','record'],activityMode:['record','none','unknown','limited'],exercise:['walk','bike','dance'],planDays:[3,5,7],sleep:['under6','6to7','7to9','over9','irregular','unknown'],sitting:['under4','4to8','over8','unknown']};
export const lifeNumbers={proteinGrams:[0,300],moderateMinutes:[0,2520],vigorousMinutes:[0,2520],strengthDays:[0,7]};
export const inRange=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function restoreLife(raw){
  const s=lifeDefaults();
  for(const [key,values] of Object.entries(lifeEnums))if(values.includes(raw[key]))s[key]=raw[key];
  for(const [key,[min,max]] of Object.entries(lifeNumbers))if(inRange(raw[key],min,max)&&(key==='proteinGrams'||Number.isInteger(raw[key])))s[key]=raw[key];
  s.habitsDone=Array.isArray(raw.habitsDone)?[...new Set(raw.habitsDone.filter(x=>['food','move','rest'].includes(x)))]:[];
  return s;
}
export function validLife(s,step){
  if(step===8)return s.age==='skip'||s.age==='under19'||(lifeEnums.age.includes(s.age)&&lifeEnums.referenceSex.includes(s.referenceSex)&&lifeEnums.healthContext.includes(s.healthContext));
  if(step===9)return lifeEnums.proteinHabit.includes(s.proteinHabit)&&(s.proteinMode==='habit'||inRange(s.proteinGrams,0,300));
  if(step===10){
    if(['unknown','limited'].includes(s.activityMode))return true;
    if(generalAdult(s)&&(![3,5,7].includes(s.planDays)||!lifeEnums.exercise.includes(s.exercise)))return false;
    const strength=inRange(s.strengthDays,0,7)&&Number.isInteger(s.strengthDays);
    if(s.activityMode==='none')return strength;
    return s.activityMode==='record'&&strength&&['moderateMinutes','vigorousMinutes'].every(k=>inRange(s[k],0,2520)&&Number.isInteger(s[k]));
  }
  if(step===11)return lifeEnums.sleep.includes(s.sleep)&&lifeEnums.sitting.includes(s.sitting);
  return false;
}
export const generalAdult=s=>['19-29','30-49','50-64','65+'].includes(s.age)&&s.healthContext==='general';
const referenceAmounts={female:{'19-29':55,'30-49':50,'50-64':50,'65+':50},male:{'19-29':65,'30-49':65,'50-64':60,'65+':60}};
export const exercises={walk:{name:'빠르게 걷기',cue:'점심을 먹고 동네 한 바퀴'},bike:{name:'자전거 타기',cue:'평지에서 편하게 페달 밟기'},dance:{name:'리듬에 맞춰 춤추기',cue:'좋아하는 노래와 함께 움직이기'}};
export function proteinResult(s){
  const target=generalAdult(s)?referenceAmounts[s.referenceSex]?.[s.age]??null:null;
  const intake=s.proteinMode==='record'&&inRange(s.proteinGrams,0,300)?s.proteinGrams:null;
  const gap=target!==null&&intake!==null?Math.round(Math.max(0,target-intake)*10)/10:null;
  const title=gap===null?'한 끼에 단백질 반찬 하나':gap>0?`기록한 하루는 참고량보다 ${gap}g 적어요`:'기록한 하루는 참고량을 채웠어요';
  let action='다음 한 끼에 두부·달걀·생선 중 한 가지 곁들이기';
  if(gap===0)action='단백질은 지금처럼, 여러 식품으로 나눠 챙기기';
  else if(gap!==null&&gap<=7)action='우유 200ml 한 잔을 식사나 간식에 곁들여보기';
  else if(gap!==null&&gap<=10)action='그릭요거트 100g을 간식으로 챙겨보기';
  else if(gap!==null&&gap<=16)action='구운 닭가슴살 50g을 반찬으로 곁들여보기';
  else if(gap!==null&&gap<=17)action='그릭요거트 100g과 우유 200ml를 나눠 챙겨보기';
  else if(gap!==null)action='점심·저녁에 단백질 반찬을 나눠 챙겨보기';
  else if(['two','three'].includes(s.proteinHabit))action='챙겨 먹는 단백질 반찬을 다양하게 바꿔보기';
  if(!generalAdult(s))action=s.healthContext==='personal'||s.age==='under19'?'내 식사 조건에 맞는 단백질 식품과 양 확인하기':s.balance==='carbs'?'다음 한 끼에 두부·달걀·생선 중 하나 곁들이기':s.balance==='meat'?'고기 반찬에 채소 반찬도 함께 챙기기':s.balance==='balanced'?'단백질·채소 반찬을 다양하게 이어가기':'다음 한 끼의 반찬과 양을 가볍게 기록하기';
  return {target,intake,gap,title,action};
}
export function activityResult(s){
  const eligible=generalAdult(s)&&s.activityMode!=='limited'&&s.quickActivity!=='limited';
  const recorded=s.activityMode==='none'||(s.activityMode==='record'&&inRange(s.moderateMinutes,0,2520)&&inRange(s.vigorousMinutes,0,2520));
  const equivalent=recorded?(s.activityMode==='none'?0:s.moderateMinutes+2*s.vigorousMinutes):null;
  const gap=eligible&&equivalent!==null?Math.max(0,150-equivalent):null;
  const days=[3,5,7].includes(s.planDays)?s.planDays:5;
  const daily=gap===null?null:Math.ceil(gap/days/5)*5;
  const start=daily===null?null:Math.min(daily,10);
  const gradual=gap>0&&equivalent<30;
  const strengthGap=eligible&&inRange(s.strengthDays,0,7)&&recorded?Math.max(0,2-s.strengthDays):null;
  const exercise=exercises[s.exercise]||exercises.walk;
  let action='일주일 동안 움직인 시간 기록하기';
  if(!eligible)action=s.healthContext==='personal'||s.activityMode==='limited'?'내 몸에 맞는 활동 범위부터 확인하기':'일주일 동안 움직인 시간 기록하기';
  else if(gap===0)action='지금의 유산소 활동 리듬 유지하기';
  else if(gap>0)action=`주 ${days}일, 하루 ${gradual?start:daily}분 ${exercise.name}${gradual?'부터 시작하기':''}`;
  let quick=null;
  if(gap===null&&s.quickActivity){
    const restricted=s.quickActivity==='limited'||s.healthContext==='personal'||s.age==='under19';
    const low=['none','light','some'].includes(s.quickActivity);
    quick=restricted?{title:'내 몸에 맞는 움직임부터',description:'활동 제한이나 별도 기준이 필요한 경우, 자신의 상태에 맞는 활동 범위를 먼저 확인해요.'}:low?{title:'하루 10분 걷기부터, 가볍게',description:'짧게 움직이는 시간을 하루에 하나 만들어봐요. 10분은 성인을 위한 시작 예시예요. 정확한 활동 기록을 더하면 주간 참고량과 비교할 수 있어요.'}:s.quickActivity==='enough'?{title:'지금의 움직임을 꾸준하게',description:'중강도 환산 주 150분 이상으로 답했어요. 일반 성인의 최소 참고 기준에 해당하는 범위예요. 내 몸에 맞는 활동을 이어가세요.'}:{title:'내 움직임을 알아가는 한 주',description:'이번 주에 빠르게 걸은 시간부터 가볍게 기록해봐요. 모르는 시간을 0분으로 보지는 않아요.'};
    action=restricted?'내 몸에 맞는 활동 범위부터 확인하기':low?'몸에 맞는 속도로 하루 10분 걷기 시도하기':s.quickActivity==='enough'?'지금의 움직임을 꾸준히 이어가기':'일주일 동안 움직인 시간 기록하기';
  }
  return {eligible,equivalent,gap,days,daily,start,gradual,strengthGap,exercise,action,quick};
}
export function sleepResult(s){
  const short=['under6','6to7'].includes(s.sleep),irregular=s.sleep==='irregular';
  const action=short?'잠들기 30분 전 화면을 끄고 쉴 시간 만들기':irregular?'내일 일어날 시간을 먼저 정해보기':s.sleep==='unknown'?'오늘 잠든 시간과 내일 일어난 시간 기록하기':'비슷한 시간에 자고 일어나는 리듬 이어가기';
  const description=short?'7시간보다 적게 잔다고 답했어요. 잠들기 전 할 일을 조금 덜어보세요.':irregular?'수면 시간이 들쭉날쭉하다고 답했어요. 기상 시간을 기준으로 하루의 끝을 정리해봐요.':s.sleep==='over9'?'수면 시간만으로 충분히 쉬는지는 알 수 없어요. 일어났을 때 개운한지도 함께 살펴보세요.':s.sleep==='unknown'?'며칠만 기록해도 나에게 맞는 취침 리듬을 찾기 쉬워져요.':'잠에서 깬 뒤 개운한지도 함께 살펴보세요. 수면은 시간과 질 모두 중요해요.';
  return {short,irregular,action,description};
}
export function lifeProfile(s){
  const a=activityResult(s),p=proteinResult(s),rest=sleepResult(s);
  if(rest.short||rest.irregular)return {title:'충전이 필요한\n바쁜 하루형',description:'챙길 일은 많고, 나를 챙길 틈은 짧은 하루. 거창한 변화보다 밥 한 끼, 짧은 움직임, 쉬는 시간을 먼저 자리 잡아봐요.',tag:'나를 위한 충전부터'};
  if(a.gap>0||(a.gap===null&&['none','light','some'].includes(s.quickActivity))||s.sitting==='over8')return {title:'한 걸음이 필요한\n책상 생활형',description:'일에 집중하다 보면 어느새 저녁. 익숙한 식사 사이에 몸을 움직이는 작은 약속을 끼워 넣어보세요.',tag:'밥 먹고 한 바퀴'};
  if(p.gap>0||(p.gap===null&&s.balance==='carbs')||['rare','one'].includes(s.proteinHabit))return {title:'한 끼를 채우는\n밥상 탐색형',description:'끼니는 챙겼는데 반찬까지 고르기는 어려웠나요? 좋아하는 음식에 내게 필요한 한 가지를 더해보세요.',tag:'좋아하는 맛에 한 가지 더'};
  return {title:'내 리듬을 찾는\n차근차근 생활형',description:'오늘의 답변을 출발점으로, 잘 맞는 습관은 이어가고 아직 모르는 부분은 가볍게 기록해봐요.',tag:'내 속도로 꾸준하게'};
}
