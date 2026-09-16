import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,restoreState,isValid,activeSteps} from './model.mjs';
import {proteinResult,activityResult,lifeProfile} from './lifestyle.mjs';
import {lifestyleSections,lifestyleText} from './lifestyle-ui.mjs';
const adult=(extra={})=>({...initialState(),age:'30-49',referenceSex:'female',healthContext:'general',...extra});
test('Korean 2025 reference amounts follow age and sex; a single day is not a diagnosis',()=>{
  assert.equal(proteinResult(adult({proteinMode:'record',proteinGrams:35})).gap,15);
  assert.equal(proteinResult(adult({age:'19-29'})).target,55);
  assert.equal(proteinResult(adult({referenceSex:'male'})).target,65);
  assert.equal(proteinResult(adult({age:'50-64',referenceSex:'male'})).target,60);
  assert.equal(proteinResult(adult({proteinMode:'record',proteinGrams:80})).gap,0);
  const output=lifestyleSections(adult({proteinMode:'record',proteinGrams:35}));
  assert.match(output,/평소의 단백질 결핍을 뜻하지/);
  assert.match(output,/15g/);
});
test('food preferences, serving frequency and commerce mock nutrients never fabricate protein intake',()=>{
  const s=adult({selected:['jokbal','mala'],proteinHabit:'rare'});
  assert.equal(proteinResult(s).intake,null);assert.equal(proteinResult(s).gap,null);
  assert.equal(proteinResult({...s,proteinHabit:'three',frequency:5}).gap,null);
  assert.equal(proteinResult({...s,proteinGrams:35,proteinMode:'habit'}).gap,null);
});
test('no adult numeric advice without reference inputs or with individual health needs',()=>{
  for(const overrides of [{age:'under19'},{age:'skip'},{healthContext:'personal'}]){
    const s=adult({...overrides,proteinMode:'record',proteinGrams:20,activityMode:'none',strengthDays:0});
    assert.equal(proteinResult(s).gap,null);assert.equal(activityResult(s).gap,null);
  }
  assert.equal(proteinResult(adult({referenceSex:'skip',proteinMode:'record',proteinGrams:20})).gap,null);
  assert.equal(activityResult(adult({activityMode:'limited'})).gap,null);
});
test('aerobic calculation combines intensities, then distributes the gap by chosen days',()=>{
  const s=adult({activityMode:'record',moderateMinutes:40,vigorousMinutes:10,strengthDays:1,planDays:5});
  const a=activityResult(s);
  assert.equal(a.equivalent,60);assert.equal(a.gap,90);assert.equal(a.daily,20);assert.equal(a.strengthGap,1);
  assert.equal(activityResult({...s,planDays:3}).daily,30);
  assert.equal(activityResult({...s,vigorousMinutes:55}).gap,0);
});
test('inactive users get a gradual first step distinct from the eventual target',()=>{
  const a=activityResult(adult({activityMode:'none',strengthDays:0,planDays:5}));
  assert.equal(a.gap,150);assert.equal(a.start,10);assert.equal(a.daily,30);assert.equal(a.gradual,true);
  assert.equal(a.strengthGap,2);
  assert.equal(activityResult(adult({activityMode:'unknown',moderateMinutes:200,strengthDays:4})).gap,null);
  assert.equal(activityResult(adult({activityMode:'unknown',strengthDays:4})).strengthGap,null);
});
test('quick activity ranges do not invent exact deficits and remain optional-record independent',()=>{
  const s=initialState();assert.equal(isValid(s,10),false);s.quickActivity='some';assert.equal(isValid(s,10),true);
  assert.equal(activityResult(s).gap,null);assert.match(activityResult(s).action,/10분/);
  assert.equal(activityResult({...s,quickActivity:'unknown'}).gap,null);
  const restricted=adult({quickActivity:'limited',activityMode:'record',moderateMinutes:0,vigorousMinutes:0});
  assert.equal(activityResult(restricted).gap,null);assert.doesNotMatch(activityResult(restricted).action,/10분/);
  s.quickActivity='invalid';assert.equal(isValid(s,10),false);
});
test('state restoration sanitizes lifestyle data and preserves zero answers and checkmarks',()=>{
  const s=restoreState({age:'bad',referenceSex:'male',proteinGrams:-20,moderateMinutes:Infinity,vigorousMinutes:0,strengthDays:1.5,habitsDone:['food','food','move','fake']});
  assert.equal(s.age,null);assert.equal(s.proteinGrams,null);assert.equal(s.moderateMinutes,null);assert.equal(s.vigorousMinutes,0);assert.equal(s.strengthDays,null);assert.deepEqual(s.habitsDone,['food','move']);
});
test('every route has exactly five questions and ends with goals',()=>{
  for(const selected of [[],['none'],['other'],['mala']]){
    const steps=activeSteps({...initialState(),selected});
    assert.deepEqual(steps,[0,4,10,11,6]);
  }
});
test('lifestyle outcome and exported report change with answers',()=>{
  const s=adult({sleep:'under6',proteinMode:'record',proteinGrams:35,activityMode:'record',moderateMinutes:60,vigorousMinutes:0,strengthDays:0,exercise:'bike'});
  assert.match(lifeProfile(s).title,/충전/);assert.match(lifestyleText(s),/자전거/);assert.match(lifestyleText(s),/차이 15g/);
  assert.match(lifeProfile({...s,sleep:'7to9'}).title,/한 걸음/);
});
