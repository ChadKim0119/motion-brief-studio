/* ================= binding / edits ================= */
function findRef(scope,rid){const list=scope==='p'?S.proj.refs:(S.proj.scenes.find(x=>x.id===scope)||{refs:[]}).refs;return list.find(r=>r.id===rid)}
function resolve(path){let root,rest;
 if(path.startsWith('p.')){root=S.proj;rest=path.slice(2)}
 else if(path.startsWith('s.')){root=cur();rest=path.slice(2)}
 else if(path.startsWith('ui.')){root=S;rest=path.slice(3)}
 else if(path.startsWith('S:')){const i=path.indexOf('.');const sid=path.slice(2,i);root=S.proj.scenes.find(x=>x.id===sid);rest=path.slice(i+1)}
 else if(path.startsWith('L:')){const i=path.indexOf('.');const [sid,lid]=path.slice(2,i).split(':');const sc=S.proj.scenes.find(x=>x.id===sid);root=sc&&sc.lines.find(l=>l.id===lid);rest=path.slice(i+1)}
 else if(path.startsWith('R:')){const i=path.indexOf('.');const [scope,rid]=path.slice(2,i).split(':');root=findRef(scope,rid);rest=path.slice(i+1)}
 if(!root)return [null,null];const ks=rest.split('.');let o=root;for(let i=0;i<ks.length-1;i++){if(o[ks[i]]==null)o[ks[i]]={};o=o[ks[i]]}return [o,ks[ks.length-1]]}
function getPath(path){const [o,k]=resolve(path);return o?o[k]:undefined}
function setPath(path,v){const [o,k]=resolve(path);if(!o)return false;o[k]=v;return true}

const pushUndo=debounce(()=>{if(!S.proj)return;const j=JSON.stringify(S.proj);if(S.undo[S.undo.length-1]===j)return;S.undo.push(j);if(S.undo.length>80)S.undo.shift();S.redo=[];S.dirty++;renderTop()},500);
function touch(path,{structural=false}={}){if(!S.proj)return;
 S.proj.updatedAt=Date.now();pushUndo();scheduleSave();
 if(structural)refresh();else{live();Player.redrawAll();if(S.view==='edit'&&/^(s\.|S:|L:)/.test(path||''))renderTimeline()}}
function undo(){pushUndo.flush();if(S.undo.length<2)return toast('되돌릴 변경이 없습니다.');S.redo.push(S.undo.pop());S.proj=norm(JSON.parse(S.undo[S.undo.length-1]));scheduleSave();refresh();toast('되돌렸습니다.')}
function redo(){if(!S.redo.length)return;const j=S.redo.pop();S.undo.push(j);S.proj=norm(JSON.parse(j));scheduleSave();refresh();toast('다시 적용했습니다.')}

/* ================= save / open / versions ================= */
function metaOf(p){const tl=timeline(p);return {title:p.title,stage:p.stage,updatedAt:p.updatedAt,createdAt:p.createdAt,scenes:p.scenes.length,duration:+tl.total.toFixed(1),aspect:p.brief.aspect,palette:p.brief.palette,stills:p.scenes.slice(0,8).map(s=>s.still&&s.still.assetId||null),lastV:(S.versions[0]&&S.versions[0].n)||0,example:!!p.example,thumb:(p.thumb&&p.thumb.assetId)||null}}
let _lastMeta='';
const scheduleSave=debounce(()=>saveNow(),1100);
async function saveNow(){if(!S.proj||!S.pid)return;const p=S.proj;S.save='busy';renderSave();
 try{const json=JSON.stringify(p);if(json.length>250000)throw {code:'invalid_argument',message:'프로젝트 데이터가 너무 큽니다 (250KB). 원문 자료를 줄이세요.'};
  await Store.saveDraft(S.pid,{...p,_writer:CLIENT});const m=metaOf(p);const mj=JSON.stringify(m);if(mj!==_lastMeta){await Store.saveMeta(S.pid,m);_lastMeta=mj}
  S.save='ok';S.savedAt=Date.now()}catch(e){S.save='err';toast(e&&e.code==='invalid_argument'&&!e.message?'저장 권한이 없어 저장되지 않았습니다.':errMsg(e),{err:true})}renderSave()}
