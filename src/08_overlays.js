/* ================= BGM SHEET ================= */
let bgmMode='simple',bgmLang='ko';
let bgmModal=null;const bgmHolder={playing:false,nodes:[],bgmStop:null,out:null,forceBgm:true};
function openBgm(){if(bgmModal){return}bgmModal=modal({title:'BGM 설정',cls:'wide bgm-modal',body:'<div id="bgmSheet"></div>',foot:`<span class="msg">무드 맵을 움직이면 옆의 수치와 브리프에 바로 반영됩니다.</span><button class="btn" data-act="bgmPlay" id="bgmPlayBtn">${ic('play','s')}분위기 스케치 듣기</button><button class="btn pri" data-x2>완료</button>`,onClose:()=>{bgmModal=null;bgmStopSketch()}});
 bgmModal.querySelector('[data-x2]').onclick=()=>bgmModal.close();renderBgmSheet()}
function bgmStopSketch(){if(bgmHolder.playing){bgmHolder.playing=false;stopAudio(bgmHolder)}const b=$('#bgmPlayBtn');if(b)b.innerHTML=`${ic('play','s')}분위기 스케치 듣기`}
async function bgmToggleSketch(){if(bgmHolder.playing)return bgmStopSketch();Player.pause();const ctx=actx();try{await ctx.resume()}catch(e){}const p=S.proj;const tl=timeline(p);bgmHolder.out=ctx.createGain();bgmHolder.out.connect(ctx.destination);bgmHolder.playing=true;
 const from=S.t>=tl.total-1?0:S.t;await startAudio(ctx,bgmHolder.out,p,tl,from,ctx.currentTime+.08,bgmHolder);const b=$('#bgmPlayBtn');if(b)b.innerHTML=`${ic('pause','s')}정지 · ${mmss(from)}부터 재생 중`;
 setTimeout(()=>{if(bgmHolder.playing)bgmStopSketch()},(tl.total-from+.5)*1000)}
