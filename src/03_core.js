'use strict';
/* ================= utils ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=(n,c='')=>`<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const sym=(id,c='')=>`<svg class="i ${c}" aria-hidden="true"><use href="#${id}"/></svg>`;
const uid=(p='')=>p+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,k)=>a+(b-a)*k;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const nonspace=s=>String(s||'').replace(/\s+/g,'').length;
const pad=(n,w=2)=>String(Math.floor(n)).padStart(w,'0');
function tc(t,fps=30){t=Math.max(0,t||0);const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=Math.floor(t%60),f=Math.floor((t-Math.floor(t))*fps);return (h?pad(h)+':':'')+pad(m)+':'+pad(s)+':'+pad(f)}
function secs(t){t=Math.max(0,t||0);return t<60?t.toFixed(1)+'초':Math.floor(t/60)+'분 '+Math.round(t%60)+'초'}
function mmss(t){t=Math.max(0,t||0);return pad(t/60)+':'+pad(t%60)}
function srtTime(t){t=Math.max(0,t||0);const ms=Math.round((t-Math.floor(t))*1000);return pad(t/3600)+':'+pad(t%3600/60)+':'+pad(t%60)+','+pad(ms,3)}
function rel(ts){if(!ts)return '';const d=(Date.now()-ts)/1000;if(d<45)return '방금';if(d<3600)return Math.round(d/60)+'분 전';if(d<86400)return Math.round(d/3600)+'시간 전';if(d<86400*7)return Math.round(d/86400)+'일 전';const x=new Date(ts);return `${x.getFullYear()}.${pad(x.getMonth()+1)}.${pad(x.getDate())}`}
function stamp(ts){const x=new Date(ts||Date.now());return `${x.getFullYear()}.${pad(x.getMonth()+1)}.${pad(x.getDate())} ${pad(x.getHours())}:${pad(x.getMinutes())}`}
const ease={o:x=>1-Math.pow(1-x,3),o5:x=>1-Math.pow(1-x,5),io:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,back:x=>{const c1=1.6,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)}};
const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
function debounce(fn,ms){let h;const f=(...a)=>{clearTimeout(h);h=setTimeout(()=>fn(...a),ms)};f.flush=()=>{clearTimeout(h);fn()};f.cancel=()=>clearTimeout(h);return f}
function lsGet(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function hexA(hex,a){const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function lum(hex){const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return (0.299*(n>>16&255)+0.587*(n>>8&255)+0.114*(n&255))/255}
function b64ToBytes(b64){const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
function blobToB64(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=rej;r.readAsDataURL(blob)})}
function slug(s){return String(s||'project').trim().replace(/[\\/:*?"<>|]+/g,'').replace(/\s+/g,'_').slice(0,60)||'project'}

/* ================= vocab ================= */
const LANGS={ko:'한국어',ja:'日本語',en:'English'};
const LSHORT={ko:'KO',ja:'JA',en:'EN'};
const CAMERAS=[['static','고정'],['zoomIn','줌 인'],['zoomOut','줌 아웃'],['push','푸시 인'],['panL','팬 ←'],['panR','팬 →'],['tilt','틸트 업'],['orbit','오빗']];
const TRANS=[['cut','컷'],['dissolve','디졸브'],['flash','플래시'],['whip','휩 팬'],['glitch','글리치'],['wipe','와이프'],['zoom','줌 블러']];
const TEXTANIM=[['mask','마스크 리빌'],['fadeUp','페이드 업'],['type','타자기'],['pop','스케일 팝']];
const EFFECTS=[['vignette','비네트'],['grain','필름 그레인'],['glitch','글리치'],['scan','스캔 라인'],['hud','HUD 레티클'],['sweep','라이트 스윕'],['particles','파티클'],['callout','데이터 콜아웃'],['dof','배경 블러'],['tint','컬러 틴트'],['grid','그리드']];
const POSITIONS=[['left','좌측'],['center','중앙'],['right','우측'],['lower','하단']];
const STATUS=[['draft','초안'],['review','검토'],['final','확정']];
const nameOf=(list,k)=>(list.find(x=>x[0]===k)||[k,k])[1];
const SCENE_MOODS=[
 {k:'intro',n:'차분한 도입',d:'느린 줌 · 페이드',set:{energy:2,tone:0,pace:2,camera:'zoomIn',textAnim:'fadeUp',effects:['vignette','grain'],transition:'dissolve'}},
 {k:'alert',n:'긴장 · 경고',d:'글리치 · 어둡게',set:{energy:4,tone:-1,pace:4,camera:'push',textAnim:'mask',effects:['glitch','vignette','hud','tint'],transition:'flash'}},
 {k:'info',n:'정보 전달',d:'HUD · 콜아웃',set:{energy:3,tone:0,pace:3,camera:'panR',textAnim:'mask',effects:['hud','callout','scan'],transition:'wipe'}},
 {k:'connect',n:'연결 · 프로세스',d:'그리드 · 와이프',set:{energy:3,tone:-1,pace:3,camera:'panL',textAnim:'mask',effects:['dof','grid','particles'],transition:'flash'}},
 {k:'climax',n:'클라이맥스',d:'빠른 무브 · 히트',set:{energy:5,tone:1,pace:5,camera:'orbit',textAnim:'pop',effects:['sweep','particles'],transition:'whip'},hit:true},
 {k:'end',n:'여운 엔딩',d:'밝게 · 느리게',set:{energy:1,tone:1,pace:1,camera:'zoomOut',textAnim:'fadeUp',effects:['sweep','vignette'],transition:'dissolve'}},
];
const STYLES=[
 {k:'cine-dark',n:'시네마틱 다크',d:'레터박스 · 그레인 · 깊은 대비',pal:{bg:'#07090D',primary:'#E60012',accent:'#0FB5A3',text:'#FFFFFF'},font:'IBM Plex Sans KR',letterbox:true},
 {k:'clean',n:'클린 라이트',d:'넓은 여백 · 정돈된 타이포',pal:{bg:'#F3F4F6',primary:'#1B4DFF',accent:'#00A39A',text:'#0D1117'},font:'IBM Plex Sans KR',letterbox:false},
 {k:'hud',n:'테크 HUD',d:'데이터 레이어 · 스캔 · 그리드',pal:{bg:'#04101C',primary:'#2EE6CF',accent:'#FFB020',text:'#E6F4FF'},font:'IBM Plex Sans KR',letterbox:false},
 {k:'editorial',n:'에디토리얼',d:'큰 글자 · 세리프 · 지면 감각',pal:{bg:'#EFEBE3',primary:'#151515',accent:'#C2410C',text:'#111111'},font:'Noto Serif KR',letterbox:false},
 {k:'flat',n:'일러스트 플랫',d:'면 분할 · 경쾌한 색',pal:{bg:'#FFF6E8',primary:'#FF5A36',accent:'#2A9D8F',text:'#1D1D1F'},font:'Black Han Sans',letterbox:false},
 {k:'product',n:'제품 쇼케이스',d:'스튜디오 조명 · 반사광',pal:{bg:'#0F1013',primary:'#D7DAE0',accent:'#4F7CFF',text:'#FFFFFF'},font:'IBM Plex Sans KR',letterbox:true},
];
const FONTS=['IBM Plex Sans KR','Noto Serif KR','Black Han Sans','Pretendard'];
const ASPECTS=[['16:9','16:9',1920,1080],['9:16','9:16 세로',1080,1920],['1:1','1:1',1080,1080],['4:5','4:5',1080,1350]];
const aspectWH=a=>{const x=ASPECTS.find(q=>q[0]===a)||ASPECTS[0];return [x[2],x[3]]};

