/* ================= ANIMATIC RENDERER ================= */
const OFF={};
function off(key,W,H){let c=OFF[key];if(!c||c.width!==W||c.height!==H){c=document.createElement('canvas');c.width=W;c.height=H;OFF[key]=c}return c}
let NOISE=null;function noise(){if(NOISE)return NOISE;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const d=x.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);NOISE=c;return c}
const TRD={dissolve:.8,flash:.55,whip:.45,glitch:.5,wipe:.7,zoom:.6,cut:0};
const fontStack=p=>`"${p.brief.font}","IBM Plex Sans KR","Apple SD Gothic Neo",sans-serif`;
function lbH(p,H,W){return p.brief.letterbox&&W>=H?Math.round(H*0.112):0}

const FONTS_OK=new Set();function ensureFont(f,w=[700,300]){if(!f||FONTS_OK.has(f)||!document.fonts)return;FONTS_OK.add(f);Promise.all(w.map(x=>document.fonts.load(`${x} 40px "${f}"`))).then(()=>Player.redrawAll()).catch(()=>{})}
function drawFrame(ctx,W,H,p,t,o={}){ensureFont(p.brief.font);
 const tl=o.tl||timeline(p);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';
 ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
 if(!tl.segs.length){ctx.restore();return}
 let i=tl.segs.findIndex(g=>t<g.end);if(i<0)i=tl.segs.length-1;const g=tl.segs[i],prev=tl.segs[i-1];
 const u=t-g.start;const tr=prev?prev.s.dir.transition:'cut';const TD=(TRD[tr]||0)/Math.sqrt((prev?prev.s.dir.pace:3)/3);
 if(prev&&tr!=='cut'&&u<TD){drawTransition(ctx,W,H,p,prev,g,t,clamp(u/TD,0,1),tr,o)}
 else drawScene(ctx,W,H,p,g,t,o);
 // fade in from black at very start / to black at end
 const fin=clamp(t/0.6,0,1);if(fin<1){ctx.fillStyle=`rgba(0,0,0,${1-ease.o(fin)})`;ctx.fillRect(0,0,W,H)}
 const fout=clamp((tl.total-t)/1.0,0,1);if(fout<1){ctx.fillStyle=`rgba(0,0,0,${(1-fout)*.85})`;ctx.fillRect(0,0,W,H)}
 drawChrome(ctx,W,H,p,t,g,tl,o);
 if(o.subs)drawSubs(ctx,W,H,p,t,tl,o);
 if(o.guides)drawGuides(ctx,W,H);
 ctx.restore()}
function drawTransition(ctx,W,H,p,a,b,t,k,tr,o){
 const A=off('A',W,H),B=off('B',W,H);drawScene(A.getContext('2d'),W,H,p,a,t,o);drawScene(B.getContext('2d'),W,H,p,b,t,o);const e=ease.io(k);
 ctx.save();
 switch(tr){
  case 'dissolve':ctx.drawImage(A,0,0);ctx.globalAlpha=e;ctx.drawImage(B,0,0);break;
  case 'flash':ctx.drawImage(B,0,0);ctx.fillStyle=`rgba(255,255,255,${Math.pow(1-k,1.6)})`;ctx.fillRect(0,0,W,H);break;
  case 'whip':{const blur=Math.sin(Math.PI*k);for(let j=0;j<5;j++){const off_=j*W*0.018*blur;ctx.globalAlpha=j?0.22:1;ctx.drawImage(A,-W*e-off_,0);ctx.drawImage(B,W*(1-e)-off_,0)}break}
  case 'glitch':{ctx.drawImage(k>.45?B:A,0,0);const f=Math.floor(t*30);for(let j=0;j<10;j++){const y=hash(f*7+j)*H,h=H*(0.015+hash(f+j*3)*0.06),dx=(hash(f*3+j)-.5)*W*0.12*(1-k);ctx.drawImage(hash(j+f)>.5?B:A,0,y,W,h,dx,y,W,h)}ctx.globalCompositeOperation='screen';ctx.globalAlpha=.35*(1-k);ctx.fillStyle=p.brief.palette.primary;ctx.fillRect(0,hash(f)*H,W,H*.05);break}
  case 'wipe':{ctx.drawImage(A,0,0);const x=W*e;ctx.save();ctx.beginPath();ctx.rect(0,0,x,H);ctx.clip();ctx.drawImage(B,0,0);ctx.restore();const gr=ctx.createLinearGradient(x-W*.04,0,x,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,hexA(p.brief.palette.primary,.9));ctx.fillStyle=gr;ctx.fillRect(x-W*.04,0,W*.04,H);break}
  case 'zoom':{ctx.globalAlpha=1-e;const s1=1+e*.35;ctx.translate(W/2,H/2);ctx.scale(s1,s1);ctx.drawImage(A,-W/2,-H/2);ctx.setTransform(1,0,0,1,0,0);for(let j=0;j<3;j++){const s2=1.25-.25*e+j*.03*(1-e);ctx.globalAlpha=e*(j?.25:1);ctx.save();ctx.translate(W/2,H/2);ctx.scale(s2,s2);ctx.drawImage(B,-W/2,-H/2);ctx.restore()}break}
  default:ctx.drawImage(B,0,0)}
 ctx.restore()}