function bgmBriefPreview(p){return bgmBriefKo(p).split('\n').slice(1).filter(line=>bgmMode!=='expert'||! /^(메모|참고 곡|음원):/.test(line)).join('\n')}
function bgmValues(b){return [['에너지',Math.round(b.energy*100)],['밝기',Math.round(b.valence*100)]].map(([label,value])=>`<div><span>${label}</span><strong>${value}<small> / 100</small></strong><meter min="0" max="100" value="${value}" aria-label="${label}">${value}</meter></div>`).join('')}
function renderBgmSheet(){const el=$('#bgmSheet');if(!el)return;const p=S.proj,b=p.bgm;const tl=timeline(p);const mb=bgmModal&&bgmModal.querySelector('.modal-b');const st=mb?mb.scrollTop:0;
 el.innerHTML=`<div class="bgm-toolbar"><div class="seg" role="group" aria-label="BGM 설정 모드"><button data-bgm-mode="simple" aria-pressed="${bgmMode==='simple'}">심플 모드</button><button data-bgm-mode="expert" aria-pressed="${bgmMode==='expert'}">전문가 모드</button></div><span class="muted">${bgmMode==='simple'?'프리셋과 무드 맵으로 분위기를 정합니다.':'장르부터 믹스까지 모든 설정을 조절합니다.'}</span></div>
 <div class="bgm bgm-${bgmMode}"><div class="bgm-column bgm-main">
<div class="grp"><div class="grp-h"><h5>프리셋으로 시작</h5>${b.preset?`<span class="pill acc">${esc((BGM_PRESETS.find(x=>x.k===b.preset)||{n:''}).n)} 기반</span>`:''}</div><div class="presets">${BGM_PRESETS.map(x=>`<button class="preset" title="${esc(x.d)}" aria-pressed="${b.preset===x.k}" data-act="bgmPreset" data-arg="${x.k}"><b>${x.n}</b><span>${x.d}</span></button>`).join('')}</div></div>
<div class="grp"><div class="grp-h"><h5>무드 맵</h5><span class="muted" style="font-size:11px">드래그 · 방향키로 조절합니다</span></div>
   <div class="moodpad" id="moodpad" role="group" aria-label="무드 맵: 좌우 방향키는 에너지, 상하 방향키는 밝기를 조절합니다" tabindex="0" aria-describedby="bgm-mood-values">
    <span class="q" style="left:12px;top:10px">잔잔 · 희망<span>따뜻한 피아노, 서정적</span></span><span class="q" style="right:12px;top:10px;text-align:right">고양 · 경쾌<span>업비트, 런칭, 자신감</span></span><span class="q" style="right:12px;bottom:10px;text-align:right">긴장 · 웅장<span>트레일러, 서스펜스</span></span><span class="q" style="left:12px;bottom:10px">몽환 · 서정<span>앰비언트, 미스터리</span></span>
    <span class="ax" style="left:50%;bottom:6px;transform:translateX(-50%)">에너지 →</span><span class="ax" style="left:6px;top:50%;transform:rotate(-90deg) translateX(50%);transform-origin:left">밝기 →</span>
    <span class="puck" id="puck" style="left:${b.energy*100}%;top:${(1-b.valence)*100}%"></span></div></div>
<div class="bgm-expert"><div class="grp"><div class="grp-h"><h5>장르</h5><span class="muted" style="font-size:11px">1~2개 권장</span></div><div class="chips">${BGM_GENRES.map(([k])=>`<button class="chip" aria-pressed="${b.genres.includes(k)}" data-toggle="p.bgm.genres" data-v="${k}">${k}</button>`).join('')}</div></div>
<div class="grp"><div class="grp-h"><h5>템포</h5></div><div class="bpm"><b class="tnum" id="bpmv">${b.bpm}</b><small>BPM<br>${b.bpm<80?'느림':b.bpm<105?'보통':b.bpm<130?'빠름':'매우 빠름'}</small><input type="range" id="bgm-bpm" aria-label="BGM 템포" min="60" max="160" step="1" value="${b.bpm}" style="${rangeStyle(b.bpm,60,160)}" data-bind="p.bgm.bpm" data-num data-rerender><button class="btn sm" data-act="tap" title="박자에 맞춰 여러 번 누르세요">탭 템포</button></div></div></div></div>
 <div class="bgm-column bgm-summary"><div class="grp bgm-brief"><div class="grp-h"><h5>BGM 브리프</h5><span class="pill acc">실시간 반영</span></div>
   <div id="bgm-mood-values" class="bgm-values" data-live="bgmValues" aria-live="polite">${bgmValues(b)}</div>
   <p class="bgm-words" data-live="bgmWords">${esc(moodWords(b))}</p>
   <div class="bgm-brief-tools"><div class="seg" role="group" aria-label="브리프 언어"><button data-bgm-lang="ko" aria-pressed="${bgmLang==='ko'}">한국어</button><button data-bgm-lang="en" aria-pressed="${bgmLang==='en'}">EN</button></div><button class="btn sm" data-act="${bgmLang==='ko'?'copyBgmKo':'copyBgmEn'}">${ic('copy','s')}복사</button></div>
   <div class="briefout ${bgmLang==='en'?'en':''}" data-live="${bgmLang==='ko'?'bgmPreview':'bgmEn'}">${esc(bgmLang==='ko'?bgmBriefPreview(p):bgmPromptEn(p))}</div></div>
<div class="bgm-expert"><div class="grp"><div class="grp-h"><h5>씬별 에너지 곡선</h5><span class="muted" style="font-size:11px">막대를 위아래로 끌기 · ◆ 임팩트</span></div>
   <div class="arc" id="arc">${tl.segs.map((g,i)=>`<div class="col" data-arc="${g.s.id}" title="씬 ${i+1} ${esc(g.s.title)}"><div class="bar" style="height:${g.s.dir.energy*20}%"></div><button class="hitb ${g.s.bgmHit?'on':''}" ${i?'':'style="visibility:hidden"'} data-flip="S:${g.s.id}.bgmHit" aria-label="씬 ${i+1} 시작 임팩트"></button><span class="lb">${pad(i+1)}</span></div>`).join('')}</div></div>
<div class="grp"><div class="grp-h"><h5>음원 소스</h5></div>${seg('p.bgm.source',[['synth','Claude 합성'],['upload','내 음원'],['stock','스톡 검색']],b.source)}
   ${b.source==='upload'?(b.assetId?`<div class="row"><span>${ic('music','s')} ${esc(b.name)}</span><span class="sp"></span><button class="btn sm" data-act="bgmUpload">교체</button><button class="ibtn sm" data-act="bgmRemove" aria-label="음원 제거">${ic('trash','s')}</button></div>`:`<div class="drop" data-act="bgmUpload" data-dropbgm="1">${ic('upload')}<b style="font-size:12.5px">음원 올리기</b><span style="font-size:11px">MP3 · M4A · WAV · 14MB 이하</span></div>`):
   `<p class="muted" style="font-size:12px">${b.source==='synth'?'설정에 맞춰 패드·리듬·임팩트를 합성합니다. 분위기 스케치로 미리 들을 수 있습니다.':'브리프의 EN 프롬프트를 스톡 음원 사이트 검색이나 음악 생성 도구에 쓰고, 고른 곡을 ‘내 음원’으로 올리세요.'}</p>`}</div></div></div>
 <div class="bgm-column bgm-expert bgm-settings"><div class="grp"><div class="grp-h"><h5>세부</h5></div>
   <div class="field"><div class="lbl">악기 포커스</div><div class="chips">${BGM_INSTR.map(([k])=>`<button class="chip" aria-pressed="${b.instruments.includes(k)}" data-toggle="p.bgm.instruments" data-v="${k}">${k}</button>`).join('')}</div></div>
   <div class="field"><div class="lbl">보컬</div>${seg('p.bgm.vocals',[['none','없음'],['hum','허밍·코러스'],['vocal','보컬 포함']],b.vocals)}</div>
   <div class="field"><div class="lbl">피할 것</div><div class="chips">${BGM_AVOID.map(([k])=>`<button class="chip" aria-pressed="${b.avoid.includes(k)}" data-toggle="p.bgm.avoid" data-v="${k}">${k}</button>`).join('')}</div></div>
   <div class="grid2"><div class="field"><div class="lbl">나레이션 덕킹 <span class="mono">${b.duck} dB</span></div><input type="range" id="bgm-duck" aria-label="나레이션 덕킹" min="-24" max="0" step="1" value="${b.duck}" style="${rangeStyle(b.duck,-24,0)}" data-bind="p.bgm.duck" data-num data-rerender></div>
   <div class="field"><div class="lbl">볼륨 <span class="mono">${Math.round(b.volume*100)}%</span></div><input type="range" id="bgm-vol" aria-label="BGM 볼륨" min="0" max="1" step="0.05" value="${b.volume}" style="${rangeStyle(b.volume,0,1)}" data-bind="p.bgm.volume" data-num data-rerender></div>
   <div class="field"><div class="lbl">페이드 인 <span class="mono">${b.fadeIn}s</span></div><input type="range" id="bgm-fi" aria-label="BGM 페이드 인" min="0" max="6" step="0.5" value="${b.fadeIn}" style="${rangeStyle(b.fadeIn,0,6)}" data-bind="p.bgm.fadeIn" data-num data-rerender></div>
   <div class="field"><div class="lbl">페이드 아웃 <span class="mono">${b.fadeOut}s</span></div><input type="range" id="bgm-fo" aria-label="BGM 페이드 아웃" min="0" max="8" step="0.5" value="${b.fadeOut}" style="${rangeStyle(b.fadeOut,0,8)}" data-bind="p.bgm.fadeOut" data-num data-rerender></div></div>
   <div class="field"><label for="bgm-refs">참고 곡 · 링크 <span class="hint">한 줄에 하나</span></label><textarea class="ta" id="bgm-refs" rows="2" data-bind="p.bgm.refs" placeholder="예: Hans Zimmer - Time 같은 점진적 빌드업">${esc(b.refs)}</textarea></div>
   <div class="field"><label for="bgm-notes">메모</label><input class="in" id="bgm-notes" data-bind="p.bgm.notes" value="${esc(b.notes)}" placeholder="예: 씬 4 정점에서 잠깐 멈췄다 들어오기"></div></div></div></div>`;
 $$('[data-bgm-mode]',el).forEach(button=>{button.onclick=()=>{bgmMode=button.dataset.bgmMode;renderBgmSheet();el.querySelector(`[data-bgm-mode="${bgmMode}"]`).focus()}});
 $$('[data-bgm-lang]',el).forEach(button=>{button.onclick=()=>{bgmLang=button.dataset.bgmLang;renderBgmSheet();el.querySelector(`[data-bgm-lang="${bgmLang}"]`).focus()}});
 if(mb)mb.scrollTop=st;
 const pad_=$('#moodpad');
 const updateMood=()=>{const puck=$('#puck');puck.style.left=b.energy*100+'%';puck.style.top=(1-b.valence)*100+'%';live()};
 const setFrom=e=>{const r=pad_.getBoundingClientRect();b.energy=+clamp((e.clientX-r.left)/r.width,0,1).toFixed(2);b.valence=+clamp(1-(e.clientY-r.top)/r.height,0,1).toFixed(2);updateMood()};
 pad_.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();pad_.focus({preventScroll:true});pad_.setPointerCapture(e.pointerId);setFrom(e);pad_.onpointermove=setFrom};
 const finishMood=()=>{if(!pad_.onpointermove)return;pad_.onpointermove=null;touch('p.bgm')};
 pad_.onpointerup=finishMood;pad_.onpointercancel=finishMood;pad_.onlostpointercapture=finishMood;
 pad_.onkeydown=e=>{const d={ArrowLeft:[-.05,0],ArrowRight:[.05,0],ArrowUp:[0,.05],ArrowDown:[0,-.05]}[e.key];if(!d)return;e.preventDefault();e.stopPropagation();b.energy=+clamp(b.energy+d[0],0,1).toFixed(2);b.valence=+clamp(b.valence+d[1],0,1).toFixed(2);updateMood();touch('p.bgm')};
 $$('[data-arc]').forEach(col=>{col.onpointerdown=e=>{if(e.target.closest('button'))return;col.setPointerCapture(e.pointerId);const s=S.proj.scenes.find(x=>x.id===col.dataset.arc);const set=ev=>{const r=col.getBoundingClientRect();const v=clamp(Math.round((1-(ev.clientY-r.top)/(r.height-30))*5+.5),1,5);if(v!==s.dir.energy){s.dir.energy=v;col.querySelector('.bar').style.height=v*20+'%';live()}};set(e);col.onpointermove=set;col.onpointerup=()=>{col.onpointermove=null;touch('p.bgm',{structural:true})}}})}