const CLIENT=uid('c');
let unsubV=null,unsubD=null;
async function openProject(pid,{view}={}){
 Player.stop();S.versions=[];S.undo=[];S.redo=[];S.dirty=0;S.sel=0;S.t=0;S.tab='content';S.remoteBanner=false;
 let d=await Store.getDraft(pid);if(!d){toast('프로젝트를 찾을 수 없습니다. 목록에서 다시 여세요.',{err:true});return go('home')}
 S.proj=norm(d);S.pid=pid;S.undo=[JSON.stringify(S.proj)];_lastMeta='';
 unsubV&&unsubV();unsubV=Store.subVersions(pid,vs=>{S.versions=vs;S.base=vs[0]?vs[0].snapshot:null;renderTop();if($('.drawer'))renderHistory()});
 unsubD&&unsubD();unsubD=Store.subDraft(pid,d=>{if(!d||d._writer===CLIENT||!S.proj)return;if((d.updatedAt||0)>(S.proj.updatedAt||0)+500){S.remoteBanner=d;renderBanner()}});
 lsSet('mbs:last',pid);
 go(view||VIEWS[clamp((S.proj.stage||1)-1,0,4)][0]);
 if(S.proj.narration&&S.proj.narration.assetId)audioBuffer(S.proj.narration.assetId).then(()=>{Player.redrawAll()}).catch(()=>{});
}
function renderBanner(){const b=$('#banner');if(!b)return;b.hidden=!S.remoteBanner;if(S.remoteBanner)b.innerHTML=`${ic('history')}<span>다른 창이나 사용자가 이 프로젝트를 수정했습니다.</span><span class="sp"></span><button class="btn sm" data-act="loadRemote">최신 내용 불러오기</button><button class="btn sm ghost" data-act="dismissRemote">무시</button>`}
function diffSummary(a,b){if(!a)return ['첫 버전'];const out=[];
 if(a.title!==b.title)out.push('제목 변경');
 if(JSON.stringify(a.brief)!==JSON.stringify(b.brief))out.push('기획 수정');
 const ai=new Map(a.scenes.map((s,i)=>[s.id,s]));const bi=new Set(b.scenes.map(s=>s.id));
 const add=b.scenes.filter(s=>!ai.has(s.id)).length,rem=a.scenes.filter(s=>!bi.has(s.id)).length;
 if(add)out.push(`씬 ${add}개 추가`);if(rem)out.push(`씬 ${rem}개 삭제`);
 if(!add&&!rem&&a.scenes.map(s=>s.id).join()!==b.scenes.map(s=>s.id).join())out.push('씬 순서 변경');
 b.scenes.forEach((s,i)=>{const o=ai.get(s.id);if(!o)return;const ch=[];
  const txt=x=>x.lines.map(l=>l.ko+'|'+l.ja+'|'+l.en).join('/');
  if(txt(o)!==txt(s))ch.push('나레이션');
  if(o.lines.map(l=>l.start+'-'+l.end).join()!==s.lines.map(l=>l.start+'-'+l.end).join()||o.start!==s.start||o.end!==s.end)ch.push('타이밍');
  if(JSON.stringify(o.onscreen)!==JSON.stringify(s.onscreen))ch.push('화면 텍스트');
  if(o.intent!==s.intent||o.visual!==s.visual||o.title!==s.title||o.chapter!==s.chapter)ch.push('의도·비주얼');
  if(JSON.stringify(o.dir)!==JSON.stringify(s.dir)||o.bgmHit!==s.bgmHit)ch.push('연출');
  if(JSON.stringify(o.still)!==JSON.stringify(s.still))ch.push('스틸');
  if(o.refs.length!==s.refs.length)ch.push('레퍼런스');
  if(o.notes.length!==s.notes.length||o.notes.filter(n=>n.done).length!==s.notes.filter(n=>n.done).length)ch.push('수정 지시');
  if(o.status!==s.status||o.locked!==s.locked)ch.push('상태');
  if(ch.length)out.push(`씬 ${i+1} ${ch.join('·')}`)});
 if(JSON.stringify(a.bgm)!==JSON.stringify(b.bgm))out.push('BGM 설정');
 if(JSON.stringify(a.narration&&a.narration.assetId)!==JSON.stringify(b.narration&&b.narration.assetId))out.push('나레이션 오디오');
 if(JSON.stringify(a.langs)!==JSON.stringify(b.langs)||JSON.stringify(a.subs)!==JSON.stringify(b.subs))out.push('자막 설정');
 if(JSON.stringify(a.voice)!==JSON.stringify(b.voice))out.push('보이스 디렉션');
 if(JSON.stringify(a.refs)!==JSON.stringify(b.refs))out.push('전체 레퍼런스');
 if(JSON.stringify(a.thumb)!==JSON.stringify(b.thumb))out.push('썸네일');
 return out.length?out:['변경 없음']}
async function commitVersion({label='',note='',source={kind:'user'},attach=null,snapshot=null}={}){
 pushUndo.flush();if(!S.proj)return;const snap=clone(snapshot||S.proj);const n=(S.versions[0]?S.versions[0].n:0)+1;
 const v={id:'v'+pad(n,4),n,label:label||'',note:note||'',source,author:S.me.id||null,at:Date.now(),stage:snap.stage,summary:diffSummary(S.base,snap),snapshot:snap,attach:attach||null};
 const js=JSON.stringify(v);if(js.length>250000){toast('버전 데이터가 너무 큽니다. 원문 자료를 줄이세요.',{err:true});return null}
 try{await Store.addVersion(S.pid,v);if(!S.versions.some(x=>x.id===v.id))S.versions=[v,...S.versions];S.base=snap;S.dirty=0;scheduleSave();renderTop();toast(`v${n}을 저장했습니다.`);return v}catch(e){toast(errMsg(e),{err:true});return null}}

/* ================= navigation & render ================= */
function go(view){if(view!=='edit')Player.pause();S.view=view;if(S.proj){const i=VIEWS.findIndex(v=>v[0]===view);if(i>=0&&i+1>S.proj.stage){S.proj.stage=i+1;scheduleSave()}}render()}
function render(){renderTop();renderMain()}
function refresh(){if(S.view==='edit'){renderSceneList();renderInspector();renderTimeline();Player.resize();Player.redrawAll();renderTop();return}
 const v=$('.view');const st=v?v.scrollTop:0;renderMain();const v2=$('.view');if(v2)v2.scrollTop=st;renderTop()}
const LOGO=`<span class="logo-mark"><svg viewBox="0 0 24 24"><path d="M7 6.5l9.5 5.5L7 17.5z" fill="#ffffff"/><path d="M18.6 3.6l2.2 2.2-2.2 2.2-2.2-2.2z" fill="#87d0df"/></svg></span>`;
function renderSave(){const el=$('#savestate');if(!el)return;el.className='savestate'+(S.save==='busy'?' busy':S.save==='err'?' err':'');el.innerHTML=`<i></i><span>${S.save==='busy'?'저장 중…':S.save==='err'?'저장 실패':S.local?'이 브라우저에 저장됨':'자동 저장됨'}</span>`}
function renderTop(){const t=$('#top');if(!S.proj||S.view==='home'){t.innerHTML=`<button class="logo" data-act="home" title="프로젝트 목록">${LOGO}<span class="logo-word">Motion Brief Studio</span></button><span class="sp"></span><div class="top-r">${S.local?'<span class="pill warn" title="Claude 밖에서 열려 브라우저에만 저장됩니다">로컬 모드</span>':''}<button class="btn sm" data-act="import">${ic('import','s')}안내서 가져오기</button><button class="ibtn" data-act="help" title="사용 방법 (?)" aria-label="도움말">${ic('help')}</button></div>`;return}
 const v=S.versions[0];const vk=v&&v.source&&v.source.kind||'user';const vc=(SRC[vk]||SRC.user).c;
 const si=VIEWS.findIndex(x=>x[0]===S.view);
 t.innerHTML=`<button class="logo" data-act="home" title="프로젝트 목록">${LOGO}</button>
 <button class="vbtn" data-act="history" title="버전 기록 열기 (H)" aria-label="버전 기록">${ic('history','s')}<b>${v?'v'+v.n:'v0'}</b>${v?`<span class="dot" style="background:var(--src-${vc||'user'})"></span>`:''}${S.dirty?`<span class="chg" title="마지막 버전 이후 변경">+${S.dirty}</span>`:''}${ic('chev','s')}</button>
 <input class="ptitle" id="ptitle" data-bind="p.title" value="${esc(S.proj.title)}" aria-label="프로젝트 이름">
 <nav class="steps" aria-label="제작 단계">${VIEWS.map(([k,n],i)=>`<button class="step ${S.view===k?'on':''} ${i<si?'done':''}" data-act="go" data-arg="${k}"><span class="n">${i<si?'✓':i+1}</span>${n}</button>`).join('')}</nav>
 <div class="top-r"><span id="savestate"></span>
 <button class="ibtn" data-act="undo" title="되돌리기 (⌘Z)" aria-label="되돌리기">${ic('undo')}</button>
 <button class="ibtn" data-act="redo" title="다시 실행 (⇧⌘Z)" aria-label="다시 실행">${ic('redo')}</button>
 <button class="ibtn" data-act="bgm" title="BGM 설정 (B)" aria-label="BGM 설정">${ic('music')}</button>
 <button class="btn sm pri" data-act="saveVersion" title="지금 상태를 버전으로 저장">${ic('save','s')}버전 저장<kbd>⌘S</kbd></button>
 <button class="ibtn" data-act="help" title="사용 방법 (?)" aria-label="도움말">${ic('help')}</button></div>`;
 renderSave()}