function coverRect(iw,ih,W,H,fx=.5,fy=.5){const s=Math.max(W/iw,H/ih);const w=iw*s,h=ih*s;return [ (W-w)*fx, (H-h)*fy, w, h]}
function drawScene(ctx,W,H,p,g,t,o={}){
 const s=g.s,d=s.dir,pal=p.brief.palette;const dur=Math.max(.3,g.end-g.start);const u=t-g.start;const P=clamp(u/dur,0,1);const pace=(d.pace||3)/3;const eff=new Set(d.effects||[]);
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 // ---- background with camera
 const im=s.still&&img(s.still.assetId);const e=ease.io(P);const a=0.075*Math.sqrt(pace);let sc=1.03,dx=0,dy=0,rot=0;
 switch(d.camera){case 'static':sc=1.02+0.012*P;break;case 'zoomIn':sc=1+a*1.4*e;break;case 'zoomOut':sc=1+a*1.4*(1-e);break;case 'push':sc=1+a*2.6*ease.o(P);break;
  case 'panL':sc=1.12;dx=lerp(.045,-.045,e)*W;break;case 'panR':sc=1.12;dx=lerp(-.045,.045,e)*W;break;case 'tilt':sc=1.12;dy=lerp(.045,-.045,e)*H;break;case 'orbit':sc=1.07+.05*e;rot=lerp(-.014,.014,e);dx=lerp(.03,-.03,e)*W;break}
 const fx=s.still?(s.still.fx??.5):.5,fy=s.still?(s.still.fy??.5):.5;
 ctx.save();ctx.translate(W*fx+dx,H*fy+dy);ctx.rotate(rot);ctx.scale(sc,sc);ctx.translate(-W*fx,-H*fy);
 if(eff.has('dof')&&'filter' in ctx)ctx.filter=`blur(${Math.round(W/240)}px)`;
 if(im){const [x,y,w,h]=coverRect(im.naturalWidth,im.naturalHeight,W,H,fx,fy);ctx.drawImage(im,x,y,w,h)}
 else{ctx.fillStyle=pal.bg;ctx.fillRect(-W*.1,-H*.1,W*1.2,H*1.2);const gr=ctx.createRadialGradient(W*(.7-.2*e),H*.4,0,W*.7,H*.4,W*.7);gr.addColorStop(0,hexA(pal.primary,.28));gr.addColorStop(1,hexA(pal.primary,0));ctx.fillStyle=gr;ctx.fillRect(-W*.1,-H*.1,W*1.2,H*1.2);
  const gr2=ctx.createRadialGradient(W*.15,H*.9,0,W*.15,H*.9,W*.5);gr2.addColorStop(0,hexA(pal.accent,.18));gr2.addColorStop(1,hexA(pal.accent,0));ctx.fillStyle=gr2;ctx.fillRect(-W*.1,-H*.1,W*1.2,H*1.2);
  ctx.fillStyle=hexA(pal.text,.05);ctx.font=`800 ${Math.round(H*.62)}px "Bricolage Grotesque",sans-serif`;ctx.textAlign='right';ctx.textBaseline='alphabetic';ctx.fillText(pad(g.i+1),W*.97,H*.86)}
 ctx.filter='none';ctx.restore();
 const dark=im?1:(lum(pal.bg)<.5?1:0);const txtCol=im||dark?(im?'#FFFFFF':pal.text):pal.text;
 if(eff.has('dof')){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,W,H)}
 if(d.tone<0){ctx.fillStyle=`rgba(0,0,0,${.2*-d.tone})`;ctx.fillRect(0,0,W,H)}else if(d.tone>0){ctx.fillStyle=`rgba(255,255,255,${.07*d.tone})`;ctx.fillRect(0,0,W,H)}
 if(im){const gl=ctx.createLinearGradient(0,0,W*.65,0);gl.addColorStop(0,'rgba(0,0,0,.42)');gl.addColorStop(1,'rgba(0,0,0,0)');if(['left','lower'].includes(s.onscreen.position)&&s.onscreen.headline){ctx.fillStyle=gl;ctx.fillRect(0,0,W,H)}}
 const acc=d.accent==='accent'?pal.accent:d.accent==='text'?pal.text:pal.primary;
 // ---- effects
 if(eff.has('tint')){ctx.globalCompositeOperation='soft-light';ctx.fillStyle=hexA(acc,.55);ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}
 if(eff.has('grid')){ctx.strokeStyle=hexA(txtCol,.08);ctx.lineWidth=1;const n=12;for(let k=1;k<n;k++){const x=Math.round(W*k/n)+.5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let k=1;k<7;k++){const y=Math.round(H*k/7)+.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}}
 if(eff.has('particles')){for(let k=0;k<46;k++){const px=hash(k*3.1)*W,sp=.02+hash(k)*.05,py=((hash(k*7.7)-u*sp*pace)%1+1)%1*H;const r=W*(.0012+hash(k*5)*.0025);ctx.fillStyle=hexA(k%3?pal.text:acc,.25+hash(k*9)*.4);ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill()}}
 if(eff.has('scan')){const k=clamp((P-.18)/.45,0,1);if(k>0&&k<1){const x=lerp(W*.08,W*.92,ease.io(k));const gr=ctx.createLinearGradient(x-W*.12,0,x,0);gr.addColorStop(0,hexA(acc,0));gr.addColorStop(1,hexA(acc,.28));ctx.fillStyle=gr;ctx.fillRect(x-W*.12,0,W*.12,H);ctx.fillStyle=hexA(acc,.95);ctx.fillRect(x-1,0,2,H)}}
 if(eff.has('hud')){const k=ease.o5(clamp((u-.3)/.6,0,1));const bx=[W*.3,H*.24,W*.7,H*.76];const padx=lerp(W*.2,0,k),pady=lerp(H*.15,0,k);const x1=bx[0]-padx,y1=bx[1]-pady,x2=bx[2]+padx,y2=bx[3]+pady,L=W*.03;ctx.globalAlpha=k*(.65+.35*Math.sin(t*6)**2);ctx.strokeStyle=acc;ctx.lineWidth=Math.max(2,W/640);ctx.beginPath();
  ctx.moveTo(x1,y1+L);ctx.lineTo(x1,y1);ctx.lineTo(x1+L,y1);ctx.moveTo(x2-L,y1);ctx.lineTo(x2,y1);ctx.lineTo(x2,y1+L);ctx.moveTo(x2,y2-L);ctx.lineTo(x2,y2);ctx.lineTo(x2-L,y2);ctx.moveTo(x1+L,y2);ctx.lineTo(x1,y2);ctx.lineTo(x1,y2-L);ctx.stroke();
  const cx=(x1+x2)/2,cy=(y1+y2)/2;ctx.beginPath();ctx.moveTo(cx-W*.01,cy);ctx.lineTo(cx+W*.01,cy);ctx.moveTo(cx,cy-W*.01);ctx.lineTo(cx,cy+W*.01);ctx.stroke();ctx.font=`500 ${Math.round(W*.0105)}px "IBM Plex Mono",monospace`;ctx.fillStyle=acc;ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText((s.chapter||'TRACKING').toUpperCase()+' · '+(u).toFixed(1)+'s',x1,y1-W*.006);ctx.globalAlpha=1}
 if(eff.has('callout')){const labs=(s.onscreen.sub||'').split(/[·,|]/).map(x=>x.trim()).filter(Boolean).slice(0,4);const L=labs.length?labs:['DATA 01','DATA 02','DATA 03'];
  L.forEach((lab,k)=>{const a2=ease.o(clamp((u-.6-k*.35)/.5,0,1));if(!a2)return;const px=W*(.38+.13*k),py=H*(.42+((k%2)?.12:-.04)),ly=H*(k%2?.82:.2),lx=px+W*.05;ctx.globalAlpha=a2;ctx.strokeStyle=acc;ctx.lineWidth=Math.max(1.5,W/900);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,lerp(py,ly,a2));ctx.lineTo(lerp(px,lx,a2),lerp(py,ly,a2));ctx.stroke();ctx.fillStyle=acc;ctx.beginPath();ctx.arc(px,py,W*.004,0,Math.PI*2);ctx.fill();
   ctx.font=`600 ${Math.round(W*.011)}px "IBM Plex Mono",monospace`;const tw=ctx.measureText(lab).width;ctx.fillStyle='rgba(10,13,18,.82)';ctx.fillRect(lx,ly-W*.014,tw+W*.016,W*.024);ctx.fillStyle='#fff';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(lab,lx+W*.008,ly-W*.002)});ctx.globalAlpha=1}
 if(eff.has('sweep')){const k=clamp((P-.3)/.4,0,1);if(k>0&&k<1){ctx.save();ctx.globalCompositeOperation='screen';const x=lerp(-W*.3,W*1.3,ease.io(k));const gr=ctx.createLinearGradient(x-W*.15,0,x+W*.15,H*.4);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.33)');gr.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);ctx.restore()}}
 if(eff.has('glitch')){const f=Math.floor(t*24);const on=(u>.12&&u<.55)||hash(f*1.3)>.93;if(on){const src=ctx.canvas;for(let j=0;j<6;j++){const y=hash(f*5+j)*H,h=H*(.01+hash(f+j)*.05),dx2=(hash(f*9+j)-.5)*W*.06;ctx.drawImage(src,0,y,W,h,dx2,y,W,h)}ctx.globalCompositeOperation='screen';ctx.fillStyle=hexA(acc,.25);ctx.fillRect(0,hash(f)*H,W,H*.02);ctx.globalCompositeOperation='source-over'}}
 if(!im&&o.placeholders&&s.visual){ctx.font=`italic 400 ${Math.round(W*.0125)}px ${fontStack(p)}`;ctx.fillStyle=hexA(txtCol,.38);ctx.textAlign='right';ctx.textBaseline='bottom';const lb=lbH(p,H,W);wrapLines(ctx,'화면 · '+s.visual,W*.42).slice(0,3).forEach((ln,k,arr)=>ctx.fillText(ln,W*.96,H-lb-H*.05-(arr.length-1-k)*W*.019))}
 // ---- text
 drawText(ctx,W,H,p,s,u,dur,txtCol,acc,!!im);
 if(eff.has('vignette')){const gr=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H)}
 if(eff.has('grain')){ctx.save();ctx.globalAlpha=.08;ctx.globalCompositeOperation='overlay';const pat=ctx.createPattern(noise(),'repeat');const f=Math.floor(t*24);ctx.translate(-hash(f)*256,-hash(f+9)*256);ctx.fillStyle=pat;ctx.fillRect(0,0,W+256,H+256);ctx.restore()}
 ctx.restore()}
