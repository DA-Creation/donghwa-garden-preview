// Product facts: client proposal dated 2026-08-15, pp. 6–7.
// Prices are proposal prices, not live checkout prices.
export const SOURCE = {date: '2026-08-15', pages: '6–7', status: 'proposal'};
export const PEOPLE = [{id:'1',label:'1명'}, {id:'2',label:'2명'}, {id:'3',label:'3명'}, {id:'4',label:'4명 이상'}];
export const FREQUENCIES = [
  {id:'1',label:'하루 1끼'}, {id:'2',label:'하루 2끼'},
  {id:'3',label:'하루 3끼'}, {id:'varies',label:'매일 달라요'}
];
export const STYLES = [
  {id:'complete',icon:'🍚',label:'밥 + 국 + 반찬',detail:'국도 반찬도 함께 먹어요'},
  {id:'sides',icon:'🥢',label:'밥 + 반찬',detail:'국 없이 반찬만 있어도 좋아요'},
  {id:'soup',icon:'🥣',label:'국이나 찌개 중심',detail:'국이나 찌개에 밥을 곁들여요'},
  {id:'simple',icon:'🍜',label:'면·분식·한 그릇 음식',detail:'한 가지로 간단하게 먹어요'},
  {id:'varies',icon:'🍽️',label:'그때그때 달라요',detail:'정해진 식사 방식은 없어요'}
];
export const FOODS = [
  {id:'spicy',icon:'🌶️',label:'얼큰한 찌개',detail:'김치찌개·매운탕'},
  {id:'soup',icon:'🥣',label:'구수한 국·탕',detail:'국밥·우거지국'},
  {id:'ferment',icon:'🫘',label:'된장·청국장',detail:'된장찌개·청국장'},
  {id:'meat',icon:'🍖',label:'고기 요리',detail:'불고기·제육볶음'},
  {id:'fish',icon:'🐟',label:'생선·해산물',detail:'생선구이·해물찜'},
  {id:'sides',icon:'🥬',label:'나물·밑반찬',detail:'나물무침·장조림'},
  {id:'noodles',icon:'🍜',label:'면·분식',detail:'국수·떡볶이'},
  {id:'tofu',icon:'🍲',label:'두부 요리',detail:'순두부·두부조림'},
  {id:'any',icon:'🍽️',label:'골고루 먹어요',detail:'특별히 가리지 않아요'}
];
export const AVOIDS = [
  {id:'spicy',label:'매운 국·찌개'},
  {id:'ferment',label:'청국장'},
  {id:'jeotgal',label:'젓갈'},
  {id:'soymilk',label:'두유'},
  {id:'soy',label:'두부·콩으로 만든 음식'},
  {id:'none',label:'특별히 없어요'}
];
const p = (id,name,tagline,price,retail,items,tags,knownFoods,extra={}) =>
  ({id,name,tagline,price,retail,shipping:price>=29900?0:3500,items,tags,knownFoods:['soy',...knownFoods],...extra});