function renderMain(){const m=$('#main');const f={home:viewHome,brief:viewBrief,script:viewScript,narr:viewNarr,edit:viewEdit,export:viewExport}[S.view]||viewHome;
 const ban=S.view!=='home'?`<div class="banner" id="banner" hidden></div>`:'';
 if(S.view==='edit'){m.innerHTML=`<div style="height:100%;display:grid;grid-template-rows:auto 1fr">${ban}${f()}</div>`;mountEdit()}
 else{m.innerHTML=`<div class="view">${ban}${f()}</div>`;(MOUNT[S.view]||(()=>{}))()}
 renderBanner()}
const MOUNT={};

/* ================= LIVE (cheap computed text) ================= */
const LIVE={
 total:()=>secs(timeline(S.proj).total),
 chars:()=>S.proj.scenes.reduce((a,s)=>a+s.lines.reduce((b,l)=>b+nonspace(l.ko),0),0).toLocaleString(),
 sdur:sid=>{const g=timeline(S.proj).segs.find(x=>x.s.id===sid);return g?(g.end-g.start).toFixed(1)+'s':''},
 stitle:sid=>{const s=S.proj.scenes.find(x=>x.id===sid);return esc(s&&(s.title||s.lines[0].ko.slice(0,18))||'제목 없음')},
 meter:()=>{const tl=timeline(S.proj);const tgt=S.proj.brief.duration||45;const k=tl.total/tgt;return `<div class="meter ${k>1.08?'over':''}"><i style="width:${Math.min(100,k*100)}%"></i></div><div class="row" style="justify-content:space-between;margin-top:6px;font-size:11.5px"><span class="muted">예상 ${secs(tl.total)}</span><span class="${k>1.08?'mismatch':'muted'}">목표 ${secs(tgt)} ${k>1.08?'· '+Math.round((k-1)*100)+'% 초과':k<.85?'· 여유 있음':''}</span></div>`},
 mismatch:sid=>{const s=S.proj.scenes.find(x=>x.id===sid);if(!s)return '';const n=s.lines.length;const bad=enabledLangs(S.proj).filter(l=>l!=='ko'&&s.lines.some(x=>x.ko.trim()&&!String(x[l]||'').trim()));return bad.length?`<span class="mismatch">${bad.map(l=>LSHORT[l]).join('·')} 번역 비어 있음</span>`:`<span class="muted">${n}줄</span>`},
 ttsBody:()=>esc(ttsBody(S.proj,S.proj.tts.lang,S.proj.tts.sceneBreak)),
 ttsStyle:()=>esc(styleInstruction(S.proj)),
 ttsCount:()=>{const b=ttsBody(S.proj,S.proj.tts.lang,S.proj.tts.sceneBreak);return `${b.replace(/\s/g,'').length.toLocaleString()}자 · 약 ${secs(b.replace(/\s/g,'').length/(S.proj.voice.speechRate||6))}`},
 bgmWords:()=>esc(moodWords(S.proj.bgm)),
 bgmKo:()=>esc(bgmBriefKo(S.proj)),
 bgmEn:()=>esc(bgmPromptEn(S.proj)),
 thumbTitle:()=>'',
};
function live(){if(!S.proj)return;for(const el of $$('[data-live]')){const f=LIVE[el.dataset.live];if(f){const h=f(el.dataset.arg);if(el.innerHTML!==h)el.innerHTML=h}}}

