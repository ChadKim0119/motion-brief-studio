/* ================= EDITOR ================= */
function viewEdit(){return `<div class="ed">
 <aside class="slist" aria-label="씬 목록"><div class="slist-h"><span class="eyebrow">씬 <span id="scount"></span></span><button class="ibtn sm" data-act="addScene" title="씬 추가" aria-label="씬 추가">${ic('plus','s')}</button></div><div class="slist-b" id="slist"></div>
  <div class="slist-f"><button class="btn sm" style="width:100%" data-act="bgm">${ic('music','s')}BGM 설정</button></div></aside>
 <section class="stage" aria-label="미리보기"><div class="canvas-wrap" id="cwrap"><canvas id="cv" width="1280" height="720"></canvas></div><div class="ptool" id="ptool"></div></section>
 <aside class="insp" id="insp" aria-label="씬 속성"></aside>
 <section class="tl" id="tl" aria-label="타임라인"></section></div>`}
function mountEdit(){S.sel=clamp(S.sel,0,S.proj.scenes.length-1);renderSceneList();renderPTool();renderInspector();renderTimeline();Player.attach($('#cv'));
 const ro=new ResizeObserver(()=>{Player.fit();renderTimelineCanvases()});ro.observe($('#cwrap'));ro.observe($('#tl'))}
function selectScene(i,{seek=true}={}){S.sel=clamp(i,0,S.proj.scenes.length-1);if(seek&&!Player.playing){const g=timeline(S.proj).segs[S.sel];if(g)S.t=g.start+0.01}renderSceneList();renderInspector();renderTimeline();Player.redrawAll()}
function renderSceneList(){const el=$('#slist');if(!el)return;const tl=timeline(S.proj);$('#scount').textContent=S.proj.scenes.length;
 el.innerHTML=tl.segs.map((g,i)=>{const s=g.s;const st=s.still&&s.still.assetId;const open=s.notes.filter(n=>!n.done).length;
  return `<button class="sitem ${i===S.sel?'on':''}" data-act="sel" data-arg="${i}" draggable="true" data-drag="${s.id}"><span class="th" style="${st?`background-image:url('${Store.url(st)}')`:`background:${S.proj.brief.palette.bg}`}"><b>${pad(i+1)}</b></span><span style="min-width:0;display:grid"><span class="t" data-live="stitle" data-arg="${s.id}">${LIVE.stitle(s.id)}</span><span class="m"><span class="st ${s.status}"></span>${(g.end-g.start).toFixed(1)}s${s.locked?ic('lock','s'):''}<span style="text-transform:uppercase;letter-spacing:.05em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.chapter)}</span></span></span>${open?`<span class="badge" title="미완료 수정 지시">${open}</span>`:''}</button>`}).join('')}
function renderPTool(){const el=$('#ptool');if(!el)return;const p=S.proj;const langs=enabledLangs(p);
 el.innerHTML=`<button class="ibtn" data-act="prevScene" title="이전 씬 (↑)" aria-label="이전 씬">${ic('prev')}</button><button class="ibtn" data-act="play" id="playbtn" title="재생/정지 (Space)" aria-label="재생">${ic(Player.playing?'pause':'play')}</button><button class="ibtn" data-act="nextScene" title="다음 씬 (↓)" aria-label="다음 씬">${ic('next')}</button>
 <span class="tc" id="tcode">${tc(S.t,p.brief.fps)} <span>/ ${tc(timeline(p).total,p.brief.fps)}</span></span><span class="sp"></span>
 <button class="ibtn ${p.subs.show?'on':''}" data-flip="p.subs.show" title="자막 보이기 (C)" aria-label="자막 보이기" aria-pressed="${p.subs.show}">${ic('cc')}</button>
 ${p.subs.show?`${seg('p.subs.lang',langs.map(l=>[l,LSHORT[l]]),p.subs.lang)}${langs.length>1?`<select id="sub2" data-bind="p.subs.second" aria-label="보조 자막"><option value="">보조 없음</option>${langs.filter(l=>l!==p.subs.lang).map(l=>`<option value="${l}" ${p.subs.second===l?'selected':''}>+ ${LANGS[l]}</option>`).join('')}</select>`:''}`:''}
 <button class="ibtn ${S.guides?'on':''}" data-act="guides" title="세이프 영역 가이드 (G)" aria-label="가이드">${ic('grid')}</button>
 <button class="ibtn ${p.bgm.preview?'on':''}" data-flip="p.bgm.preview" title="BGM 스케치 함께 듣기" aria-label="BGM 스케치" aria-pressed="${p.bgm.preview}">${ic('music')}</button>
 <button class="ibtn" data-act="fullscreen" title="전체 화면" aria-label="전체 화면">${ic('full')}</button>`}