function wrapLines(ctx,text,maxW){const out=[];String(text).split('\n').forEach(par=>{const words=par.split(/(\s+)/);let line='';for(const w of words){const test=line+w;if(ctx.measureText(test).width>maxW&&line.trim()){out.push(line.trim());line=w.trimStart()}else line=test;
  while(ctx.measureText(line).width>maxW&&line.length>1){let k=line.length;while(k>1&&ctx.measureText(line.slice(0,k)).width>maxW)k--;out.push(line.slice(0,k));line=line.slice(k)}}if(line.trim()||!out.length)out.push(line.trim())});return out}
function drawText(ctx,W,H,p,s,u,dur,col,acc,overImg){const hd=s.onscreen.headline,sb=s.onscreen.sub;const chap=s.chapter;if(!hd&&!sb&&!chap)return;
 const d=s.dir;const pace=(d.pace||3)/3;const base=Math.min(W,H*1.78);const hs=Math.round(base*(W<H?.075:.052));const ss=Math.round(base*.021);const lb=lbH(p,H,W);
 const pos=s.onscreen.position||'left';const align=pos==='center'?'center':pos==='right'?'right':'left';const x=pos==='center'?W/2:pos==='right'?W*.92:W*.08;const maxW=pos==='center'?W*.8:W*.52;
 const F=fontStack(p);ctx.font=`700 ${hs}px ${F}`;const lines=hd?wrapLines(ctx,hd,maxW):[];const lh=hs*1.16;
 ctx.font=`300 ${ss}px ${F}`;const sl=sb&&!(d.effects||[]).includes('callout')?wrapLines(ctx,sb,maxW):[];
 const blockH=(chap?ss*1.8:0)+lines.length*lh+(sl.length?ss*.8+sl.length*ss*1.45:0);
 let y=pos==='lower'?H-lb-H*.1-blockH:H*.46-blockH/2;
 const outK=1-ease.io(clamp((u-(dur-.45))/.45,0,1));const anim=d.textAnim||'mask';const T0=.25/pace;const D=.7/Math.sqrt(pace);
 ctx.textAlign=align;ctx.textBaseline='top';if(overImg){ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=hs*.25}
 const one=(text,font,color,yy,hgt,t0)=>{const k=clamp((u-t0)/D,0,1);if(k<=0)return;ctx.font=font;ctx.fillStyle=color;
  if(anim==='mask'){const kk=ease.o5(k);ctx.save();ctx.beginPath();ctx.rect(0,yy-hgt*.08,W,hgt*1.12);ctx.clip();ctx.globalAlpha=outK;ctx.fillText(text,x,yy+(1-kk)*hgt*1.1);ctx.restore()}
  else if(anim==='fadeUp'){const kk=ease.o(k);ctx.globalAlpha=kk*outK;ctx.fillText(text,x,yy+(1-kk)*hgt*.45);ctx.globalAlpha=1}
  else if(anim==='type'){const n=Math.floor(clamp((u-t0)*26*pace,0,text.length));ctx.globalAlpha=outK;ctx.fillText(text.slice(0,n),x,yy);if(n<text.length&&Math.floor(u*3)%2===0){const w=ctx.measureText(text.slice(0,n)).width;const cx=align==='left'?x+w:align==='center'?x+w/2:x;ctx.fillRect(cx+2,yy,Math.max(2,hgt*.06),hgt*.9)}ctx.globalAlpha=1}
  else{const kk=ease.back(k);ctx.save();ctx.globalAlpha=clamp(k*2,0,1)*outK;ctx.translate(x,yy+hgt/2);ctx.scale(.85+.15*kk,.85+.15*kk);ctx.fillText(text,0,-hgt/2);ctx.restore()}};
 let t0=T0;if(chap){ctx.save();ctx.shadowBlur=0;one(chap.toUpperCase().split('').join(' '),`600 ${Math.round(ss*.78)}px "IBM Plex Mono",monospace`,acc,y,ss,t0*.6);ctx.restore();y+=ss*1.8}
 lines.forEach((ln,k)=>{one(ln,`${k===lines.length-1&&lines.length>1?800:700} ${hs}px ${F}`,col,y,hs,t0+k*.12);y+=lh});
 if(sl.length){y+=ss*.8;sl.forEach((ln,k)=>{one(ln,`300 ${ss}px ${F}`,hexA(col.length===7?col:'#ffffff',.82),y,ss,t0+.3+lines.length*.12+k*.08);y+=ss*1.45})}
 ctx.shadowBlur=0;ctx.globalAlpha=1}