let taps=[];function tapTempo(){const n=performance.now();taps=taps.filter(t=>n-t<3000);taps.push(n);if(taps.length>=3){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1);const bpm=clamp(Math.round(60000/iv),60,160);S.proj.bgm.bpm=bpm;touch('p.bgm',{structural:true});toast(`템포를 ${bpm} BPM으로 맞췄습니다.`)}else toast('박자에 맞춰 세 번 이상 누르세요.',{ms:1200})}

/* ================= HISTORY ================= */
let drawerEl=null;
function openHistory(){if(drawerEl){drawerEl.remove();drawerEl=null;return}const L=$('#layer');const sc=document.createElement('div');sc.className='scrim';sc.style.background='rgba(10,12,18,.25)';sc.style.placeItems='stretch';sc.style.padding='0';
 sc.innerHTML=`<aside class="drawer" role="dialog" aria-label="버전 기록"><div class="drawer-h">${ic('history')}<h3>버전 기록</h3><button class="btn sm pri" data-act="saveVersion">${ic('save','s')}지금 저장</button><button class="ibtn" data-act="closeHistory" aria-label="닫기">${ic('close')}</button></div><div class="vfilter" id="vfilter"></div><div class="vlist" id="vlist"></div></aside>`;
 sc.addEventListener('mousedown',e=>{if(e.target===sc)closeHistory()});L.appendChild(sc);drawerEl=sc;renderHistory()}
function closeHistory(){if(drawerEl){drawerEl.remove();drawerEl=null}}
async function renderHistory(){const f=$('#vfilter'),l=$('#vlist');if(!f||!l)return;const vs=S.versions;const kinds=[...new Set(vs.map(v=>(v.source&&v.source.kind)||'user'))];
 f.innerHTML=`<button class="chip" aria-pressed="${S.vfilter==='all'}" data-act="vfilter" data-arg="all">전체 ${vs.length}</button>${kinds.map(k=>`<button class="chip" aria-pressed="${S.vfilter===k}" data-act="vfilter" data-arg="${k}">${SRC[k]?SRC[k].n:k} ${vs.filter(v=>((v.source&&v.source.kind)||'user')===k).length}</button>`).join('')}`;
 const list=vs.filter(v=>S.vfilter==='all'||((v.source&&v.source.kind)||'user')===S.vfilter);
 let names={};if(Cap.user){try{const ids=[...new Set(list.map(v=>v.author).filter(Boolean))];if(ids.length)names=await Cap.user.profiles(ids)}catch(e){}}
 l.innerHTML=(S.dirty?`<div class="vdraft">${ic('undo','s')}<span>저장 안 된 변경 ${S.dirty}개 · ${esc(diffSummary(S.base,S.proj).slice(0,3).join(', '))}</span><span class="sp"></span><button class="btn sm" data-act="saveVersion">저장</button></div>`:'')+
 (list.length?list.map((v,i)=>{const nm=v.author&&names[v.author]?names[v.author].name:'';const sm=v.summary||[];return `<div class="vrow ${i===0&&S.vfilter==='all'?'cur':''}"><div class="rail"><i></i><b></b></div><div style="min-width:0"><div class="vh"><span class="vn">v${v.n}</span>${srcTag(v.source)}${v.label?`<span class="vl">${esc(v.label)}</span>`:''}<span class="vt" title="${stamp(v.at)}">${rel(v.at)}</span></div>
  <div class="muted" style="font-size:11.5px;margin-top:2px">${esc(VIEWS[clamp((v.stage||1)-1,0,4)][1])} 단계${nm?' · '+esc(nm):''}${v.source&&v.source.agent?' · '+esc(v.source.agent):''}${v.source&&v.source.ref?` · <span class="mono">${esc(v.source.ref)}</span>`:''}</div>
  <ul>${sm.slice(0,4).map(x=>`<li>${esc(x)}</li>`).join('')}${sm.length>4?`<li class="muted">외 ${sm.length-4}건</li>`:''}</ul>${v.note?`<div class="vnote">${esc(v.note)}</div>`:''}
  ${v.attach?`<div class="att">${v.attach.video?`<span class="pill acc">${ic('film','s')}${v.attach.kind==='final'?'최종 영상':'애니마틱'}</span>`:''}${v.attach.thumb?`<span class="pill acc">${ic('image','s')}썸네일</span>`:''}${v.attach.link?`<a class="pill acc" href="${esc(v.attach.link)}" target="_blank" rel="noopener">${ic('link','s')}링크</a>`:''}</div>`:''}
  <div class="vact"><button class="btn sm" data-act="viewVersion" data-arg="${v.id}">${ic('eye','s')}보기·비교</button>${i||S.vfilter!=='all'||S.dirty?`<button class="btn sm" data-act="restoreVersion" data-arg="${v.id}">${ic('undo','s')}이 버전으로 복원</button>`:''}<button class="btn sm ghost" data-act="dlVersionBrief" data-arg="${v.id}">${ic('download','s')}brief.md</button></div></div></div>`}).join(''):`<div class="empty" style="margin:10px"><h4>아직 저장된 버전이 없습니다</h4><p style="font-size:12px">‘버전 저장’(⌘S)을 누르거나 Claude로 생성·가져오기를 하면 출처 태그와 함께 기록됩니다.</p></div>`)}