/* ================= HOME ================= */
function viewHome(){const ps=S.projects.slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
 return `<div class="wrap">
 <section class="hero"><div><div class="eyebrow" style="margin-bottom:12px">모션그래픽 기획 · 편집 · 버전 관리</div><h1>스크립트에서 <em>제작 안내서</em>까지,<br>한 화면에서 다듬기</h1><p>주제를 정하면 Claude가 씬 구성과 나레이션 초안을 만들고, 오디오에 맞춰 타이밍과 연출을 편집합니다. 마지막엔 다른 Claude 작업에 그대로 넘길 제작 안내서, 애니마틱 MP4, 썸네일을 받습니다.</p></div>
 <div class="row" style="justify-content:flex-end"><button class="btn lg" data-act="import">${ic('import')}안내서 가져오기</button><button class="btn lg pri" data-act="newProject">${ic('plus')}새 프로젝트</button></div></section>
 <div class="flow">${[
  ['기획','주제, 핵심 메시지, 길이·화면비, 비주얼 스타일, 레퍼런스, BGM 성격을 정합니다.','brief'],
  ['스크립트','씬마다 나레이션·화면 텍스트·제작 의도를 씁니다. Claude 초안과 번역을 쓸 수 있습니다.','scenes[]'],
  ['나레이션','TTS용 텍스트와 보이스 지시문을 복사해 Gemini에서 음성을 만든 뒤, 오디오를 올립니다.','narration.txt'],
  ['씬 편집','오디오에 맞춰 타이밍이 자동 정렬됩니다. 연출 컨트롤·스틸·다국어 자막을 다듬습니다.','animatic'],
  ['내보내기','제작 안내서(brief.md), 패키지 ZIP, 애니마틱 MP4, 썸네일, 자막 SRT를 받습니다.','brief.md · mp4']
 ].map(([h,p,o],i)=>`<div><span class="n">${pad(i+1)}</span><h4>${h}</h4><p>${p}</p><span class="out">${o}</span></div>`).join('')}</div>
 <div class="loop"><b>Claude와 주고받기</b><span>brief.md 내보내기</span><span class="arr">→</span><span>다른 프로젝트의 Claude에게 제작 요청</span><span class="arr">→</span><span>최종 MP4 · 수정된 brief.md 가져오기</span><span class="arr">→</span><span>출처 태그가 붙은 새 버전</span></div>
 <div class="sec-h" style="margin-bottom:12px"><h3>프로젝트 ${ps.length?`<span class="muted" style="font-weight:400">${ps.length}</span>`:''}</h3>${ps.length?`<button class="btn sm ghost" data-act="sample">${ic('film','s')}예시 프로젝트 추가</button>`:''}</div>
 ${ps.length?`<div class="plist">${ps.map(pcard).join('')}</div>`:`<div class="empty"><h4>아직 프로젝트가 없습니다</h4><p>새 프로젝트를 만들거나, 예시 프로젝트(e-Care 컨셉 영상)로 전체 흐름을 먼저 살펴보세요.</p><div class="row" style="justify-content:center"><button class="btn" data-act="sample">${ic('film')}예시 프로젝트 열기</button><button class="btn pri" data-act="newProject">${ic('plus')}새 프로젝트</button></div></div>`}
 </div>`}
function pcard(m){const pal=m.palette||{bg:'#111',primary:'#888'};const st=(m.stills||[]).slice(0,6);while(st.length<4)st.push(null);
 return `<div class="pcard" role="button" tabindex="0" data-act="open" data-arg="${esc(m.id)}"><div class="pstrip">${st.map((id,i)=>`<i style="background-color:${i%2?pal.primary:pal.bg};${id?`background-image:url('${Store.url(id)}')`:''};opacity:${id?1:.55+.1*i}"></i>`).join('')}</div>
 <div class="pbody"><h4>${esc(m.title||'제목 없음')}</h4><div class="pmeta">${m.example?'<span class="pill acc">예시</span>':''}<span class="pill">${VIEWS[clamp((m.stage||1)-1,0,4)][1]}</span><span class="mono">v${m.lastV||0}</span><span>씬 ${m.scenes||0}</span><span>${secs(m.duration||0)}</span><span class="sp"></span><span>${rel(m.updatedAt)}</span><button class="ibtn sm" data-act="delProject" data-arg="${esc(m.id)}" title="삭제" aria-label="프로젝트 삭제">${ic('trash','s')}</button></div></div></div>`}