const BGM_GENRES=[['시네마틱 오케스트라','cinematic orchestral'],['앰비언트','ambient'],['코퍼레이트·테크','corporate tech'],['일렉트로닉','electronic'],['신스웨이브','synthwave'],['로파이','lo-fi'],['피아노 솔로','solo piano'],['어쿠스틱','acoustic'],['하이브리드 트레일러','hybrid trailer'],['미니멀 테크노','minimal techno'],['힙합 비트','hip-hop beat'],['재즈','jazz']];
const BGM_INSTR=[['피아노','felt piano'],['스트링','soft strings'],['신스 패드','warm synth pads'],['플럭','plucky synth arps'],['기타','clean guitar'],['베이스','deep bass'],['퍼커션','light percussion'],['벨·글로켄','glockenspiel bells'],['브라스','brass swells'],['앰비언트 텍스처','ambient textures']];
const BGM_AVOID=[['보컬','vocals'],['강한 드럼','heavy drums'],['EDM 드롭','EDM drops'],['과한 리버브','washed-out reverb'],['유명곡 연상','recognizable melodies'],['급격한 변화','abrupt changes']];
const BGM_PRESETS=[
 {k:'launch',n:'테크 런칭',d:'미래적 · 자신감 · 점점 고조',set:{energy:.68,valence:.66,bpm:118,genres:['코퍼레이트·테크','일렉트로닉'],instruments:['신스 패드','플럭','퍼커션','베이스'],vocals:'none'}},
 {k:'brand',n:'감성 브랜드 필름',d:'따뜻함 · 여운 · 서정',set:{energy:.32,valence:.72,bpm:84,genres:['시네마틱 오케스트라','피아노 솔로'],instruments:['피아노','스트링'],vocals:'none'}},
 {k:'demo',n:'제품 데모',d:'경쾌 · 명료 · 일정한 리듬',set:{energy:.55,valence:.8,bpm:110,genres:['코퍼레이트·테크','어쿠스틱'],instruments:['플럭','기타','퍼커션'],vocals:'none'}},
 {k:'docu',n:'다큐 · 설명',d:'담백 · 신뢰 · 나레이션 우선',set:{energy:.26,valence:.5,bpm:88,genres:['앰비언트','피아노 솔로'],instruments:['피아노','앰비언트 텍스처'],vocals:'none'}},
 {k:'tension',n:'긴장 → 해소',d:'어두운 도입 · 밝은 반전',set:{energy:.62,valence:.34,bpm:100,genres:['하이브리드 트레일러','시네마틱 오케스트라'],instruments:['스트링','퍼커션','신스 패드'],vocals:'none'}},
 {k:'minimal',n:'미니멀 앰비언트',d:'공간감 · 배경처럼 낮게',set:{energy:.16,valence:.56,bpm:72,genres:['앰비언트'],instruments:['신스 패드','앰비언트 텍스처'],vocals:'none'}},
];
const VOICE_TONES=[['따뜻한','warm'],['신뢰감 있는','trustworthy'],['차분한','calm'],['밝은','bright'],['진중한','serious'],['친근한','friendly'],['다큐멘터리','documentary-style'],['광고 · 임팩트','punchy, commercial'],['속삭이듯','soft, intimate'],['에너지 넘치는','energetic']];
const GEMINI_VOICES=[['Kore','단단함'],['Charon','정보 전달'],['Aoede','산뜻함'],['Sulafat','따뜻함'],['Achernar','부드러움'],['Vindemiatrix','온화함'],['Despina','매끄러움'],['Algieba','매끄러움'],['Iapetus','또렷함'],['Erinome','또렷함'],['Schedar','고른 톤'],['Gacrux','성숙함'],['Rasalgethi','정보 전달'],['Sadaltager','지적임'],['Puck','경쾌함'],['Zephyr','밝음'],['Leda','젊음'],['Orus','단단함'],['Fenrir','들뜬'],['Algenib','허스키']];
const SRC={user:{n:'웹 · 직접 편집',t:'WEB',c:''},web:{n:'Claude · 웹 생성',t:'CLAUDE·WEB',c:'web'},code:{n:'Claude Code',t:'CLAUDE CODE',c:'code'},chat:{n:'Claude 채팅 · 프로젝트',t:'CLAUDE CHAT',c:'chat'},git:{n:'GitHub 에이전트',t:'GITHUB',c:'git'},import:{n:'가져오기 · 기타',t:'IMPORT',c:'import'}};
const srcTag=(s)=>{const k=(s&&s.kind)||'user';const x=SRC[k]||SRC.import;return `<span class="src ${x.c}" title="${esc(x.n+(s&&s.agent?' · '+s.agent:'')+(s&&s.ref?' · '+s.ref:''))}">${x.t}</span>`};