function lineDiff(a,b){if(a===b)return esc(b);return `<del>${esc(a||'∅')}</del> <ins>${esc(b||'∅')}</ins>`}
function viewVersion(vid){const v=S.versions.find(x=>x.id===vid);if(!v)return;const a=v.snapshot,b=S.proj;const am=new Map(a.scenes.map(s=>[s.id,s]));
 const rows=[];b.scenes.forEach((s,i)=>{const o=am.get(s.id);if(!o){rows.push(`<div class="d"><h6>씬 ${i+1} · ${esc(s.title)} <span class="pill ok">현재에만 있음</span></h6></div>`);return}const parts=[];
  const ta=o.lines.map(l=>l.ko).join(' / '),tb=s.lines.map(l=>l.ko).join(' / ');if(ta!==tb)parts.push(`<div><span class="eyebrow">나레이션</span><div>${lineDiff(ta,tb)}</div></div>`);
  if(o.onscreen.headline!==s.onscreen.headline)parts.push(`<div><span class="eyebrow">헤드라인</span><div>${lineDiff(o.onscreen.headline,s.onscreen.headline)}</div></div>`);
  if(o.intent!==s.intent)parts.push(`<div><span class="eyebrow">의도</span><div>${lineDiff(o.intent,s.intent)}</div></div>`);
  if(JSON.stringify(o.dir)!==JSON.stringify(s.dir))parts.push(`<div><span class="eyebrow">연출</span><div class="muted">${esc(nameOf(CAMERAS,o.dir.camera))}→${esc(nameOf(CAMERAS,s.dir.camera))} · 에너지 ${o.dir.energy}→${s.dir.energy} · 효과 ${o.dir.effects.length}→${s.dir.effects.length}개</div></div>`);
  if(parts.length)rows.push(`<div class="d"><h6>씬 ${i+1} · ${esc(s.title)}</h6>${parts.join('')}</div>`)});
 a.scenes.forEach(s=>{if(!b.scenes.find(x=>x.id===s.id))rows.push(`<div class="d"><h6>${esc(s.title)} <span class="pill bad">v${v.n}에만 있음 (현재 삭제됨)</span></h6></div>`)});
 const m=modal({title:`v${v.n} ${v.label||''}`,cls:'mid',body:`<div class="row">${srcTag(v.source)}<span class="muted">${stamp(v.at)}</span>${v.source&&v.source.agent?`<span class="muted">· ${esc(v.source.agent)}</span>`:''}</div>${v.note?`<p style="white-space:pre-wrap">${esc(v.note)}</p>`:''}
  ${v.attach&&v.attach.video?`<video src="${Store.url(v.attach.video)}" controls style="width:100%;border-radius:10px;background:#000"></video>`:''}${v.attach&&v.attach.thumb?`<img src="${Store.url(v.attach.thumb)}" alt="썸네일" style="border-radius:10px">`:''}
  <div class="eyebrow">v${v.n} → 현재 작업본 비교</div><div class="diff">${rows.length?rows.join(''):'<p class="muted">씬 내용은 현재와 같습니다.</p>'}</div>`,
  foot:`<button class="btn" data-act="dlVersionBrief" data-arg="${v.id}">${ic('download','s')}이 버전 brief.md</button><button class="btn pri" data-act="restoreVersion" data-arg="${v.id}">${ic('undo','s')}이 버전으로 복원</button>`})}
async function restoreVersion(vid){const v=S.versions.find(x=>x.id===vid);if(!v)return;const ok=await confirmBox(`v${v.n}으로 복원하시겠습니까?`,`현재 작업본을 v${v.n} 내용으로 바꾸고, 새 버전 ‘v${v.n} 복원’으로 기록합니다. 지금 내용은 ${S.dirty?'먼저 자동으로 버전 저장된 뒤 ':''}기록에 남아 있어 언제든 되돌릴 수 있습니다.`,'복원',false);if(!ok)return;
 if(S.dirty)await commitVersion({label:'복원 전 자동 저장',source:{kind:'user'}});
 const id=S.proj.id;S.proj=norm({...clone(v.snapshot),id});S.undo.push(JSON.stringify(S.proj));await commitVersion({label:`v${v.n} 복원`,note:`v${v.n}의 내용으로 되돌림`,source:{kind:'user'}});$$('.scrim').forEach(x=>{if(!x.contains(drawerEl))x.remove()});closeHistory();refresh()}
function saveVersionModal(){if(!S.proj)return;pushUndo.flush();const sm=diffSummary(S.base,S.proj);let kind='user';
 const m=modal({title:`v${(S.versions[0]?S.versions[0].n:0)+1} 저장`,body:`<div class="field"><label for="sv-label">이름 <span class="hint">선택</span></label><input class="in" id="sv-label" placeholder="예: 1차 피드백 반영" autofocus></div>
  <div class="field"><label for="sv-note">변경 메모</label><textarea class="ta" id="sv-note" rows="3">${esc(sm.join(', '))}</textarea></div>
  <div class="field"><div class="lbl">출처 태그 <span class="hint">이 변경을 만든 주체</span></div><div class="chips" id="sv-src">${Object.entries(SRC).map(([k,x])=>`<button class="chip" aria-pressed="${k==='user'}" data-k="${k}">${x.n}</button>`).join('')}</div></div>
  <div class="grid2"><div class="field"><label for="sv-agent">에이전트 · 작업자 <span class="hint">선택</span></label><input class="in" id="sv-agent" placeholder="예: Claude Code · render-bot"></div><div class="field"><label for="sv-ref">참조 <span class="hint">브랜치·커밋·PR</span></label><input class="in mono" id="sv-ref" placeholder="owner/repo@a1b2c3d"></div></div>`,
  foot:`<span class="msg">⌘↵ 로 저장</span><button class="btn" data-no>취소</button><button class="btn pri" data-ok>${ic('save','s')}저장</button>`});
 m.querySelector('#sv-src').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;kind=b.dataset.k;$$('#sv-src .chip').forEach(c=>c.setAttribute('aria-pressed',String(c===b)))};
 m.querySelector('[data-no]').onclick=()=>m.close();const ok=async()=>{const v=await commitVersion({label:$('#sv-label').value.trim(),note:$('#sv-note').value.trim(),source:{kind,agent:$('#sv-agent').value.trim(),ref:$('#sv-ref').value.trim()}});if(v)m.close()};
 m.querySelector('[data-ok]').onclick=ok;m.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();ok()}})}

/* ================= IMPORT ================= */
function parseBriefText(txt){txt=String(txt||'').trim();let data=null,fm={};
 const m=txt.match(/^---\n([\s\S]*?)\n---/);if(m)m[1].split('\n').forEach(l=>{const i=l.indexOf(':');if(i>0)fm[l.slice(0,i).trim()]=l.slice(i+1).trim().replace(/^"(.*)"$/,'$1')});
 if(txt.startsWith('{')){try{data=JSON.parse(txt)}catch(e){}}
 if(!data){const blocks=[...txt.matchAll(/```json[^\n]*\n([\s\S]*?)```/g)].map(x=>x[1]);for(const b of blocks.reverse()){try{const j=JSON.parse(b);if(j&&(j.project||j.scenes)){data=j;break}}catch(e){}}}
 if(!data)return null;const project=data.project||data;if(!Array.isArray(project.scenes))return null;
 const srcMap={'claude-code':'code','claude-chat':'chat','claude-web':'web','github':'git','web-user':'user','import':'import'};
 return {project:norm(project),fm,kind:srcMap[fm.source]||(fm.source?'import':'code'),note:fm.note||'',version:fm.version||data.version||''}}
