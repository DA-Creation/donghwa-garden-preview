import test from 'node:test';
import assert from 'node:assert/strict';
import {foods,initialState,isValid,activeSteps,comparison,menuValues,restoreState} from './model.mjs';
test('multiple foods are averaged after portion normalization, not summed',()=>{
 const s={...initialState(),selected:['jokbal','mala'],frequency:3,portions:'mixed',compareWeekly:2};
 const c=comparison(s);assert.equal(c.avg.price,(38000/3+17000)/2);assert.equal(c.avg.nutrients[1],(125/3+29)/2);assert.equal(c.meals,8);assert.equal(c.after,72000);assert.equal(c.leftover,0);
});
test('whole subscription cost is retained when only four meals replace delivery',()=>{
 const c=comparison({...initialState(),selected:['burger'],frequency:1,compareWeekly:3});
 assert.equal(c.weekly,1);assert.equal(c.meals,4);assert.equal(c.after,68000);assert.equal(c.before,44000);assert.equal(c.difference,-24000);assert.equal(c.leftover,4);
});
test('twelve meals need two full boxes and extra rice',()=>{
 const c=comparison({...initialState(),selected:['mala'],frequency:5,compareWeekly:3});
 assert.equal(c.boxes,2);assert.equal(c.after,140000);assert.equal(c.leftover,4);
});
test('no delivery, unknown foods and zero replacement do not fabricate savings',()=>{
 assert.equal(comparison({...initialState(),selected:['none']}),null);
 assert.equal(comparison({...initialState(),selected:['other'],other:'초밥'}),null);
 const c=comparison({...initialState(),selected:['mala'],frequency:0});assert.equal(c.meals,0);assert.equal(c.after,0);assert.equal(c.difference,0);
 assert.equal(comparison({...initialState(),selected:['mala'],frequency:3,compareWeekly:0}).before,0);
});
test('editing price never changes nutrient total; portions do',()=>{
 const s={...initialState(),selected:['jokbal'],overrides:{jokbal:{price:42000,portions:3}}};
 const f=foods.find(f=>f.id==='jokbal'),v=menuValues(s,f);assert.equal(v.price,14000);assert.equal(v.nutrients[1],125/3);
 s.overrides.jokbal.portions=2;assert.equal(menuValues(s,f).nutrients[1],62.5);
});
test('five required answers finish the quiz without optional records or commerce inputs',()=>{
 const s=initialState();assert.equal(isValid(s,0),false);s.selected=['other'];assert.equal(isValid(s,0),false);s.other='초밥';assert.equal(isValid(s,0),true);assert.equal(activeSteps(s).length,5);s.selected=['none'];assert.deepEqual(activeSteps(s),[0,4,10,11,6]);s.goals=['budget','time','protein'];assert.equal(isValid(s,6),false);
 Object.assign(s,{balance:'carbs',quickActivity:'unknown',sleep:'unknown',goals:['budget']});assert.ok(activeSteps(s).every(step=>isValid(s,step)));assert.equal(s.age,null);assert.equal(s.time,null);assert.equal(s.proteinGrams,null);
});
test('persisted state rejects unknown IDs and invalid financial inputs',()=>{
 const s=restoreState({selected:['mala','none','unknown'],goals:['budget','evil','time','protein'],step:30,frequency:100,overrides:{mala:{price:-1,portions:0}},other:'a'.repeat(100)});
 assert.deepEqual(s.selected,['none']);assert.deepEqual(s.goals,['budget','time']);assert.equal(s.step,11);assert.equal(s.frequency,null);assert.deepEqual(s.overrides,{});assert.equal(s.other.length,40);
});
