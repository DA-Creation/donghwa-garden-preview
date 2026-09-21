import test from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCTS,blankAnswers,sanitizeAnswers,stepValid,isComplete,toggleMulti,recommend,priceBreakdown,verifiedNutritionComparison} from './model.mjs';
const answer=(changes={})=>({people:'2',frequency:'2',style:'complete',foods:['any'],...changes});
const winner=changes=>recommend(answer(changes))[0]?.product.id;

test('혼자 불규칙하게 집밥을 먹는 경우 작은 구성을 먼저 추천',()=>{
  assert.equal(winner({people:'1',frequency:'varies'}),'solo');
});
test('두 사람의 밥·국·반찬 식사는 풀 베이직',()=>{
  assert.equal(winner({people:'2'}),'full');
});
test('가족 식사는 큰 고정 구성부터 추천',()=>{
  for(const people of ['3','4'])assert.equal(winner({people}),'family');
});
test('평소 식사 방식이 다르면 추천도 달라짐',()=>{
  assert.equal(winner({style:'sides'}),'sides');
  assert.equal(winner({style:'soup'}),'soup');
});
test('좋아하는 음식 답변이 실제 추천에 반영됨',()=>{
  assert.equal(winner({foods:['spicy']}),'spicy');
  assert.equal(winner({foods:['ferment']}),'ferment');
});
test('강릉 전용 옵션은 지역 확인 전 자동 추천에 포함하지 않음',()=>{
  assert.ok(recommend(answer()).every(r=>r.product.id!=='local'));
  assert.ok(recommend(answer(),'gangneung').some(r=>r.product.id==='local'));
});
test('배송비 포함 가격과 상품 자체 할인 금액을 구분',()=>{
  assert.deepEqual(priceBreakdown(PRODUCTS.find(p=>p.id==='basic')),
    {goods:23900,shipping:3500,delivered:27400,goodsSaving:3100});
  assert.equal(priceBreakdown(PRODUCTS.find(p=>p.id==='full')).delivered,29900);
  assert.equal(priceBreakdown(PRODUCTS.find(p=>p.id==='local')).delivered,null);
  assert.equal(priceBreakdown(PRODUCTS.find(p=>p.id==='local')).goodsSaving,null);
});
test('응답이 완성되기 전에는 결과를 만들지 않음',()=>{
  assert.deepEqual(recommend(blankAnswers()),[]);
  assert.equal(stepValid(0,{...blankAnswers(),people:'1'}),false);
  assert.equal(isComplete(answer()),true);
});
test('저장된 잘못된 값이나 삽입 문자열은 복원하지 않음',()=>{
  assert.deepEqual(sanitizeAnswers(null),blankAnswers());
  const a=sanitizeAnswers({people:'<script>',frequency:'1',style:'complete',foods:['spicy','spicy','bad','tofu','sides','fish'],avoids:['none','soy']});
  assert.equal(a.people,'');
  assert.deepEqual(a.foods,['spicy','tofu','sides']);
  assert.equal('avoids' in a,false);
});
test('음식 선택 제한·선택 취소·없음의 상호배제',()=>{
  assert.deepEqual(toggleMulti(['spicy','soup','meat'],'fish',{max:3,exclusive:'any'}),['spicy','soup','meat']);
  assert.deepEqual(toggleMulti(['spicy'],'any',{max:3,exclusive:'any'}),['any']);
  assert.deepEqual(toggleMulti(['any'],'tofu',{max:3,exclusive:'any'}),['tofu']);
  assert.deepEqual(toggleMulti(['spicy'],'spicy',{max:3,exclusive:'any'}),[]);
});
test('수치·출처·같은 1인 한 끼 기준이 없으면 영양 비교를 생성하지 않음',()=>{
  const left={verified:true,basis:'one-person-meal',source:'fixture',kcal:600,protein:20,sodium:1800};
  const right={...left,kcal:550,protein:25,sodium:1400};
  assert.equal(verifiedNutritionComparison(left,null),null);
  assert.equal(verifiedNutritionComparison(left,{...right,verified:false}),null);
  assert.equal(verifiedNutritionComparison(left,{...right,basis:'whole-box'}),null);
  assert.equal(verifiedNutritionComparison(left,{...right,protein:null}),null);
  assert.deepEqual(verifiedNutritionComparison(left,right).protein,{usual:20,recommended:25,difference:5});
});
test('모든 추천에 고정 상품과 설명이 있고 입력을 변경하지 않음',()=>{
  for(const people of ['1','2','3','4'])for(const style of ['complete','sides','soup','simple','varies']){
    const a=answer({people,style}),before=structuredClone(a),result=recommend(a);
    assert.deepEqual(a,before);
    assert.ok(result.length>0);
    assert.ok(result.every(r=>PRODUCTS.includes(r.product)&&r.reasons.length>0));
    assert.equal(new Set(result.map(r=>r.product.id)).size,result.length);
  }
});

// Every combination customers can actually submit must reach a recommendation.
test('3단계의 모든 유효 답변 조합에 추천과 대안이 있음',()=>{
  const foodIds=['spicy','soup','ferment','meat','fish','sides','noodles','tofu'];
  const selections=[['any']];
  for(let mask=1;mask<(1<<foodIds.length);mask++){
    const selection=foodIds.filter((_,i)=>mask&(1<<i));
    if(selection.length<=3)selections.push(selection);
  }
  let checked=0;
  for(const people of ['1','2','3','4'])for(const frequency of ['1','2','3','varies'])
  for(const style of ['complete','sides','soup','simple','varies'])for(const foods of selections){
    const a={people,frequency,style,foods};
    assert.equal(isComplete(a),true);
    assert.equal(stepValid(3,a),false);
    const results=recommend(a);
    assert.ok(results.length>=3);
    assert.ok(results.slice(0,3).every(r=>r.reasons.length>0));
    checked++;
  }
  assert.equal(checked,7440);
});