function openImport(prefill=''){let parsed=null,kind='code',target=S.proj?'current':'new';
 const m=modal({title:'제작 안내서 가져오기',cls:'mid',body:`<p class="muted">다른 Claude 작업이 돌려준 brief.md나 project.json을 붙여 넣거나 파일을 끌어다 놓으세요. 맨 아래 JSON 블록을 읽어 버전으로 기록합니다.</p>
  <textarea class="ta" id="imp-txt" rows="9" placeholder="--- format: motion-brief/1 ... 또는 { &quot;project&quot;: ... }" data-dropimport="1" style="font:12px/1.6 var(--f-mono)">${esc(prefill)}</textarea>
  <div class="row"><button class="btn sm" id="imp-file">${ic('upload','s')}파일 선택</button><span class="muted" id="imp-st" style="font-size:12px"></span></div><div id="imp-more"></div>`,
  foot:`<button class="btn" data-no>취소</button><button class="btn pri" data-ok disabled>${ic('import','s')}가져오기</button>`});
 const st=m.querySelector('#imp-st'),more=m.querySelector('#imp-more'),okb=m.querySelector('[data-ok]');
 const check=()=>{parsed=parseBriefText(m.querySelector('#imp-txt').value);okb.disabled=!parsed;if(!parsed){st.textContent=m.querySelector('#imp-txt').value.trim()?'motion-brief 데이터를 찾지 못했습니다. 문서 끝의 JSON 블록까지 포함됐는지 확인하세요.':'';more.innerHTML='';return}
  kind=parsed.kind;st.innerHTML=`<b style="color:var(--ok)">✓ 인식됨</b> · ${esc(parsed.project.title)} · 씬 ${parsed.project.scenes.length}개${parsed.version?' · 기준 '+esc(parsed.version):''}`;
  more.innerHTML=`${S.proj?`<div class="field"><div class="lbl">가져올 위치</div>${seg('_imp_target',[['current','현재 프로젝트의 새 버전'],['new','새 프로젝트로']],target)}</div>`:''}
  <div class="field"><div class="lbl">출처 태그</div><div class="chips" id="imp-src">${Object.entries(SRC).map(([k,x])=>`<button class="chip" aria-pressed="${k===kind}" data-k="${k}">${x.n}</button>`).join('')}</div></div>
  <div class="grid2"><input class="in" id="imp-agent" placeholder="에이전트 (예: Claude Code)" value="${esc(parsed.fm.agent||({code:'Claude Code',chat:'Claude 채팅'})[kind]||'')}"><input class="in mono" id="imp-ref" placeholder="참조 (repo@commit)" value="${esc(parsed.fm.ref||'')}"></div>
  <textarea class="ta" id="imp-note" rows="2" placeholder="변경 메모">${esc(parsed.note)}</textarea>`;
  more.querySelector('#imp-src').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;kind=b.dataset.k;$$('#imp-src .chip').forEach(c=>c.setAttribute('aria-pressed',String(c===b)))};
  $$('[data-set="_imp_target"]',more).forEach(b=>b.onclick=ev=>{ev.stopPropagation();target=b.dataset.v;$$('[data-set="_imp_target"]',more).forEach(c=>c.setAttribute('aria-pressed',String(c===b)))})};
 m.querySelector('#imp-txt').addEventListener('input',check);m.querySelector('#imp-file').onclick=async()=>{const f=await pickFile('.md,.json,.txt,text/markdown,application/json');if(f){m.querySelector('#imp-txt').value=await f.text();check()}};
 m.querySelector('[data-no]').onclick=()=>m.close();if(prefill)check();
 okb.onclick=async()=>{if(!parsed)return;const source={kind,agent:$('#imp-agent').value.trim(),ref:$('#imp-ref').value.trim()};const note=$('#imp-note').value.trim()||'안내서 가져오기';m.close();
  if(target==='current'&&S.proj){const id=S.proj.id;if(S.dirty)await commitVersion({label:'가져오기 전 자동 저장',source:{kind:'user'}});S.proj=norm({...parsed.project,id});materializeCheck();await commitVersion({label:'가져옴',note,source});refresh()}
  else{const p=norm({...parsed.project,id:uid('p'),createdAt:Date.now(),updatedAt:Date.now()});await createProject(p,{label:'가져옴',note,source})}}}
function materializeCheck(){/* keep incoming timings as-is */}

/* ================= AI (sample) ================= */
const SCENE_SCHEMA=`{"chapter":"짧은 영문 대문자 라벨","title":"씬 제목","intent":"제작 의도","visual":"화면 구성 설명","headline":"화면 헤드라인","sub":"서브 카피(콜아웃은 · 로 구분)","position":"left|center|right|lower","lines":["자막 한 줄","..."],"energy":1-5,"tone":-2~2,"pace":1-5,"camera":"${CAMERAS.map(c=>c[0]).join('|')}","transition":"${TRANS.map(c=>c[0]).join('|')}","effects":["${EFFECTS.map(c=>c[0]).join('","')}" 중 0~4개],"textAnim":"${TEXTANIM.map(c=>c[0]).join('|')}","bgmHit":true|false}`;
function briefForAI(p){const b=p.brief;return JSON.stringify({제목:p.title,주제:b.topic,핵심메시지:b.messages.filter(Boolean),타겟:b.audience,목표길이초:b.duration,화면비:b.aspect,스타일:(STYLES.find(s=>s.k===b.style)||{}).n,제작메모:b.notes,BGM:moodWords(p.bgm),나레이션속도_초당글자:p.voice.speechRate},null,1)+(b.sourceText?`\n\n[원문 자료]\n${b.sourceText.slice(0,24000)}`:'')}
function sceneFromAI(x,base){const s=base?clone(base):newScene();const pick=(v,list,d)=>list.some(q=>q[0]===v)?v:d;
 s.chapter=String(x.chapter||s.chapter||'').slice(0,24);s.title=String(x.title||s.title||'');s.intent=String(x.intent||'');s.visual=String(x.visual||'');s.onscreen={headline:String(x.headline||''),sub:String(x.sub||''),position:pick(x.position,POSITIONS,s.onscreen.position||'left')};
 const lines=(Array.isArray(x.lines)?x.lines:String(x.lines||'').split('\n')).map(t=>String(t).trim()).filter(Boolean);
 const same=base&&base.lines.length===lines.length;s.lines=lines.length?lines.map((t,i)=>{const o=base&&base.lines[i];return {...newLine(t),...(same&&o?{id:o.id,start:o.start,end:o.end,ja:o.ko===t?o.ja:'',en:o.ko===t?o.en:''}:{})}}):[newLine()];
 s.dir={...s.dir,energy:clamp(Math.round(+x.energy||s.dir.energy),1,5),tone:clamp(Math.round(+x.tone||0),-2,2),pace:clamp(Math.round(+x.pace||3),1,5),camera:pick(x.camera,CAMERAS,s.dir.camera),transition:pick(x.transition,TRANS,s.dir.transition),textAnim:pick(x.textAnim,TEXTANIM,s.dir.textAnim),effects:(Array.isArray(x.effects)?x.effects:[]).filter(e=>EFFECTS.some(q=>q[0]===e)).slice(0,5)};
 if(typeof x.bgmHit==='boolean')s.bgmHit=x.bgmHit;return s}