/* ================= BRIEF ================= */
function viewBrief(){const p=S.proj,b=p.brief;const langs=enabledLangs(p);
 return `<div class="wrap">
 <div class="page-h"><div><div class="eyebrow">STEP 01 · 기획</div><h2>무엇을, 누구에게, 어떤 느낌으로</h2><p>여기 적은 내용이 Claude의 스크립트 초안과 제작 안내서의 기준이 됩니다. 비워 둔 항목은 Claude가 알아서 정합니다.</p></div></div>
 <div class="bgrid">
  <section class="card sec"><div class="sec-h"><h3>기본 정보</h3></div>
   <div class="field"><label for="b-topic">주제 · 한 줄 설명<span class="hint">무엇을 설명하는 영상인지 적습니다</span></label><textarea class="ta" id="b-topic" rows="3" data-bind="p.brief.topic" placeholder="예: 고객이 문제를 알기 전에 먼저 진단하고 연락하는 커넥티드카 케어 서비스">${esc(b.topic)}</textarea></div>
   <div class="field"><label>핵심 메시지<span class="hint">시청자가 기억할 1~3가지</span></label>${b.messages.map((m,i)=>`<input class="in" id="b-msg${i}" data-bind="p.brief.messages.${i}" value="${esc(m)}" placeholder="${['메시지 1 (가장 중요)','메시지 2','메시지 3'][i]}">`).join('')}</div>
   <div class="field"><label for="b-aud">타겟 시청자</label><input class="in" id="b-aud" data-bind="p.brief.audience" value="${esc(b.audience)}" placeholder="예: 신차 구매 고객, 딜러사 임원"></div>
  </section>
  <section class="card sec"><div class="sec-h"><h3>형식</h3></div>
   <div class="field"><div class="lbl">목표 길이<span class="mono" style="font-size:13px">${b.duration}초</span></div><input type="range" id="b-dur" min="10" max="180" step="5" value="${b.duration}" style="${rangeStyle(b.duration,10,180)}" data-bind="p.brief.duration" data-num data-rerender>
    <div class="chips">${[15,30,45,60,90,120].map(x=>`<button class="chip" aria-pressed="${b.duration===x}" data-set="p.brief.duration" data-v="${x}" data-num>${x}초</button>`).join('')}</div></div>
   <div class="field"><div class="lbl">화면비</div>${seg('p.brief.aspect',ASPECTS.map(a=>[a[0],a[1]]),b.aspect)}</div>
   <div class="grid2"><div class="field"><div class="lbl">프레임레이트</div>${seg('p.brief.fps',[[24,'24'],[30,'30'],[60,'60']],b.fps,'data-num')}</div>
   <div class="field"><div class="lbl">레터박스</div><div class="trow" style="padding:0"><span class="muted" style="font-size:12px">위아래 시네마 바</span><button class="toggle" aria-pressed="${b.letterbox}" data-flip="p.brief.letterbox" aria-label="레터박스"></button></div></div></div>
   <div class="field"><div class="lbl">나레이션 속도<span class="hint">길이 예측용 · 초당 글자 수(공백 제외)</span></div><div class="range-row"><span>느림</span><input type="range" id="b-rate" min="4" max="9" step="0.1" value="${p.voice.speechRate}" style="${rangeStyle(p.voice.speechRate,4,9)}" data-bind="p.voice.speechRate" data-num><b>${p.voice.speechRate}</b></div></div>
  </section>
  <section class="card sec span"><div class="sec-h"><h3>비주얼 스타일</h3><span class="muted" style="font-size:12px">스타일을 고르면 팔레트·폰트·레터박스가 함께 바뀝니다</span></div>
   <div class="styles">${STYLES.map(s=>`<button class="stycard" aria-pressed="${b.style===s.k}" data-act="style" data-arg="${s.k}"><div class="pv" style="background:${s.pal.bg}"><span style="position:absolute;left:10px;top:9px;width:40%;height:7px;border-radius:3px;background:${s.pal.text};opacity:.9"></span><span style="position:absolute;left:10px;top:21px;width:26%;height:5px;border-radius:3px;background:${s.pal.primary}"></span><span style="position:absolute;right:10px;bottom:8px;width:16px;height:16px;border-radius:50%;background:${s.pal.accent}"></span>${s.letterbox?'<span style="position:absolute;left:0;right:0;top:0;height:5px;background:#000"></span><span style="position:absolute;left:0;right:0;bottom:0;height:5px;background:#000"></span>':''}</div><b>${s.n}</b><span>${s.d}</span></button>`).join('')}</div>
   <div class="grid3" style="grid-template-columns:repeat(4,minmax(0,1fr)) 1.4fr">${[['bg','배경'],['primary','주 색상'],['accent','보조 색상'],['text','텍스트']].map(([k,n])=>`<label class="sw"><input type="color" id="pal-${k}" value="${esc(b.palette[k])}" data-bind="p.brief.palette.${k}"><span>${n}</span><span class="mono">${esc(b.palette[k])}</span></label>`).join('')}
    <div class="field"><input class="in" id="b-font" list="fontlist" data-bind="p.brief.font" value="${esc(b.font)}" placeholder="폰트"><datalist id="fontlist">${FONTS.map(f=>`<option value="${f}">`).join('')}</datalist></div></div>
  </section>
  <section class="card sec"><div class="sec-h"><h3>언어 · 자막</h3></div>
   <div class="trow"><span>한국어 <span class="pill">기본</span></span><button class="toggle" aria-pressed="true" disabled aria-label="한국어 (항상 사용)"></button></div>
   <div class="trow"><span>일본어 자막·나레이션 편집</span><button class="toggle" aria-pressed="${p.langs.ja}" data-flip="p.langs.ja" data-rerender aria-label="일본어 사용"></button></div>
   <div class="trow"><span>영어 자막·나레이션 편집</span><button class="toggle" aria-pressed="${p.langs.en}" data-flip="p.langs.en" data-rerender aria-label="영어 사용"></button></div>
   <div class="divider"></div>
   <div class="trow"><span>자막 기본 표시</span><button class="toggle" aria-pressed="${p.subs.show}" data-flip="p.subs.show" aria-label="자막 표시"></button></div>
   <div class="field"><div class="lbl">주 자막</div>${seg('p.subs.lang',langs.map(l=>[l,LANGS[l]]),p.subs.lang)}</div>
   <div class="field"><div class="lbl">보조 자막 <span class="hint">주 자막 아래 작게</span></div>${seg('p.subs.second',[['','없음'],...langs.filter(l=>l!==p.subs.lang).map(l=>[l,LANGS[l]])],p.subs.second)}</div>
  </section>
  <section class="card sec"><div class="sec-h"><h3>사운드</h3></div>
   <div style="display:grid;gap:8px"><div class="eyebrow">BGM</div><div style="font-weight:600" data-live="bgmWords">${esc(moodWords(p.bgm))}</div><div class="muted" style="font-size:12px">${p.bgm.bpm} BPM · ${esc(p.bgm.genres.join(', ')||'장르 미정')}</div><div><button class="btn sm" data-act="bgm">${ic('sliders','s')}BGM 설정 열기</button></div></div>
   <div class="divider"></div>
   <div style="display:grid;gap:8px"><div class="eyebrow">나레이션 보이스</div><div style="font-weight:600">${esc(p.voice.gender)} · ${esc(p.voice.age)} · ${esc(p.voice.tones.join(', '))}</div><div class="muted" style="font-size:12px">${p.narration?'오디오 업로드됨 · '+secs(p.narration.duration):'오디오 없음 · 3단계에서 올립니다'}</div><div><button class="btn sm" data-act="go" data-arg="narr">${ic('mic','s')}보이스 설정</button></div></div>
  </section>
  <section class="card sec span"><div class="sec-h"><h3>원문 자료 · 제작 메모</h3><span class="muted" style="font-size:12px">기획서, 서비스 설명, 기존 스크립트를 붙여 넣거나 .md/.txt 파일을 끌어다 놓으세요</span></div>
   <div class="grid2"><div class="field"><label for="b-src">원문 자료<span class="hint">${(b.sourceText||'').length.toLocaleString()}자</span></label><textarea class="ta" id="b-src" rows="8" data-bind="p.brief.sourceText" data-dropText="p.brief.sourceText" placeholder="여기에 붙여 넣기 또는 파일 드롭">${esc(b.sourceText)}</textarea></div>
   <div class="field"><label for="b-notes">Claude에게 남길 제작 메모</label><textarea class="ta" id="b-notes" rows="8" data-bind="p.brief.notes" placeholder="예: 경쟁사 언급 금지, 마지막 씬은 로고 락업, 전체적으로 과장 없는 톤">${esc(b.notes)}</textarea></div></div>
  </section>
  <section class="card sec span"><div class="sec-h"><h3>전체 레퍼런스</h3><span class="muted" style="font-size:12px">영상 전체의 분위기·색감·편집 리듬 참고용 · 씬별 가이드는 씬 편집에서 따로 붙입니다</span></div>${refsHTML('p',p.refs)}</section>
 </div>
 <div class="dock"><span class="msg">다음 단계: 씬별 스크립트 작성</span><button class="btn" data-act="go" data-arg="script">직접 작성하기 ${ic('chev','s')}</button><button class="btn ai" data-act="aiDraft">${ic('spark')}Claude로 스크립트 초안</button></div>
 </div>`}