function drawChrome(ctx,W,H,p,t,g,tl,o){const lb=lbH(p,H,W);const pal=p.brief.palette;
 if(lb){ctx.fillStyle='#000';ctx.fillRect(0,0,W,lb);ctx.fillRect(0,H-lb,W,lb)}
 if(o.chrome===false)return;const fs=Math.round(Math.min(W,H*1.78)*.0105);const topY=lb?lb/2:H*.045;
 ctx.textBaseline='middle';ctx.font=`700 ${Math.round(fs*1.25)}px ${fontStack(p)}`;ctx.textAlign='left';ctx.fillStyle=lb?'#fff':hexA(lum(pal.bg)<.5?'#ffffff':'#000000',.75);ctx.globalAlpha=.85;ctx.fillText(p.title||'',W*.033,topY);
 const ch=tl.segs.length;ctx.font=`500 ${fs}px "IBM Plex Mono",monospace`;ctx.textAlign='right';const lab=`${pad(g.i+1)} / ${pad(ch)}   ${(g.s.chapter||'').toUpperCase()}`;ctx.fillText(lab,W*.967,topY);ctx.globalAlpha=1;
 ctx.fillStyle=pal.primary;ctx.fillRect(0,H-Math.max(2,H*.003),W*clamp(t/tl.total,0,1),Math.max(2,H*.003))}