function sceneForAI(s,i){return {index:i+1,id:s.id,locked:s.locked,chapter:s.chapter,title:s.title,intent:s.intent,visual:s.visual,headline:s.onscreen.headline,sub:s.onscreen.sub,position:s.onscreen.position,lines:s.lines.map(l=>l.ko).filter(Boolean),energy:s.dir.energy,tone:s.dir.tone,pace:s.dir.pace,camera:s.dir.camera,transition:s.dir.transition,effects:s.dir.effects,textAnim:s.dir.textAnim,bgmHit:s.bgmHit,openNotes:s.notes.filter(n=>!n.done).map(n=>n.text)}}
function aiRun({title,intro='',prompt,tier='default',preview,apply,applyLabel='적용'}){
 if(!Cap.sample){toast('Claude 호출은 claude.ai에서 열었을 때만 쓸 수 있습니다.',{err:true});return}
 let ctl=null,result=null;
 const m=modal({title,cls:'mid',body:`${intro}<div class="row" id="ai-st"><span class="spin"></span><span>Claude가 작성 중… 처음 응답까지 10~60초 걸릴 수 있습니다.</span></div><details id="ai-raw-d"><summary class="muted" style="cursor:pointer;font-size:12px">작성 중인 원문 보기</summary><pre class="ai-out" id="ai-raw"></pre></details><div id="ai-prev"></div>`,
  foot:`<button class="btn" data-stop>중단</button><button class="btn" data-retry hidden>${ic('spark','s')}다시 생성</button><button class="btn pri" data-apply hidden>${ic('check','s')}${applyLabel}</button>`,onClose:()=>{ctl&&ctl.abort()}});
 const st=m.querySelector('#ai-st'),raw=m.querySelector('#ai-raw'),pv=m.querySelector('#ai-prev'),bStop=m.querySelector('[data-stop]'),bRetry=m.querySelector('[data-retry]'),bApply=m.querySelector('[data-apply]');
 const run=async()=>{ctl=new AbortController();bStop.hidden=false;bRetry.hidden=true;bApply.hidden=true;pv.innerHTML='';raw.textContent='';st.innerHTML=`<span class="spin"></span><span>Claude가 작성 중… 처음 응답까지 10~60초 걸릴 수 있습니다.</span>`;
  try{result=await Cap.sample.json(prompt,{modelTier:tier,cache:false,signal:ctl.signal,onText:({text})=>{raw.textContent=text;raw.scrollTop=raw.scrollHeight;st.innerHTML=`<span class="spin"></span><span>작성 중… ${text.length.toLocaleString()}자</span>`}});
   st.innerHTML=`<span class="pill ok">${ic('check','s')}완료</span><span class="muted" style="font-size:12px">내용을 확인하고 적용하세요. 적용하면 Claude 출처 태그가 붙은 새 버전이 만들어집니다.</span>`;pv.innerHTML=preview(result);bApply.hidden=false;bRetry.hidden=false;bStop.hidden=true}
  catch(e){bStop.hidden=true;bRetry.hidden=false;st.innerHTML=`<span class="pill bad">!</span><span>${esc(errMsg(e))}</span>`;if(e&&(e.code==='not_granted'||e.code==='sampling_disabled'))bRetry.hidden=true}};
 bStop.onclick=()=>{ctl&&ctl.abort()};bRetry.onclick=run;bApply.onclick=async()=>{bApply.disabled=true;try{await apply(result);m.close()}catch(e){console.error(e);toast('적용하지 못했습니다. '+errMsg(e),{err:true});bApply.disabled=false}};run()}
function scenesPreview(list){return `<div class="diff">${list.map((x,i)=>`<div class="d"><h6><span class="mono" style="color:var(--accent)">${pad(i+1)}</span> ${esc(x.chapter||'')} · ${esc(x.title||'')}</h6><div style="font-size:12.5px">${(x.lines||[]).map(esc).join('<br>')}</div><div class="muted" style="font-size:11.5px">${esc(x.headline||'')}${x.intent?' — '+esc(x.intent):''}</div></div>`).join('')}</div>`}
function aiDraft(){const p=S.proj;const has=p.scenes.some(s=>s.lines.some(l=>l.ko.trim()));let n='auto';
 const m=modal({title:'Claude로 스크립트 초안 만들기',body:`<p class="muted">기획 내용을 바탕으로 씬 구성, 나레이션, 화면 텍스트, 연출 제안까지 한 번에 만듭니다.${has?' <b style="color:var(--warn)">잠기지 않은 기존 씬은 새 초안으로 바뀝니다</b> (지금 상태는 버전으로 먼저 저장됩니다).':''}</p>
  <div class="field"><div class="lbl">씬 개수</div><div class="seg" id="ai-n">${[['auto','자동'],[3,'3'],[4,'4'],[5,'5'],[6,'6'],[8,'8']].map(([k,l])=>`<button aria-pressed="${k==='auto'}" data-k="${k}">${l}</button>`).join('')}</div></div>
  <div class="field"><label for="ai-extra">추가 지시 <span class="hint">선택</span></label><textarea class="ta" id="ai-extra" rows="3" placeholder="예: 첫 씬은 질문으로 시작, 숫자 근거를 한 번 넣어줘"></textarea></div>
  ${!p.brief.topic&&!p.brief.sourceText?'<p style="color:var(--warn);font-size:12px">주제나 원문 자료가 비어 있습니다. 채워 넣을수록 초안이 정확해집니다.</p>':''}`,
  foot:`<button class="btn" data-no>취소</button><button class="btn ai" data-ok>${ic('spark','s')}초안 만들기</button>`});
 m.querySelector('#ai-n').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;n=b.dataset.k;$$('#ai-n button').forEach(c=>c.setAttribute('aria-pressed',String(c===b)))};m.querySelector('[data-no]').onclick=()=>m.close();
 m.querySelector('[data-ok]').onclick=()=>{const extra=$('#ai-extra').value.trim();m.close();
  const prompt=`당신은 모션그래픽 영상 기획자이자 카피라이터입니다. 아래 기획으로 약 ${p.brief.duration}초 길이의 모션그래픽 씬 구성과 한국어 나레이션을 작성하세요.

규칙
- 씬 수: ${n==='auto'?'내용에 맞게 3~8개':n+'개'}. 기승전결이 있도록 도입-전개-정점-마무리 흐름.
- 나레이션은 소리 내어 읽기 자연스러운 구어체. lines 배열의 각 항목이 자막 한 줄이며 공백 포함 26자 이내로 의미 단위에서 끊기.
- 전체 나레이션 분량: 공백 제외 약 ${Math.round(p.brief.duration*(p.voice.speechRate||6)*0.82)}자 (초당 ${p.voice.speechRate||6}자 기준, 씬 전환 여유 포함).
- headline은 화면에 크게 뜨는 짧은 문구(12자 이내 권장), chapter는 VALUE·SENSING 같은 영문 대문자 한 단어.
- 연출 값은 씬의 감정에 맞게. 정점 씬은 energy 5, 마지막 씬은 차분하게. bgmHit은 장면 분위기가 크게 바뀌는 씬에만 true.
- 원문에 없는 사실·수치를 지어내지 말 것.${extra?`\n- 추가 지시: ${extra}`:''}

출력: JSON만. 형식 {"scenes":[${SCENE_SCHEMA}]}

[기획]
${briefForAI(p)}`;
  aiRun({title:'스크립트 초안',prompt,preview:r=>scenesPreview((r&&r.scenes)||[]),applyLabel:'초안 적용',apply:async r=>{const list=(r&&r.scenes)||[];if(!list.length)throw {message:'씬이 비어 있습니다'};
   if(has&&S.dirty)await commitVersion({label:'초안 생성 전 자동 저장',source:{kind:'user'}});
   const locked=p.scenes.filter(s=>s.locked);const gen=list.map(x=>sceneFromAI(x));let out=[];
   if(locked.length){let gi=0;p.scenes.forEach(s=>{if(s.locked)out.push(s);else if(gi<gen.length)out.push(gen[gi++])});while(gi<gen.length)out.push(gen[gi++])}else out=gen;
   p.scenes=out;p.scenes.forEach(s=>{if(!s.locked){s.start=null;s.end=null}});S.sel=0;await commitVersion({label:'Claude 초안',note:extra||'기획 기반 스크립트 초안 생성',source:{kind:'web',agent:'Claude (웹 내 생성)'}});go('script')}})}}