/* ================= model ================= */
function newScene(o={}){return Object.assign({id:uid('s'),title:'',chapter:'',intent:'',visual:'',onscreen:{headline:'',sub:'',position:'left'},lines:[newLine()],start:null,end:null,dir:{energy:3,tone:0,pace:3,camera:'zoomIn',transition:'dissolve',effects:['vignette'],textAnim:'mask',accent:'primary'},still:null,refs:[],notes:[],status:'draft',locked:false,bgmHit:false},o)}
function newLine(ko=''){return {id:uid('l'),ko,ja:'',en:'',start:null,end:null}}
function newProject(title){const st=STYLES[0];return {id:uid('p'),schema:1,title:title||'새 모션그래픽',createdAt:Date.now(),updatedAt:Date.now(),stage:1,
 brief:{topic:'',messages:['','',''],audience:'',duration:45,aspect:'16:9',fps:30,style:st.k,palette:clone(st.pal),font:st.font,letterbox:st.letterbox,sourceText:'',notes:''},
 langs:{ja:false,en:false},subs:{show:true,lang:'ko',second:''},
 voice:{gender:'여성',age:'30대',tones:['따뜻한','신뢰감 있는'],pace:'보통',pauses:true,voiceName:'',extra:'',speechRate:6},
 tts:{lang:'ko',sceneBreak:true},narration:null,tail:2.5,
 bgm:{preset:'',energy:.5,valence:.6,bpm:100,genres:[],instruments:[],vocals:'none',avoid:['보컬'],refs:'',duck:-12,volume:.7,fadeIn:2,fadeOut:3,source:'synth',assetId:null,name:'',notes:'',preview:true},
 refs:[],scenes:[newScene()],thumb:{tpl:'cinema',title:'',sub:'',sceneId:null},renders:[]}}