function drawSubs(ctx,W,H,p,t,tl,o){const x=tl.lines.find((q,k)=>{const nx=tl.lines[k+1];const e=Math.min(q.end+.4,nx?nx.start-.06:q.end+.4);return t>=q.start-.1&&t<e});if(!x)return;
 const l1=String(x.l[o.lang||'ko']||'').trim(),l2=o.second?String(x.l[o.second]||'').trim():'';if(!l1&&!l2)return;
 const lb=lbH(p,H,W);const base=Math.min(W,H*1.78);const f1=Math.round(base*(W<H?.03:.0165)),f2=Math.round(f1*.76);const F=fontStack(p);
 const cy=lb?H-lb/2:H*(W<H?.8:.88);ctx.textAlign='center';ctx.textBaseline='middle';
 const fJ=o.lang==='ja'?'"Hiragino Sans","Noto Sans JP",':'';
 ctx.font=`500 ${f1}px ${fJ}${F}`;const w1=l1?ctx.measureText(l1).width:0;ctx.font=`400 ${f2}px "Hiragino Sans","Noto Sans JP",${F}`;const w2=l2?ctx.measureText(l2).width:0;
 const h=(l1?f1*1.3:0)+(l2?f2*1.35:0);const y0=cy-h/2;
 if(!lb){ctx.fillStyle='rgba(0,0,0,.55)';const bw=Math.max(w1,w2)+f1*1.2;const r=f1*.3;ctx.beginPath();ctx.roundRect?ctx.roundRect(W/2-bw/2,y0-f1*.3,bw,h+f1*.6,r):ctx.rect(W/2-bw/2,y0-f1*.3,bw,h+f1*.6);ctx.fill()}
 let y=y0;if(l1){ctx.font=`500 ${f1}px ${fJ}${F}`;ctx.fillStyle='#fff';ctx.fillText(l1,W/2,y+f1*.65);y+=f1*1.3}
 if(l2){ctx.font=`400 ${f2}px "Hiragino Sans","Noto Sans JP",${F}`;ctx.fillStyle='#A3ACBA';ctx.fillText(l2,W/2,y+f2*.68)}}
function drawGuides(ctx,W,H){ctx.save();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.setLineDash([6,6]);ctx.lineWidth=1;[[.05,.05],[.1,.1]].forEach(([a,b])=>ctx.strokeRect(W*a,H*b,W*(1-2*a),H*(1-2*b)));ctx.setLineDash([2,6]);ctx.strokeStyle='rgba(255,255,255,.25)';for(const k of [1/3,2/3]){ctx.beginPath();ctx.moveTo(W*k,0);ctx.lineTo(W*k,H);ctx.moveTo(0,H*k);ctx.lineTo(W,H*k);ctx.stroke()}
 ctx.setLineDash([]);ctx.font='500 11px "IBM Plex Mono"';ctx.fillStyle='rgba(255,255,255,.6)';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('ACTION SAFE 90%',W*.05+4,H*.05+4);ctx.fillText('TITLE SAFE 80%',W*.1+4,H*.1+4);ctx.restore()}