function updateTimeUI(){const tl=timeline(S.proj);const tcEl=$('#tcode');if(tcEl)tcEl.innerHTML=`${tc(S.t,S.proj.brief.fps)} <span>/ ${tc(tl.total,S.proj.brief.fps)}</span>`;
 const ph=$('#phead');if(ph)ph.style.left=(S.t/Math.max(.01,tl.total)*100)+'%';
 const cl=tl.lines.find(x=>S.t>=x.start&&S.t<x.end);const id=cl?cl.l.id:null;if(id!==S.curLine){S.curLine=id;$$('.lcard.cur,.sub.cur,.ltable tr.cur').forEach(e=>e.classList.remove('cur'));if(id){$$(`[data-lid="${id}"]`).forEach(e=>e.classList.add('cur'))}}
 if(Player.playing&&S.view==='edit'){const i=tl.segs.findIndex(g=>S.t<g.end);const ii=i<0?tl.segs.length-1:i;if(ii!==S.sel&&!($('#insp')||{}).contains?.(document.activeElement)){S.sel=ii;renderSceneList();renderInspector();$$('.blk').forEach((b,k)=>b.classList.toggle('on',k===ii))}}}

function renderInspector(){const el=$('#insp');if(!el)return;const s=cur();if(!s){el.innerHTML='';return}const i=S.sel;const open=s.notes.filter(n=>!n.done).length;
 const keep=$('.insp-b',el);const st=keep?keep.scrollTop:0;
 el.innerHTML=`<div class="insp-h"><div class="row1"><span class="no">${pad(i+1)}</span><span class="tt" data-live="stitle" data-arg="${s.id}">${LIVE.stitle(s.id)}</span><button class="ibtn sm ${s.locked?'on':''}" data-flip="s.locked" title="${s.locked?'잠김: Claude 재생성에서 제외':'잠그기'}" aria-label="잠금" aria-pressed="${s.locked}">${ic(s.locked?'lock':'unlock','s')}</button><button class="ibtn sm" data-act="dupScene" data-arg="${s.id}" title="복제" aria-label="복제">${ic('dup','s')}</button><button class="ibtn sm" data-act="delScene" data-arg="${s.id}" title="삭제" aria-label="삭제">${ic('trash','s')}</button></div>
  <div class="row" style="justify-content:space-between">${seg('s.status',STATUS,s.status)}<span class="mono muted" style="font-size:11px">${(()=>{const g=timeline(S.proj).segs[i];return g?`${mmss(g.start)}.${String(Math.floor(g.start%1*10))} → ${mmss(g.end)} · ${(g.end-g.start).toFixed(1)}s`:''})()}</span></div></div>
 <div class="tabs" role="tablist">${[['content','내용'],['dir','연출'],['refs','레퍼런스'],['notes','수정 지시']].map(([k,n])=>`<button role="tab" aria-selected="${S.tab===k}" data-act="tab" data-arg="${k}">${n}${k==='refs'&&s.refs.length?` <span class="mono faint">${s.refs.length}</span>`:''}${k==='notes'&&open?`<span class="cnt">${open}</span>`:''}</button>`).join('')}</div>
 <div class="insp-b">${{content:inspContent,dir:inspDir,refs:inspRefs,notes:inspNotes}[S.tab](s)}</div>`;
 const nb=$('.insp-b',el);if(nb)nb.scrollTop=st;autosize(el)}