function refsHTML(scope,list){
 return `<div class="refgrid">${list.map(r=>`<div class="ref"><div class="th">${r.kind==='image'?`<img src="${Store.url(r.assetId)}" alt="">`:r.kind==='video'?`<video src="${Store.url(r.assetId)}" muted playsinline preload="metadata" onmouseenter="this.play()" onmouseleave="this.pause()"></video>`:r.kind==='link'?`<a href="${esc(r.url)}" target="_blank" rel="noopener" style="display:grid;place-items:center;gap:4px;color:var(--accent);text-decoration:none;padding:8px;text-align:center;font-size:11px;word-break:break-all">${ic('link','l')}${esc((r.url||'').replace(/^https?:\/\//,'').slice(0,40))}</a>`:`<div style="padding:10px;font-size:12px;color:var(--fg-2);text-align:left;align-self:start">${ic('msg')}</div>`}<span class="k">${{image:'IMG',video:'VIDEO',link:'LINK',note:'NOTE'}[r.kind]}</span></div>
  <div class="rb"><input id="rt-${r.id}" data-bind="R:${scope}:${r.id}.title" value="${esc(r.title)}" placeholder="제목"><input id="rn-${r.id}" data-bind="R:${scope}:${r.id}.note" value="${esc(r.note)}" placeholder="참고할 점 (예: 색감, 컷 리듬)"><div class="row"><span class="faint" style="font-size:12px">${rel(r.at)}</span><button class="ibtn sm" data-act="delRef" data-arg="${scope}:${r.id}" aria-label="레퍼런스 삭제">${ic('trash','s')}</button></div></div></div>`).join('')}
 <div class="drop" data-act="addRefFiles" data-arg="${scope}" data-dropfiles="${scope}" style="min-height:150px">${ic('upload','l')}<b style="font-size:12.5px">이미지 · 영상 추가</b><span style="font-size:11px">클릭하거나 끌어다 놓기 · 20MB 이하</span></div></div>
 <div class="row" style="margin-top:10px"><button class="btn sm" data-act="addRefLink" data-arg="${scope}">${ic('link','s')}링크 추가</button><button class="btn sm" data-act="addRefNote" data-arg="${scope}">${ic('msg','s')}텍스트 메모 추가</button></div>`}