function deepMerge(base,o){if(o==null)return base;if(Array.isArray(base)||typeof base!=='object'||base===null)return o;const r={...base};for(const k in o){r[k]=(k in base&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))?deepMerge(base[k],o[k]):o[k]}return r}
function norm(p){const d=newProject(p&&p.title);const r=deepMerge(d,p||{});r.id=r.id||uid('p');
 r.scenes=(Array.isArray(r.scenes)&&r.scenes.length?r.scenes:[newScene()]).map(s=>{const x=deepMerge(newScene(),s||{});x.id=x.id||uid('s');x.lines=(Array.isArray(x.lines)&&x.lines.length?x.lines:[newLine()]).map(l=>({...newLine(),...(typeof l==='string'?{ko:l}:l),id:(l&&l.id)||uid('l')}));x.dir.effects=Array.isArray(x.dir.effects)?x.dir.effects:[];x.refs=Array.isArray(x.refs)?x.refs:[];x.notes=Array.isArray(x.notes)?x.notes:[];return x});
 if(!Array.isArray(r.brief.messages))r.brief.messages=['','',''];while(r.brief.messages.length<3)r.brief.messages.push('');
 delete r._writer;r.refs=Array.isArray(r.refs)?r.refs:[];r.renders=Array.isArray(r.renders)?r.renders:[];return r}
const enabledLangs=p=>['ko',...(p.langs.ja?['ja']:[]),...(p.langs.en?['en']:[])];

/* timing */
function estDur(s,rate){const ch=s.lines.reduce((a,l)=>a+nonspace(l.ko),0);if(!ch)return 3;const nl=s.lines.filter(l=>l.ko.trim()).length;return Math.max(2.5,ch/(rate||6)+nl*0.32+1.0)}
function timeline(p){const rate=p.voice.speechRate||6;let t=0;const segs=[];
 p.scenes.forEach((s,i)=>{let st=s.start!=null?s.start:t;let en=s.end!=null?s.end:st+estDur(s,rate);if(en<st+0.3)en=st+0.3;segs.push({i,s,start:st,end:en});t=en});
 const lines=[];
 segs.forEach(g=>{const ls=g.s.lines;const timed=ls.length&&ls.every(l=>l.start!=null&&l.end!=null);
  if(timed){ls.forEach(l=>lines.push({g,l,start:l.start,end:l.end}))}
  else{const act=ls.filter(l=>l.ko.trim()||l.ja||l.en);const tot=act.reduce((a,l)=>a+Math.max(1,nonspace(l.ko)),0)||1;const a0=g.start+0.35,a1=Math.max(a0+0.5,g.end-0.4);const span=a1-a0;let c=a0;const gap=Math.min(0.25,span*0.04);
   act.forEach(l=>{const d=span*(Math.max(1,nonspace(l.ko))/tot);lines.push({g,l,start:c,end:c+d-gap,est:true});c+=d})}});
 let total=segs.length?segs[segs.length-1].end:0;
 return {segs,lines,total,aligned:p.scenes.every(s=>s.start!=null&&s.end!=null)}}