function autosize(root){$$('.lcard textarea',root||document).forEach(t=>{t.style.height='auto';t.style.height=t.scrollHeight+2+'px'})}
function inspContent(s){const p=S.proj;const langs=enabledLangs(p);const tl=timeline(p);const lt=new Map(tl.lines.map(x=>[x.l.id,x]));
 return `<div class="grp"><div class="grp-h"><h5>나레이션 · 자막</h5><span class="muted" style="font-size:11px">${langs.map(l=>LSHORT[l]).join(' · ')}</span></div>
 ${s.lines.map((l,k)=>{const x=lt.get(l.id);return `<div class="lcard" data-lid="${l.id}"><div class="lh"><b>${k+1}</b>${x?`<span>${x.start.toFixed(2)}–${x.end.toFixed(2)}s${x.est?' (예상)':''}</span>`:''}<span class="sp"></span>${x?`<button class="ibtn sm" data-act="seek" data-arg="${x.start}" title="이 줄로 이동" aria-label="이 줄로 이동">${ic('play','s')}</button>`:''}<button class="ibtn sm" data-act="delLine" data-arg="${l.id}" title="줄 삭제" aria-label="줄 삭제">${ic('close','s')}</button></div>
  ${langs.map(lg=>`<div class="lrow"><span>${LSHORT[lg]}</span><textarea id="lt-${l.id}-${lg}" rows="1" data-bind="L:${s.id}:${l.id}.${lg}" placeholder="${lg==='ko'?'나레이션':'번역'}">${esc(l[lg]||'')}</textarea></div>`).join('')}</div>`}).join('')}
 <div class="row"><button class="btn sm" data-act="addLine">${ic('plus','s')}줄 추가</button>${langs.length>1?`<button class="btn sm" data-act="aiTranslate" data-arg="${s.id}">${ic('spark','s')}이 씬 번역</button>`:''}</div></div>
 <div class="grp"><div class="grp-h"><h5>화면 텍스트</h5></div>
  <textarea class="ta" id="e-hd" rows="2" data-bind="s.onscreen.headline" placeholder="헤드라인 (줄바꿈 가능)" style="min-height:0">${esc(s.onscreen.headline)}</textarea>
  <input class="in" id="e-sub" data-bind="s.onscreen.sub" value="${esc(s.onscreen.sub)}" placeholder="서브 카피 · 콜아웃은 ‘·’로 구분">
  <div class="field"><div class="lbl">위치</div>${seg('s.onscreen.position',POSITIONS,s.onscreen.position)}</div></div>
 <div class="grp"><div class="grp-h"><h5>씬 정보</h5></div>
  <div class="grid2" style="grid-template-columns:1fr 1.6fr"><input class="in mono" id="e-ch" data-bind="s.chapter" value="${esc(s.chapter)}" placeholder="CHAPTER"><input class="in" id="e-ti" data-bind="s.title" value="${esc(s.title)}" placeholder="씬 제목"></div>
  <div class="field"><label for="e-in">제작 의도</label><textarea class="ta" id="e-in" rows="3" data-bind="s.intent" placeholder="이 씬에서 시청자가 느끼고 이해할 것">${esc(s.intent)}</textarea></div>
  <div class="field"><label for="e-vi">화면 구성</label><textarea class="ta" id="e-vi" rows="3" data-bind="s.visual" placeholder="화면에 무엇이 어떻게 보이는지">${esc(s.visual)}</textarea></div></div>
 <div class="grp"><div class="grp-h"><h5>스틸 이미지</h5>${s.still?`<div class="row"><button class="btn sm" data-act="stillUpload">${ic('upload','s')}교체</button><button class="ibtn sm" data-act="stillRemove" aria-label="스틸 제거">${ic('trash','s')}</button></div>`:''}</div>
  <div class="still" id="still" data-dropstill="1" style="aspect-ratio:${(()=>{const [w,h]=aspectWH(p.brief.aspect);return w+'/'+h})()};max-height:320px;margin-inline:auto;width:100%">${s.still?`<img src="${Store.url(s.still.assetId)}" alt="씬 스틸"><span class="fp" style="left:${(s.still.fx??.5)*100}%;top:${(s.still.fy??.5)*100}%"></span>`:`<div class="none" data-act="stillUpload">${ic('image','l')}<b>스틸 올리기</b><span>클릭 또는 드롭 · 없으면 팔레트 배경으로 표시</span></div>`}</div>
  ${s.still?'<p class="muted" style="font-size:11.5px">이미지를 클릭하면 카메라 무브의 중심점이 바뀝니다.</p>':''}</div>`}