/* ================= PLAYER ================= */
const Player={cv:null,ctx:null,playing:false,from:0,t0:0,nodes:[],bgmStop:null,raf:0,out:null,
 attach(cv){this.cv=cv;this.ctx=cv.getContext('2d');this.resize();this.fit();this.draw()},
 resize(){if(!this.cv||!S.proj)return;const [w,h]=aspectWH(S.proj.brief.aspect);const L=1280;const k=L/Math.max(w,h);const W=Math.round(w*k),H=Math.round(h*k);if(this.cv.width!==W||this.cv.height!==H){this.cv.width=W;this.cv.height=H}this.fit()},
 fit(){const wr=$('#cwrap');if(!wr||!this.cv)return;const cw=wr.clientWidth-32,ch=wr.clientHeight-32;const r=this.cv.width/this.cv.height;let w=cw,h=cw/r;if(h>ch){h=ch;w=ch*r}this.cv.style.width=Math.max(50,w)+'px';this.cv.style.height=Math.max(30,h)+'px'},
 redrawAll(){if(this.cv&&document.body.contains(this.cv)&&!this.playing)this.draw();if(typeof Exp!=='undefined'&&Exp.thumbDraw)Exp.thumbDraw()},
 draw(){if(!this.cv||!S.proj||!document.body.contains(this.cv))return;const p=S.proj;drawFrame(this.ctx,this.cv.width,this.cv.height,p,S.t,{subs:p.subs.show,lang:p.subs.lang,second:p.subs.second,guides:S.guides,placeholders:true});updateTimeUI()},
 async play(){if(!S.proj||this.playing)return;const ctx=actx();try{await ctx.resume()}catch(e){}const tl=timeline(S.proj);if(S.t>=tl.total-.05)S.t=0;
  this.out=ctx.createGain();this.out.connect(ctx.destination);this.from=S.t;this.t0=ctx.currentTime+.08;this.playing=true;S.playing=true;renderPTool();
  await startAudio(ctx,this.out,S.proj,tl,this.from,this.t0,this);
  const loop=()=>{if(!this.playing)return;const t=this.from+Math.max(0,ctx.currentTime-this.t0);S.t=t;if(t>=tl.total){this.pause();S.t=tl.total;this.draw();return}this.draw();this.raf=requestAnimationFrame(loop)};loop()},
 pause(){if(!this.playing)return;this.playing=false;S.playing=false;cancelAnimationFrame(this.raf);stopAudio(this);renderPTool();this.redrawAll()},
 stop(){this.pause()},
 toggle(){this.playing?this.pause():this.play()},
 async seek(t){S.t=clamp(t,0,timeline(S.proj).total);if(this.playing){this.pause();await this.play()}else this.redrawAll()}};
async function startAudio(ctx,out,p,tl,from,t0,holder){holder.nodes=[];
 const n=p.narration;if(n&&n.assetId){try{const buf=await audioBuffer(n.assetId);if(holder.playing!==false&&from<buf.duration){const src=ctx.createBufferSource();src.buffer=buf;src.connect(out);src.start(t0,from);holder.nodes.push(src)}}catch(e){console.warn(e)}}
 if(p.bgm.preview||holder.forceBgm)holder.bgmStop=await startBgm(ctx,out,p,tl,from,t0)}
function stopAudio(h){(h.nodes||[]).forEach(n=>{try{n.stop()}catch(e){}});h.nodes=[];if(h.bgmStop){h.bgmStop();h.bgmStop=null}if(h.out){const o=h.out;setTimeout(()=>{try{o.disconnect()}catch(e){}},120);h.out=null}}

/* ================= BGM SKETCH (WebAudio) ================= */
const midiHz=m=>440*Math.pow(2,(m-69)/12);
function bgmEnvelope(p,tl,x){const b=p.bgm;let v=b.volume*.5;v*=clamp(x/Math.max(.01,b.fadeIn),0,1)*clamp((tl.total-x)/Math.max(.01,b.fadeOut),0,1);
 const duck=Math.pow(10,(b.duck||-12)/20);const speaking=tl.lines.some(q=>x>=q.start-.15&&x<=q.end+.2);if(speaking)v*=duck;
 const g=tl.segs.find(q=>x<q.end)||tl.segs[tl.segs.length-1];if(g)v*=.65+.09*g.s.dir.energy;return v}