function aiScene(sid){const p=S.proj;const i=p.scenes.findIndex(s=>s.id===sid);const s=p.scenes[i];if(!s)return;if(s.locked)return toast('잠긴 씬은 다시 쓸 수 없습니다. 잠금을 해제한 뒤 다시 시도하세요.');
 const typed=($('#newnote')&&$('#newnote').value.trim())||'';const open=s.notes.filter(n=>!n.done).map(n=>n.text);
 const m=modal({title:`씬 ${i+1} 다시 쓰기`,body:`${open.length?`<div class="field"><div class="lbl">함께 반영할 미완료 지시</div><ul style="margin:0;padding-left:18px;font-size:12.5px">${open.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`:''}<div class="field"><label for="ai-ins">수정 지시</label><textarea class="ta" id="ai-ins" rows="4" placeholder="예: 더 짧고 단호하게, 헤드라인은 질문형으로">${esc(typed)}</textarea></div><p class="muted" style="font-size:12px">스틸·레퍼런스는 유지되고, 줄 수가 같으면 자막 타이밍과 번역도 유지됩니다.</p>`,
  foot:`<button class="btn" data-no>취소</button><button class="btn ai" data-ok>${ic('spark','s')}다시 쓰기</button>`});
 m.querySelector('[data-no]').onclick=()=>m.close();m.querySelector('[data-ok]').onclick=()=>{const ins=$('#ai-ins').value.trim();if(!ins&&!open.length){toast('수정 지시를 입력하세요.');return}m.close();
  const ctx=p.scenes.map((x,k)=>k===i?null:`${k+1}. [${x.chapter}] ${x.title}: ${x.lines.map(l=>l.ko).join(' ')}`).filter(Boolean).join('\n');
  const prompt=`당신은 모션그래픽 기획자입니다. 아래 영상의 씬 ${i+1}만 수정 지시에 맞게 다시 작성하세요. 앞뒤 씬과 흐름이 자연스럽게 이어져야 합니다.
규칙: 나레이션 lines는 자막 한 줄씩(26자 이내). 길이는 지시가 없으면 현재와 비슷하게. 원문에 없는 사실은 지어내지 말 것.
출력: JSON만. 형식 ${SCENE_SCHEMA.slice(0,-1)},"changeNote":"무엇을 바꿨는지 한 문장"}

[수정 지시]
${[...open,ins].filter(Boolean).map(t=>'- '+t).join('\n')}

[현재 씬 ${i+1}]
${JSON.stringify(sceneForAI(s,i),null,1)}

[다른 씬 (참고)]
${ctx}

[기획 요약]
${briefForAI({...p,brief:{...p.brief,sourceText:p.brief.sourceText.slice(0,6000)}})}`;
  aiRun({title:`씬 ${i+1} 다시 쓰기`,prompt,preview:r=>`${r.changeNote?`<p><b>${esc(r.changeNote)}</b></p>`:''}<div class="diff"><div class="d"><h6>나레이션</h6>${lineDiff(s.lines.map(l=>l.ko).join(' / '),(r.lines||[]).join(' / '))}</div><div class="d"><h6>헤드라인</h6>${lineDiff(s.onscreen.headline,r.headline||'')}</div><div class="d"><h6>의도</h6>${lineDiff(s.intent,r.intent||'')}</div></div>`,
   apply:async r=>{const ns=sceneFromAI(r,s);ns.still=s.still;ns.refs=s.refs;ns.notes=s.notes.map(n=>n.done?n:{...n,done:true,by:'Claude 반영'});if(ins)ns.notes.push({id:uid('n'),text:ins,done:true,at:Date.now(),by:'Claude 반영'});ns.start=s.start;ns.end=s.end;p.scenes[i]=ns;
    await commitVersion({label:`씬 ${i+1} 재생성`,note:[ins,...open].filter(Boolean).join(' / ')+(r.changeNote?`\n→ ${r.changeNote}`:''),source:{kind:'web',agent:'Claude (웹 내 생성)'}});const nn=$('#newnote');if(nn)nn.value='';refresh()}})}}
function aiReviseAll(){const p=S.proj;const m=modal({title:'전체 수정 지시',body:`<p class="muted">모든 씬에 적용할 지시를 적으세요. 잠긴 씬(${p.scenes.filter(s=>s.locked).length}개)은 그대로 둡니다. 각 씬의 미완료 지시도 함께 반영합니다.</p><textarea class="ta" id="ai-all" rows="5" placeholder="예: 전체적으로 존댓말을 더 담백하게, 전문 용어는 한 번 풀어서 설명"></textarea>`,foot:`<button class="btn" data-no>취소</button><button class="btn ai" data-ok>${ic('wand','s')}수정하기</button>`});
 m.querySelector('[data-no]').onclick=()=>m.close();m.querySelector('[data-ok]').onclick=()=>{const ins=$('#ai-all').value.trim();if(!ins&&!p.scenes.some(s=>s.notes.some(n=>!n.done))){toast('지시를 입력하세요.');return}m.close();
  const prompt=`당신은 모션그래픽 기획자입니다. 아래 씬 목록 전체를 지시에 맞게 수정하세요.
규칙: locked가 true인 씬은 내용을 바꾸지 말고 그대로 돌려줄 것. 기존 씬은 id를 그대로 유지. 새 씬을 추가할 때만 id를 null로. 각 씬의 openNotes(미완료 지시)도 반영. 나레이션 lines는 자막 한 줄씩(26자 이내). 목표 길이 약 ${p.brief.duration}초.
출력: JSON만. 형식 {"changeNote":"한두 문장 요약","scenes":[${SCENE_SCHEMA.slice(0,-1)},"id":"기존 id 또는 null"}]}

[전체 지시]
${ins||'(각 씬의 openNotes만 반영)'}

[씬 목록]
${JSON.stringify(p.scenes.map(sceneForAI),null,1)}

[기획 요약]
${briefForAI({...p,brief:{...p.brief,sourceText:p.brief.sourceText.slice(0,6000)}})}`;
  aiRun({title:'전체 수정',prompt,preview:r=>`${r.changeNote?`<p><b>${esc(r.changeNote)}</b></p>`:''}${scenesPreview(r.scenes||[])}`,apply:async r=>{const list=r.scenes||[];if(!list.length)throw {message:'씬이 비어 있습니다'};if(S.dirty)await commitVersion({label:'전체 수정 전 자동 저장',source:{kind:'user'}});
   const byId=new Map(p.scenes.map(s=>[s.id,s]));const out=list.map(x=>{const old=x.id&&byId.get(x.id);if(old&&old.locked)return old;const ns=sceneFromAI(x,old||null);if(old){ns.still=old.still;ns.refs=old.refs;ns.notes=old.notes.map(n=>n.done?n:{...n,done:true,by:'Claude 반영'});ns.start=old.start;ns.end=old.end}return ns});
   p.scenes.filter(s=>s.locked&&!out.includes(s)).forEach(s=>out.push(s));p.scenes=out;if(out.some(s=>s.start==null))out.forEach(s=>{s.start=null;s.end=null});
   await commitVersion({label:'전체 수정',note:(ins||'씬별 지시 반영')+(r.changeNote?`\n→ ${r.changeNote}`:''),source:{kind:'web',agent:'Claude (웹 내 생성)'}});refresh()}})}}
function aiTranslate(sid){const p=S.proj;const langs=enabledLangs(p).filter(l=>l!=='ko');if(!langs.length)return toast('기획 단계에서 일본어·영어를 먼저 켜세요.');
 const scenes=sid?p.scenes.filter(s=>s.id===sid):p.scenes;const items=[];scenes.forEach(s=>s.lines.forEach(l=>{if(l.ko.trim()&&langs.some(lg=>!String(l[lg]||'').trim()))items.push({id:l.id,ko:l.ko})}));
 if(!items.length)return toast('비어 있는 번역이 없습니다.');
 const prompt=`다음은 모션그래픽 영상의 한국어 나레이션 자막입니다. 각 줄을 ${langs.map(l=>({ja:'일본어',en:'영어'})[l]).join('와 ')}로 번역하세요.
규칙: 자막용으로 짧고 자연스럽게, 원문 한 줄당 한 줄. 일본어는 정중한 です・ます체 또는 광고 카피체로 원문 톤에 맞추기. 고유명사·브랜드명은 원어 유지.
영상 맥락: ${p.title} — ${p.brief.topic.slice(0,300)}
출력: JSON만. 형식 {${langs.map(l=>`"${l}":{"줄id":"번역"}`).join(',')}}

[자막]
${items.map(x=>`${x.id}\t${x.ko}`).join('\n')}`;
 aiRun({title:`번역 채우기 (${items.length}줄)`,prompt,tier:'default',preview:r=>`<div class="diff">${items.slice(0,40).map(x=>`<div class="d"><div style="font-size:12.5px">${esc(x.ko)}</div>${langs.map(l=>`<div class="muted" style="font-size:12px">${LSHORT[l]} · ${esc((r[l]||{})[x.id]||'—')}</div>`).join('')}</div>`).join('')}</div>`,applyLabel:'빈 칸에 채우기',
  apply:async r=>{let n=0;p.scenes.forEach(s=>s.lines.forEach(l=>langs.forEach(lg=>{const v=(r[lg]||{})[l.id];if(v&&!String(l[lg]||'').trim()){l[lg]=String(v);n++}})));await commitVersion({label:'번역 채우기',note:`${langs.map(l=>LANGS[l]).join('·')} ${n}칸`,source:{kind:'web',agent:'Claude (웹 내 생성)'}});refresh();toast(`번역 ${n}칸을 채웠습니다.`)}})}

/* ================= HELP ================= */
function openHelp(first=false){const m=modal({title:first?'모션 브리프 스튜디오 시작하기':'사용 방법',cls:'mid',body:`<p style="color:var(--fg-2)">모션그래픽을 <b>기획 → 스크립트 → 나레이션 → 씬 편집 → 내보내기</b> 순서로 다듬는 도구입니다. 결과물은 다른 Claude 작업에 그대로 넘길 수 있는 <b>제작 안내서(brief.md)</b>와 애니마틱 MP4·썸네일입니다.</p>
 <div class="help-steps">${[['기획','주제·메시지·길이·스타일·레퍼런스·BGM 성격을 정합니다. 비워 둔 칸은 Claude가 채웁니다.'],['스크립트','씬마다 나레이션(한 줄 = 자막 한 줄), 화면 텍스트, 제작 의도를 씁니다. Claude 초안·번역·전체 수정을 쓸 수 있습니다.'],['나레이션','스타일 지시문과 본문을 복사해 Google AI Studio TTS에서 음성을 만들고, 오디오를 올리면 타이밍이 자동으로 맞춰집니다.'],['씬 편집','애니마틱을 보며 연출 컨트롤(분위기 프리셋·카메라·효과·전환), 스틸, 다국어 자막, 수정 지시를 다룹니다. 타임라인 경계를 끌어 길이를 조절합니다.'],['내보내기','brief.md, ZIP 패키지, SRT, 썸네일, 애니마틱 MP4를 받고, 완성 영상이나 수정된 안내서를 가져와 버전으로 남깁니다.']].map(([h,t],i)=>`<div><span class="n">${i+1}</span><div><h4>${h}</h4><p>${t}</p></div></div>`).join('')}</div>
 <div class="divider"></div><h4 style="font-size:13.5px">버전과 출처</h4><p class="muted" style="font-size:12.5px">작업은 자동 저장되고, ‘버전 저장’(⌘S)을 누르거나 Claude 생성·가져오기를 하면 버전이 쌓입니다. 각 버전에는 <span class="src">WEB</span> <span class="src web">CLAUDE·WEB</span> <span class="src code">CLAUDE CODE</span> <span class="src git">GITHUB</span> 같은 출처 태그가 붙어 여러 에이전트가 함께 작업해도 누가 무엇을 바꿨는지 보입니다. 좌상단 버전 버튼에서 비교·복원할 수 있습니다.</p>
 <div class="divider"></div><h4 style="font-size:13.5px">단축키</h4><div class="shortcuts">${[['⌘ S','버전 저장'],['⌘ Z / ⇧⌘ Z','되돌리기 / 다시 실행'],['Space','재생 / 정지 (씬 편집)'],['↑ ↓','이전 / 다음 씬'],['C','자막 보이기 전환'],['G','세이프 영역 가이드'],['H','버전 기록'],['B','BGM 설정'],['?','이 도움말']].map(([k,t])=>`<span class="kbd">${k}</span><span>${t}</span>`).join('')}</div>
 <p class="muted" style="font-size:12px">프로젝트와 버전은 이 페이지의 저장소에 보관돼, 페이지를 공유받은 사람도 같은 프로젝트를 보고 편집할 수 있습니다.</p>`,
 foot:first?`<button class="btn" data-act="sample">${ic('film','s')}예시 프로젝트 보기</button><button class="btn pri" data-start>시작하기</button>`:`<button class="btn pri" data-start>닫기</button>`});m.querySelector('[data-start]').onclick=()=>m.close();if(first)lsSet('mbs:welcomed',1)}