function inspDir(s){const d=s.dir;const last=S.sel===S.proj.scenes.length-1;
 return `<div class="grp"><div class="grp-h"><h5>분위기 프리셋</h5><span class="muted" style="font-size:11px">여러 컨트롤을 한 번에 설정</span></div><div class="moods">${SCENE_MOODS.map(m=>`<button class="mood" data-act="mood" data-arg="${m.k}"><b>${m.n}</b><span>${m.d}</span></button>`).join('')}</div></div>
 <div class="grp"><div class="grp-h"><h5>에너지</h5><span class="muted" style="font-size:11px">BGM 곡선에도 반영</span></div><div class="dots">${[1,2,3,4,5].map(n=>`<button class="${n===d.energy?'on':n<d.energy?'lv':''}" data-set="s.dir.energy" data-v="${n}" data-num aria-label="에너지 ${n}">${n}</button>`).join('')}</div></div>
 <div class="grp"><div class="grp-h"><h5>톤 · 페이싱</h5></div>
  <div class="range-row"><span>어둡게</span><input type="range" id="d-tone" min="-2" max="2" step="1" value="${d.tone}" style="${rangeStyle(d.tone,-2,2)}" data-bind="s.dir.tone" data-num><span>밝게</span></div>
  <div class="range-row"><span>느긋하게</span><input type="range" id="d-pace" min="1" max="5" step="1" value="${d.pace}" style="${rangeStyle(d.pace,1,5)}" data-bind="s.dir.pace" data-num><span>빠르게</span></div></div>
 <div class="grp"><div class="grp-h"><h5>카메라 무브</h5></div><div class="optgrid">${CAMERAS.map(([k,n])=>`<button class="opt" aria-pressed="${d.camera===k}" data-set="s.dir.camera" data-v="${k}">${sym('c-'+k)}${n}</button>`).join('')}</div></div>
 <div class="grp"><div class="grp-h"><h5>텍스트 애니메이션</h5></div><div class="optgrid">${TEXTANIM.map(([k,n])=>`<button class="opt" aria-pressed="${d.textAnim===k}" data-set="s.dir.textAnim" data-v="${k}">${sym('a-'+k)}${n}</button>`).join('')}</div></div>
 <div class="grp"><div class="grp-h"><h5>효과</h5><span class="muted" style="font-size:11px">${d.effects.length}개</span></div><div class="chips">${EFFECTS.map(([k,n])=>`<button class="chip" aria-pressed="${d.effects.includes(k)}" data-toggle="s.dir.effects" data-v="${k}">${n}</button>`).join('')}</div></div>
 <div class="grp"><div class="grp-h"><h5>${last?'엔딩 처리':'다음 씬으로 전환'}</h5></div>${last?'<p class="muted" style="font-size:12px">마지막 씬은 화면이 유지된 채 끝납니다. 끝 여유 시간은 나레이션 단계에서 조절합니다.</p>':`<div class="optgrid">${TRANS.map(([k,n])=>`<button class="opt" aria-pressed="${d.transition===k}" data-set="s.dir.transition" data-v="${k}">${sym('t-'+k)}${n}</button>`).join('')}</div>`}</div>
 <div class="grp"><div class="grp-h"><h5>강조 색</h5></div>${seg('s.dir.accent',[['primary','주 색상'],['accent','보조 색상'],['text','텍스트 색']],d.accent)}</div>
 <div class="grp"><div class="trow"><div><b style="font-size:12.5px">이 씬 시작에 BGM 임팩트</b><div class="muted" style="font-size:11.5px">휘익 + 저음 히트로 장면 전환을 강조</div></div><button class="toggle" aria-pressed="${s.bgmHit}" data-flip="s.bgmHit" aria-label="BGM 임팩트"></button></div></div>`}