async function startBgm(ctx,out,p,tl,from,t0){const b=p.bgm;const master=ctx.createGain();master.gain.value=0;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;master.connect(comp);comp.connect(out);
 const live=new Set();const at=x=>t0+(x-from);
 const tidy=n=>{live.add(n);n.onended=()=>live.delete(n)};
 // envelope automation every .1s
 for(let x=from;x<=tl.total;x+=.1){master.gain.linearRampToValueAtTime(bgmEnvelope(p,tl,x),Math.max(ctx.currentTime,at(x)))}
 if(b.source==='upload'&&b.assetId){try{const buf=await audioBuffer(b.assetId);const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;s.connect(master);s.start(t0,from%buf.duration);tidy(s)}catch(e){console.warn(e)}
  return()=>{live.forEach(n=>{try{n.stop()}catch(e){}});try{master.disconnect()}catch(e){}}}
 const minor=b.valence<.45;const root=minor?57:60;const prog=minor?[[0,'m'],[8,'M'],[3,'M'],[10,'M']]:(b.valence>.72?[[0,'M'],[5,'M'],[9,'m'],[7,'M']]:[[0,'M'],[7,'M'],[9,'m'],[5,'M']]);
 const beat=60/b.bpm,bar=beat*4,chordLen=bar*(b.energy<.35?2:1);
 const G=new Set(b.genres),I=new Set(b.instruments);const piano=G.has('피아노 솔로')||I.has('피아노');const ambient=G.has('앰비언트')&&!G.has('일렉트로닉');
 const drums=!piano&&!ambient&&b.energy>.45&&!(b.avoid||[]).includes('강한 드럼');
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700+b.energy*2600;lp.Q.value=.6;lp.connect(master);
 let nb=null;const noiseBuf=()=>{if(nb)return nb;nb=ctx.createBuffer(1,ctx.sampleRate*1,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return nb};
 const chordAt=x=>{const [r,q]=prog[Math.floor(x/chordLen+1e-6)%4];const tri=q==='m'?[0,3,7,10]:[0,4,7,11];return tri.map(n=>root+r+n)};
 const segAt=x=>(tl.segs.find(q=>x<q.end)||tl.segs[tl.segs.length-1]);
 const note=(type,hz,start,dur,gain,dest=lp,att=.01,rel=.3)=>{if(start<ctx.currentTime-.01)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain,start+att);g.gain.setValueAtTime(gain,start+Math.max(att,dur-rel));g.gain.linearRampToValueAtTime(0,start+dur);o.connect(g);g.connect(dest);o.start(start);o.stop(start+dur+.05);tidy(o)};
 const pluck=(type,hz,start,dec,gain)=>{if(start<ctx.currentTime-.01)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(gain,start);g.gain.exponentialRampToValueAtTime(.0008,start+dec);o.connect(g);g.connect(lp);o.start(start);o.stop(start+dec+.05);tidy(o)};
 const kick=st=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(130,st);o.frequency.exponentialRampToValueAtTime(42,st+.16);g.gain.setValueAtTime(.55,st);g.gain.exponentialRampToValueAtTime(.001,st+.3);o.connect(g);g.connect(master);o.start(st);o.stop(st+.32);tidy(o)};
 const hat=(st,gain=.06)=>{const s=ctx.createBufferSource();s.buffer=noiseBuf();const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=7500;const g=ctx.createGain();g.gain.setValueAtTime(gain,st);g.gain.exponentialRampToValueAtTime(.001,st+.05);s.connect(f);f.connect(g);g.connect(master);s.start(st,Math.random()*.5,.08);tidy(s)};
 const hit=st=>{const s=ctx.createBufferSource();s.buffer=noiseBuf();const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(300,st-.7);f.frequency.exponentialRampToValueAtTime(5000,st);const g=ctx.createGain();g.gain.setValueAtTime(0,st-.7);g.gain.linearRampToValueAtTime(.35,st-.02);g.gain.linearRampToValueAtTime(0,st+.05);s.connect(f);f.connect(g);g.connect(master);s.start(Math.max(ctx.currentTime,st-.7),0,.8);tidy(s);
  const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.setValueAtTime(70,st);o.frequency.exponentialRampToValueAtTime(34,st+1.1);og.gain.setValueAtTime(.7,st);og.gain.exponentialRampToValueAtTime(.001,st+1.3);o.connect(og);og.connect(master);o.start(st);o.stop(st+1.35);tidy(o)};
 let cursor=Math.floor(from/(beat/2))*(beat/2);let lastCi=-1;const hits=tl.segs.filter((g,i)=>i&&g.s.bgmHit).map(g=>g.start).filter(x=>x>from+.05);
 const schedule=()=>{const songNow=from+(ctx.currentTime-t0);const until=Math.min(tl.total,songNow+1.6);
  while(cursor<until){const x=cursor,st=at(x);const g=segAt(x);const se=g?g.s.dir.energy:3;const bi=Math.round(x/(beat/2));const isBeat=bi%2===0,beatN=Math.round(x/beat)%4;
   const ci=Math.floor(x/chordLen+1e-6);
   if(ci!==lastCi){lastCi=ci;const notes=chordAt(x);const rest=Math.max(.2,(ci+1)*chordLen-x);
    if(piano){notes.slice(0,3).forEach((m,k)=>pluck('triangle',midiHz(m),st+k*.012,Math.min(2.4,rest),.07))}
    else notes.forEach((m,k)=>{['sawtooth','triangle'].forEach((tp,j)=>note(tp,midiHz(m)*(j?1.003:.997),st,rest+.25,j?.028:.018,lp,Math.min(1.2,rest*.3),Math.min(1,rest*.3)))});
    if(b.energy>.3&&se>=2)note('sine',midiHz(notes[0]-24),st,Math.min(rest,bar)*.9,.16,master,.02,.2)}
   if(se>=3&&b.energy>.38&&!ambient){const notes=chordAt(x);const m=notes[bi%notes.length]+12;pluck(G.has('일렉트로닉')||G.has('신스웨이브')?'square':'triangle',midiHz(m),st,.22,.035)}
   if(piano&&isBeat&&beatN===2&&se>=2){const notes=chordAt(x);pluck('triangle',midiHz(notes[1]+12),st,1.2,.04)}
   if(drums&&se>=4){if(isBeat)kick(st);hat(st,isBeat?.035:.06)}else if(drums&&se>=3&&isBeat&&beatN===0)kick(st);
   cursor+=beat/2}
  hits.filter(h=>h>=songNow-.1&&h<until+.8&&!hits._done?.has(h)).forEach(h=>{(hits._done=hits._done||new Set()).add(h);hit(at(h))})};
 schedule();const iv=setInterval(schedule,200);
 return()=>{clearInterval(iv);live.forEach(n=>{try{n.stop()}catch(e){}});try{master.gain.cancelScheduledValues(0);master.gain.value=0;master.disconnect()}catch(e){}}}