function materialize(p){const tl=timeline(p);tl.segs.forEach(g=>{g.s.start=+g.start.toFixed(3);g.s.end=+g.end.toFixed(3)})}

/* ================= state ================= */
const S={view:'home',proj:null,pid:null,versions:[],projects:[],sel:0,tab:'content',t:0,playing:false,dirty:0,save:'ok',savedAt:0,undo:[],redo:[],base:null,vfilter:'all',me:{id:null,name:''},readOnly:false,local:false,tlZoom:1,guides:false,curLine:null,remoteBanner:false};
const VIEWS=[['brief','기획','주제·톤·레퍼런스'],['script','스크립트','씬별 나레이션·의도'],['narr','나레이션','TTS 텍스트·오디오'],['edit','씬 편집','타이밍·연출·자막'],['export','내보내기','안내서·MP4·썸네일']];
const cur=()=>S.proj&&S.proj.scenes[clamp(S.sel,0,S.proj.scenes.length-1)];

/* ================= capabilities & storage ================= */
const Cap={db:null,assets:null,sample:null,downloads:null,user:null};
const LOCALBLOB={};
const Store={
 mode:'local',
 async init(){
  if(window.claude&&window.claude.use){
   const [db,assets,sample,downloads,user]=await Promise.all(['db','assets','sample','downloads','user'].map(n=>window.claude.use(n).catch(()=>null)));
   Object.assign(Cap,{db,assets,sample,downloads,user});
  }
  if(Cap.db){this.mode='db'}else{S.local=true}
  if(Cap.user){try{S.me.id=await Cap.user.id()}catch(e){}try{const me=await Cap.user.me();S.me.name=me&&me.name||''}catch(e){}
   try{const c=Cap.user.can&&await Cap.user.can('data.write');if(c===false)S.readOnly=true}catch(e){}}
 },
 subProjects(cb){
  if(this.mode==='db'){return Cap.db.collection('projects').onSnapshot(sn=>cb(sn.docs.map(d=>({id:d.id,...d.data()}))),e=>{console.warn(e);cb([])})}
  const f=()=>cb(Object.values(lsGet('mbs:projects',{})));f();this._lp=f;return()=>{}
 },
 async getDraft(pid){if(this.mode==='db'){const d=await Cap.db.doc('drafts/'+pid).get();return d.exists?d.data():null}return lsGet('mbs:draft:'+pid,null)},
 subDraft(pid,cb){if(this.mode==='db')return Cap.db.doc('drafts/'+pid).onSnapshot(d=>cb(d.exists?d.data():null),()=>{});return()=>{}},
 async saveDraft(pid,data){if(this.mode==='db')return Cap.db.doc('drafts/'+pid).set(data);lsSet('mbs:draft:'+pid,data)},
 async saveMeta(pid,meta){if(this.mode==='db')return Cap.db.doc('projects/'+pid).set(meta);const m=lsGet('mbs:projects',{});m[pid]={id:pid,...meta};lsSet('mbs:projects',m);this._lp&&this._lp()},
 async delProject(pid){if(this.mode==='db'){const vs=await Cap.db.collection('projects/'+pid+'/versions').get();for(const d of vs.docs){await Cap.db.doc('projects/'+pid+'/versions/'+d.id).delete()}await Cap.db.doc('drafts/'+pid).delete();return Cap.db.doc('projects/'+pid).delete()}
  const m=lsGet('mbs:projects',{});delete m[pid];lsSet('mbs:projects',m);try{localStorage.removeItem('mbs:draft:'+pid);localStorage.removeItem('mbs:versions:'+pid)}catch(e){}this._lp&&this._lp()},
 subVersions(pid,cb){
  if(this.mode==='db'){return Cap.db.collection('projects/'+pid+'/versions').orderBy('n','desc').onSnapshot(sn=>cb(sn.docs.map(d=>({id:d.id,...d.data()}))),e=>{console.warn(e);cb([])})}
  const f=()=>cb(lsGet('mbs:versions:'+pid,[]).slice().sort((a,b)=>b.n-a.n));f();this._lv=f;return()=>{}
 },
 async addVersion(pid,v){if(this.mode==='db')return Cap.db.doc('projects/'+pid+'/versions/'+v.id).set(v);const a=lsGet('mbs:versions:'+pid,[]);a.push(v);lsSet('mbs:versions:'+pid,a);this._lv&&this._lv()},
 async patchVersion(pid,vid,patch){if(this.mode==='db')return Cap.db.doc('projects/'+pid+'/versions/'+vid).update(patch);const a=lsGet('mbs:versions:'+pid,[]);const x=a.find(v=>v.id===vid);if(x)Object.assign(x,patch);lsSet('mbs:versions:'+pid,a);this._lv&&this._lv()},
 async upload(blob,type){
  if(Cap.assets){const r=await Cap.assets.upload(blob,type?{type}:undefined);return r.id}
  const id='local:'+uid();LOCALBLOB[id]=URL.createObjectURL(blob);LOCALBLOB[id+':blob']=blob;return id
 },
 url(id){if(!id)return '';if(String(id).startsWith('local:'))return LOCALBLOB[id]||'';return '/_blob/'+id},
 async fetchBlob(id){if(String(id).startsWith('local:'))return LOCALBLOB[id+':blob'];const r=await fetch(this.url(id));if(!r.ok)throw new Error('asset '+r.status);return r.blob()},
};
const ERR={
 not_granted:'이 페이지에 해당 권한이 허용되지 않았습니다. 상단 아티팩트 메뉴의 권한에서 허용할 수 있습니다.',
 rate_limited:'요청이 많아 잠시 처리하지 못했습니다. 잠시 뒤 다시 시도하세요.',
 too_large:'파일이 너무 큽니다. 20MB 이하로 줄이세요.',
 unsupported_type:'지원하지 않는 파일 형식입니다.',
 quota_or_state:'저장 공간이 가득 찼습니다. 쓰지 않는 레퍼런스를 삭제하세요.',
 quota_exceeded:'저장 한도에 도달했습니다. 오래된 프로젝트를 정리하세요.',
 invalid_argument:'저장 권한이 없거나 데이터가 너무 큽니다.',
 refused:'Claude가 이 요청을 처리하지 않았습니다. 지시 문구를 바꿔 다시 시도하세요.',
 invalid_json:'Claude 응답을 읽지 못했습니다. 다시 시도하세요.',
 sampling_disabled:'이 계정에서는 Claude 호출을 쓸 수 없습니다.',
 session_expired:'로그인이 만료되었습니다. 다시 로그인하세요.',
 prompt_too_large:'보낼 내용이 너무 깁니다. 원문 자료를 줄이세요.',
 declined:'저장을 취소했습니다.',
 cancelled:'중단했습니다.'};