function inspRefs(s){return `<div class="grp"><div class="grp-h"><h5>이 씬의 레퍼런스</h5></div><p class="muted" style="font-size:12px">구도, 효과, 타이포 같은 이 씬만의 가이드를 붙이세요. 제작 안내서에 씬별로 들어갑니다.</p>${refsHTML(s.id,s.refs)}</div>`}
function inspNotes(s){const open=s.notes.filter(n=>!n.done);
 return `<div class="grp"><div class="grp-h"><h5>수정 지시 남기기</h5></div><textarea class="ta" id="newnote" rows="3" placeholder="예: 헤드라인을 더 짧게, 스캔 효과는 빼고 차분하게"></textarea>
  <div class="row"><button class="btn sm" data-act="addNote">${ic('plus','s')}지시 추가</button><span class="sp"></span><button class="btn sm ai" data-act="aiScene" data-arg="${s.id}" ${s.locked?'disabled title="잠긴 씬입니다"':''}>${ic('spark','s')}지시대로 재생성</button></div>
  <p class="muted" style="font-size:11.5px">‘지시대로 재생성’은 미완료 지시와 위 입력란을 함께 Claude에게 보내 이 씬만 다시 씁니다. 새 버전으로 기록됩니다. 직접 고칠 거라면 지시만 남겨 두면 제작 안내서의 체크리스트로 전달됩니다.</p></div>
 <div class="grp"><div class="grp-h"><h5>지시 목록</h5><span class="muted" style="font-size:11px">${open.length}개 미완료</span></div>
 ${s.notes.length?s.notes.slice().reverse().map(n=>`<div class="note ${n.done?'done':''}"><input type="checkbox" ${n.done?'checked':''} data-act="noteDone" data-arg="${n.id}" aria-label="완료"><div><div class="nt">${esc(n.text)}</div><div class="nm">${rel(n.at)}${n.by?' · '+esc(n.by):''}</div></div><button class="ibtn sm" data-act="delNote" data-arg="${n.id}" aria-label="지시 삭제">${ic('close','s')}</button></div>`).join(''):'<div class="empty" style="padding:18px"><span style="font-size:12px">아직 지시가 없습니다</span></div>'}</div>`}

/* ---------- timeline ---------- */
function renderTimeline(){const el=$('#tl');if(!el)return;const p=S.proj;const tl=timeline(p);const D=Math.max(.01,tl.total);const pc=x=>(x/D*100).toFixed(3)+'%';
 const step=D>120?10:D>50?5:D>20?2:1;let ticks='';for(let x=0;x<=D;x+=step)ticks+=`<i style="left:${pc(x)}"><span>${mmss(x)}</span></i>`;
 const lang=p.subs.lang||'ko';const sx=el.querySelector('.tl-scroll');const sl=sx?sx.scrollLeft:0;
 el.innerHTML=`<div class="tl-h"><span class="eyebrow">타임라인</span>${tl.aligned?'<span class="pill ok">오디오 정렬</span>':'<span class="pill warn" title="나레이션 오디오를 올리고 자동 맞춤을 하면 정확해집니다">예상 길이</span>'}<span class="mono muted" style="font-size:11.5px">${secs(D)} · ${p.scenes.length}씬 · ${tl.lines.length}줄</span><span class="sp"></span>
  <span class="muted" style="font-size:11px">경계를 끌어 씬 길이 조절</span>${!tl.aligned&&p.narration?`<button class="btn sm" data-act="align">${ic('wand','s')}자동 맞춤</button>`:''}
  <div class="range-row" style="width:150px"><span>줌</span><input type="range" id="tlzoom" min="1" max="6" step="0.5" value="${S.tlZoom}" style="${rangeStyle(S.tlZoom,1,6)}" data-bind="ui.tlZoom" data-num><b>${S.tlZoom}×</b></div></div>
 <div class="tl-body"><div class="tl-labels"><div style="--h:24px"></div><div style="--h:46px">씬</div><div style="--h:32px">자막 ${LSHORT[lang]}</div><div style="--h:44px">${ic('mic','s')}나레이션</div><div style="--h:40px">${ic('music','s')}BGM</div></div>
 <div class="tl-scroll" id="tlscroll"><div class="tl-inner" id="tlinner" style="width:${S.tlZoom*100}%">
  <div class="trk ruler" style="--h:24px" data-seek="1">${ticks}</div>
  <div class="trk" style="--h:46px">${tl.segs.map((g,i)=>`<div class="blk ${i===S.sel?'on':''}" style="left:${pc(g.start)};width:calc(${pc(g.end-g.start)} - 2px)" data-act="sel" data-arg="${i}" title="${esc(g.s.title)}"><b>${pad(i+1)}${g.s.locked?' '+ic('lock','s'):''}</b><span>${esc(g.s.title||g.s.lines[0].ko||'')}</span></div>`).join('')}
   ${tl.segs.slice(1).map((g,k)=>`<div class="hdl" style="left:${pc(g.start)}" data-hdl="${k+1}" title="끌어서 경계 이동"></div>`).join('')}</div>
  <div class="trk" style="--h:32px">${tl.lines.map(x=>`<div class="sub" data-lid="${x.l.id}" style="left:${pc(x.start)};width:${pc(Math.max(.05,x.end-x.start))};${x.est?'border-style:dashed':''}" title="${esc(x.l[lang]||x.l.ko)}">${esc(x.l[lang]||x.l.ko)}</div>`).join('')}</div>
  <div class="trk" style="--h:44px">${p.narration?'<canvas id="tlwave"></canvas>':'<div class="tl-empty">나레이션 오디오 없음 · 3단계에서 올리기</div>'}</div>
  <div class="trk" style="--h:40px"><canvas id="tlbgm"></canvas>${tl.segs.slice(1).map((g,k)=>`<button class="hit ${g.s.bgmHit?'on':''}" style="left:${pc(g.start)}" data-flip="S:${g.s.id}.bgmHit" title="씬 ${k+2} 시작 BGM 임팩트 ${g.s.bgmHit?'켜짐':'꺼짐'}" aria-label="BGM 임팩트"></button>`).join('')}</div>
  <div class="phead" id="phead" style="left:${pc(S.t)}"></div>
 </div></div></div>`;
 const nsx=el.querySelector('.tl-scroll');nsx.scrollLeft=sl;renderTimelineCanvases()}
