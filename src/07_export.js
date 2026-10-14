/* ================= EXPORT ================= */
const extOf=(name,mime,def)=>{const m=String(name||'').match(/\.([a-z0-9]{2,5})$/i);if(m)return m[1].toLowerCase();const t={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','video/mp4':'mp4','video/webm':'webm','audio/wav':'wav','audio/x-wav':'wav','audio/mpeg':'mp3','audio/mp4':'m4a','audio/x-m4a':'m4a','audio/aac':'aac'}[mime];return t||def};
function packFiles(p){const f={narration:null,bgm:null,stills:{},refs:{}};
 if(p.narration&&p.narration.assetId)f.narration={path:'audio/narration.'+extOf(p.narration.name,p.narration.mime,'wav'),assetId:p.narration.assetId,audio:true};
 if(p.bgm.source==='upload'&&p.bgm.assetId)f.bgm={path:'audio/bgm.'+extOf(p.bgm.name,'','mp3'),assetId:p.bgm.assetId,audio:true};
 p.scenes.forEach((s,i)=>{if(s.still&&s.still.assetId)f.stills[s.id]={path:`stills/scene-${pad(i+1)}.${extOf(s.still.name,s.still.mime,'jpg')}`,assetId:s.still.assetId};
  s.refs.forEach((r,k)=>{if(r.assetId)f.refs[r.id]={path:`refs/scene-${pad(i+1)}-${k+1}.${extOf(r.name,r.mime,r.kind==='video'?'mp4':'jpg')}`,assetId:r.assetId}})});
 p.refs.forEach((r,k)=>{if(r.assetId)f.refs[r.id]={path:`refs/global-${k+1}.${extOf(r.name,r.mime,r.kind==='video'?'mp4':'jpg')}`,assetId:r.assetId}});
 return f}
function stripForExport(p){const x=clone(p);if(x.narration)delete x.narration.peaks;return x}
function claudeRequest(p){const [w,h]=aspectWH(p.brief.aspect);const tl=timeline(p);const v=S.versions[0];
 return `첨부한 제작 안내서(brief.md)와 패키지 파일로 모션그래픽 영상을 제작해줘.
- 안내서 맨 아래 \`motion-brief\` JSON 블록이 정본이야. 본문 설명과 다르면 JSON을 따라.
- 산출물: ① ${w}×${h}, ${p.brief.fps}fps MP4 (${tl.total.toFixed(1)}초${p.narration?', 나레이션 '+packFiles(p).narration.path+' 포함':''}, BGM은 안내서의 BGM 브리프대로) ② 영상 컨셉이 한눈에 보이는 썸네일 PNG.
- 자막은 ${p.subs.show?`${LANGS[p.subs.lang]}${p.subs.second?' + '+LANGS[p.subs.second]+' (보조)':''}로 넣어줘`:'넣지 마'}.
- 잠긴 씬(locked: true)은 변경하지 말고, 체크되지 않은 수정 지시는 모두 반영해줘.
- 결과를 돌려줄 때 같은 형식의 brief.md를 함께 줘. front matter의 source는 claude-code 또는 claude-chat, note에는 바뀐 점을 적어줘${v?` (기준 버전 v${v.n})`:''}.`}
function buildBrief(p){const tl=timeline(p);const [w,h]=aspectWH(p.brief.aspect);const v=S.versions[0];const files=packFiles(p);const langs=enabledLangs(p);const b=p.brief;
 const L=[];const fm=['---','format: motion-brief/1',`title: "${String(p.title).replace(/"/g,'\\"')}"`,`project_id: ${p.id}`,`version: ${v?'v'+v.n:'draft'}`,`source: ${v&&v.source?({user:'web-user',web:'claude-web',code:'claude-code',chat:'claude-chat',git:'github',import:'import'})[v.source.kind]:'web-user'}`,`exported: ${new Date().toISOString()}`,`aspect: "${b.aspect}"`,`resolution: ${w}x${h}`,`fps: ${b.fps}`,`duration: ${tl.total.toFixed(2)}`,`timing: ${tl.aligned?'aligned-to-audio':'estimated'}`,`languages: [${langs.join(', ')}]`,`subtitles: ${p.subs.show?`${p.subs.lang}${p.subs.second?'+'+p.subs.second:''}`:'off'}`,'note: ""','---'];
 L.push(fm.join('\n'),'',`# ${p.title} — 모션그래픽 제작 안내서`,'',
 `> 이 문서는 Motion Brief Studio에서 내보낸 제작 사양입니다. 사람이 읽는 본문과, 맨 아래의 \`motion-brief\` JSON(정본)으로 이루어져 있습니다.`,'',
 '## 0. 작업 지시 (Claude에게)','',claudeRequest(p).split('\n').map(x=>x.startsWith('-')?x:'- '+x).join('\n').replace(/^- 첨부한/,'첨부한'),'',
 '## 1. 개요','',`| 항목 | 내용 |`,`|---|---|`,`| 주제 | ${(b.topic||'-').replace(/\n/g,' ')} |`,`| 핵심 메시지 | ${b.messages.filter(Boolean).map((m,i)=>`${i+1}) ${m}`).join(' · ')||'-'} |`,`| 타겟 | ${b.audience||'-'} |`,`| 길이 | 목표 ${b.duration}초 · 실제 ${tl.total.toFixed(1)}초 (${tl.aligned?'오디오 정렬':'예상치'}) |`,`| 화면 | ${w}×${h} · ${b.fps}fps${b.letterbox?' · 레터박스':''} |`,`| 스타일 | ${(STYLES.find(s=>s.k===b.style)||{n:b.style}).n} · 폰트 ${b.font} |`,`| 팔레트 | 배경 ${b.palette.bg} · 주 ${b.palette.primary} · 보조 ${b.palette.accent} · 텍스트 ${b.palette.text} |`,`| 자막 | ${p.subs.show?LANGS[p.subs.lang]+(p.subs.second?' + '+LANGS[p.subs.second]:''):'표시 안 함'} |`,'');
 if(b.notes)L.push('**제작 메모**','',b.notes,'');
 L.push('## 2. 사운드','','### 나레이션','',`- 오디오: ${files.narration?`\`${files.narration.path}\` (${p.narration.duration.toFixed(2)}초, 원본 ${p.narration.name})`:'없음 (TTS 생성 전)'}`,`- 보이스: ${p.voice.gender} · ${p.voice.age} · ${p.voice.tones.join(', ')} · ${p.voice.pace}${p.voice.voiceName?' · Gemini '+p.voice.voiceName:''}`,'','```text',styleInstruction(p),'```','','### BGM 브리프','','```text',bgmBriefKo(p),'```','','음원 생성·검색 프롬프트 (EN):','','```text',bgmPromptEn(p),'```','');
 L.push('## 3. 씬 구성','','| # | 시간 | 길이 | 챕터 | 제목 | 카메라 | 전환 | 에너지 | 상태 |','|---|---|---|---|---|---|---|---|---|');
 tl.segs.forEach(g=>{const s=g.s;L.push(`| ${pad(g.i+1)} | ${mmss(g.start)}–${mmss(g.end)} | ${(g.end-g.start).toFixed(1)}s | ${s.chapter||''} | ${s.title||''}${s.locked?' 🔒':''} | ${nameOf(CAMERAS,s.dir.camera)} | ${g.i===tl.segs.length-1?'엔딩':nameOf(TRANS,s.dir.transition)} | ${s.dir.energy}/5 | ${nameOf(STATUS,s.status)} |`)});
 L.push('','## 4. 씬 상세','');
 tl.segs.forEach(g=>{const s=g.s,d=s.dir;L.push(`### 씬 ${pad(g.i+1)} · ${s.title||'(제목 없음)'}${s.locked?' 🔒 잠김':''}`,'',`- 시간: ${g.start.toFixed(2)}s → ${g.end.toFixed(2)}s (${(g.end-g.start).toFixed(2)}s)${s.chapter?` · 챕터 라벨 \`${s.chapter}\``:''}`,`- 제작 의도: ${s.intent||'-'}`,`- 화면 구성: ${s.visual||'-'}`,`- 화면 텍스트: ${s.onscreen.headline?`“${s.onscreen.headline.replace(/\n/g,' / ')}”`:'-'}${s.onscreen.sub?` · 서브 “${s.onscreen.sub}”`:''} · 위치 ${nameOf(POSITIONS,s.onscreen.position)}`,
  `- 연출: 카메라 ${nameOf(CAMERAS,d.camera)} · 텍스트 ${nameOf(TEXTANIM,d.textAnim)} · 효과 ${d.effects.map(e=>nameOf(EFFECTS,e)).join(', ')||'없음'} · 톤 ${['아주 어둡게','어둡게','기본','밝게','아주 밝게'][d.tone+2]} · 페이싱 ${d.pace}/5 · 에너지 ${d.energy}/5 · 강조색 ${d.accent}`,
  `- 전환: ${g.i===tl.segs.length-1?'엔딩 (화면 유지 후 페이드)':nameOf(TRANS,d.transition)+' → 다음 씬'}${s.bgmHit?' · 시작 시 BGM 임팩트':''}`,`- 스틸: ${files.stills[s.id]?'`'+files.stills[s.id].path+'` (중심점 '+(s.still.fx??.5).toFixed(2)+', '+(s.still.fy??.5).toFixed(2)+')':'없음 — 화면 구성 설명대로 제작'}`);
  if(s.refs.length)L.push(`- 레퍼런스: ${s.refs.map(r=>`${r.title||r.kind}${files.refs[r.id]?` (\`${files.refs[r.id].path}\`)`:r.url?` (${r.url})`:''}${r.note?' — '+r.note:''}`).join(' / ')}`);
  L.push('','| # | 시작 | 끝 | '+langs.map(l=>LANGS[l]).join(' | ')+' |','|---|---|---|'+langs.map(()=>'---').join('|')+'|');
  const lt=new Map(tl.lines.map(x=>[x.l.id,x]));s.lines.forEach((l,k)=>{const x=lt.get(l.id);L.push(`| ${k+1} | ${x?x.start.toFixed(2):''} | ${x?x.end.toFixed(2):''} | ${langs.map(lg=>String(l[lg]||'').replace(/\|/g,'/')).join(' | ')} |`)});
  if(s.notes.length){L.push('','수정 지시:');s.notes.forEach(n=>L.push(`- [${n.done?'x':' '}] ${n.text}`))}L.push('')});
 if(p.refs.length){L.push('## 5. 전체 레퍼런스','');p.refs.forEach(r=>L.push(`- ${r.title||r.kind}${files.refs[r.id]?` — \`${files.refs[r.id].path}\``:r.url?` — ${r.url}`:''}${r.note?' · '+r.note:''}`));L.push('')}
 if(b.sourceText){L.push('## 6. 원문 자료','','<details><summary>펼치기</summary>','',b.sourceText,'','</details>','')}
 if(S.versions.length){L.push('## 7. 변경 이력 (최근 8개)','');S.versions.slice(0,8).forEach(x=>L.push(`- v${x.n} · ${stamp(x.at)} · ${(SRC[x.source&&x.source.kind]||SRC.user).n}${x.source&&x.source.agent?' ('+x.source.agent+')':''}${x.label?' · '+x.label:''} — ${(x.summary||[]).join(', ')}${x.note?' — '+x.note.replace(/\n/g,' '):''}`));L.push('')}
 L.push('## 8. 데이터 (정본)','','```json motion-brief',JSON.stringify({format:'motion-brief/1',exportedAt:new Date().toISOString(),version:v?'v'+v.n:null,files:Object.fromEntries(Object.entries({narration:files.narration&&files.narration.path,bgm:files.bgm&&files.bgm.path,stills:Object.fromEntries(Object.entries(files.stills).map(([k,x])=>[k,x.path])),refs:Object.fromEntries(Object.entries(files.refs).map(([k,x])=>[k,x.path]))})),timeline:{total:+tl.total.toFixed(3),scenes:tl.segs.map(g=>({id:g.s.id,start:+g.start.toFixed(3),end:+g.end.toFixed(3)})),lines:tl.lines.map(x=>({id:x.l.id,scene:x.g.s.id,start:+x.start.toFixed(3),end:+x.end.toFixed(3),est:!!x.est}))},project:stripForExport(p)},null,1),'```','');
 return L.join('\n')}
function buildSrt(p,lang){const tl=timeline(p);let k=0;return tl.lines.map(x=>{const t=String(x.l[lang]||'').trim();if(!t)return '';k++;return `${k}\n${srtTime(x.start)} --> ${srtTime(x.end)}\n${t}\n`}).filter(Boolean).join('\n')}

const Exp={thumbDraw:null};
function viewExport(){const p=S.proj;const langs=enabledLangs(p);const tl=timeline(p);const th=p.thumb;const [w,h]=aspectWH(p.brief.aspect);
 const openNotes=p.scenes.reduce((a,s)=>a+s.notes.filter(n=>!n.done).length,0);const missing=p.scenes.filter(s=>!s.lines.some(l=>l.ko.trim())).length;
 return `<div class="wrap" style="max-width:1400px">
 <div class="page-h"><div><div class="eyebrow">STEP 05 · 내보내기</div><h2>제작 안내서와 결과물</h2><p>brief.md(또는 ZIP 패키지)를 다른 프로젝트의 Claude에게 넘기면 그대로 제작할 수 있습니다. 완성된 MP4나 수정된 안내서는 아래에서 다시 가져와 버전으로 남기세요.</p></div>
 <div class="row">${S.dirty?`<span class="pill warn">마지막 버전 이후 변경 ${S.dirty}</span>`:''}<button class="btn" data-act="saveVersion">${ic('save','s')}버전 저장</button></div></div>
 <div class="row" style="margin-bottom:16px">${[[tl.aligned,tl.aligned?'타이밍 오디오 정렬':'타이밍은 예상치 (오디오 없음)'],[!missing,missing?`나레이션 없는 씬 ${missing}개`:'모든 씬에 나레이션'],[!openNotes,openNotes?`미완료 수정 지시 ${openNotes}개 (안내서에 체크리스트로 포함)`:'미완료 수정 지시 없음'],[langs.every(l=>l==='ko'||tl.lines.every(x=>String(x.l[l]||'').trim())),langs.length>1?'다국어 자막 '+(langs.every(l=>l==='ko'||tl.lines.every(x=>String(x.l[l]||'').trim()))?'완료':'빈 줄 있음'):'자막: 한국어']].map(([ok,t])=>`<span class="pill ${ok?'ok':'warn'}">${ok?ic('check','s'):'!'} ${t}</span>`).join('')}</div>
 <div class="xgrid">
  <section class="card x8" style="overflow:hidden"><div class="sec" style="padding-bottom:14px"><div class="sec-h"><h3>제작 안내서 <span class="mono muted" style="font-weight:400;font-size:12px">brief.md</span></h3><div class="row"><button class="btn sm" data-act="copyRequest">${ic('msg','s')}요청문 복사</button><button class="btn sm" data-act="copyBrief">${ic('copy','s')}복사</button><button class="btn sm pri" data-act="dlBrief">${ic('download','s')}brief.md</button></div></div>
   <p class="muted" style="font-size:12px">본문(사람용) + 맨 아래 JSON 정본(기계용)으로 되어 있어, Claude가 정확히 읽고 같은 형식으로 수정본을 돌려줄 수 있습니다.</p></div><pre class="mdpre" id="mdpre">${esc(buildBrief(p))}</pre></section>
  <section class="card sec x4"><div class="sec-h"><h3>파일</h3></div>
   <div class="dlrow"><span class="ft">ZIP</span><div class="dt"><b>제작 패키지</b><span>안내서 · JSON · 나레이션 텍스트 · SRT · 오디오 · 스틸 · 레퍼런스 · 썸네일</span></div><button class="btn sm pri" data-act="dlZip">${ic('download','s')}저장</button></div>
   <div class="dlrow"><span class="ft">JSON</span><div class="dt"><b>project.json</b><span>다시 가져오기용 프로젝트 데이터</span></div><button class="btn sm" data-act="dlJson">${ic('download','s')}</button></div>
   ${langs.map(l=>`<div class="dlrow"><span class="ft">TXT</span><div class="dt"><b>narration_${l}.txt</b><span>${LANGS[l]} 나레이션 · TTS용 일반 텍스트</span></div><button class="btn sm" data-act="copyNarr" data-arg="${l}" aria-label="복사">${ic('copy','s')}</button><button class="btn sm" data-act="dlNarr" data-arg="${l}" aria-label="저장">${ic('download','s')}</button></div>`).join('')}
   ${langs.map(l=>`<div class="dlrow"><span class="ft">SRT</span><div class="dt"><b>subtitles_${l}.srt</b><span>${LANGS[l]} 자막 ${tl.aligned?'· 오디오 타이밍':'· 예상 타이밍'}</span></div><button class="btn sm" data-act="dlSrt" data-arg="${l}" aria-label="저장">${ic('download','s')}</button></div>`).join('')}
  </section>
  <section class="card sec x6"><div class="sec-h"><h3>썸네일</h3><span class="muted" style="font-size:12px">영상 컨셉을 한 장에</span></div>
   <canvas class="thumbcv" id="thumbcv" width="1280" height="720"></canvas>
   <div class="row">${seg('p.thumb.tpl',[['cinema','시네마'],['center','센터 타이틀'],['board','스토리보드']],th.tpl)}<span class="sp"></span><select class="sel" style="width:auto" id="thumbScene" data-bind="p.thumb.sceneId" aria-label="배경 씬"><option value="">배경: 자동</option>${p.scenes.map((s,i)=>`<option value="${s.id}" ${th.sceneId===s.id?'selected':''}>배경: 씬 ${i+1}${s.still?'':' (스틸 없음)'}</option>`).join('')}</select></div>
   <div class="grid2"><input class="in" id="th-title" data-bind="p.thumb.title" value="${esc(th.title)}" placeholder="${esc(p.title)}"><input class="in" id="th-sub" data-bind="p.thumb.sub" value="${esc(th.sub)}" placeholder="${esc(p.brief.messages[0]||p.brief.topic||'서브 카피')}"></div>
   <div class="row" style="justify-content:flex-end"><button class="btn sm" data-act="thumbAttach">${ic('save','s')}버전에 첨부</button><button class="btn sm pri" data-act="dlThumb">${ic('download','s')}PNG 저장</button></div></section>
  <section class="card sec x6"><div class="sec-h"><h3>애니마틱 MP4</h3><span class="muted" style="font-size:12px">${w}×${h} · 실시간 녹화 ${secs(tl.total)}</span></div>
   <canvas class="recv" id="reccv" width="${w}" height="${h}" style="aspect-ratio:${w}/${h};max-height:340px;object-fit:contain"></canvas>
   <div class="prog"><i id="recprog"></i></div>
   <div class="row"><span class="muted" style="font-size:12px" id="recmsg">편집 화면의 미리보기를 그대로 녹화합니다. 녹화하는 동안 이 탭을 앞에 두세요.</span><span class="sp"></span><label class="row" style="gap:6px;font-size:12px">소리 모니터<button class="toggle" aria-pressed="${Rec.monitor}" data-act="recMonitor" aria-label="소리 모니터"></button></label><button class="btn sm pri" data-act="record" id="recbtn">${ic('rec','s')}녹화 시작</button></div>
   <div id="recout"></div></section>
  <section class="card sec x12"><div class="sec-h"><h3>결과물 돌려받기</h3><span class="muted" style="font-size:12px">다른 Claude 작업에서 만든 최종 영상·수정본을 버전으로 기록</span></div>
   <div class="grid3"><button class="drop" data-act="finalUpload" data-dropfinal="1">${ic('film','l')}<b style="font-size:13px;color:var(--fg)">최종 MP4 등록</b><span style="font-size:11.5px">20MB 이하 · 출처 태그와 함께 새 버전</span></button>
    <button class="drop" data-act="import">${ic('import','l')}<b style="font-size:13px;color:var(--fg)">수정된 안내서 가져오기</b><span style="font-size:11.5px">brief.md 또는 project.json 붙여 넣기·드롭</span></button>
    <button class="drop" data-act="finalLink">${ic('link','l')}<b style="font-size:13px;color:var(--fg)">링크로 등록</b><span style="font-size:11.5px">큰 파일은 드라이브·깃허브 링크로</span></button></div>
   ${p.renders.length?`<div class="refgrid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${p.renders.slice().reverse().map(r=>`<div class="ref"><div class="th">${r.assetId?`<video src="${Store.url(r.assetId)}" controls preload="metadata"></video>`:`<a href="${esc(r.url)}" target="_blank" rel="noopener" style="color:var(--accent);padding:10px;text-align:center;word-break:break-all;font-size:12px">${ic('link','l')}<br>${esc(r.url)}</a>`}<span class="k">${r.kind==='final'?'FINAL':'ANIMATIC'}</span></div><div class="rb"><div class="row"><b style="font-size:12px">${r.v?'v'+r.v:''} ${srcTag(r.source)}</b><span class="faint" style="font-size:11px">${rel(r.at)}</span></div>${r.note?`<span class="muted" style="font-size:11.5px">${esc(r.note)}</span>`:''}</div></div>`).join('')}</div>`:''}
  </section>
 </div></div>`}
MOUNT.export=()=>{const cv=$('#thumbcv');if(cv){const [w,h]=aspectWH(S.proj.brief.aspect);const k=1280/Math.max(w,h);cv.width=Math.round(w*k);cv.height=Math.round(h*k);cv.style.aspectRatio=`${w}/${h}`;if(h>w)cv.style.maxHeight='420px';Exp.thumbDraw=()=>{if(document.body.contains(cv))drawThumb(cv.getContext('2d'),cv.width,cv.height,S.proj)};Exp.thumbDraw();document.fonts&&document.fonts.ready.then(()=>Exp.thumbDraw&&Exp.thumbDraw())}
 const rc=$('#reccv');if(rc&&!Rec.running)drawFrame(rc.getContext('2d'),rc.width,rc.height,S.proj,Math.min(timeline(S.proj).total*.3,6),{subs:S.proj.subs.show,lang:S.proj.subs.lang,second:S.proj.subs.second});
 if(Rec.lastUrl)showRecOut()};
function thumbBgScene(p){const th=p.thumb;let s=th.sceneId&&p.scenes.find(x=>x.id===th.sceneId);if(!s)s=p.scenes.find(x=>x.still)||p.scenes[0];return s}
function drawThumb(ctx,W,H,p){const th=p.thumb,pal=p.brief.palette;const F=fontStack(p);const tl=timeline(p);const title=th.title||p.title;const sub=th.sub||p.brief.messages[0]||p.brief.topic||'';
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=pal.bg;ctx.fillRect(0,0,W,H);const base=Math.min(W,H*1.78);
 const bgImg=(s,x,y,w,h)=>{const im=s&&s.still&&img(s.still.assetId);if(im){const [ix,iy,iw,ih]=coverRect(im.naturalWidth,im.naturalHeight,w,h,s.still.fx??.5,s.still.fy??.5);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(im,x+ix,y+iy,iw,ih);ctx.restore();return true}
  const gr=ctx.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,pal.bg);gr.addColorStop(1,hexA(pal.primary,.5));ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);return false};
 if(th.tpl==='board'){const cells=p.scenes.slice(0,6);const cols=W>=H?3:2,rows=Math.ceil(Math.max(1,cells.length)/cols);const top=H*.3,g=base*.008;const cw=(W-g*(cols+1))/cols,chh=(H-top-g*(rows+1))/rows;
  ctx.fillStyle=pal.bg;ctx.fillRect(0,0,W,H);cells.forEach((s,i)=>{const cx=g+(i%cols)*(cw+g),cy=top+g+Math.floor(i/cols)*(chh+g);const has=bgImg(s,cx,cy,cw,chh);const gd=ctx.createLinearGradient(0,cy+chh*.45,0,cy+chh);gd.addColorStop(0,'rgba(0,0,0,0)');gd.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=gd;ctx.fillRect(cx,cy,cw,chh);
   ctx.fillStyle='#fff';ctx.font=`800 ${Math.round(base*.03)}px "Bricolage Grotesque",sans-serif`;ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText(pad(i+1),cx+base*.012,cy+chh-base*.034);ctx.font=`600 ${Math.round(base*.0125)}px ${F}`;ctx.fillText(((s.chapter?s.chapter.toUpperCase()+' · ':'')+(s.title||'')).slice(0,34),cx+base*.012,cy+chh-base*.012);
   if(!has&&s.visual){ctx.font=`italic ${Math.round(base*.012)}px ${F}`;ctx.fillStyle=hexA(pal.text,.6);wrapLines(ctx,s.visual,cw-base*.03).slice(0,2).forEach((l,k)=>ctx.fillText(l,cx+base*.012,cy+base*.03+k*base*.017))}});
  const tc_=lum(pal.bg)<.5?'#fff':pal.text;ctx.textBaseline='alphabetic';ctx.fillStyle=pal.primary;ctx.font=`600 ${Math.round(base*.013)}px "IBM Plex Mono",monospace`;ctx.fillText(`${p.scenes.length} SCENES · ${Math.round(tl.total)}s · ${p.brief.aspect}`,g*2,top*.3);
  ctx.fillStyle=tc_;ctx.font=`800 ${Math.round(base*.052)}px ${F}`;ctx.fillText(title,g*2,top*.64);ctx.font=`300 ${Math.round(base*.02)}px ${F}`;ctx.fillStyle=hexA(tc_==='#fff'?'#ffffff':pal.text,.75);ctx.fillText(sub.slice(0,70),g*2,top*.88);ctx.restore();return}
 const s=thumbBgScene(p);const has=bgImg(s,0,0,W,H);
 if(th.tpl==='center'){ctx.fillStyle=has?'rgba(0,0,0,.5)':'rgba(0,0,0,.15)';ctx.fillRect(0,0,W,H);const vg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=pal.primary;ctx.font=`600 ${Math.round(base*.015)}px "IBM Plex Mono",monospace`;ctx.fillText((p.scenes.map(x=>x.chapter).filter(Boolean).slice(0,5).join('  ·  ')||'MOTION GRAPHIC').toUpperCase(),W/2,H*.3);
  ctx.fillStyle='#fff';ctx.font=`800 ${Math.round(base*.075)}px ${F}`;const tlns=wrapLines(ctx,title,W*.8);tlns.forEach((l,k)=>ctx.fillText(l,W/2,H*.47+(k-(tlns.length-1)/2)*base*.085));
  const y2=H*.47+tlns.length*base*.045+base*.05;ctx.fillStyle=pal.primary;ctx.fillRect(W/2-base*.04,y2,base*.08,Math.max(3,base*.004));ctx.fillStyle='rgba(255,255,255,.85)';ctx.font=`300 ${Math.round(base*.024)}px ${F}`;ctx.fillText(sub.slice(0,60),W/2,y2+base*.05);ctx.restore();return}
 // cinema
 const gl=ctx.createLinearGradient(0,0,W*.75,0);gl.addColorStop(0,'rgba(0,0,0,.82)');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.fillRect(0,0,W,H);
 const lb=p.brief.letterbox&&W>=H?Math.round(H*.07):0;if(lb){ctx.fillStyle='#000';ctx.fillRect(0,0,W,lb);ctx.fillRect(0,H-lb,W,lb)}
 const x=W*.06;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=pal.primary;ctx.font=`600 ${Math.round(base*.016)}px "IBM Plex Mono",monospace`;ctx.fillText(`${p.scenes.length} SCENES · ${Math.round(tl.total)}s`,x,H*.3);
 ctx.fillStyle='#fff';ctx.font=`800 ${Math.round(base*.07)}px ${F}`;const tl2=wrapLines(ctx,title,W*.55);tl2.forEach((l,k)=>ctx.fillText(l,x,H*.42+k*base*.08));let y=H*.42+(tl2.length-1)*base*.08+base*.06;
 ctx.font=`300 ${Math.round(base*.024)}px ${F}`;ctx.fillStyle='rgba(255,255,255,.85)';wrapLines(ctx,sub,W*.5).slice(0,2).forEach(l=>{ctx.fillText(l,x,y);y+=base*.034});
 const chips=p.scenes.map((s,i)=>`${pad(i+1)} ${(s.chapter||s.title||'').toUpperCase()}`).slice(0,6);ctx.font=`500 ${Math.round(base*.0125)}px "IBM Plex Mono",monospace`;let cx=x;const cy=H-lb-H*.09;
 chips.forEach((c,i)=>{const w=ctx.measureText(c).width;if(cx+w>W*.95)return;ctx.fillStyle=i===0?pal.primary:'rgba(255,255,255,.75)';ctx.fillText(c,cx,cy);cx+=w+base*.02;if(i<chips.length-1){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillText('→',cx-base*.015,cy)}});
 ctx.fillStyle=pal.primary;ctx.fillRect(x,H*.42-base*.11,base*.05,Math.max(3,base*.005));ctx.restore()}

/* ---------- recorder ---------- */
const Rec={running:false,monitor:true,lastUrl:null,lastBlob:null,lastMime:'',
 pickMime(){const c=['video/mp4;codecs="avc1.640028,mp4a.40.2"','video/mp4;codecs=avc1,mp4a','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return c.find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||''},
 async start(){if(this.running)return this.stop();const cv=$('#reccv');if(!cv)return;if(!window.MediaRecorder||!cv.captureStream){toast('이 브라우저는 영상 녹화를 지원하지 않아요. Chrome 최신 버전을 써 주세요.',{err:true});return}
  Player.pause();const p=S.proj;const tl=timeline(p);const ctx=actx();try{await ctx.resume()}catch(e){}
  if(p.narration)await audioBuffer(p.narration.assetId).catch(()=>null);
  const dest=ctx.createMediaStreamDestination();const out=ctx.createGain();out.connect(dest);if(this.monitor)out.connect(ctx.destination);
  const fps=p.brief.fps>=60?60:30;const stream=new MediaStream([...cv.captureStream(fps).getVideoTracks(),...dest.stream.getAudioTracks()]);
  const mime=this.pickMime();const [w]=aspectWH(p.brief.aspect);const mr=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:w>=1920?10e6:8e6,audioBitsPerSecond:192e3}:{});const chunks=[];mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  this.running=true;this.holder={playing:true,forceBgm:p.bgm.preview,out};const btn=$('#recbtn');if(btn)btn.innerHTML=`${ic('pause','s')}녹화 중지`;
  const c2=cv.getContext('2d');drawFrame(c2,cv.width,cv.height,p,0,{subs:p.subs.show,lang:p.subs.lang,second:p.subs.second,tl});
  mr.start(250);const t0=ctx.currentTime+.25;await startAudio(ctx,out,p,tl,0,t0,this.holder);
  const done=new Promise(r=>mr.onstop=r);
  const loop=()=>{if(!this.running)return;const t=Math.max(0,ctx.currentTime-t0);drawFrame(c2,cv.width,cv.height,p,Math.min(t,tl.total),{subs:p.subs.show,lang:p.subs.lang,second:p.subs.second,tl});const pr=$('#recprog');if(pr)pr.style.width=(t/tl.total*100).toFixed(1)+'%';const m=$('#recmsg');if(m)m.textContent=`녹화 중 ${tc(t,fps)} / ${tc(tl.total,fps)} · 탭을 바꾸면 끊길 수 있어요`;
   if(t>=tl.total+.15){this.finish()}else requestAnimationFrame(loop)};this.mr=mr;loop();
  await done;stopAudio(this.holder);try{out.disconnect()}catch(e){}
  const type=(mime||'video/webm').split(';')[0];const blob=new Blob(chunks,{type});if(this.lastUrl)URL.revokeObjectURL(this.lastUrl);this.lastBlob=blob;this.lastMime=type;this.lastUrl=URL.createObjectURL(blob);this.running=false;
  const b2=$('#recbtn');if(b2)b2.innerHTML=`${ic('rec','s')}다시 녹화`;const m=$('#recmsg');if(m)m.textContent=`녹화 완료 · ${(blob.size/1048576).toFixed(1)}MB · ${type==='video/mp4'?'MP4':'WebM (이 브라우저는 MP4 녹화를 지원하지 않음)'}`;showRecOut()},
 finish(){if(this.mr&&this.mr.state!=='inactive'){this.running=false;this.mr.stop()}},
 stop(){this.finish()}};
function showRecOut(){const o=$('#recout');if(!o||!Rec.lastUrl)return;const ext=Rec.lastMime==='video/mp4'?'mp4':'webm';
 o.innerHTML=`<div class="divider"></div><div class="row"><video src="${Rec.lastUrl}" controls style="width:200px;border-radius:8px;background:#000"></video><div style="flex:1;min-width:160px;display:grid;gap:6px"><b>animatic.${ext}</b><span class="muted" style="font-size:12px">${(Rec.lastBlob.size/1048576).toFixed(1)}MB</span><div class="row"><button class="btn sm pri" data-act="recSave">${ic('download','s')}저장</button><button class="btn sm" data-act="recAttach" ${Rec.lastBlob.size>20*1048576?'disabled title="20MB 이하만 첨부할 수 있어요"':''}>${ic('save','s')}버전에 첨부</button></div></div></div>`}

/* ---------- zip ---------- */
async function buildZip(){if(!window.JSZip){toast('ZIP 라이브러리를 불러오지 못했어요. 개별 파일로 저장해 주세요.',{err:true});return}
 const p=S.proj;const z=new JSZip();const files=packFiles(p);const langs=enabledLangs(p);toast('패키지를 만드는 중…');
 z.file('brief.md',buildBrief(p));z.file('project.json',JSON.stringify({format:'motion-brief/1',project:stripForExport(p)},null,1));z.file('REQUEST.txt',claudeRequest(p));
 langs.forEach(l=>{z.file(`narration_${l}.txt`,ttsBody(p,l,p.tts.sceneBreak));z.file(`subtitles_${l}.srt`,buildSrt(p,l))});z.file('tts_style_instructions.txt',styleInstruction(p));z.file('bgm_brief.txt',bgmBriefKo(p)+'\n\n[EN prompt]\n'+bgmPromptEn(p));
 const fails=[];const add=async(x)=>{try{if(x.audio){const a=await audioBytes(x.assetId);z.file(x.path,a.bytes)}else{z.file(x.path,await Store.fetchBlob(x.assetId))}}catch(e){fails.push(x.path)}};
 const all=[files.narration,files.bgm,...Object.values(files.stills),...Object.values(files.refs)].filter(Boolean);for(const x of all)await add(x);
 const cv=document.createElement('canvas');const [w,h]=aspectWH(p.brief.aspect);cv.width=w;cv.height=h;drawThumb(cv.getContext('2d'),w,h,p);const tb=await new Promise(r=>cv.toBlob(r,'image/png'));if(tb)z.file('thumbnail.png',tb);
 const blob=await z.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
 await saveFile(`${slug(p.title)}_${S.versions[0]?'v'+S.versions[0].n:'draft'}.zip`,blob);if(fails.length)toast(`일부 파일을 넣지 못했어요: ${fails.join(', ')}`,{err:true})}