function moodWords(b){const e=['아주 차분한','잔잔한','적당히 움직이는','활기찬','역동적인'][clamp(Math.floor(b.energy*5),0,4)];const v=['어둡고 진지한','다소 묵직한','중립적인','밝은','희망찬'][clamp(Math.floor(b.valence*5),0,4)];
 const q=b.energy>=.5?(b.valence>=.5?'고양 · 경쾌':'긴장 · 웅장'):(b.valence>=.5?'잔잔 · 희망':'몽환 · 서정');return `${v}, ${e} (${q})`}
function bgmArcText(p){const tl=timeline(p);const es=tl.segs.map(g=>g.s.dir.energy);const mx=Math.max(...es);const peak=tl.segs.find(g=>g.s.dir.energy===mx);return {es,peak,tl}}
function bgmBriefKo(p){const b=p.bgm;const {es,peak,tl}=bgmArcText(p);const hits=tl.segs.filter((g,i)=>i&&g.s.bgmHit).map(g=>`씬 ${g.i+1} (${mmss(g.start)})`);
 return [`분위기: ${moodWords(b)} · 에너지 ${Math.round(b.energy*100)} / 밝기 ${Math.round(b.valence*100)}`,`장르: ${b.genres.join(', ')||'미정'}`,`템포: ${b.bpm} BPM`,`악기: ${b.instruments.join(', ')||'자유'} · 보컬: ${{none:'없음',hum:'허밍·코러스',vocal:'보컬 포함'}[b.vocals]}`,
  `구성: 씬별 에너지 ${es.join(' → ')} · 정점은 씬 ${peak?peak.i+1:'-'} (${peak?mmss(peak.start):''})`,hits.length?`강조 히트: ${hits.join(', ')}`:'강조 히트: 없음',`믹스: 나레이션 구간 ${b.duck} dB 덕킹 · 페이드 인 ${b.fadeIn}s / 아웃 ${b.fadeOut}s · 볼륨 ${Math.round(b.volume*100)}%`,
  b.avoid.length?`피할 것: ${b.avoid.join(', ')}`:'',b.refs?`참고 곡: ${b.refs.replace(/\n/g,' / ')}`:'',b.notes?`메모: ${b.notes}`:'',`음원: ${{synth:'Claude가 절차적으로 합성 (분위기 스케치 기반)',upload:'업로드한 음원 사용'+(b.name?' · '+b.name:''),stock:'스톡 음원 검색 후 교체'}[b.source]}`].filter(Boolean).join('\n')}
function bgmPromptEn(p){const b=p.bgm;const {peak,tl}=bgmArcText(p);const tr=x=>(BGM_GENRES.find(g=>g[0]===x)||[x,x])[1];const ti=x=>(BGM_INSTR.find(g=>g[0]===x)||[x,x])[1];const ta=x=>(BGM_AVOID.find(g=>g[0]===x)||[x,x])[1];
 const mood=[b.valence<.3?'dark, serious':b.valence<.45?'brooding':b.valence<.6?'neutral, focused':b.valence<.78?'bright, warm':'hopeful, uplifting',b.energy<.25?'very calm':b.energy<.45?'gentle':b.energy<.65?'steady, moving':b.energy<.82?'energetic':'driving, powerful'].join(', ');
 const voc={none:'instrumental, no vocals',hum:'wordless humming or choir pads only',vocal:'with vocals'}[b.vocals];
 return `${voc}. ${b.genres.map(tr).join(' + ')||'cinematic underscore'}, ${mood}, ${b.bpm} BPM. Featuring ${b.instruments.map(ti).join(', ')||'tasteful, minimal instrumentation'}. Structure: ${Math.round(tl.total)} seconds, builds toward a peak around ${peak?mmss(peak.start):'the middle'} and resolves gently at the end. Leaves space for voice-over (background bed under narration).${b.avoid.length?' Avoid '+b.avoid.map(ta).join(', ')+'.':''}${b.refs?' Reference feel: '+b.refs.replace(/\n/g,'; ')+'.':''}`}