function renderTimelineCanvases(){const p=S.proj;if(!p)return;const tl=timeline(p);const D=Math.max(.01,tl.total);const cs=getComputedStyle(document.documentElement);const col=k=>cs.getPropertyValue(k).trim();const dpr=devicePixelRatio||1;
 const w=$('#tlwave');if(w&&p.narration){const W=w.clientWidth,H=w.clientHeight;w.width=W*dpr;w.height=H*dpr;const c=w.getContext('2d');c.scale(dpr,dpr);const pk=p.narration.peaks||[];const span=p.narration.duration/D*W;c.fillStyle=col('--fg-2');c.globalAlpha=.75;const bw=span/pk.length;pk.forEach((v,i)=>{const h=Math.max(1,v*(H-8));c.fillRect(i*bw,H/2-h/2,Math.max(.6,bw-.3),h)})}
 const b=$('#tlbgm');if(b){const W=b.clientWidth,H=b.clientHeight;b.width=W*dpr;b.height=H*dpr;const c=b.getContext('2d');c.scale(dpr,dpr);
  c.fillStyle=col('--warn-soft');tl.lines.forEach(x=>c.fillRect(x.start/D*W,H-6,(x.end-x.start)/D*W,4));
  const acc=col('--accent');c.beginPath();tl.segs.forEach((g,i)=>{const y=H-6-(g.s.dir.energy/5)*(H-12);const x0=g.start/D*W,x1=g.end/D*W;if(!i)c.moveTo(x0,y);else c.lineTo(x0+Math.min(14,(x1-x0)*.2),y);c.lineTo(x1,y)});
  c.strokeStyle=acc;c.lineWidth=2;c.stroke();c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.globalAlpha=.12;c.fillStyle=acc;c.fill()}}
function tlTimeAt(clientX){const inner=$('#tlinner');const r=inner.getBoundingClientRect();return clamp((clientX-r.left)/r.width,0,1)*timeline(S.proj).total}
document.addEventListener('pointerdown',e=>{
 const h=e.target.closest('.hdl');
 if(h){e.preventDefault();const k=+h.dataset.hdl;materialize(S.proj);h.classList.add('drag');
  const mv=ev=>{const sc=S.proj.scenes;const t=tlTimeAt(ev.clientX);const lo=sc[k-1].start+0.4,hi=sc[k].end-0.4;const v=+clamp(t,lo,hi).toFixed(2);sc[k-1].end=v;sc[k].start=v;S.t=v;renderTimeline();Player.redrawAll();updateTimeUI()};
  const up=()=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);touch('timing',{});renderSceneList();renderInspector()};
  document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);return}
 const r=e.target.closest('[data-seek]');
 if(r||(e.target.closest('#tlinner')&&!e.target.closest('.blk,.hit,button'))){const set=ev=>{S.t=tlTimeAt(ev.clientX);if(Player.playing)Player.seek(S.t);else{Player.redrawAll();updateTimeUI()}};set(e);
  const up=()=>{document.removeEventListener('pointermove',set);document.removeEventListener('pointerup',up)};document.addEventListener('pointermove',set);document.addEventListener('pointerup',up)}
});
