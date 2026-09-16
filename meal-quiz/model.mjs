import {lifeDefaults,restoreLife,lifeEnums} from './lifestyle.mjs';
// Fictional commerce prototype values, separate from lifestyle reference calculations.
export const DEMO_NOTICE = '가격·영양 수치는 화면 확인을 위한 예시이며, 실제 상품 정보가 아닙니다.';
export const foods = [
  {id:'jokbal',name:'족발',emoji:'🍖',tag:'쫀득한 한 점',price:38000,portions:3,nutrients:[1800,125,45,120,4500,5]},
  {id:'mala',name:'마라탕',emoji:'🍲',tag:'얼얼한 국물',price:17000,portions:1,nutrients:[820,29,78,43,2400,7]},
  {id:'tteok',name:'떡볶이',emoji:'🌶️',tag:'매콤달콤',price:16000,portions:2,nutrients:[1200,22,244,16,2600,6]},
  {id:'chicken',name:'치킨',emoji:'🍗',tag:'바삭한 행복',price:24000,portions:2,nutrients:[1800,110,96,108,3200,3]},
  {id:'pizza',name:'피자',emoji:'🍕',tag:'치즈는 못 참지',price:26000,portions:2,nutrients:[2000,80,240,80,3800,8]},
  {id:'burger',name:'햄버거',emoji:'🍔',tag:'든든한 한 입',price:11000,portions:1,nutrients:[850,27,110,33,1300,5]},
  {id:'jjajang',name:'짜장면',emoji:'🍜',tag:'익숙한 맛',price:10000,portions:1,nutrients:[800,22,125,24,1900,5]},
  {id:'jjamppong',name:'짬뽕',emoji:'🥢',tag:'얼큰한 한 그릇',price:12000,portions:1,nutrients:[730,30,102,22,2800,5]},
  {id:'bossam',name:'보쌈',emoji:'🥬',tag:'한 쌈 가득',price:36000,portions:3,nutrients:[1800,120,60,120,3900,9]},
  {id:'cutlet',name:'돈까스',emoji:'🍛',tag:'바삭하고 든든',price:13000,portions:1,nutrients:[950,33,108,43,1700,4]},
  {id:'gukbap',name:'국밥',emoji:'🍚',tag:'뜨끈한 국물',price:11000,portions:1,nutrients:[720,35,88,25,2100,3]},
];
export const nutrients = [
  {name:'열량',unit:'kcal',decimals:0}, {name:'단백질',unit:'g',decimals:1},
  {name:'탄수화물',unit:'g',decimals:1}, {name:'지방',unit:'g',decimals:1},
  {name:'나트륨',unit:'mg',decimals:0}, {name:'식이섬유',unit:'g',decimals:1},
];
export const plan = {name:'순두부 집밥 정기구독',boxPrice:64000,meals:8,rice:1000,shipping:0,nutrients:[630,30,85,19,980,8]};
export const reasons = [
  {id:'taste',icon:'♡',text:'오늘은 이 맛을 꼭 먹어야겠어',sub:'맛있는 음식이 주는 행복이 좋아요',title:'취향 확실한\n메뉴 탐험가',description:'좋아하는 맛에는 확실한 취향이 있는 당신. 집밥도 내 입맛에 맞아야 오래 즐길 수 있죠.',tip:'익숙한 맛부터, 집밥 한 끼',recommendation:'좋아하는 맛과 이번 식단의 메뉴를 먼저 비교해보세요.'},
  {id:'tired',icon:'☾',text:'배는 고픈데, 요리할 기운이 없어',sub:'퇴근 후엔 잠깐 쉬고 싶어요',title:'오늘도 수고한\n퇴근 미식가',description:'맛있는 한 끼는 챙기고 싶지만, 퇴근 후 요리할 기운은 아껴두고 싶은 당신.',tip:'꺼내 먹을 밥상이 있으면 좋겠어요',recommendation:'장보고 손질하는 과정을 줄일 수 있는 순두부·국·찌개·반찬 구성을 살펴보세요.'},
  {id:'fridge',icon:'▤',text:'냉장고를 열었는데 먹을 게 없네',sub:'장보기 타이밍을 자꾸 놓쳐요',title:'내일의 밥상을 위한\n냉장고 채움 준비생',description:'먹을 게 준비되어 있으면 집밥도 반가운 당신. 필요한 만큼, 제때 채우는 리듬이 어울려요.',tip:'먹을 만큼, 제때 채우는 밥상',recommendation:'먹을 수 있는 양과 보관 기간을 먼저 확인하고 배송 간격을 골라보세요.'},
  {id:'decision',icon:'?',text:'오늘 뭐 먹지? 생각부터 일이야',sub:'매일 메뉴를 정하는 게 어려워요',title:'매일의 메뉴 회의\n오늘 뭐 먹지 고민 대장',description:'한 끼를 먹기 전부터 메뉴 회의를 시작하는 당신. 준비된 식단이 작은 여유를 만들어줄 거예요.',tip:'오늘 메뉴는, 밥상에 맡겨요',recommendation:'회차별로 준비되는 식단을 확인하고 메뉴 고민을 덜어보세요.'},
  {id:'together',icon:'☺',text:'같이 맛있는 걸 나눠 먹고 싶어',sub:'함께 먹을 때 더 맛있으니까요',title:'맛있는 시간을 나누는\n밥상 모임장',description:'무엇을 먹는지만큼 누구와 먹는지도 중요한 당신. 함께 먹을 사람을 떠올리며 밥상을 준비해봐요.',tip:'함께 먹을 사람만큼 든든하게',recommendation:'같이 먹는 인원에 맞춰 실제 제공 식수와 이번 식단을 확인해보세요.'},
];
export const goals=[{id:'protein',text:'단백질 챙기기',icon:'◉'},{id:'movement',text:'꾸준히 움직이기',icon:'↗'},{id:'rest',text:'잠과 휴식 챙기기',icon:'☾'},{id:'variety',text:'채소·반찬 다양하게',icon:'♧'},{id:'budget',text:'한 끼 비용 줄이기',icon:'₩'},{id:'time',text:'장보기·메뉴 고민 줄이기',icon:'◷'},{id:'ingredients',text:'원재료 알고 먹기',icon:'✓'},{id:'flavor',text:'좋아하는 맛으로 집밥 늘리기',icon:'♡'}];
export const initialState = () => ({view:'intro',step:0,selected:[],other:'',frequency:null,portions:null,reason:null,balance:null,time:null,goals:[],replace:null,overrides:{},compareFood:'average',compareWeekly:2,...lifeDefaults()});
export function restoreState(raw) {
  const base=initialState();
  if(!raw || typeof raw!=='object') return base;
  const allow=['none','other',...foods.map(x=>x.id)];
  const selected=Array.isArray(raw.selected)?[...new Set(raw.selected.filter(x=>allow.includes(x)))]:[];
  base.selected=selected.includes('none')?['none']:selected;
  base.other=typeof raw.other==='string'?raw.other.slice(0,40):'';
  for(const [key,options] of Object.entries({frequency:[0,1,2,3,5,'unknown'],portions:[1,2,'shared','mixed'],reason:reasons.map(x=>x.id),balance:['carbs','meat','balanced','unknown'],time:[5,10,20,0],replace:[0,1,2,3]})) if(options.includes(raw[key])) base[key]=raw[key];
  base.goals=Array.isArray(raw.goals)?[...new Set(raw.goals.filter(x=>goals.some(g=>g.id===x)))].slice(0,2):[];
  base.step=Number.isInteger(raw.step)?Math.max(0,Math.min(11,raw.step)):0;
  base.view=['intro','quiz','result'].includes(raw.view)?raw.view:'intro';
  base.compareWeekly=[0,1,2,3].includes(raw.compareWeekly)?raw.compareWeekly:2;
  base.compareFood=raw.compareFood==='average'||base.selected.includes(raw.compareFood)?raw.compareFood:'average';
  for(const food of foods) {const o=raw.overrides?.[food.id];if(o&&Number.isFinite(o.price)&&o.price>=0&&o.price<=200000&&Number.isFinite(o.portions)&&o.portions>=1&&o.portions<=12)base.overrides[food.id]={price:o.price,portions:o.portions};}
  Object.assign(base,restoreLife(raw));
  if(!activeSteps(base).includes(base.step))base.step=activeSteps(base).find(step=>!isValid(base,step))??6;
  return base;
}
export const activeSteps = () => [0,4,10,11,6];
export function isValid(state,step) {
  if(step===0) return state.selected.length>0&&(!state.selected.includes('other')||state.other.trim().length>0);
  if(step===4) return ['carbs','meat','balanced','unknown'].includes(state.balance);
  if(step===10) return lifeEnums.quickActivity.includes(state.quickActivity);
  if(step===11) return lifeEnums.sleep.includes(state.sleep);
  if(step===6) return state.goals.length>0&&state.goals.length<=2;
  return false;
}
export function menuValues(state,food) {
  const servings=state.overrides[food.id]?.portions ?? (typeof state.portions==='number'?state.portions:food.portions);
  const price=state.overrides[food.id]?.price ?? food.price;
  return {price:price/servings,servings,orderPrice:price,nutrients:food.nutrients.map(x=>x/servings)};
}
export function comparison(state) {
  const selected=foods.filter(x=>state.selected.includes(x.id));
  const menu=state.compareFood==='average'?selected:selected.filter(x=>x.id===state.compareFood);
  if(!menu.length) return null;
  const values=menu.map(f=>menuValues(state,f));
  const avg=values.reduce((a,b)=>({price:a.price+b.price,nutrients:a.nutrients.map((v,i)=>v+b.nutrients[i])}),{price:0,nutrients:Array(6).fill(0)});
  avg.price/=values.length;avg.nutrients=avg.nutrients.map(x=>x/values.length);
  const cap=typeof state.frequency==='number'?state.frequency:3;
  const weekly=Math.max(0,Math.min(state.compareWeekly,cap,3));
  const meals=weekly*4,boxes=meals?Math.ceil(meals/plan.meals):0;
  const before=avg.price*meals,after=boxes*(plan.boxPrice+plan.shipping)+meals*plan.rice;
  return {avg,weekly,meals,boxes,before,after,difference:before-after,leftover:boxes*plan.meals-meals,unitAfter:meals?after/meals:0};
}