export const PRODUCTS = [
  p('solo','솔로 미니','혼자 먹는 밥상에 필요한 만큼',18900,21400,
    ['순두부 425g','비지찌개 620g','반찬 2종','김치 200g'],['small','soup','tofu','complete'],[],{target:'1인',cadence:'격주 권장'}),
  p('basic','한끼 베이직','국 하나, 반찬 셋으로 차리는 밥상',23900,27000,
    ['순두부 425g','국·탕 620g × 1','반찬 3종','김치 300g'],['complete','soup','sides','tofu'],[],{target:'1~2인'}),
  p('full','풀 베이직','둘이 먹는 밥상에 순두부 넉넉히',29900,31900,
    ['순두부 850g','국·탕 620g × 1','반찬 3종','김치 300g'],['complete','soup','sides','tofu'],[],{target:'2인'}),
  p('spicy','얼큰 한상','얼큰순두부와 매콤한 반찬',23900,26300,
    ['얼큰순두부 620g','순두부 425g','매콤 반찬 3종','김치 200g'],['spicy','soup','tofu'],['spicy']),
  p('soup','국물 위크','세 가지 국·찌개를 번갈아',27900,31200,
    ['얼큰순두부 620g','비지찌개 620g','우거지국 620g','강된장볼','김치 200g'],['soup','spicy','ferment'],['spicy']),
  p('ferment','발효 건강','청국장찌개에 순두부와 두유까지',26900,29700,
    ['순두부 425g','청국장찌개 620g','반찬 3종','김치 200g','두유 2개'],['ferment','tofu','complete'],['ferment','soymilk']),
  p('mild','아이 순한맛','순두부와 우거지국 중심의 구성',21900,23300,
    ['순두부 425g','우거지국 620g','순한 반찬 3종','두유 2개'],['mild','soup','tofu','complete'],['soymilk']),
  p('sides','밑반찬 위크','국보다 반찬을 자주 찾는 밥상',25900,28900,
    ['순두부 425g','반찬 5종','강된장볼 150g','김치 300g'],['sides','tofu','ferment'],[]),
  p('family','프리미엄 패밀리','여럿이 함께 먹는 식탁',42900,52600,
    ['순두부 850g','국·탕 620g × 2','반찬 4종','김치 300g','두유 2개','젓갈 150g'],['family','complete','soup','sides','tofu'],['soymilk','jeotgal'],{target:'3~4인'}),
  p('local','강릉 이웃 위클리','강릉 지역 전용 구성',19900,null,
    ['순두부 425g','국·탕 620g × 1','반찬 3종','매장 그날 반찬'],['complete','soup','sides','tofu'],[],{region:'gangneung',shipping:null,monthly:79000})
];
export const blankAnswers = () => ({people:'',frequency:'',style:'',foods:[],avoids:[]});
const has = (options,value) => options.some(o=>o.id===value);
export function sanitizeAnswers(raw={}) {
  if(!raw||typeof raw!=='object')raw={};
  const safeList = (key,options,max) => Array.isArray(raw[key])
    ? [...new Set(raw[key].filter(v=>has(options,v)))].slice(0,max) : [];
  const foods=safeList('foods',FOODS,3), avoids=safeList('avoids',AVOIDS,6);
  return {
    people:has(PEOPLE,raw.people)?raw.people:'',
    frequency:has(FREQUENCIES,raw.frequency)?raw.frequency:'',
    style:has(STYLES,raw.style)?raw.style:'',
    foods:foods.includes('any')?['any']:foods,
    avoids:avoids.includes('none')?['none']:avoids
  };
}
export function stepValid(step,a) {
  if(step===0)return has(PEOPLE,a.people)&&has(FREQUENCIES,a.frequency);
  if(step===1)return has(STYLES,a.style);
  if(step===2)return a.foods.length>0&&a.foods.length<=3&&a.foods.every(v=>has(FOODS,v));
  if(step===3)return a.avoids.length>0&&a.avoids.every(v=>has(AVOIDS,v));
  return false;
}
export const isComplete = a => [0,1,2,3].every(s=>stepValid(s,a));
export function toggleMulti(values,id,{exclusive,max}) {
  if(values.includes(id))return values.filter(x=>x!==id);
  if(id===exclusive)return [id];
  const current=values.filter(x=>x!==exclusive);
  return current.length>=max?values:[...current,id];
}
export function priceBreakdown(product) {
  return {goods:product.price,shipping:product.shipping,
    delivered:product.shipping===null?null:product.price+product.shipping,
    goodsSaving:product.retail===null?null:product.retail-product.price};
}
export function recommend(raw,region='unknown') {
  const a=sanitizeAnswers(raw);
  if(!isComplete(a))return [];
  return PRODUCTS.filter(product=>product.region?region===product.region:true)
    .filter(product=>!a.avoids.some(v=>product.knownFoods.includes(v)))
    .map(product=>{
      let score=0;
      const id=product.id;
      if(a.people==='1')score+=({solo:12,basic:8,spicy:6,mild:3,full:1,family:-16}[id]||0);
      if(a.people==='2')score+=({full:14,basic:9,family:-6,solo:-10}[id]||0);
      if(['3','4'].includes(a.people))score+=id==='family'?35:id==='full'?8:id==='solo'?-16:0;
      if(a.frequency==='varies')score+=id==='solo'?6:0;
      if(['2','3'].includes(a.frequency))score+=({full:3,soup:3,sides:3,family:3}[id]||0);
      if(a.style==='sides')score+=id==='sides'?30:product.tags.includes('sides')?3:0;
      if(a.style==='soup')score+=id==='soup'?28:product.tags.includes('soup')?5:0;
      if(a.style==='complete')score+=product.tags.includes('complete')?7:0;
      if(a.style==='simple')score+=['solo','basic'].includes(id)?3:0;
      for(const food of a.foods) {
        if(product.tags.includes(food))score+=5;
        if(food==='spicy'&&id==='spicy')score+=21;
        if(food==='ferment'&&id==='ferment')score+=24;
        if(food==='sides'&&id==='sides')score+=9;
      }
      if(a.avoids.includes('spicy')&&id==='mild')score+=20;
      return {product,score,reasons:recommendationReasons(product,a)};
    }).sort((a,b)=>b.score-a.score||a.product.price-b.product.price);
}
export function recommendationReasons(product,a) {
  const reasons=[];
  if(product.id==='family'&&['3','4'].includes(a.people))reasons.push('여럿이 함께 먹는다고 답해 주셔서, 3~4인 구성부터 골랐어요.');
  if(product.id==='solo'&&a.people==='1')reasons.push('혼자 먹는 밥상에 맞춰, 반찬 2종이 담긴 작은 구성을 골랐어요.');
  if(product.id==='full'&&a.people==='2')reasons.push('두 사람이 함께 먹는다고 답해 주셔서, 순두부 850g이 담긴 2인 구성을 골랐어요.');
  if(product.id==='basic'&&['1','2'].includes(a.people))reasons.push('1~2인용 구성에 국과 반찬이 함께 들어 있어요.');
  if(product.id==='sides'&&a.style==='sides')reasons.push('국보다 반찬을 곁들이는 식사에 맞춰, 반찬 5종이 있는 구성을 골랐어요.');
  if(product.id==='soup'&&a.style==='soup')reasons.push('국·찌개를 중심으로 드셔서, 세 가지 국물이 담긴 구성을 골랐어요.');
  if(product.id==='spicy'&&a.foods.includes('spicy'))reasons.push('좋아하시는 얼큰한 찌개에 맞춰, 얼큰순두부와 매콤 반찬을 골랐어요.');
  if(product.id==='ferment'&&a.foods.includes('ferment'))reasons.push('된장·청국장을 좋아하셔서, 청국장찌개가 있는 구성을 골랐어요.');
  if(product.id==='mild'&&a.avoids.includes('spicy'))reasons.push('매운 국·찌개를 피하셔서, 순한맛으로 기획된 구성을 골랐어요.');
  if(a.foods.includes('tofu')&&product.items.some(i=>i.startsWith('순두부')))reasons.push('좋아하시는 두부 요리로 순두부가 들어 있어요.');
  if(a.frequency==='varies'&&product.id==='solo')reasons.push('집에서 먹는 횟수가 일정하지 않아, 격주 이용을 권하는 옵션부터 보여드려요.');
  if(reasons.length<2&&a.style==='complete'&&product.tags.includes('complete'))reasons.push('평소 드시는 밥·국·반찬 구성을 이어갈 수 있어요. 밥은 별도로 준비해주세요.');
  if(reasons.length===0)reasons.push('식사 인원과 평소 밥상 구성을 기준으로 골랐어요.');
  return reasons.slice(0,3);
}
export function compositionComparison(product,a) {
  if(a.foods.includes('noodles')||a.style==='simple')return {
    before:'면·분식이나 한 그릇 음식',after:product.id==='soup'?'국·찌개를 번갈아 먹는 밥상':'순두부에 반찬을 곁들이는 밥상',
    text:product.id==='soup'?'얼큰순두부·비지찌개·우거지국이 들어 있어, 밥과 곁들일 국을 바꿔 먹을 수 있어요.':'밥을 따로 준비하면, 구성에 담긴 순두부와 반찬을 함께 차릴 수 있어요.'
  };
  if(a.foods.some(f=>['meat','fish'].includes(f)))return {
    before:a.foods.includes('meat')?'고기 요리를 즐기는 식사':'생선·해산물을 즐기는 식사',
    after:product.id==='soup'?'국·찌개 세 가지를 더하는 식사':'순두부와 반찬을 더하는 식사',
    text:'좋아하는 요리에 곁들일 음식을 기준으로 골랐어요. 고기나 생선 메뉴의 포함 여부는 회차별 식단에서 확인해주세요.'
  };
  return {before:STYLES.find(s=>s.id===a.style)?.label||'평소 밥상',after:product.id==='sides'?'반찬 5종을 번갈아':product.id==='soup'?'국·찌개 3종을 번갈아':'국과 반찬을 함께',
    text:'구성에 들어 있는 음식을 나눠 차려 먹을 수 있어요. 한 상에 모두 드셔야 하는 구성은 아니에요.'};
}
// Quantitative comparisons are enabled only for comparable, verified servings.
export function verifiedNutritionComparison(left,right) {
  if(![left,right].every(x=>x?.verified===true&&x?.basis==='one-person-meal'&&x?.source))return null;
  const keys=['kcal','protein','sodium'];
  if(![left,right].every(x=>keys.every(k=>Number.isFinite(x[k])&&x[k]>=0)))return null;
  return Object.fromEntries(keys.map(k=>[k,{usual:left[k],recommended:right[k],difference:right[k]-left[k]}]));
}