/* ================= SCRIPT ================= */
function viewScript(){const p=S.proj;const langs=enabledLangs(p);const tl=timeline(p);
 return `<div class="wrap" style="max-width:1320px">
 <div class="page-h"><div><div class="eyebrow">STEP 02 · 스크립트</div><h2>씬별 나레이션과 의도</h2><p>나레이션은 <b>한 줄 = 자막 한 줄</b>입니다. 줄바꿈으로 자막을 끊습니다. ${langs.length>1?'다국어는 같은 줄 순서로 맞춰 적습니다.':'일본어·영어 자막은 기획 단계에서 켤 수 있습니다.'}</p></div>
 <div class="row"><button class="btn" data-act="addScene">${ic('plus')}씬 추가</button>${langs.length>1?`<button class="btn" data-act="aiTranslate">${ic('spark')}빈 번역 채우기</button>`:''}<button class="btn ai" data-act="aiReviseAll">${ic('wand')}전체 수정 지시</button></div></div>
 <div class="script-layout"><div>${p.scenes.map((s,i)=>sblock(s,i,langs)).join('')}
  <button class="drop" data-act="addScene" style="width:100%">${ic('plus','l')}<b style="font-size:12.5px">씬 추가</b></button></div>
  <aside class="sticky card sec" style="padding:16px"><div class="eyebrow">길이</div><div data-live="meter">${LIVE.meter()}</div>
   <div class="statgrid"><div class="stat"><b data-live="total">${secs(tl.total)}</b><span>${tl.aligned?'오디오 기준':'예상 길이'}</span></div><div class="stat"><b data-live="chars">${LIVE.chars()}</b><span>글자 (공백 제외)</span></div><div class="stat"><b>${p.scenes.length}</b><span>씬</span></div><div class="stat"><b>${p.scenes.reduce((a,s)=>a+s.lines.filter(l=>l.ko.trim()).length,0)}</b><span>자막 줄</span></div></div>
   <div class="divider"></div><div class="eyebrow">씬 길이</div>
   <div style="display:grid;gap:5px">${p.scenes.map((s,i)=>`<a href="#sb-${s.id}" class="row" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="mono" style="width:22px;color:var(--accent);font-weight:600">${pad(i+1)}</span><span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px" data-live="stitle" data-arg="${s.id}">${LIVE.stitle(s.id)}</span><span class="mono muted" style="font-size:11px" data-live="sdur" data-arg="${s.id}">${LIVE.sdur(s.id)}</span></a>`).join('')}</div>
   <div class="divider"></div><button class="btn pri" data-act="go" data-arg="narr">나레이션 단계로 ${ic('chev','s')}</button></aside></div>
 </div>`}
function sblock(s,i,langs){return `<section class="sblock" id="sb-${s.id}"><div class="sblock-h"><span class="no">${pad(i+1)}</span><input class="chap mono" id="ch-${s.id}" data-bind="S:${s.id}.chapter" value="${esc(s.chapter)}" placeholder="CHAPTER" aria-label="챕터 라벨"><input class="ttl" id="ti-${s.id}" data-bind="S:${s.id}.title" value="${esc(s.title)}" placeholder="씬 제목" aria-label="씬 제목">
  <span class="mono muted" style="font-size:11.5px" data-live="sdur" data-arg="${s.id}">${LIVE.sdur(s.id)}</span>
  ${s.locked?`<span class="pill" title="잠긴 씬은 Claude 재생성에서 제외">${ic('lock','s')}잠김</span>`:''}
  <button class="ibtn sm" data-act="moveScene" data-arg="${s.id}:-1" title="위로" aria-label="위로">${ic('up','s')}</button><button class="ibtn sm" data-act="moveScene" data-arg="${s.id}:1" title="아래로" aria-label="아래로">${ic('down','s')}</button><button class="ibtn sm" data-act="dupScene" data-arg="${s.id}" title="복제" aria-label="복제">${ic('dup','s')}</button><button class="ibtn sm" data-act="delScene" data-arg="${s.id}" title="삭제" aria-label="삭제">${ic('trash','s')}</button><button class="btn sm" data-act="aiScene" data-arg="${s.id}" title="이 씬만 Claude로 다시 쓰기">${ic('spark','s')}다시 쓰기</button></div>
  <div class="sblock-b"><div class="langcols">${langs.map(l=>`<div class="lng ${l}"><div class="lt">${LSHORT[l]} · ${LANGS[l]} ${l==='ko'?`<span class="sp"></span><span data-live="mismatch" data-arg="${s.id}">${LIVE.mismatch(s.id)}</span>`:''}</div><textarea class="ta" id="tx-${s.id}-${l}" rows="${Math.max(2,s.lines.length)}" data-lines="${s.id}.${l}" placeholder="${l==='ko'?'나레이션을 한 줄씩 입력':'한국어 줄 순서대로 번역'}">${esc(s.lines.map(x=>x[l]||'').join('\n'))}</textarea></div>`).join('')}</div>
  <div style="display:grid;gap:8px;align-content:start"><div class="field"><label for="hd-${s.id}">화면 텍스트</label><textarea class="ta" id="hd-${s.id}" rows="2" style="min-height:0" data-bind="S:${s.id}.onscreen.headline" placeholder="헤드라인 (줄바꿈 가능)">${esc(s.onscreen.headline)}</textarea><input class="in" id="sbt-${s.id}" data-bind="S:${s.id}.onscreen.sub" value="${esc(s.onscreen.sub)}" placeholder="서브 카피"></div>
  <div class="field"><label for="in-${s.id}">제작 의도</label><textarea class="ta" id="in-${s.id}" rows="2" data-bind="S:${s.id}.intent" placeholder="이 씬에서 전달할 감정·정보">${esc(s.intent)}</textarea></div>
  <div class="field"><label for="vi-${s.id}">화면 구성</label><textarea class="ta" id="vi-${s.id}" rows="2" data-bind="S:${s.id}.visual" placeholder="무엇이 보이는지 (예: 차량 정측면 + 스캔)">${esc(s.visual)}</textarea></div></div></div></section>`}

/* ================= NARRATION ================= */
function ttsBody(p,lang,sceneBreak){return p.scenes.map(s=>s.lines.map(l=>String(l[lang]||'').trim()).filter(Boolean).join('\n')).filter(Boolean).join(sceneBreak?'\n\n':'\n')}
function styleInstruction(p){const v=p.voice;const lang=LANGS[p.tts.lang]||'Korean';const ln={ko:'Korean',ja:'Japanese',en:'English'}[p.tts.lang];
 const g={'여성':'female','남성':'male','중성적':'gender-neutral'}[v.gender]||'';const age={'20대':'in their 20s','30대':'in their 30s','40대':'in their 40s','50대+':'in their 50s or older'}[v.age]||'';
 const tones=v.tones.map(t=>(VOICE_TONES.find(x=>x[0]===t)||[t,t])[1]).join(', ');
 const pace={'느리게':'slow and unhurried','보통':'measured, natural','조금 빠르게':'brisk but clear'}[v.pace]||'measured';
 return `Read the following ${ln} narration aloud as a ${g} narrator ${age}`.replace(/\s+/g,' ').trim()+`.
Tone: ${tones||'warm, clear'}.
Pace: ${pace}${v.pauses?', with a short natural pause between sentences and a longer pause between paragraphs':''}.
Delivery: polished, clear diction suited to a ${({'cine-dark':'cinematic brand film','clean':'clean product explainer','hud':'tech explainer','editorial':'editorial film','flat':'friendly animated explainer','product':'premium product showcase'})[p.brief.style]||'motion graphics explainer'}. Do not read stage directions.${v.extra?'\n'+v.extra:''}`}
function viewNarr(){const p=S.proj,v=p.voice,n=p.narration;const langs=enabledLangs(p);const tl=timeline(p);
 return `<div class="wrap" style="max-width:1320px">
 <div class="page-h"><div><div class="eyebrow">STEP 03 · 나레이션</div><h2>Gemini에서 음성을 만들고, 오디오를 올리세요</h2><p>① 스타일 지시문과 본문을 복사해 Google AI Studio의 음성 생성(TTS)에 붙여 넣습니다. ② 만들어진 오디오를 오른쪽에 올리면 자막 줄과 씬 타이밍이 자동으로 맞춰집니다.</p></div></div>
 <div class="ncols">
  <section class="card sec"><div class="sec-h"><h3>① TTS 텍스트</h3><span class="muted" style="font-size:12px" data-live="ttsCount">${LIVE.ttsCount()}</span></div>
   <div class="row">${seg('p.tts.lang',langs.map(l=>[l,LANGS[l]]),p.tts.lang)}<span class="sp"></span><label class="row" style="gap:8px;font-size:12px"><span>씬 사이 빈 줄</span><button class="toggle" aria-pressed="${p.tts.sceneBreak}" data-flip="p.tts.sceneBreak" aria-label="씬 사이 빈 줄"></button></label></div>
   <div class="copybox"><div class="bar"><span class="eyebrow">Style instructions</span><button class="btn sm" data-act="copyStyle">${ic('copy','s')}복사</button></div><pre data-live="ttsStyle">${LIVE.ttsStyle()}</pre></div>
   <div class="copybox"><div class="bar"><span class="eyebrow">나레이션 본문</span><button class="btn sm" data-act="copyTts">${ic('copy','s')}복사</button><button class="btn sm" data-act="dlTts">${ic('download','s')}.txt</button></div><pre data-live="ttsBody">${LIVE.ttsBody()}</pre></div>
   <details><summary style="cursor:pointer;font-weight:600;padding:4px 0">보이스 디렉션 조정</summary><div style="display:grid;gap:12px;margin-top:10px">
    <div class="grid2"><div class="field"><div class="lbl">성별</div>${seg('p.voice.gender',[['여성','여성'],['남성','남성'],['중성적','중성적']],v.gender)}</div><div class="field"><div class="lbl">연령대</div>${seg('p.voice.age',[['20대','20대'],['30대','30대'],['40대','40대'],['50대+','50대+']],v.age)}</div></div>
    <div class="field"><div class="lbl">톤 <span class="hint">여러 개 선택</span></div><div class="chips">${VOICE_TONES.map(([k])=>`<button class="chip" aria-pressed="${v.tones.includes(k)}" data-toggle="p.voice.tones" data-v="${k}">${k}</button>`).join('')}</div></div>
    <div class="grid2"><div class="field"><div class="lbl">속도</div>${seg('p.voice.pace',[['느리게','느리게'],['보통','보통'],['조금 빠르게','조금 빠르게']],v.pace)}</div><div class="field"><div class="lbl">문장 사이 쉼</div><div class="trow" style="padding:0"><span class="muted" style="font-size:12px">자연스러운 쉼 넣기</span><button class="toggle" aria-pressed="${v.pauses}" data-flip="p.voice.pauses" aria-label="쉼"></button></div></div></div>
    <div class="field"><label for="v-name">Gemini 보이스 <span class="hint">AI Studio에서 고를 보이스 메모 · 참고용</span></label><input class="in" id="v-name" list="gvoices" data-bind="p.voice.voiceName" value="${esc(v.voiceName)}" placeholder="예: Kore"><datalist id="gvoices">${GEMINI_VOICES.map(([n,d])=>`<option value="${n}">${d}</option>`).join('')}</datalist></div>
    <div class="field"><label for="v-extra">추가 지시 (영문 권장)</label><input class="in" id="v-extra" data-bind="p.voice.extra" value="${esc(v.extra)}" placeholder="e.g. Smile slightly on the final line."></div></div></details>
  </section>
  <section class="card sec"><div class="sec-h"><h3>② 나레이션 오디오</h3>${n?`<span class="pill ok">${ic('check','s')}${tl.aligned?'타이밍 정렬됨':'업로드됨'}</span>`:''}</div>
   ${n?`<div class="row" style="flex-wrap:nowrap"><div style="flex:1;min-width:0"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.name)}</b><span class="muted mono" style="font-size:11.5px">${n.duration.toFixed(2)}s · ${esc(n.mime||'')}</span></div><button class="btn sm" data-act="narrPlay">${ic('play','s')}듣기</button><button class="btn sm" data-act="narrUpload">${ic('upload','s')}교체</button><button class="ibtn sm" data-act="narrRemove" aria-label="오디오 제거">${ic('trash','s')}</button></div>
   <canvas class="wave" id="wave" height="120"></canvas>
   <div class="row"><button class="btn pri" data-act="align">${ic('wand')}자막·씬 타이밍 자동 맞춤</button><div class="field" style="flex:1;min-width:160px"><div class="range-row"><span>영상 끝 여유</span><input type="range" id="tail" min="0" max="8" step="0.5" value="${p.tail}" style="${rangeStyle(p.tail,0,8)}" data-bind="p.tail" data-num><b>${p.tail}s</b></div></div></div>
   <p class="muted" style="font-size:12px">무음 구간을 찾아 자막 줄 수에 맞게 나눕니다. 결과가 어긋난 줄은 아래 표에서 시간을 직접 고치거나, 씬 편집 타임라인에서 경계를 끌어 조정하세요.</p>
   <div class="tbl-wrap"><table class="ltable"><thead><tr><th>#</th><th>씬</th><th>자막</th><th>시작</th><th>끝</th><th></th></tr></thead><tbody>${tl.lines.map((x,k)=>`<tr data-lid="${x.l.id}"><td class="mono muted">${k+1}</td><td class="mono" style="color:var(--accent)">${pad(x.g.i+1)}</td><td class="txt">${esc(x.l.ko)}</td><td><input type="number" step="0.01" id="ls-${x.l.id}" data-bind="L:${x.g.s.id}:${x.l.id}.start" data-num value="${x.est?'':(+x.start).toFixed(2)}" placeholder="${(+x.start).toFixed(2)}"></td><td><input type="number" step="0.01" id="le-${x.l.id}" data-bind="L:${x.g.s.id}:${x.l.id}.end" data-num value="${x.est?'':(+x.end).toFixed(2)}" placeholder="${(+x.end).toFixed(2)}"></td><td><button class="ibtn sm" data-act="playLine" data-arg="${x.start}:${x.end}" aria-label="이 줄 듣기">${ic('play','s')}</button></td></tr>`).join('')}</tbody></table></div>`
   :`<div class="drop" data-act="narrUpload" data-dropaudio style="padding:40px 18px">${ic('mic','l')}<b style="font-size:14px;color:var(--fg)">나레이션 오디오 올리기</b><span style="font-size:12px">WAV · MP3 · M4A · 14MB 이하 · 클릭하거나 끌어다 놓기</span></div>
   <p class="muted" style="font-size:12px">오디오 없이도 다음 단계로 갈 수 있습니다. 그 경우 글자 수로 예측한 길이(<b>${secs(tl.total)}</b>)로 애니마틱을 만듭니다.</p>`}
   <div class="divider"></div><div class="row" style="justify-content:flex-end"><button class="btn pri" data-act="go" data-arg="edit">씬 편집으로 ${ic('chev','s')}</button></div>
  </section></div></div>`}
MOUNT.narr=()=>{drawWave()};
function drawWave(){const cv=$('#wave');if(!cv||!S.proj.narration)return;const p=S.proj,n=p.narration;const dpr=devicePixelRatio||1;const W=cv.clientWidth,H=120;cv.width=W*dpr;cv.height=H*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);
 const cs=getComputedStyle(document.documentElement);const acc=cs.getPropertyValue('--accent').trim(),fg=cs.getPropertyValue('--fg-2').trim(),key=cs.getPropertyValue('--key').trim();
 const tl=timeline(p);const D=Math.max(n.duration,tl.total);
 tl.segs.forEach((g,i)=>{c.fillStyle=i%2?hexA(acc.startsWith('#')?acc:'#2747E8',.08):'transparent';c.fillRect(g.start/D*W,0,(g.end-g.start)/D*W,H)});
 tl.lines.forEach(x=>{c.fillStyle=hexA(key.startsWith('#')?key:'#E8A200',.22);c.fillRect(x.start/D*W,H-10,(x.end-x.start)/D*W,8)});
 const pk=n.peaks||[];c.fillStyle=fg;const bw=W/pk.length*(n.duration/D);pk.forEach((v,i)=>{const h=Math.max(1,v*(H-24));c.fillRect(i*bw,(H-14)/2-h/2,Math.max(1,bw-.5),h)});
 c.fillStyle=acc;tl.segs.forEach((g,i)=>{if(i){c.fillRect(g.start/D*W-1,0,2,H)}c.font='600 10px IBM Plex Mono';c.fillText(pad(i+1),g.start/D*W+4,12)})}
