/* ================= project create / sample ================= */
async function createProject(p,{label='생성',note='',source={kind:'user'}}={}){
 try{await Store.saveDraft(p.id,p);await Store.saveMeta(p.id,metaOf(p))}catch(e){toast(errMsg(e),{err:true});return}
 await openProject(p.id);await commitVersion({label,note,source})}
function sampleProject(){const SUB=[[0.27,2.09,"모빌리티의 진정한 가치는"],[2.51,4.17,"고객의 일상 속 안전과"],[4.46,7.86,"예기치 못한 순간의 불안감을 해소하는 데에서 시작됩니다."],[9.03,11.93,"우리는 토요타의 차세대 커넥티드 서비스 환경 속에서"],[12.19,14.71,"차량의 미세한 신호 하나까지 놓치지 않는"],[14.96,17.07,"스마트한 케어 체계를 구축하고 있습니다."],[18.37,21.63,"실시간으로 수집되는 차량 진단 데이터와 경고 신호는"],[22.07,24.08,"콜센터 상담원과 서비스 어드바이저,"],[24.42,27.61,"그리고 정비사로 이어지는 유기적인 프로세스를 통해"],[27.97,29.30,"완벽하게 연결됩니다."],[30.64,32.59,"차량이 서비스 센터에 도착하기 전,"],[32.89,34.47,"미리 고장 원인을 파악하고"],[34.77,38.51,"고객에게 가장 신속하고 정확한 대처 가이드를 제시하는 것."],[38.99,41.31,"이것이 바로 본 프로젝트가 지향하는"],[41.59,43.15,"능동적이고 선제적인"],[43.42,45.56,"고객 감동 서비스의 핵심입니다."]];
 const JA=["モビリティの真の価値は、","お客様の日常における安全と、","予期せぬ瞬間の不安を解消することから始まります。","私たちはトヨタの次世代コネクティッドサービス環境の中で、","車両のわずかなサインひとつも見逃さない","スマートなケア体制を構築しています。","リアルタイムで収集される車両診断データと警告信号は、","コールセンターのオペレーター、サービスアドバイザー、","そして整備士へとつながる有機的なプロセスによって","完璧につながります。","車両がサービスセンターに到着する前に、","あらかじめ故障の原因を把握し、","お客様に最も迅速かつ的確な対処ガイドをご提示すること。","これこそが、本プロジェクトが目指す","能動的でプロアクティブな","お客様に感動をお届けするサービスの核心です。"];
 const mk=(a,b)=>SUB.slice(a,b).map((x,k)=>({...newLine(x[2]),ja:JA[a+k],start:x[0],end:x[1]}));
 const p=newProject('예시 · e-Care 컨셉 영상');p.example=true;p.stage=4;
 Object.assign(p.brief,{topic:'고객이 문제를 알아차리기 전에 차량 상태를 진단하고 먼저 연락하는 토요타 커넥티드 케어(e-Care) 서비스를 고객에게 설명하는 시네마틱 모션그래픽',messages:['불안을 안심으로 바꾸는 선제적 케어','차량 데이터 → 상담원 → 어드바이저 → 정비사로 이어지는 하나의 프로세스','센터 도착 전에 이미 시작된 케어'],audience:'신차 구매 고객 · 딜러 상담 현장',duration:48,notes:'스캔 효과는 변형 금지. 정측면 컷에 디지털 트윈 윤곽선. 장면 5는 턴테이블 회전 후 로고 락업.'});
 p.brief.palette={bg:'#07090D',primary:'#E60012',accent:'#0FB5A3',text:'#FFFFFF'};p.langs.ja=true;p.subs={show:true,lang:'ko',second:'ja'};p.tail=2.94;
 Object.assign(p.voice,{gender:'남성',age:'40대',tones:['신뢰감 있는','차분한','진중한'],voiceName:'Charon'});
 Object.assign(p.bgm,{preset:'brand',energy:.36,valence:.62,bpm:80,genres:['앰비언트','시네마틱 오케스트라'],instruments:['신스 패드','벨·글로켄'],avoid:['보컬','강한 드럼'],notes:'씬 전환마다 휘익(whoosh), 1장 4.5초에 경고 핑, 엔딩에 차임'});
 const D=(o)=>({energy:3,tone:0,pace:3,camera:'zoomIn',transition:'dissolve',effects:['vignette','grain'],textAnim:'mask',accent:'primary',...o});
 p.scenes=[
  newScene({chapter:'VALUE',title:'가치 — 불안을 안심으로',intent:'일상 속 안전의 가치를 말하다 예기치 못한 순간(경고)으로 긴장을 만들고, 곧바로 안심으로 전환',visual:'전면 3/4 차량 컷, 4.5초 글리치와 붉은 레티클(ANOMALY DETECTED), 6.2초에 청록 레티클로 전환',onscreen:{headline:'불안을\n안심으로.',sub:'',position:'left'},lines:mk(0,3),start:0,end:8.6,dir:D({energy:2,tone:-1,camera:'zoomOut',effects:['glitch','hud','vignette','grain'],transition:'whip'})}),
  newScene({chapter:'SENSING',title:'감지 — 미세한 신호까지',intent:'e-Care 브랜드를 소개하고, 차량 전체를 스캔해 센서 데이터를 읽는 장면으로 기술 신뢰감 전달',visual:'정측면 컷(우향), 12.15–14.5초 좌→우 스캔 + 디지털트윈 윤곽선, 타이어·배터리·ECU·브레이크·파워트레인 콜아웃',onscreen:{headline:'e-Care',sub:'TIRE PRESSURE · HV BATTERY · ECU · BRAKE SYSTEM',position:'left'},lines:mk(3,6),start:8.6,end:17.9,dir:D({energy:3,camera:'panR',effects:['scan','callout','vignette'],transition:'flash'}),bgmHit:true}),
  newScene({chapter:'CONNECT',title:'연결 — 데이터에서 사람까지',intent:'데이터가 상담원·어드바이저·정비사로 이어지는 하나의 프로세스임을 4개 패널로 보여줌',visual:'후면 3/4 컷을 어둡게+블러, 글래스 패널 4개(차량·콜센터·어드바이저·정비사)와 연결선',onscreen:{headline:'데이터에서 사람까지,\n하나로.',sub:'',position:'center'},lines:mk(6,10),start:17.9,end:30.2,dir:D({energy:3,tone:-1,camera:'panL',effects:['dof','grid','particles'],transition:'flash'}),bgmHit:true}),
  newScene({chapter:'PROACTIVE',title:'선제 대응 — 도착 전 케어',intent:'센터 도착 전에 원인 파악 → 가이드 → 콜아웃 → 입고 준비가 이미 끝나 있음을 타임라인으로',visual:'하이앵글 탑뷰 줌인, 좌측 4단계 타임라인, 우측 원격진단·대처 가이드 카드',onscreen:{headline:'센터 도착 전,\n이미 시작된 케어.',sub:'이상 감지 · 원인 파악 · 대처 가이드 · 입고 준비',position:'left'},lines:mk(10,13),start:30.2,end:38.9,dir:D({energy:4,camera:'push',effects:['hud','callout','vignette'],transition:'flash'}),bgmHit:true}),
  newScene({chapter:'PROMISE',title:'약속 — 능동적, 선제적',intent:'핵심 가치를 두 단어로 각인하고 로고 락업으로 마무리',visual:'턴테이블 회전(16컷, 가로 모션블러) 후 슬로 줌, 능동적./선제적. 타이포, e-Care 로고와 태그라인',onscreen:{headline:'능동적. 선제적.',sub:'고객이 알기 전에, 토요타가 먼저 케어합니다.',position:'center'},lines:mk(13,16),start:38.9,end:48.5,dir:D({energy:5,tone:1,camera:'orbit',effects:['sweep','vignette'],textAnim:'pop',transition:'dissolve'}),bgmHit:true,status:'review'})];
 p.scenes[0].notes=[{id:uid('n'),text:'GX 컷으로 교체 시 레티클 bbox 재측정',done:false,at:Date.now()}];
 p.thumb={tpl:'cinema',title:'e-Care',sub:'고객이 알기 전에, 토요타가 먼저 케어합니다.',sceneId:null};return p}

