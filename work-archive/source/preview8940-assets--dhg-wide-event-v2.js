document.addEventListener('DOMContentLoaded',function(){
const section=document.querySelector('.dhg-wide-event'),filter=document.querySelector('.meeting-market-filter'),search=document.querySelector('#market-search input');
if(section&&filter){
 const track=section.querySelector('.dhg-event-track'),slides=Array.from(track.children),play=section.querySelector('.dhg-event-play'),count=section.querySelector('.dhg-event-count');
 const desktop=matchMedia('(min-width:1024px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const clone=slides[0].cloneNode(true);clone.setAttribute('aria-hidden','true');clone.inert=true;clone.tabIndex=-1;track.append(clone);
 let index=0,position=0,timer=null,resetTimer=null,paused=reduced.matches;
 const stop=()=>{clearTimeout(timer);timer=null};
 const update=()=>{count.querySelector('b').textContent=String(index+1).padStart(2,'0');count.setAttribute('aria-label',`전체 ${slides.length}개 중 ${index+1}번째 행사`);slides.forEach((slide,i)=>{slide.inert=i!==index;slide.tabIndex=i===index?0:-1;slide.setAttribute('aria-hidden',String(i!==index));});};
 const eligible=()=>!paused&&!section.hidden&&desktop.matches&&!document.hidden;
 const schedule=()=>{stop();if(eligible())timer=setTimeout(next,4000)};
 function next(){if(!eligible())return;position++;index=position%slides.length;track.style.transition='';track.style.transform=`translateX(-${position*100}%)`;update();if(position===slides.length){resetTimer=setTimeout(()=>{position=0;track.style.transition='none';track.style.transform='translateX(0)';resetTimer=null},reduced.matches?0:700)}schedule();}
 const sync=()=>{section.hidden=filter.querySelector('[aria-pressed="true"]')?.dataset.marketCategory!=='all'||!!search?.value.trim();schedule()};
 function playback(){play.setAttribute('aria-label',paused?'행사 배너 재생':'행사 배너 일시정지');play.firstElementChild.textContent=paused?'▶':'Ⅱ';schedule()}
 play.addEventListener('click',()=>{paused=!paused;playback()});
 new MutationObserver(sync).observe(filter,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});search?.addEventListener('input',sync);desktop.addEventListener('change',sync);document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;playback()});window.addEventListener('pagehide',()=>{stop();clearTimeout(resetTimer)});window.addEventListener('pageshow',schedule);
 update();sync();playback();
}
(() => {
  document.querySelectorAll('.dhg-desktop-apply').forEach(button => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, active = false, enteredAt = 0;
  const paint = (now = performance.now()) => {
    frame = 0;
    const amount = reduced.matches ? 1 : .18;
    x += (targetX - x) * amount;
    y += (targetY - y) * amount;
    const progress = reduced.matches ? 1 : Math.min(1, (now - enteredAt) / 1000);
    const blend = Math.max(0, (progress - .35) / .65);
    const eased = blend * blend * (3 - 2 * blend);
    const center = button.clientWidth / 2;
    const wave = Math.sin(progress * Math.PI * 2) * button.clientWidth * .12;
    const displayX = (center + wave) * (1 - eased) + x * eased;
    button.style.setProperty('--cta-glow-width', `${button.clientWidth * 2 * (1 - eased) + 210 * eased}px`);
    button.style.setProperty('--cta-glow-x', `${displayX}px`);
    button.style.setProperty('--cta-glow-y', `${button.clientHeight / 2 * (1 - eased) + y * eased}px`);
    if (active && (progress < 1 || Math.abs(targetX - x) > .1 || Math.abs(targetY - y) > .1)) frame = requestAnimationFrame(paint);
  };
  function move(event) {
    if (event.pointerType === 'touch') return;
    const rect = button.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
    if (!active) { x = targetX; y = targetY; enteredAt = performance.now(); }
    active = true;
    if (!frame) frame = requestAnimationFrame(paint);
  }
  button.addEventListener('pointerenter', move);
  button.addEventListener('pointermove', move);
  button.addEventListener('pointerleave', () => { active = false; cancelAnimationFrame(frame); frame = 0; button.style.removeProperty('--cta-glow-width'); });
  button.addEventListener('focus', () => {
    if (!active) { targetX = button.clientWidth / 2; targetY = button.clientHeight / 2; x = targetX; y = targetY; paint(); }
  });
  });
})();

});