const errMsg=e=>ERR[e&&e.code]||(e&&e.message)||'문제가 생겼습니다. 다시 시도하세요.';

/* audio asset wrapper: audio types are not accepted as-is, so wrap as JSON */
async function uploadAudio(file){
 if(file.size>14.5*1024*1024)throw {code:'too_large',message:'오디오는 14MB 이하만 저장할 수 있습니다 (WAV라면 MP3/M4A로 변환 권장).'};
 const b64=await blobToB64(file);
 const wrapped=new Blob([JSON.stringify({mbsAudio:1,name:file.name,mime:file.type||'audio/wav',b64})],{type:'application/json'});
 const id=await Store.upload(wrapped,'application/json');
 AUD.bytes[id]={bytes:b64ToBytes(b64),name:file.name,mime:file.type||'audio/wav'};
 return id}
const AUD={buf:{},bytes:{},pending:{}};
async function audioBytes(id){if(AUD.bytes[id])return AUD.bytes[id];const blob=await Store.fetchBlob(id);const j=JSON.parse(await blob.text());AUD.bytes[id]={bytes:b64ToBytes(j.b64),name:j.name,mime:j.mime};return AUD.bytes[id]}
async function audioBuffer(id){if(!id)return null;if(AUD.buf[id])return AUD.buf[id];if(AUD.pending[id])return AUD.pending[id];
 AUD.pending[id]=(async()=>{const {bytes}=await audioBytes(id);const ctx=actx();const buf=await ctx.decodeAudioData(bytes.slice(0).buffer);AUD.buf[id]=buf;return buf})();
 try{return await AUD.pending[id]}finally{delete AUD.pending[id]}}