/* ================= actions ================= */
const ACT={
 home(){Player.pause();closeHistory();S.view='home';S.proj=null;S.pid=null;unsubV&&unsubV();unsubD&&unsubD();render()},
 go(el){go(el.dataset.arg)},
 open(el,e){if(e.target.closest('[data-act="delProject"]'))return;openProject(el.dataset.arg)},
 async delProject(el,e){e.stopPropagation();const id=el.dataset.arg;const m=S.projects.find(x=>x.id===id);if(await confirmBox('프로젝트를 삭제하시겠습니까?',`‘${esc(m&&m.title||'')}’와 모든 버전 기록이 삭제되며 되돌릴 수 없습니다.`,'삭제')){try{await Store.delProject(id);toast('프로젝트를 삭제했습니다.')}catch(err){toast(errMsg(err),{err:true})}}},
 newProject(){let dur=45,asp='16:9';const m=modal({title:'새 프로젝트',body:`<div class="field"><label for="np-t">이름</label><input class="in" id="np-t" placeholder="예: 신규 앱 온보딩 소개 영상" autofocus></div>
  <div class="field"><div class="lbl">목표 길이</div><div class="seg" id="np-d">${[15,30,45,60,90].map(x=>`<button aria-pressed="${x===45}" data-k="${x}">${x}초</button>`).join('')}</div></div>
  <div class="field"><div class="lbl">화면비</div><div class="seg" id="np-a">${ASPECTS.map(a=>`<button aria-pressed="${a[0]==='16:9'}" data-k="${a[0]}">${a[1]}</button>`).join('')}</div></div>`,foot:`<button class="btn" data-no>취소</button><button class="btn pri" data-ok>만들기</button>`});
  const pickSeg=(id,cb)=>m.querySelector(id).onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;cb(b.dataset.k);$$(id+' button').forEach(c=>c.setAttribute('aria-pressed',String(c===b)))};pickSeg('#np-d',k=>dur=+k);pickSeg('#np-a',k=>asp=k);
  m.querySelector('[data-no]').onclick=()=>m.close();const ok=async()=>{const p=newProject($('#np-t').value.trim()||'새 모션그래픽');p.brief.duration=dur;p.brief.aspect=asp;if(asp!=='16:9')p.brief.letterbox=false;m.close();await createProject(p,{label:'프로젝트 생성'})};
  m.querySelector('[data-ok]').onclick=ok;m.querySelector('#np-t').addEventListener('keydown',e=>{if(e.key==='Enter')ok()})},
 async sample(){$$('#layer .scrim').forEach(x=>x.remove());drawerEl=null;bgmModal=null;const p=sampleProject();await createProject(p,{label:'예시 프로젝트',note:'e-Care v2.1 시네마틱 영상을 예시 데이터로 옮김 (스틸·오디오 제외)',source:{kind:'import',agent:'예시 데이터'}});go('edit')},
 import(){openImport()},
 history(){openHistory()},closeHistory(){closeHistory()},
 vfilter(el){S.vfilter=el.dataset.arg;renderHistory()},
 viewVersion(el){viewVersion(el.dataset.arg)},
 restoreVersion(el){restoreVersion(el.dataset.arg)},
 dlVersionBrief(el){const v=S.versions.find(x=>x.id===el.dataset.arg);if(!v)return;const keep=S.proj;S.proj=norm(v.snapshot);const md=buildBrief(S.proj).replace(/^version: .*$/m,'version: v'+v.n);S.proj=keep;saveFile(`${slug(v.snapshot.title)}_v${v.n}_brief.md`,md)},
 saveVersion(){saveVersionModal()},
 undo(){undo()},redo(){redo()},
 help(){openHelp()},bgm(){openBgm()},
 loadRemote(){if(!S.remoteBanner)return;S.proj=norm(S.remoteBanner);S.remoteBanner=false;S.undo.push(JSON.stringify(S.proj));refresh();renderBanner();toast('최신 내용을 불러왔습니다.')},
 dismissRemote(){S.remoteBanner=false;renderBanner()},
 style(el){const st=STYLES.find(x=>x.k===el.dataset.arg);if(!st)return;const b=S.proj.brief;b.style=st.k;b.palette=clone(st.pal);b.font=st.font;b.letterbox=st.letterbox&&b.aspect==='16:9';touch('p.brief',{structural:true})},
 aiDraft(){aiDraft()},aiReviseAll(){aiReviseAll()},aiScene(el){aiScene(el.dataset.arg)},aiTranslate(el){aiTranslate(el.dataset.arg||null)},
 addScene(){const p=S.proj;const at=S.view==='edit'?S.sel+1:p.scenes.length;const s=newScene();const prev=p.scenes[at-1];if(prev){s.dir=clone(prev.dir)}p.scenes.splice(at,0,s);if(p.scenes.some(x=>x.start!=null)&&prev){const e=prev.end??timeline(p).total;s.start=e;s.end=e+3;p.scenes.slice(at+1).forEach(x=>{if(x.start!=null){x.start+=3;x.end+=3}})}S.sel=at;touch('scenes',{structural:true});if(S.view==='script')setTimeout(()=>{const t=$(`#tx-${s.id}-ko`);t&&t.focus();t&&t.scrollIntoView({block:'center',behavior:'smooth'})},50)},
 dupScene(el){const p=S.proj;const i=p.scenes.findIndex(s=>s.id===el.dataset.arg);if(i<0)return;const c=clone(p.scenes[i]);c.id=uid('s');c.lines.forEach(l=>l.id=uid('l'));c.refs.forEach(r=>r.id=uid('r'));c.notes=[];c.locked=false;if(c.start!=null){const d=c.end-c.start;p.scenes.slice(i+1).forEach(x=>{if(x.start!=null){x.start+=d;x.end+=d}});c.start=p.scenes[i].end;c.end=c.start+d}p.scenes.splice(i+1,0,c);S.sel=i+1;touch('scenes',{structural:true});toast('씬을 복제했습니다.')},
 async delScene(el){const p=S.proj;if(p.scenes.length<2)return toast('씬이 하나뿐이라 삭제할 수 없습니다.');const i=p.scenes.findIndex(s=>s.id===el.dataset.arg);const s=p.scenes[i];const has=s.lines.some(l=>l.ko.trim())||s.intent||s.still;
  if(has&&!(await confirmBox(`씬 ${i+1}을 삭제하시겠습니까?`,'되돌리기(⌘Z)나 버전 기록으로 복구할 수 있습니다.','삭제')))return;if(s.start!=null&&p.scenes[i-1])p.scenes[i-1].end=s.end;else if(s.start!=null&&p.scenes[i+1])p.scenes[i+1].start=s.start;p.scenes.splice(i,1);S.sel=clamp(S.sel,0,p.scenes.length-1);touch('scenes',{structural:true})},
 moveScene(el){const [id,d]=el.dataset.arg.split(':');const p=S.proj;const i=p.scenes.findIndex(s=>s.id===id);const j=i+(+d);if(j<0||j>=p.scenes.length)return;moveSceneTo(i,j)},
 sel(el){selectScene(+el.dataset.arg)},
 tab(el){S.tab=el.dataset.arg;renderInspector()},
 prevScene(){selectScene(S.sel-1)},nextScene(){selectScene(S.sel+1)},
 play(){Player.toggle()},
 seek(el){S.t=+el.dataset.arg;Player.seek(S.t)},
 guides(){S.guides=!S.guides;renderPTool();Player.redrawAll()},
 fullscreen(){const c=$('#cwrap');if(c&&c.requestFullscreen)c.requestFullscreen().catch(()=>toast('전체 화면을 열 수 없습니다.',{err:true}))},
 addLine(){const s=cur();s.lines.push(newLine());touch('s.lines',{structural:true});setTimeout(()=>{const l=s.lines[s.lines.length-1];const t=$(`#lt-${l.id}-ko`);t&&t.focus()},30)},
 delLine(el){const s=cur();if(s.lines.length<2){s.lines[0]={...s.lines[0],ko:'',ja:'',en:''}}else s.lines=s.lines.filter(l=>l.id!==el.dataset.arg);touch('s.lines',{structural:true})},
 mood(el){const m=SCENE_MOODS.find(x=>x.k===el.dataset.arg);const s=cur();s.dir={...s.dir,...clone(m.set)};if(m.hit)s.bgmHit=true;touch('s.dir',{structural:true});toast(`‘${m.n}’을 적용했습니다. ⌘Z로 되돌릴 수 있습니다.`)},
 addNote(){const t=$('#newnote');const v=t&&t.value.trim();if(!v)return toast('지시 내용을 입력하세요.');cur().notes.push({id:uid('n'),text:v,done:false,at:Date.now(),by:S.me.name||''});t.value='';touch('s.notes',{structural:true})},
 noteDone(el){const n=cur().notes.find(x=>x.id===el.dataset.arg);if(n){n.done=el.checked;touch('s.notes',{structural:true})}},
 delNote(el){const s=cur();s.notes=s.notes.filter(x=>x.id!==el.dataset.arg);touch('s.notes',{structural:true})},
 async stillUpload(){const f=await pickFile('image/png,image/jpeg,image/webp,image/gif');if(f)setStill(f)},
 stillRemove(){cur().still=null;touch('s.still',{structural:true})},
 async addRefFiles(el,e){if(e&&e.target.closest('input,button:not([data-act="addRefFiles"])'))return;const fs=await pickFile('image/*,video/mp4,video/webm',true);if(fs&&fs.length)addRefs(el.dataset.arg,fs)},
 addRefLink(el){const scope=el.dataset.arg;const m=modal({title:'링크 레퍼런스 추가',body:`<div class="field"><label for="rl-u">URL</label><input class="in" id="rl-u" placeholder="https://" autofocus></div><div class="field"><label for="rl-n">참고할 점</label><input class="in" id="rl-n" placeholder="예: 0:12~0:20 타이포 리듬"></div>`,foot:`<button class="btn" data-no>취소</button><button class="btn pri" data-ok>추가</button>`});
  m.querySelector('[data-no]').onclick=()=>m.close();m.querySelector('[data-ok]').onclick=()=>{let u=$('#rl-u').value.trim();if(!u)return;if(!/^https?:\/\//.test(u))u='https://'+u;refList(scope).push({id:uid('r'),kind:'link',url:u,title:u.replace(/^https?:\/\/(www\.)?/,'').split('/')[0],note:$('#rl-n').value.trim(),at:Date.now()});m.close();touch('refs',{structural:true})}},
 addRefNote(el){refList(el.dataset.arg).push({id:uid('r'),kind:'note',title:'메모',note:'',at:Date.now()});touch('refs',{structural:true})},
 delRef(el){const [scope,id]=el.dataset.arg.split(':');const l=refList(scope);const i=l.findIndex(r=>r.id===id);if(i>=0)l.splice(i,1);touch('refs',{structural:true})},
 copyStyle(){copyText(styleInstruction(S.proj),'스타일 지시문을 복사했습니다.')},
 copyTts(){copyText(ttsBody(S.proj,S.proj.tts.lang,S.proj.tts.sceneBreak),'나레이션 본문을 복사했습니다.')},
 dlTts(){saveFile(`${slug(S.proj.title)}_narration_${S.proj.tts.lang}.txt`,ttsBody(S.proj,S.proj.tts.lang,S.proj.tts.sceneBreak))},
 async narrUpload(){const f=await pickFile('audio/*,.wav,.mp3,.m4a,.aac');if(f)setNarration(f)},
 async narrRemove(){if(!(await confirmBox('나레이션 오디오를 제거하시겠습니까?','자막·씬 타이밍은 글자 수 기준 예상치로 돌아갑니다.','제거')))return;const p=S.proj;p.narration=null;p.scenes.forEach(s=>{s.start=s.end=null;s.lines.forEach(l=>{l.start=l.end=null})});touch('narration',{structural:true})},
 narrPlay(el){previewAudio(0,null,el)},
 playLine(el){const [a,b]=el.dataset.arg.split(':').map(Number);previewAudio(a,b,el)},
 align(){alignNarration()},
 copyBrief(){copyText(buildBrief(S.proj),'제작 안내서를 복사했습니다.')},
 copyRequest(){copyText(claudeRequest(S.proj),'Claude 요청문을 복사했습니다.')},
 dlBrief(){saveFile(`${slug(S.proj.title)}_${S.versions[0]?'v'+S.versions[0].n:'draft'}_brief.md`,buildBrief(S.proj))},
 dlJson(){saveFile(`${slug(S.proj.title)}_project.json`,JSON.stringify({format:'motion-brief/1',project:stripForExport(S.proj)},null,1))},
 dlZip(){buildZip()},
 copyNarr(el){copyText(ttsBody(S.proj,el.dataset.arg,S.proj.tts.sceneBreak))},
 dlNarr(el){saveFile(`narration_${el.dataset.arg}.txt`,ttsBody(S.proj,el.dataset.arg,S.proj.tts.sceneBreak))},
 dlSrt(el){saveFile(`subtitles_${el.dataset.arg}.srt`,buildSrt(S.proj,el.dataset.arg))},
 async dlThumb(){const p=S.proj;const [w,h]=aspectWH(p.brief.aspect);const cv=document.createElement('canvas');cv.width=w;cv.height=h;drawThumb(cv.getContext('2d'),w,h,p);const b=await new Promise(r=>cv.toBlob(r,'image/png'));saveFile(`${slug(p.title)}_thumbnail.png`,b)},
 async thumbAttach(){const p=S.proj;const [w,h]=aspectWH(p.brief.aspect);const cv=document.createElement('canvas');cv.width=w;cv.height=h;drawThumb(cv.getContext('2d'),w,h,p);const b=await new Promise(r=>cv.toBlob(r,'image/png'));try{const id=await Store.upload(b,'image/png');p.thumb.assetId=id;await commitVersion({label:'썸네일',note:`썸네일 (${p.thumb.tpl})`,attach:{thumb:id},source:{kind:'user'}})}catch(e){toast(errMsg(e),{err:true})}},
 record(){Rec.start()},
 recMonitor(el){Rec.monitor=!Rec.monitor;el.setAttribute('aria-pressed',String(Rec.monitor))},
 recSave(){if(Rec.lastBlob)saveFile(`${slug(S.proj.title)}_animatic.${Rec.lastMime==='video/mp4'?'mp4':'webm'}`,Rec.lastBlob)},
 async recAttach(){if(!Rec.lastBlob)return;try{toast('업로드하는 중입니다.');const id=await Store.upload(Rec.lastBlob,Rec.lastMime);S.proj.renders.push({id:uid('r'),kind:'animatic',assetId:id,at:Date.now(),source:{kind:'user'},v:(S.versions[0]?S.versions[0].n:0)+1});await commitVersion({label:'애니마틱',note:'애니마틱 MP4 녹화',attach:{video:id,kind:'animatic'},source:{kind:'user'}});refresh()}catch(e){toast(errMsg(e),{err:true})}},
 async finalUpload(){const f=await pickFile('video/mp4,video/webm');if(f)registerFinal(f)},
 finalLink(){const m=modal({title:'최종 결과물 링크 등록',body:`<div class="field"><label for="fl-u">링크</label><input class="in" id="fl-u" placeholder="https://drive.google.com/… 또는 GitHub 릴리스" autofocus></div><div class="field"><label for="fl-n">메모</label><input class="in" id="fl-n" placeholder="예: v12 기준 최종 렌더, BGM 교체"></div>${srcPicker('code')}`,foot:`<button class="btn" data-no>취소</button><button class="btn pri" data-ok>등록</button>`});
  m.querySelector('[data-no]').onclick=()=>m.close();m.querySelector('[data-ok]').onclick=async()=>{let u=$('#fl-u').value.trim();if(!u)return;if(!/^https?:\/\//.test(u))u='https://'+u;const source=readSrcPicker(m);m.close();S.proj.renders.push({id:uid('r'),kind:'final',url:u,at:Date.now(),source,note:$('#fl-n')?.value||'',v:(S.versions[0]?S.versions[0].n:0)+1});await commitVersion({label:'최종 결과물',note:u,attach:{link:u,kind:'final'},source});refresh()}},
 bgmPreset(el){const x=BGM_PRESETS.find(q=>q.k===el.dataset.arg);if(!x)return;Object.assign(S.proj.bgm,clone(x.set),{preset:x.k});touch('p.bgm',{structural:true})},
 bgmPlay(){bgmToggleSketch()},tap(){tapTempo()},
 async bgmUpload(){const f=await pickFile('audio/*,.mp3,.m4a,.wav');if(f)setBgmFile(f)},
 bgmRemove(){S.proj.bgm.assetId=null;S.proj.bgm.name='';touch('p.bgm',{structural:true})},
 copyBgmKo(){copyText(bgmBriefKo(S.proj))},copyBgmEn(){copyText(bgmPromptEn(S.proj),'EN 프롬프트를 복사했습니다.')},
};
function srcPicker(def){return `<div class="field"><div class="lbl">출처 태그</div><div class="chips" data-srcpick="${def}">${Object.entries(SRC).map(([k,x])=>`<button type="button" class="chip" aria-pressed="${k===def}" data-k="${k}" onclick="this.parentNode.dataset.srcpick='${k}';[...this.parentNode.children].forEach(c=>c.setAttribute('aria-pressed',String(c===this)))">${x.n}</button>`).join('')}</div><input class="in" data-srcagent placeholder="에이전트 · 참조 (선택, 예: Claude Code · repo@a1b2c3)"></div>`}
function readSrcPicker(m){const k=m.querySelector('[data-srcpick]').dataset.srcpick;const a=(m.querySelector('[data-srcagent]').value||'').trim();const [agent,ref]=a.split('·').map(x=>x&&x.trim());return {kind:k,agent:agent||'',ref:ref||''}}
async function registerFinal(f){if(f.size>20*1048576){toast('20MB를 넘는 파일은 업로드할 수 없습니다. 링크로 등록하세요.',{err:true});return ACT.finalLink()}
 const m=modal({title:'최종 영상 등록',body:`<p><b>${esc(f.name)}</b> <span class="muted">${(f.size/1048576).toFixed(1)}MB</span></p><div class="field"><label for="fv-n">변경 메모</label><input class="in" id="fv-n" placeholder="예: Claude Code 렌더 · GX 컷 교체" autofocus></div>${srcPicker('code')}`,foot:`<button class="btn" data-no>취소</button><button class="btn pri" data-ok>${ic('upload','s')}업로드 · 버전 기록</button>`});
 m.querySelector('[data-no]').onclick=()=>m.close();m.querySelector('[data-ok]').onclick=async()=>{const source=readSrcPicker(m);const note=$('#fv-n').value.trim();m.close();toast('업로드하는 중입니다.');try{const id=await Store.upload(f,f.type||'video/mp4');S.proj.renders.push({id:uid('r'),kind:'final',assetId:id,at:Date.now(),source,note,v:(S.versions[0]?S.versions[0].n:0)+1});await commitVersion({label:'최종 영상',note:note||f.name,attach:{video:id,kind:'final'},source});refresh()}catch(e){toast(errMsg(e),{err:true})}}}
const refList=scope=>scope==='p'?S.proj.refs:S.proj.scenes.find(s=>s.id===scope).refs;
async function addRefs(scope,files){let n=0;for(const f of files){const kind=f.type.startsWith('image/')?'image':(f.type==='video/mp4'||f.type==='video/webm')?'video':null;if(!kind){toast(`${f.name}: 이미지나 MP4·WebM만 올릴 수 있습니다.`,{err:true});continue}
  try{toast(`${f.name} 업로드하는 중입니다.`,{ms:1500});const id=await Store.upload(f,f.type);refList(scope).push({id:uid('r'),kind,assetId:id,title:f.name.replace(/\.[^.]+$/,''),note:'',name:f.name,mime:f.type,at:Date.now()});n++}catch(e){toast(`${f.name}: ${errMsg(e)}`,{err:true})}}
 if(n){touch('refs',{structural:true});toast(`레퍼런스 ${n}개를 추가했습니다.`)}}
async function setStill(f){if(!f.type.startsWith('image/'))return toast('이미지 파일만 쓸 수 있습니다.',{err:true});const s=cur();try{toast('업로드하는 중입니다.',{ms:1200});const id=await Store.upload(f,f.type);s.still={assetId:id,fx:.5,fy:.5,name:f.name,mime:f.type};touch('s.still',{structural:true})}catch(e){toast(errMsg(e),{err:true})}}
async function setBgmFile(f){try{toast('업로드하는 중입니다.',{ms:1500});const id=await uploadAudio(f);S.proj.bgm.assetId=id;S.proj.bgm.name=f.name;S.proj.bgm.source='upload';touch('p.bgm',{structural:true})}catch(e){toast(errMsg(e),{err:true})}}
function moveSceneTo(i,j){const p=S.proj;const timed=p.scenes.every(s=>s.start!=null);const [s]=p.scenes.splice(i,1);p.scenes.splice(j,0,s);if(timed){let t=0;p.scenes.forEach(x=>{const d=x.end-x.start;x.start=t;x.end=t+d;t+=d})}S.sel=j;touch('scenes',{structural:true})}
function peaksOf(buf,n=1200){const ch=buf.getChannelData(0);const step=Math.max(1,Math.floor(ch.length/n));const out=[];let mx=0;for(let i=0;i<n;i++){let m=0;const a=i*step,b=Math.min(ch.length,a+step);for(let k=a;k<b;k+=4){const v=Math.abs(ch[k]);if(v>m)m=v}out.push(m);if(m>mx)mx=m}return out.map(v=>+(v/(mx||1)).toFixed(3))}
async function setNarration(f){if(!/audio|\.wav$|\.mp3$|\.m4a$|\.aac$/i.test(f.type+f.name))return toast('오디오 파일만 올릴 수 있습니다.',{err:true});
 try{toast('오디오를 올리는 중입니다.',{ms:2000});const id=await uploadAudio(f);const buf=await audioBuffer(id);S.proj.narration={assetId:id,name:f.name,mime:f.type||'audio/wav',duration:+buf.duration.toFixed(3),peaks:peaksOf(buf)};
  touch('narration',{structural:true});toast('오디오를 올렸습니다.',{action:'자동 맞춤',onAction:alignNarration,ms:9000})}catch(e){toast(errMsg(e),{err:true})}}
let prevHolder=null;
async function previewAudio(a,b,el){const n=S.proj.narration;if(!n)return;if(prevHolder){try{prevHolder.stop()}catch(e){}prevHolder=null;return}const ctx=actx();await ctx.resume();const buf=await audioBuffer(n.assetId);const s=ctx.createBufferSource();s.buffer=buf;s.connect(ctx.destination);s.start(0,a,b?Math.max(.05,b-a+.15):undefined);prevHolder=s;s.onended=()=>{if(prevHolder===s)prevHolder=null}}
function detectGaps(buf){const ch=buf.getChannelData(0);const sr=buf.sampleRate;const hop=Math.round(sr*.01);const n=Math.floor(ch.length/hop);const rms=new Float32Array(n);
 for(let i=0;i<n;i++){let s=0;for(let k=i*hop;k<(i+1)*hop;k+=2)s+=ch[k]*ch[k];rms[i]=Math.sqrt(s/(hop/2))}
 const sorted=Array.from(rms).sort((a,b)=>a-b);const floor=sorted[Math.floor(n*.1)]||0,peak=sorted[Math.floor(n*.95)]||1;const thr=floor+(peak-floor)*.1;
 const sil=Array.from(rms,v=>v<thr);let ss=sil.indexOf(false),se=sil.lastIndexOf(false);if(ss<0){ss=0;se=n-1}
 const gaps=[];let i=ss;while(i<=se){if(sil[i]){let j=i;while(j<=se&&sil[j])j++;const len=(j-i)*.01;if(len>=.12)gaps.push({s:i*.01,e:j*.01,c:(i+j)/2*.01,len});i=j}else i++}
 return {gaps,ss:ss*.01,se:(se+1)*.01}}
async function alignNarration(){const p=S.proj;if(!p.narration)return toast('먼저 나레이션 오디오를 올리세요');let buf;try{buf=await audioBuffer(p.narration.assetId)}catch(e){return toast('오디오를 읽지 못했습니다. 파일을 다시 올리세요.',{err:true})}
 const items=[];p.scenes.forEach((s,si)=>s.lines.forEach(l=>{if(l.ko.trim())items.push({s,si,l,ch:Math.max(1,nonspace(l.ko))})}));const N=items.length;if(!N)return toast('나레이션 줄이 없습니다. 스크립트를 먼저 입력하세요.');
 const {gaps,ss,se}=detectGaps(buf);const K=N-1,G=gaps.length;const span=Math.max(.1,se-ss);const tot=items.reduce((a,x)=>a+x.ch,0);let cum=0;const exp=items.slice(0,-1).map(x=>{cum+=x.ch;return ss+span*cum/tot});
 let cuts=[];
 if(K>0&&G>=K){const cost=(k,j)=>Math.abs(gaps[j].c-exp[k])/span*6-Math.min(gaps[j].len,1.2)*1.4-(items[k].si!==items[k+1].si?Math.min(gaps[j].len,1.2)*.8:0);
  const INF=1e9;const dp=Array.from({length:K},()=>new Float64Array(G).fill(INF));const bk=Array.from({length:K},()=>new Int32Array(G).fill(-1));
  for(let j=0;j<G;j++)if(G-1-j>=K-1)dp[0][j]=cost(0,j);
  for(let k=1;k<K;k++){let best=INF,bi=-1;for(let j=k;j<G-(K-1-k);j++){const pv=dp[k-1][j-1];if(pv<best){best=pv;bi=j-1}if(bi>=0){dp[k][j]=best+cost(k,j);bk[k][j]=bi}}}
  let j=-1,b=INF;for(let x=0;x<G;x++)if(dp[K-1][x]<b){b=dp[K-1][x];j=x}for(let k=K-1;k>=0;k--){cuts[k]=gaps[j];j=bk[k][j]}}
 else if(K>0){cuts=exp.map(e=>({s:e-.05,e:e+.05,c:e}));toast('무음 구간이 부족해 글자 수 비율로 나눴습니다. 표에서 확인하세요.',{ms:6000})}
 items.forEach((x,k)=>{x.l.start=+(k?cuts[k-1].e-.04:Math.max(0,ss-.05)).toFixed(3);x.l.end=+(k<K?cuts[k].s+.06:Math.min(buf.duration,se+.05)).toFixed(3)});
 p.scenes.forEach(s=>s.lines.forEach(l=>{if(!l.ko.trim()){l.start=null;l.end=null}}));
 const tail=p.tail??2.5;const firsts=p.scenes.map(s=>s.lines.find(l=>l.ko.trim()&&l.start!=null));const lasts=p.scenes.map(s=>[...s.lines].reverse().find(l=>l.ko.trim()&&l.end!=null));
 let t=0;p.scenes.forEach((s,i)=>{s.start=+t.toFixed(3);let e;const nf=firsts.slice(i+1).find(Boolean);const lf=lasts[i];
  if(i===p.scenes.length-1)e=Math.max(buf.duration,lf?lf.end:0)+tail;else if(lf&&nf)e=(lf.end+nf.start)/2;else if(nf)e=Math.max(t+2.5,nf.start-.4);else e=t+3;
  s.end=+Math.max(t+.8,e).toFixed(3);t=s.end});
 touch('timing',{structural:true});toast(`${N}줄 · ${p.scenes.length}개 씬 타이밍을 맞췄습니다.`,{action:'버전 저장',onAction:()=>commitVersion({label:'타이밍 자동 맞춤',note:`${N}줄 정렬`,source:{kind:'user'}})})}

/* ================= events ================= */
document.addEventListener('click',e=>{
 const st=e.target.closest('#still');if(st&&e.target.tagName==='IMG'){const r=e.target.getBoundingClientRect();const s=cur();s.still.fx=+clamp((e.clientX-r.left)/r.width,0,1).toFixed(3);s.still.fy=+clamp((e.clientY-r.top)/r.height,0,1).toFixed(3);touch('s.still',{structural:true});return}
 const a=e.target.closest('[data-act]');if(a&&ACT[a.dataset.act]){if(a.tagName==='A')e.preventDefault();ACT[a.dataset.act](a,e);return}
 const sb=e.target.closest('[data-set]');if(sb&&S.proj&&!sb.dataset.set.startsWith('_')){let v=sb.dataset.v;if(sb.hasAttribute('data-num'))v=+v;setPath(sb.dataset.set,v);if(sb.dataset.set==='p.brief.aspect'&&v!=='16:9'&&S.proj.brief.letterbox)S.proj.brief.letterbox=false;touch(sb.dataset.set,{structural:true});return}
 const tg=e.target.closest('[data-toggle]');if(tg&&S.proj){const arr=getPath(tg.dataset.toggle)||[];const v=tg.dataset.v;const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v);touch(tg.dataset.toggle,{structural:true});return}
 const fl=e.target.closest('[data-flip]');if(fl&&S.proj){setPath(fl.dataset.flip,!getPath(fl.dataset.flip));if(fl.dataset.flip==='p.langs.ja'||fl.dataset.flip==='p.langs.en'){const L=enabledLangs(S.proj);if(!L.includes(S.proj.subs.lang))S.proj.subs.lang='ko';if(S.proj.subs.second&&!L.includes(S.proj.subs.second))S.proj.subs.second='';if(!L.includes(S.proj.tts.lang))S.proj.tts.lang='ko'}touch(fl.dataset.flip,{structural:true});return}
});
document.addEventListener('keydown',e=>{const a=e.target.closest&&e.target.closest('.pcard');if(a&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProject(a.dataset.arg)}});
document.addEventListener('input',e=>{const el=e.target;if(el.tagName==='TEXTAREA'&&el.closest('.lcard')){el.style.height='auto';el.style.height=el.scrollHeight+2+'px'}if(!S.proj&&!(el.dataset.bind||'').startsWith('ui.'))return;
 if(el.dataset.bind){let v=el.value;if(el.hasAttribute('data-num'))v=v===''?null:parseFloat(v);
  if(el.type==='range'){const mn=+el.min,mx=+el.max;el.style.setProperty('--p',((v-mn)/(mx-mn)*100)+'%');const b=el.closest('.range-row')&&el.closest('.range-row').querySelector('b');if(b)b.textContent=el.id==='tail'?v+'s':el.id==='tlzoom'?v+'×':v;if(el.id==='bgm-bpm'){const bv=$('#bpmv');if(bv)bv.textContent=v}
   const lb=el.closest('.field')&&el.closest('.field').querySelector('.lbl .mono');if(lb&&el.id!=='bgm-bpm')lb.textContent=el.id==='b-dur'?v+'초':el.id==='bgm-duck'?v+' dB':el.id==='bgm-vol'?Math.round(v*100)+'%':v+'s'}
  if(el.type==='color'){const m=el.parentElement.querySelector('.mono');if(m)m.textContent=v}
  const path=el.dataset.bind;if(path.startsWith('ui.')){setPath(path,v);if(path==='ui.tlZoom'){const inner=$('#tlinner');if(inner){inner.style.width=v*100+'%';renderTimelineCanvases()}}return}
  setPath(path,v);if(path==='p.title')document.title=(v||'제목 없음')+' · 모션 브리프 스튜디오';
  if(/\.lines?\b|L:/.test(path)||path.startsWith('L:')){}
  touch(path,{});if(path.startsWith('L:')&&/\.(start|end)$/.test(path)){renderTimeline&&$('#tl')&&renderTimeline();drawWave()}
  if(path==='p.thumb.sceneId'||path==='p.subs.second')refresh();return}
 if(el.dataset.lines){const [sid,lang]=el.dataset.lines.split('.');const s=S.proj.scenes.find(x=>x.id===sid);if(!s)return;const rows=el.value.split('\n');
  if(lang==='ko'){const n=Math.max(1,rows.length);while(s.lines.length<n)s.lines.push(newLine());if(s.lines.length>n){const extra=s.lines.splice(n);['ja','en'].forEach(l=>{const t=extra.map(x=>x[l]).filter(Boolean).join(' ');if(t)s.lines[n-1][l]=(s.lines[n-1][l]?s.lines[n-1][l]+' ':'')+t})}rows.forEach((r,i)=>s.lines[i].ko=r)}
  else{s.lines.forEach((l,i)=>l[lang]=rows[i]||'');if(rows.length>s.lines.length)s.lines[s.lines.length-1][lang]+=' '+rows.slice(s.lines.length).join(' ')}
  touch('S:'+sid+'.lines',{});return}
});
document.addEventListener('change',e=>{const el=e.target;if(el.hasAttribute&&el.hasAttribute('data-rerender')&&S.proj)refresh()});
['dragover','dragenter'].forEach(ev=>document.addEventListener(ev,e=>{const z=e.target.closest&&e.target.closest('[data-dropfiles],[data-dropaudio],[data-dropstill],[data-droptext],[data-dropimport],[data-dropbgm],[data-dropfinal],.sitem');if(z){e.preventDefault();z.classList.add('over')}}));
document.addEventListener('dragleave',e=>{const z=e.target.closest&&e.target.closest('.over');if(z)z.classList.remove('over')});
document.addEventListener('dragstart',e=>{const d=e.target.closest&&e.target.closest('[data-drag]');if(d){e.dataTransfer.setData('text/x-scene',d.dataset.drag);e.dataTransfer.effectAllowed='move'}});
document.addEventListener('drop',async e=>{const z=e.target.closest&&e.target.closest('[data-dropfiles],[data-dropaudio],[data-dropstill],[data-droptext],[data-dropimport],[data-dropbgm],[data-dropfinal],.sitem');if(!z)return;e.preventDefault();z.classList.remove('over');
 const sid=e.dataTransfer.getData('text/x-scene');if(sid&&z.classList.contains('sitem')){const p=S.proj;const i=p.scenes.findIndex(s=>s.id===sid);const j=+z.dataset.arg;if(i>=0&&i!==j)moveSceneTo(i,j);return}
 const fs=[...(e.dataTransfer.files||[])];if(!fs.length)return;
 if(z.dataset.dropfiles)return addRefs(z.dataset.dropfiles,fs);if(z.hasAttribute('data-dropaudio'))return setNarration(fs[0]);if(z.dataset.dropstill)return setStill(fs[0]);if(z.dataset.dropbgm)return setBgmFile(fs[0]);if(z.dataset.dropfinal)return registerFinal(fs[0]);
 if(z.dataset.droptext||z.dataset.dropimport){const t=await fs[0].text();if(z.dataset.dropimport){z.value=t;z.dispatchEvent(new Event('input',{bubbles:true}));return}const cur_=getPath(z.dataset.droptext)||'';setPath(z.dataset.droptext,(cur_?cur_+'\n\n':'')+`[${fs[0].name}]\n`+t);touch(z.dataset.droptext,{structural:true})}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawerEl&&!$$('#layer .scrim').some(x=>x!==drawerEl)){closeHistory();return}const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement&&document.activeElement.tagName)||document.activeElement&&document.activeElement.isContentEditable;const mod=e.metaKey||e.ctrlKey;const modalOpen=$$('#layer .scrim').some(x=>x!==drawerEl);
 if(mod&&e.key.toLowerCase()==='s'){e.preventDefault();if(S.proj&&!modalOpen)saveVersionModal();return}
 if(mod&&e.key.toLowerCase()==='z'&&!typing&&S.proj){e.preventDefault();e.shiftKey?redo():undo();return}
 if(typing||mod||modalOpen&&e.key!=='?')return;
 if(e.key==='?'){e.preventDefault();openHelp();return}if(!S.proj)return;
 if(e.key===' '&&S.view==='edit'){e.preventDefault();Player.toggle()}
 else if(e.key==='ArrowUp'&&S.view==='edit'){e.preventDefault();selectScene(S.sel-1)}
 else if(e.key==='ArrowDown'&&S.view==='edit'){e.preventDefault();selectScene(S.sel+1)}
 else if(e.key==='c'||e.key==='C'){S.proj.subs.show=!S.proj.subs.show;touch('p.subs.show',{structural:true})}
 else if(e.key==='g'||e.key==='G'){ACT.guides()}
 else if(e.key==='h'||e.key==='H'){openHistory()}
 else if(e.key==='b'||e.key==='B'){openBgm()}});
window.addEventListener('beforeunload',()=>{scheduleSave.flush&&S.proj&&scheduleSave.flush()});
const _origRefresh=refresh;refresh=function(){_origRefresh();if(S.view==='edit')renderPTool();if($('#bgmSheet'))renderBgmSheet();if(S.view==='narr')drawWave()};

/* ================= boot ================= */
(async function boot(){
 const fav=document.createElement('link');fav.rel='icon';fav.href='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#16365D"/><path d="M10 9l12 7-12 7z" fill="#fff"/><path d="M25 4.5l2.5 2.5-2.5 2.5-2.5-2.5z" fill="#87D0DF"/></svg>');document.head.appendChild(fav);
 render();$('#main').innerHTML=`<div class="view"><div class="wrap"><div class="empty" style="border:0"><span class="spin"></span><span>프로젝트를 불러오는 중…</span></div></div></div>`;
 await Store.init();
 let first=true;Store.subProjects(list=>{S.projects=list;if(S.view==='home'&&!first)renderMain();if(first){first=false;renderMain()}});
 if(!lsGet('mbs:welcomed',0))setTimeout(()=>openHelp(true),400);
 ensureFont('Bricolage Grotesque',[800]);ensureFont('IBM Plex Mono',[500,600]);ensureFont('IBM Plex Sans KR',[300,500,700,800]);document.fonts&&document.fonts.ready.then(()=>Player.redrawAll());
})();
