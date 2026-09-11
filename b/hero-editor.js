(async () => {
  const hero = document.querySelector('.subscription-hero--video');
  if (!hero) return;
  const gradient=document.createElement('div');
  gradient.className='subscription-hero-gradient';gradient.setAttribute('aria-hidden','true');hero.querySelector('video').after(gradient);
  const targets = {
    gradient: {label:'영상 위 그라데이션',node:gradient,gradient:true},
    intro: {label:'상단 안내 문구', node:hero.querySelector('.subscription-video-title > p')},
    title: {label:'메인 제목', node:hero.querySelector('h1')},
    message: {label:'하단 문구', node:hero.querySelector('.subscription-video-message')}
  };
  hero.querySelectorAll('.subscription-doodles path').forEach((node,i) => {
    targets[`decor${i}`] = {label:i<3?`별 장식 ${i+1}`:`작은 장식 ${i-2}`,node,decor:true};
  });
  const original = Object.fromEntries(Object.entries(targets).map(([id,t])=>[id,{html:t.node.innerHTML,style:t.node.getAttribute('style')} ]));
  function restore() {
    for (const [id,t] of Object.entries(targets)) {
      t.node.innerHTML=original[id].html;
      if (original[id].style===null) t.node.removeAttribute('style'); else t.node.setAttribute('style',original[id].style);
    }
  }
  function apply(config) {
    restore();
    for (const [id,v] of Object.entries(config.elements || {})) {
      const target=targets[id]; if (!target) continue;
      const n=target.node;
      if(target.gradient){
        const g={visible:false,color:'#000000',endColor:'#000000',opacity:60,endOpacity:0,angle:180,start:0,end:70,...v};
        const rgba=(hex,alpha)=>`rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${alpha/100})`;
        n.style.display=g.visible?'block':'none';
        n.style.background=`linear-gradient(${g.angle}deg, ${rgba(g.color,g.opacity)} ${g.start}%, ${rgba(g.endColor,g.endOpacity)} ${Math.max(g.start,g.end)}%)`;
        continue;
      }
      if(v.visible!==undefined)n.style.visibility=v.visible?'visible':'hidden';
      if(v.text!==undefined && !target.decor) {
        n.replaceChildren();
        v.text.split('\n').forEach((line,i)=>{
          if(i)n.append(document.createElement('br'));
          const span=document.createElement('span');span.textContent=line;
          if(id==='message')span.style.color=i ? (v.highlight || '#e6f2b9') : (v.color || '#fffdf1');
          n.append(span);
        });
      }
      if(v.size!==undefined)n.style.fontSize=`${v.size/3.9}cqw`;
      if(v.lineHeight!==undefined)n.style.lineHeight=v.lineHeight;
      if(v.color){if(target.decor)n.style.fill=v.color;else n.style.color=v.color;}
      if(v.stroke){if(target.decor)n.style.stroke=v.stroke;else n.style.webkitTextStrokeColor=v.stroke;}
      if(v.strokeWidth!==undefined){if(target.decor)n.style.strokeWidth=v.strokeWidth;else n.style.webkitTextStrokeWidth=`${v.strokeWidth}px`;}
      if(v.x!==undefined) {
        n.style.transformBox=target.decor?'fill-box':'border-box';n.style.transformOrigin='center';
        n.style.transform=`translate(${v.x}px, ${v.y}px) rotate(${v.rotation}deg) scale(${v.scale})`;
      }
    }
  }
  let saved={elements:{}};
  try { const r=await fetch('./hero-settings.json',{cache:'no-store'});if(r.ok)saved=await r.json(); } catch {}
  apply(saved);
  if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))return;
  const css=document.createElement('link');css.rel='stylesheet';css.href='./hero-editor.css';document.head.append(css);
  const backupKey='dhgarden-hero-B-draft';
  let draft=structuredClone(saved);
  let recovered=false;
  try {const backup=JSON.parse(localStorage.getItem(backupKey));if(backup?.elements){draft=backup;recovered=true;apply(draft);}} catch {}
  function backupDraft(){try{localStorage.setItem(backupKey,JSON.stringify(draft));}catch{}}
  const launcher=document.createElement('button');launcher.className='hero-edit-launcher';launcher.textContent='히어로 편집';
  const panel=document.createElement('section');panel.className='hero-editor';panel.hidden=true;panel.setAttribute('aria-label','히어로 편집기');
  panel.innerHTML=`<header><strong>히어로 편집</strong><button type="button" data-close aria-label="편집창 닫기">×</button></header><p class="hero-editor-help">개발 화면 전용 · 변경은 바로 미리보기 됩니다.</p><label>편집할 요소<select data-target></select></label><div data-fields></div><div class="hero-editor-actions"><button data-reset>선택 요소 초기화</button><button data-cancel>미리보기 취소</button><button data-save>완성본 반영</button></div><p role="status" data-status></p>`;
  document.body.append(launcher,panel);
  const select=panel.querySelector('[data-target]');
  for(const [id,t] of Object.entries(targets)){const o=new Option(t.label,id);select.add(o);}
  const colorHex = s => {const m=s.match(/[\d.]+/g);return m&&m.length>=3?'#'+m.slice(0,3).map(x=>Math.round(+x).toString(16).padStart(2,'0')).join(''):'#fffdf1';};
  function defaults(id){
    const t=targets[id],style=getComputedStyle(t.node);
    if(t.gradient)return {visible:false,color:'#000000',endColor:'#000000',opacity:60,endOpacity:0,angle:180,start:0,end:70};
    return {visible:true,x:0,y:0,rotation:id==='message'?2:0,scale:1,
      size:t.decor?16:id==='intro'?13.26:id==='title'?46.8:29.64,lineHeight:id==='intro'?1.4:id==='title'?1.15:1.55,
      color:t.decor?'#fffdf1':'#fffdf1',stroke:t.decor?(id==='decor0'||id==='decor1'||id==='decor2'?'#18271e':'#fffdf1'):'#18271e',
      strokeWidth:t.decor?3.5:id==='title'?5:id==='message'?4:0,highlight:'#e6f2b9',
      text:original[id].html.replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'')};
  }
  // Capture defaults before subsequent previews modify the computed styles.
  restore();const base=Object.fromEntries(Object.keys(targets).map(id=>[id,defaults(id)]));apply(draft);
  const status=panel.querySelector('[data-status]');
  function render(){
    const id=select.value,t=targets[id],v={...base[id],...draft.elements[id]},fields=panel.querySelector('[data-fields]');fields.replaceChildren();
    const specs=t.gradient ? [['visible','그라데이션 표시','checkbox'],['color','시작 색상','color'],['opacity','시작 농도 %','number',0,100,1],['endColor','끝 색상','color'],['endOpacity','끝 농도 %','number',0,100,1],['angle','방향 °','number',0,360,1],['start','시작 위치 %','number',0,100,1],['end','끝 위치 %','number',0,100,1]] : [['visible','표시','checkbox'],...(!t.decor?[['text','문구 (줄바꿈 가능)','textarea'],['size','글자 크기 · 기준 px','number',8,120,1],['lineHeight','행간','number',.8,2.5,.05],['color','글자 색','color']]:[['color','장식 채움 색','color']]),['stroke','외곽선 색','color'],['strokeWidth','외곽선 두께','number',0,12,.5],['x','좌우 이동','number',-300,300,1],['y','위아래 이동','number',-500,500,1],['rotation','회전','number',-180,180,1],['scale','배율','number',.1,3,.05],...(id==='message'?[['highlight','하단 강조 색','color']]:[])];
    for(const [key,label,type,min,max,step] of specs){
      const l=document.createElement('label');l.textContent=label;
      const input=document.createElement(type==='textarea'?'textarea':'input');
      if(type!=='textarea')input.type=type;else input.rows=3;
      if(type==='checkbox')input.checked=v[key];else input.value=type==='number'?Math.round(v[key]*100)/100:v[key];
      if(min!==undefined){input.min=min;input.max=max;input.step=step;}
      input.addEventListener('input',()=>{
        if(!input.checkValidity())return;
        draft.elements[id]={...v,...draft.elements[id],[key]:type==='checkbox'?input.checked:type==='number'?Number(input.value):input.value};
        backupDraft();apply(draft);status.textContent='미리보기 중 · 완성본 반영을 눌러 저장하세요.';
      });l.append(input);fields.append(l);
    }
  }
  function setEditorOpen(open) {
    panel.hidden=!open;
    document.body.classList.toggle('is-hero-editing',open);
    if(open){hero.closest('.app-shell').scrollTop=0;render();if(recovered){status.textContent='자동 백업한 편집값을 복원했습니다. 완성본 반영을 눌러 파일에 저장하세요.';recovered=false;}}
  }
  launcher.onclick=()=>setEditorOpen(panel.hidden);
  panel.querySelector('[data-close]').onclick=()=>setEditorOpen(false);select.onchange=render;
  panel.querySelector('[data-reset]').onclick=()=>{delete draft.elements[select.value];backupDraft();apply(draft);render();status.textContent='선택 요소를 초기화했습니다. 저장 전 미리보기 상태입니다.';};
  panel.querySelector('[data-cancel]').onclick=()=>{draft=structuredClone(saved);backupDraft();apply(draft);render();status.textContent='저장된 완성본으로 되돌렸습니다.';};
  panel.querySelector('[data-save]').onclick=async e=>{
    e.target.disabled=true;backupDraft();
    try{const r=await fetch('/__dev/hero-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});if(!r.ok)throw Error();saved=structuredClone(draft);backupDraft();status.textContent='완성본을 저장했습니다. 새로고침 후에도 유지됩니다.';}
    catch{status.textContent='파일 저장에 실패했습니다. 편집값은 브라우저에 백업되어 있습니다. 창을 닫지 말고 다시 시도해주세요.';}
    finally{e.target.disabled=false;}
  };
  const updateVisibility=()=>{const hidden=hero.closest('main').hidden;launcher.hidden=hidden;if(hidden)setEditorOpen(false);};
  new MutationObserver(updateVisibility).observe(hero.closest('main'),{attributes:true,attributeFilter:['hidden']});updateVisibility();
})();