let _actx=null;function actx(){if(!_actx)_actx=new (window.AudioContext||window.webkitAudioContext)();return _actx}

/* images */
const IMG={};
function img(id){if(!id)return null;let r=IMG[id];if(!r){r=IMG[id]={el:new Image(),ok:false};r.el.onload=()=>{r.ok=true;Player.redrawAll()};r.el.src=Store.url(id)}return r.ok?r.el:null}

/* ================= ui helpers ================= */
function toast(msg,o={}){const el=document.createElement('div');el.className='toast'+(o.err?' err':'');el.innerHTML=`<span>${esc(msg)}</span>`+(o.action?`<button>${esc(o.action)}</button>`:'');if(o.action)el.querySelector('button').onclick=()=>{o.onAction&&o.onAction();el.remove()};$('#toasts').appendChild(el);setTimeout(()=>el.remove(),o.ms||(o.err?6000:3200))}
async function copyText(t,label='복사했습니다.'){try{await navigator.clipboard.writeText(t);toast(label)}catch(e){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();toast(ok?label:'복사가 막혀 있습니다. 텍스트를 직접 선택해 복사하세요.',{err:!ok})}}
async function saveFile(filename,data){
 if(Cap.downloads){try{await Cap.downloads.save({filename,data});toast(filename+' 파일을 저장했습니다.');return true}catch(e){if(e&&e.code==='declined')return false;toast(errMsg(e),{err:true});return false}}
 try{const blob=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();toast(filename+' 파일을 저장했습니다.');return true}catch(e){toast('이 환경에서는 파일 저장을 할 수 없습니다.',{err:true});return false}}
function pickFile(accept,multiple=false){return new Promise(res=>{const f=$('#filepick');f.value='';f.accept=accept||'';f.multiple=multiple;f.onchange=()=>res(multiple?[...f.files]:f.files[0]||null);f.click()})}
function modal(o){ // {title, body, foot, cls, onClose}
 const L=$('#layer');const wrap=document.createElement('div');wrap.className='scrim';
 wrap.innerHTML=`<div class="modal ${o.cls||''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="modal-h"><h3>${esc(o.title)}</h3><button class="ibtn" data-x aria-label="닫기">${ic('close')}</button></div><div class="modal-b">${o.body||''}</div>${o.foot!==false?`<div class="modal-f">${o.foot||''}</div>`:''}</div>`;
 const close=()=>{wrap.remove();o.onClose&&o.onClose();document.removeEventListener('keydown',kd,true)};
 const kd=e=>{if(e.key==='Escape'&&L.lastElementChild===wrap){e.stopPropagation();close()}};document.addEventListener('keydown',kd,true);
 wrap.addEventListener('mousedown',e=>{if(e.target===wrap)close()});wrap.querySelector('[data-x]').onclick=close;
 L.appendChild(wrap);const m=wrap.querySelector('.modal');m.close=close;setTimeout(()=>{const f=m.querySelector('[autofocus],.modal-b input,.modal-b textarea');f&&f.focus()},30);return m}
function confirmBox(title,text,okLabel,danger=true){return new Promise(res=>{const m=modal({title,body:`<p style="color:var(--fg-2)">${text}</p>`,foot:`<button class="btn" data-no>취소</button><button class="btn ${danger?'danger':'pri'}" data-ok>${esc(okLabel)}</button>`,onClose:()=>res(false)});m.querySelector('[data-no]').onclick=()=>{m.close()};m.querySelector('[data-ok]').onclick=()=>{res(true);m.close()}})}
const seg=(name,list,val,attrs='')=>`<div class="seg" role="group">${list.map(([k,n])=>`<button type="button" aria-pressed="${String(k)===String(val)}" data-set="${name}" data-v="${esc(k)}" ${attrs}>${n}</button>`).join('')}</div>`;
const rangeStyle=(v,a,b)=>`--p:${((v-a)/(b-a)*100).toFixed(1)}%`;
