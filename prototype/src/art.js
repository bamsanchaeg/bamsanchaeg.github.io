/* ===== 픽셀 그래픽: 색, 질감, 나무, 한옥, 캐릭터 (모두 코드로 직접 그린 원본) ===== */
const T = 16;
const mk = (w,h) => { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
const R = (g,c,x,y,w,h) => { g.fillStyle=c; g.fillRect(x,y,w,h); };
const hash=(a,b,c=0)=>{let h=Math.imul(a+374761393,668265263)^Math.imul(b+1274126177,2246822519)^Math.imul(c+97,3266489917);h=Math.imul(h^h>>>13,1274126177);return ((h^h>>>16)>>>0)/4294967296;};
const pick=(a,v)=>a[Math.min(a.length-1,v*a.length|0)];
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const u32=h=>{const [r,g,b]=rgb(h);return (255<<24|b<<16|g<<8|r)>>>0;};
const mixU=(c,k)=>{const r=Math.min(255,(c&255)*k),g=Math.min(255,(c>>8&255)*k),b=Math.min(255,(c>>16&255)*k);return (255<<24|b<<16|g<<8|r)>>>0;};
const ramp=a=>a.map(u32);
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16-.5);
const bay=(x,y)=>BAYER[(y&3)*4+(x&3)];
/* 256칸마다 이어지는 부드러운 노이즈 */
function noiseTable(cell,seed){ const n=256/cell, t=new Float32Array(65536); const v=(i,j)=>hash(((i%n)+n)%n,((j%n)+n)%n,seed), s=f=>f*f*(3-2*f);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){ const i=x/cell|0,j=y/cell|0,a=s(x/cell-i),b=s(y/cell-j); t[y<<8|x]=(v(i,j)*(1-a)+v(i+1,j)*a)*(1-b)+(v(i,j+1)*(1-a)+v(i+1,j+1)*a)*b; } return t; }
const N4=noiseTable(4,1), N8=noiseTable(8,2), N16=noiseTable(16,3), N64=noiseTable(64,4), N32=noiseTable(32,5);
const nz=(t,x,y)=>t[(y&255)<<8|(x&255)];
const px=(c)=>{const g=c.getContext('2d',{willReadFrequently:true}),d=g.getImageData(0,0,c.width,c.height);return {g,d,b:new Uint32Array(d.data.buffer),w:c.width,h:c.height,done(){g.putImageData(d,0,0);return c;}};};
/* 이웃 색을 어둡게 한 외곽선 */
function edge(c,k=.42){ const p=px(c),{b,w,h}=p,add=[]; for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const i=y*w+x; if(b[i]>>>24)continue; const n=(x>0&&b[i-1]>>>24&&b[i-1])||(x<w-1&&b[i+1]>>>24&&b[i+1])||(y>0&&b[i-w]>>>24&&b[i-w])||(y<h-1&&b[i+w]>>>24&&b[i+w]); if(n)add.push([i,mixU(n>>>0,k)]); } add.forEach(([i,c])=>b[i]=c); return p.done(); }

const lit=(c,k)=>{const [r,g,b]=rgb(c);return `rgb(${Math.min(255,r*k)|0},${Math.min(255,g*k)|0},${Math.min(255,b*k)|0})`;};
const ball=(g,x,y,r,c,sq=1)=>{ for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){ const d=(i*i+j*j/(sq*sq))/(r*r); if(d>1)continue; const l=.62+(-i*.35-j*.6/sq)/r*.5+Math.sqrt(1-d)*.45+bay(x+i,y+j)*.08; g.fillStyle=lit(c,l); g.fillRect(x+i,y+j,1,1);} };
/* ---------- 나무 ---------- */
const LEAF={ g:['#5d3d10','#8f641a','#b98724','#d8aa34','#efcb52','#fbe58a'], r:['#4a1512','#74211a','#9c3322','#c24d2c','#dc7140','#f09a5c'], o:['#4f2a12','#7a4319','#a35f23','#c67e31','#e09f4c','#f2c277'],
  n:['#1d3a22','#2c5430','#3f703b','#578c48','#76a859','#9cc273'], p:['#12291f','#1b3d2c','#28543a','#3a6c48','#52865a','#74a070'] };
/* 빛을 받은 공 여러 개를 겹쳐 잎 덩어리를 만든다 */
function foliage(p,blobs,rampHex,seed,grain=.5){ const rp=ramp(rampHex),{b,w,h}=p; let top=1e9,bot=0; for(const [,cy,r] of blobs){top=Math.min(top,cy-r);bot=Math.max(bot,cy+r);}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ let bz=-1e9,bi=null; const jag=(nz(N4,x*2+seed*13,y*2+seed*7)-.5)*.5+(hash(x>>1,y>>1,seed)-.5)*.22;
    for(const q of blobs){ const dx=x-q[0],dy=(y-q[1])*1.12,r=q[2]*(1+jag),d=dx*dx+dy*dy; if(d<r*r){ const z=Math.sqrt(r*r-d)+(q[3]||0); if(z>bz){bz=z;bi=[dx/r,dy/r,Math.sqrt(1-d/(r*r))];} } }
    if(!bi)continue; const l=-.42*bi[0]-.62*bi[1]+.35*bi[2]; const leaf=hash(x>>1,(y+(x&1))>>1,seed+3)*.6+nz(N4,x*3+seed,y*3)*.4;
    let v=.42+l*.42+(leaf-.5)*grain-((y-top)/(bot-top)-.4)*.22+bay(x,y)*.09; b[y*w+x]=rp[Math.max(0,Math.min(rp.length-1,v*rp.length|0))]; } }
function limb(g,pts,w0,w1,base='#6a4a30'){ const [r,gg,bb]=rgb(base); let len=0; for(let i=0;i<pts.length-1;i++)len+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]); let s=0;
  for(let i=0;i<pts.length-1;i++){ const [ax,ay]=pts[i],[bx,by]=pts[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)); for(let k=0;k<n;k++,s++){ const x=ax+(bx-ax)*k/n,y=ay+(by-ay)*k/n,w=Math.max(1,w0+(w1-w0)*s/len); const hz=Math.abs(bx-ax)>Math.abs(by-ay);
    for(let j=0;j<w;j++){ const u=j/w, li=(hz?(u<.3?1.25:u<.7?1:.65):(u<.22?1.15:u<.5?1.02:u<.78?.82:.6))*(hash((x+(hz?0:j))|0,(y*.5+(hz?j:0))|0,3)<.22?.78:1); g.fillStyle=`rgb(${Math.min(255,r*li)|0},${Math.min(255,gg*li)|0},${Math.min(255,bb*li)|0})`; hz?g.fillRect(Math.round(x),Math.round(y-w/2+j),1,1):g.fillRect(Math.round(x-w/2+j),Math.round(y),1,1); } } } }
const shadowPic=(w,h)=>{const c=mk(w,h),p=px(c); for(let y=0;y<h;y++)for(let x=0;x<w;x++){const d=((x-w/2+.5)/(w/2))**2+((y-h/2+.5)/(h/2))**2; if(d<1)p.b[y*w+x]=((d+bay(x,y)*.16<.8?0x40:0x1c)<<24|0x301820)>>>0;} c.noEdge=true; return p.done();};
const _sh=shadowPic; const SH={s:shadowPic(40,16),t:shadowPic(16,6),big:shadowPic(190,70)};
function treePic(k,v){ const w=56,h=74,c=mk(w,h); c.lift=k==='p'?.82:k==='n'?.95:.9; const g=c.getContext('2d'),s=v*31+k.charCodeAt(0);
  limb(g,[[28,72],[28,44]],8,5,k==='p'?'#7a4a34':'#6a4c34'); limb(g,[[24,72],[20,73]],4,2,'#5c4030'); limb(g,[[31,72],[36,73]],4,2,'#4c3428');
  if(k!=='p'){limb(g,[[28,50],[17,36]],4,2);limb(g,[[28,50],[40,35]],4,2);}
  const p=px(c); let bl=[]; const rn=i=>hash(i,s,9);
  if(k==='p') bl=[[28,50,13,-6],[17,44,12],[39,45,12],[28,36,15,3],[19,30,10,2],[37,29,10,2],[28,20,11,6],[28,12,7,8]].map((q,i)=>[q[0]+rn(i)*4-2,q[1]+rn(i+20)*3,q[2]-1,q[3]||0]);
  else { bl=[[28,30,19,2],[16,34,13],[40,34,13],[20,20,13,3],[37,20,13,3],[28,13,11,5],[27,44,12,-3],[12,26,9],[44,26,9]].map((q,i)=>[q[0]+rn(i)*5-2.5,q[1]+rn(i+20)*5-2.5,q[2]+rn(i+40)*2-1,q[3]||0]); if(k==='g') bl=bl.map(q=>[28+(q[0]-28)*.86,q[1]*1.02-1,q[2]*.94,q[3]]); }
  foliage(p,bl,LEAF[k],s,k==='p'?.62:.5); p.done(); return edge(c,.5); }
const TREE={}; for(const k of 'grnop') TREE[k]=[0,1,2].map(v=>treePic(k,v));
const bushPic=(()=>{const c=mk(26,22),p=px(c);foliage(p,[[8,13,7],[17,13,7],[12,9,7,2]],LEAF.n,5);p.done();const o=edge(c,.5);o.lift=.95;return o;})();
/* 명륜당 앞뜰의 큰 은행나무: 여러 갈래 줄기, 유주, 받침대, 돌 울타리 */
function greatGinkgo(big){ const w=big?292:250,h=big?300:262,c=mk(w,h),g=c.getContext('2d'),cx=w/2,by=h-22,s=big?77:53,k=big?1:.87;
  const B='#7c6148', back=[], fr=[], rn=(i,j=0)=>hash(i,s,j);
  const tips=[[-112,-150],[-86,-186],[-48,-218],[-6,-238],[40,-222],[82,-190],[112,-146],[-70,-120],[70,-116],[-24,-160],[28,-164]].map(([x,y])=>[cx+x*k,by+y*k]);
  // 뒤쪽 잎
  for(let i=0;i<46;i++){ const a=rn(i)*6.283,d=Math.sqrt(rn(i,1)); back.push([cx+Math.cos(a)*d*104*k,by-148*k+Math.sin(a)*d*76*k,(15+rn(i,2)*13)*k,-14]); }
  let p=px(c); foliage(p,back,['#4a300d','#6b4814','#8f661c','#b08426','#c79b34'],s,.5); p.done();
  // 줄기
  limb(g,[[cx-22*k,by+6],[cx-44*k,by+12]],9*k,3,B); limb(g,[[cx+22*k,by+6],[cx+46*k,by+11]],9*k,3,'#6a523d'); limb(g,[[cx,by+4],[cx+4,by+14]],12*k,4,B);
  limb(g,[[cx,by+8],[cx-2,by-34*k],[cx-4,by-100*k]],54*k,16*k,B);
  for(const o of [-14,12]) limb(g,[[cx+o*k,by+6],[cx+o*1.5*k,by-40*k],[cx+o*2.6*k,by-96*k]],22*k,13*k,o<0?'#86694e':'#6f563f');
  tips.forEach(([x,y],i)=>{ const sx=cx+(x-cx)*.14,sy=by-(52+rn(i,5)*26)*k; limb(g,[[sx,sy],[cx+(x-cx)*.5,sy+(y-sy)*.42],[x,y]],(15-i%4*2)*k,2,i%2?'#735a42':B); });
  // 유주(젖기둥)
  for(let i=0;i<11;i++){ const x=cx+(rn(i,8)*2-1)*64*k,y=by-(58+rn(i,9)*34)*k,l=(8+rn(i,10)*16)*k; limb(g,[[x,y],[x+1,y+l]],5*k,1,'#6a523d'); }
  // 앞쪽 잎: 줄기 갈래가 보이도록 아래 가운데는 비운다
  tips.forEach(([x,y],i)=>{ for(let j=0;j<3;j++) fr.push([x+(rn(i*7+j,3)-.5)*34*k,y+(rn(i*7+j,4)-.5)*28*k,(15+rn(i*7+j,6)*11)*k,rn(i*7+j,7)*10]); });
  for(let i=0;i<40;i++){ const a=rn(i,11)*6.283,d=.35+.65*Math.sqrt(rn(i,12)),x=Math.cos(a)*d*116*k,y=Math.sin(a)*d*80*k; if(y>26*k&&Math.abs(x)<56*k)continue; fr.push([cx+x,by-156*k+y,(12+rn(i,13)*11)*k,rn(i,14)*12]); }
  for(let i=0;i<9;i++)fr.push([cx+(rn(i,21)-.5)*96*k,by-(104+rn(i,22)*40)*k,(13+rn(i,23)*9)*k,4]);
  const f=mk(w,h); p=px(f); foliage(p,fr,['#6b4612','#9a6c1c','#c79426','#e3b537','#f4d257','#fde98c','#fff6c4'],s+4,.58); p.done();
  g.drawImage(edge(f,.62),0,0);
  // 받침대
  for(const o of big?[-78,74]:[66]){ const x=Math.round(cx+o*k); R(g,'#3b4048',x,by-72*k|0,4,74*k+4|0); R(g,'#8a929c',x+1,by-72*k|0,1,74*k+3|0); R(g,'#4a505a',x-4,by-74*k|0,12,4); R(g,'#59616b',x-3,by+4,10,3); }
  return edge(c,.55); }
/* 낮은 돌 울타리 (나무 둘레) — 앞쪽 절반 */
function fencePic(w){ const c=mk(w,30),g=c.getContext('2d'); for(let i=0;i<=8;i++){ const a=Math.PI*(i/8),x=w/2-Math.cos(a)*(w/2-5),y=8+Math.sin(a)*12; R(g,'#8f8c84',x-2|0,y-6|0,5,12);R(g,'#c4c1b6',x-2|0,y-6|0,2,11);R(g,'#d8d5ca',x-2|0,y-7|0,5,2); if(i<8){ const b=Math.PI*((i+1)/8),x2=w/2-Math.cos(b)*(w/2-5),y2=8+Math.sin(b)*12; for(let k=0;k<30;k++){const X=x+(x2-x)*k/30|0,Y=y+(y2-y)*k/30|0; R(g,'#4a4a50',X,Y-3,1,1);R(g,'#4a4a50',X,Y+1,1,1);} } } return edge(c,.5); }

/* ---------- 한옥 ---------- */
const GIWA=ramp(['#20242c','#343a45','#4a525d','#626b76','#7d8791','#a3adb5']), LIME=ramp(['#8a8880','#b5b2a8','#d6d3c8']);
function hanok(W,D,o){ // W,D: 바닥 크기(px). 앞은 남쪽
  const ov=o.ov??12, wh=o.wh??34, ph=o.ph??10, rise=o.rise??22, ex=ov+6, cw=W+ex*2, up=wh+rise+30, ch=D+up+6, c=mk(cw,ch), g=c.getContext('2d'), X=ex, yB=ch-6;
  const bays=o.bays, bw=W/bays, yw=yB-ph;               // 벽 아래
  // 기단과 계단
  for(let x=-4;x<W+4;x++){ for(let y=0;y<ph;y++){ const blk=(x+((y/5|0)%2)*11+200)%22, v=.86+hash(((x+((y/5|0)%2)*11+200)/22)|0,y/5|0,7)*.16; const t=y===0?1.16:(blk===0||y%5===4)?.66:v; g.fillStyle=`rgb(${176*t|0},${172*t|0},${162*t|0})`; g.fillRect(X+x,yw+y,1,1); } }
  for(const sx of (o.steps||[.5])) for(let i=0;i<4;i++){ const w=o.stepW||34,x=X+W*sx-w/2|0,y=yw+ph*i/4|0; R(g,'#cfccc0',x,y,w,2);R(g,'#8f8c82',x,y+2,w,Math.ceil(ph/4)); R(g,'#b0ada2',x-3,yw,3,ph+2);R(g,'#b0ada2',x+w,yw,3,ph+2); }
  // 벽
  R(g,o.plaster||'#d9c9a2',X,yw-wh,W,wh); for(let x=0;x<W;x++)for(let y=0;y<wh;y++) if(hash(x,y,4)<.06)R(g,'rgba(90,60,30,.16)',X+x,yw-wh+y,1,1);
  for(let i=0;i<bays;i++){ const x=X+i*bw+4|0,w=bw-7|0,y=yw-wh+9,h=wh-12;
    if(o.open){ R(g,'#2a1c18',x-2,yw-wh+6,w+4,wh-6); R(g,'#43291f',x-2,yw-5,w+4,5); }
    const dw=o.open?w-4:w,dx=o.open?x+2:x,dy=o.open?y+2:y; R(g,o.door||'#7a3b2a',dx,dy,dw,h); R(g,'rgba(255,220,170,.18)',dx,dy,dw,1);
    if(o.lattice!==false){ const n=Math.max(2,Math.round(dw/13)),pw=dw/n; for(let k=0;k<n;k++){ const ax=dx+k*pw+2|0,aw=pw-3|0; R(g,o.paper||'#e8dcb8',ax,dy+2,aw,h*.62|0); for(let q=2;q<aw;q+=3)R(g,'#8a6a48',ax+q-1,dy+2,1,h*.62|0); for(let q=0;q<h*.62-2;q+=5)R(g,'#8a6a48',ax,dy+3+q|0,aw,1); R(g,'#5c2c20',ax,dy+(h*.62|0)+4,aw,h*.3|0); R(g,'#8f4a34',ax+1,dy+(h*.62|0)+5,aw-2,1); R(g,'#3e1d16',ax+aw,dy,1,h); } }
    if(o.taegeuk){ const mx=dx+dw/2|0,my=dy+h/2|0; for(let a=-7;a<=7;a++)for(let b=-7;b<=7;b++)if(a*a+b*b<46)R(g,b<Math.sin(a/2.4)*3?'#c23b34':'#2b5aa0',mx+a,my+b,1,1); R(g,'#4a1f18',mx,dy,1,h); } }
  for(let i=0;i<=bays;i++){ const x=Math.round(X+i*bw)-3; const cl=o.col||['#5e2219','#8f3a2a','#b3553c','#7a2f22']; R(g,cl[1],x,yw-wh,7,wh);R(g,cl[2],x+1,yw-wh,2,wh);R(g,cl[3],x+4,yw-wh,2,wh);R(g,cl[0],x+6,yw-wh,1,wh); R(g,'#a5a298',x-1,yw-3,9,3); }
  // 단청 띠
  R(g,'#2f5c48',X-2,yw-wh,W+4,8); for(let x=0;x<W+4;x++){ const m=x%12; R(g,m<2?'#c8533a':m<4?'#e3c677':m<6?'#2c6e8a':m===8?'#e8e2cc':'#3c7a5c',X-2+x,yw-wh+2,1,3); } R(g,'#1d3a2e',X-2,yw-wh+7,W+4,1);
  // 지붕
  const p=px(c), half=W/2+ov, mx=X+W/2, yE=yw-wh+5, yR=yE-(D*.40+rise)|0, bk=Math.max(8,D*.40-6)|0, lift=o.lift??9, gable=!!o.gable, rg=(o.ridge??.36)*W;
  const hw=t=>gable?half-3+3*t:t<.46?rg+W*.03*t/.46:rg+W*.03+(half-rg-W*.03)*Math.pow((t-.46)/.54,1.45);
  const sideTile=(x,y,ax,sH,L)=>{ const rb=((y+600)%5), co=((ax|0)%6)===0; let v=[1,2.1,3.7,2.8,1.5][rb]+(L?.45:-.75)+(nz(N32,x,y)-.5)*.9; if(co)v-=.9; if(sH-ax<3)v=sH-ax<1.2?0:rb===2?5:3; return GIWA[Math.max(0,Math.min(5,v+bay(x,y)*.8|0))]; };
  for(let x=0;x<cw;x++){ const ax=Math.abs(x-mx),q=Math.min(1,ax/half),eave=yE-lift*q*q*q*q, topY=yR-(gable?2:3)*Math.pow(q,2)*1.6;
    for(let y=topY-bk|0;y<=eave;y++){ if(y<0)continue; const t=(y-topY)/(eave-topY); if(t<0){ const u=(topY-y)/bk, HB=gable?half-3:rg+(half-6-rg)*Math.pow(u,1.5); if(ax>HB){ const sH=half-5*Math.sin(Math.PI*(1-u)*.5); if(!gable&&ax<=sH) p.b[y*cw+x]=sideTile(x,y,ax,sH,x<mx); continue; } const rb=((x+400)%5), co=(y+((x/5|0)&1)*2)%4===0; let v=[.4,1.1,2.1,1.6,.8][rb]+(nz(N32,x,y)-.5)*.9+(x<mx?.2:-.2)-u*.3; if(co)v-=.7; if(HB-ax<3)v=HB-ax<1.2?0:3; if(u>.96)v=0; p.b[y*cw+x]=GIWA[Math.max(0,Math.min(5,v+bay(x,y)*.8|0))]; continue; } const H=hw(t); if(ax>H){ const sH=half-5*Math.sin(Math.PI*(1-t)*.5); if(!gable&&ax<=sH&&y<eave-1){ const gb=t<.46&&ax<H+W*.045; p.b[y*cw+x]=gb?u32(y%4===0?'#4a2a1e':x<mx?'#8a5138':'#6a3b29'):sideTile(x,y,ax,sH,x<mx); } continue; }
      const rib=((x+400)%5), cour=(y+((x/5|0)&1)*2)%5===0; let v=[1.1,2.6,4.6,3.6,1.9][rib]+(t<.1?-.5:0)+(nz(N32,x,y)-.5)*1.1+(x<mx?.35:-.25)+(t-.5)*.5; if(cour)v-=1; if(hash(x/5|0,y/5|0,8)<.07)v-=.7; if(y>eave-2)v=rib===2?5:rib===0?0:3.4;
      if(H-ax<4&&(t>.02)){ v=H-ax<1.2?0:H-ax<2.6?4.6:2; }     // 내림마루·추녀마루
      p.b[y*cw+x]=GIWA[Math.max(0,Math.min(5,v+bay(x,y)*.8|0))]; }
    // 처마 끝: 막새, 서까래
    if(ax<=half-1){ const e=Math.round(eave); const r=(x+400)%5; p.b[(e+1)*cw+x]=r===2?u32('#9aa0a6'):u32('#23262e'); p.b[(e+2)*cw+x]=u32('#15171d'); for(let k=0;k<(o.dbl?6:4);k++) if(ax<half-4){ const z=(x+400)%4; p.b[(e+3+k)*cw+x]=u32(z<2?(k<2?'#4f9a74':'#8f4a34'):(k<2?'#2a5a46':'#57281d')); } } }
  p.done();
  // 용마루
  const rl=gable?half-2:rg+3, ry=Math.round(yR)-6; R(g,'#8a8880',mx-rl,ry+1,rl*2,6);R(g,'#d6d3c8',mx-rl,ry+2,rl*2,2);R(g,'#5a5f68',mx-rl,ry-1,rl*2,3);R(g,'#2c3039',mx-rl,ry-2,rl*2,1);R(g,'#1f222a',mx-rl,ry+6,rl*2,1);
  for(const s of [-1,1]){ const x=Math.round(mx+s*rl)-(s>0?6:0); R(g,'#3b414b',x,ry-7,6,9);R(g,'#636b75',x+1,ry-6,2,5);R(g,'#1f222a',x,ry-8,6,1); }
  if(o.jap) for(const s of [-1,1]) for(let i=0;i<5;i++){ const t=.62+i*.07,x=Math.round(mx+s*(hw(t)-3)),y=Math.round(yR+(yE-lift*.6-yR)*t); R(g,'#7f878f',x-1,y-6,3,5);R(g,'#2c3039',x-1,y-7,3,1); }
  if(o.sign){ const w=o.sign*12+10,x=mx-w/2|0,y=yw-wh+4; R(g,'#c9a24a',x-2,y-2,w+4,17);R(g,'#16161c',x,y,w,13); crispText(g,o.text,mx,y+7,'bold 11px "Apple SD Gothic Neo","Nanum Myeongjo",serif','#f9dd6a'); }
  return {c,ox:-ex,oy:D-ch+6}; }
/* 남북으로 긴 한옥 (동재·서재·동무·서무) */
function hanokNS(W,D,o={}){ const ov=9,wh=o.wh??26,rise=18,ex=ov+4,cw=W+ex*2,ch=D+wh+rise+18,c=mk(cw,ch),g=c.getContext('2d'),X=ex,yB=ch-4,mx=cw/2,half=W/2+ov;
  // 옆면 벽(남쪽 박공)
  for(let x=0;x<W;x++)for(let y=0;y<8;y++){const b=(x+((y>>2)&1)*9)%18;g.fillStyle=b===0||y%4===3?'#7d7a70':y===0?'#cfccc0':'#a8a599';g.fillRect(X+x,yB-8+y,1,1);}
  R(g,'#dccda6',X,yB-8-wh,W,wh); for(let y=0;y<rise+6;y++){const h=(W/2)*(1-y/(rise+6));R(g,'#d2c297',mx-h,yB-8-wh-y,h*2,1);}
  for(const q of [0,.33,.66,1]){const x=X+q*(W-5)|0;R(g,'#8f3a2a',x,yB-8-wh,5,wh);R(g,'#b3553c',x+1,yB-8-wh,1,wh);R(g,'#5e2219',x+4,yB-8-wh,1,wh);} R(g,'#7a3222',X,yB-8-wh,W,4);R(g,'#7a3222',X,yB-8-wh/2,W,3); R(g,'#a5a298',X-1,yB-11,W+2,3);
  for(const q of [.36,.68]){ const x=X+q*W-8|0; R(g,'#5c2c20',x,yB-6-wh/2,18,wh/2-4);R(g,'#e8dcb8',x+2,yB-4-wh/2,14,wh/2-8); for(let k=3;k<14;k+=3)R(g,'#8a6a48',x+1+k,yB-4-wh/2,1,wh/2-8); }
  const p=px(c), y1=yB-8-wh+8, y0=y1-D-2;
  for(let x=0;x<cw;x++){ const ax=Math.abs(x-mx); if(ax>half)continue; const s=rise*Math.pow(1-ax/half,.85);
    for(let d=y0;d<=y1;d++){ const y=Math.round(d-s); if(y<0)continue; const rib=((d+600|0)%5),cour=((ax|0)%6)===0; let v=[1.1,2.6,4.5,3.5,1.9][rib]+(x<mx?.75:-.95)+(nz(N32,x,y)-.5)*1.1+(ax/half-.5)*.5; if(cour)v-=1; if(y1-d<5)v=y1-d<2?0.4:y1-d<4?4.4:1.5; if(half-ax<2)v=rib===2?5:0.5; p.b[y*cw+x]=GIWA[Math.max(0,Math.min(5,v+bay(x,y)*.8|0))]; }
    const yS=Math.round(y1-s); for(let k=1;k<4;k++)p.b[(yS+k)*cw+x]=u32(k===1?'#15171d':(x%4<2?'#8f4a34':'#4f9a74')); }
  p.done(); R(g,'#8a8880',mx-3,y0-rise,6,D+2);R(g,'#d6d3c8',mx-2,y0-rise,2,D+2);R(g,'#1f222a',mx+3,y0-rise,1,D+2);R(g,'#3b414b',mx-4,y0-rise+D-1,8,7);R(g,'#636b75',mx-3,y0-rise+D,3,4);
  return {c,ox:-ex,oy:D-ch+4}; }

/* ---------- 사람 ---------- */
const CW=24, CHh=36;
function sheet(draw,ol){ const out=mk(CW*4,CHh*4),og=out.getContext('2d'); for(let d=0;d<4;d++)for(let f=0;f<4;f++){ const c=mk(CW,CHh),g=c.getContext('2d'); g.translate(2,2); draw(g,d,f,f===1?-1:f===3?1:0,f%2); ol?edge2(c,ol):edge(c,.36); og.drawImage(c,f*CW,d*CHh); } return out; }
/* 손그림의 유령: 이불보, 점 눈, 헬멧과 고글, 배낭, 끈 부츠. 색은 파란 잉크와 종이뿐 */
const YE='#f0c53c', YL='#f9dd6a';
const K0='#35458f',K1='#4a5da8',K2='#7384c2',K3='#aab5da',K4='#d5daea',PA='#fbfbf7',GR='#b9bcc6';
const SK='#eeebe2', GPAL=[K0,K1,K2,K3,K4,PA,GR,SK].map(rgb);
/* 벡터로 그린 뒤 정해진 잉크색으로만 떨어뜨려 도트로 만든다 */
function snap(c,pal=GPAL){ const p=px(c); for(let i=0;i<p.b.length;i++){ const v=p.b[i]; if((v>>>24)<120){p.b[i]=0;continue;} const r=v&255,g=v>>8&255,bl=v>>16&255; let best=1e9,k=null; for(const q of pal){const d=(q[0]-r)**2+(q[1]-g)**2+(q[2]-bl)**2;if(d<best){best=d;k=q;}} p.b[i]=(255<<24|k[2]<<16|k[1]<<8|k[0])>>>0; } return p.done(); }
function crisp(w,h,draw,pal,line){ const Z=3,big=mk(w*Z,h*Z),g=big.getContext('2d',{willReadFrequently:true}); g.scale(Z,Z); draw(g); const src=new Uint32Array(g.getImageData(0,0,w*Z,h*Z).data.buffer), out=mk(w,h), p=px(out), L=pal.findIndex(q=>q.join()===line.join()), votes=new Float32Array(pal.length), memo=new Map();
  const near_=v=>{ const k=v&0xffffff; let m=memo.get(k); if(m===undefined){ const R_=k&255,G_=k>>8&255,B_=k>>16; let be=1e9; m=0; pal.forEach((q,i)=>{const e=(q[0]-R_)**2+(q[1]-G_)**2+(q[2]-B_)**2;if(e<be){be=e;m=i;}}); memo.set(k,m); } return m; };
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ votes.fill(0); let n=0; for(let j=0;j<Z;j++)for(let i=0;i<Z;i++){ const v=src[(y*Z+j)*w*Z+x*Z+i]; if((v>>>24)>127){n++; const m=near_(v); votes[m]+=m===L?1.35:1;} } if(n<5)continue; let b=0; for(let i=1;i<votes.length;i++)if(votes[i]>votes[b])b=i; const q=pal[b]; p.b[y*w+x]=(255<<24|q[2]<<16|q[1]<<8|q[0])>>>0; }
  return p.done(); }
const Ve=(g,c,x,y,rx,ry,o={})=>{ g.beginPath(); g.ellipse(x,y,rx,ry,0,o.a||0,o.b||6.2832); if(c){g.fillStyle=c;g.fill();} if(o.s){g.strokeStyle=o.s;g.lineWidth=o.w||1;g.stroke();} };
const Vl=(g,c,w,...q)=>{ g.beginPath(); g.moveTo(q[0],q[1]); for(let i=2;i<q.length;i+=2)g.lineTo(q[i],q[i+1]); g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.lineJoin='round'; g.stroke(); };
const Vp=(g,c,s,w,...q)=>{ g.beginPath(); g.moveTo(q[0],q[1]); for(let i=2;i<q.length;i+=2)g.lineTo(q[i],q[i+1]); g.closePath(); if(c){g.fillStyle=c;g.fill();} if(s){g.strokeStyle=s;g.lineWidth=w;g.lineJoin='round';g.stroke();} };
const flipX=(c)=>{const o=mk(c.width,c.height),g=o.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return o;};
/* ---- 픽셀로 직접 찍는 캐릭터: 외곽선 1px ---- */
const SC=.9, CWp=36, CHp=60, CX=18;
const rowsOf=(g,c,y,ws,x=CX)=>ws.forEach((w,i)=>R(g,c,x-w/2,y+i,w,1));
const Mr=(g,c,a,y,w,h=1)=>{ R(g,c,CX+a,y,w,h); R(g,c,CX-a-w,y,w,h); };          // 좌우 대칭
const shadeR=(g,c,y,ws,n,x=CX)=>ws.forEach((w,i)=>R(g,c,x+w/2-n,y+i,n,1));
function ghostUp(g,d,f=0,cat=false){ const side=d===1, back=d===3;
  g.save(); g.translate(16,17); g.scale(1,1.04); g.translate(-16,-17);          // 이불보 길이: 무릎께까지
  if(side&&!cat){ // 배낭
    for(const [x,y,r] of [[22,14,.12],[25,15,.3]]){ g.save();g.translate(x,y);g.rotate(r);R(g,PA,0,0,5,8);g.strokeStyle=K2;g.lineWidth=1;g.strokeRect(0,0,5,8);R(g,K3,1,2,3,1);R(g,K3,1,4,3,1);g.restore(); }
    Vp(g,K1,K0,1,20,20,27,20.5,28.5,31,20,32); R(g,K2,22,22,2,4); Vl(g,K0,1,20,26.5,28,26.5); R(g,K2,23,28,3,2); Vl(g,K1,1,28,30,29,32); Ve(g,PA,29,33.5,1.6,1.8,{s:K1,w:.8}); }
  // 이불보: 턱 아래로 떨어져 두 자락으로 크게 늘어진다
  const k=f%2?.6:0; g.beginPath();
  if(side){ g.moveTo(9,18);g.bezierCurveTo(7,24,6,29,5,33);g.bezierCurveTo(6,36.6+k,11,37,13.4,34.4);g.bezierCurveTo(16,37.4-k,22,37.4,26,33.6);g.bezierCurveTo(25,28,22,22,21,17); }
  else if(back){ g.moveTo(8.5,17);g.bezierCurveTo(6.5,23,4,28,3,33);g.bezierCurveTo(6,37+k,26,37-k,29,33);g.bezierCurveTo(28,28,25.5,23,23.5,17); }
  else { g.moveTo(8.5,17);g.bezierCurveTo(6.5,23,4,28,3,32.6);g.bezierCurveTo(4,36.8+k,11.6,37.4,14.6,33.6);g.bezierCurveTo(18,37.6-k,27,37,29,32.6);g.bezierCurveTo(28,28,25.5,23,23.5,17); }
  g.closePath(); g.fillStyle=PA; g.fill(); g.save(); g.clip(); g.fillStyle=K4; g.fillRect(side?21:24,17,10,22); g.restore();
  Vl(g,GR,1,side?11:10,22,side?9:8,31); Vl(g,GR,1,side?16:16,20,side?16:16,32); Vl(g,K3,1,side?20:22,22,side?22:24,31);
  if(!side&&!back&&!cat){ Vl(g,K1,1.8,8.5,21,9,27); Vl(g,K1,1.8,23.5,21,23,27); }
  if(back&&!cat){ for(const [x,y,r] of [[18,13,.1],[20,14,.24]]){ g.save();g.translate(x,y);g.rotate(r);R(g,PA,0,0,6,8);g.strokeStyle=K2;g.lineWidth=1;g.strokeRect(0,0,6,8);R(g,K3,1,2,4,1);R(g,K3,1,4,4,1);g.restore(); } Vp(g,K1,K0,1,8.5,21,23.5,21,24.5,32,7.5,32); R(g,K2,10,23,4,5); Vl(g,K0,1,8,27,24,27); R(g,K2,12,29,8,2); Vl(g,K1,1,24,31,26,33); Ve(g,PA,26,34.5,1.6,1.8,{s:K1,w:.8}); }
  g.restore();
  // 얼굴: 이불보 그대로, 점 눈 두 개
  if(cat)return;
  if(!back) Ve(g,PA,side?14.5:16,15.4,side?8.4:8.8,9.4);
  // 헬멧
  const hx=side?15.5:16; g.save(); g.beginPath(); g.rect(0,0,40,back?14.5:11.6); g.clip(); Ve(g,PA,hx,11,10.2,9.8); Ve(g,K4,hx+5.5,11,4.4,8.6); Ve(g,K3,hx+8.4,11.5,1.8,6); for(const o of [-4,0,4])Vl(g,K4,1,hx+o*.4,1.8,hx+o,4.6); g.restore();
  Vl(g,K0,1.4,hx-10,back?14:11.4,hx+10,back?14:11.4);
  if(back){ Vl(g,K1,2,6.4,8,25.6,8); R(g,K2,14.5,7,3,2); }
  else if(side){ Vl(g,K1,2.4,6,7,25.4,8.6); Ve(g,K0,8.2,6.6,3.6,3.5); Ve(g,PA,7.8,6.4,2,1.9); Ve(g,K3,8.2,7,1,1); Ve(g,K0,14.2,6.6,2.8,3.3); Ve(g,PA,14.2,6.5,1.5,1.8); }
  else { Vl(g,K1,2.4,6.2,7.6,25.8,7.6); for(const x of [11.4,20.6]){ Ve(g,K0,x,6.8,4.2,3.6); Ve(g,PA,x-.2,6.6,2.6,2.1); Vl(g,K3,.8,x-1,7.2,x+.8,5.8); } Vl(g,K0,1.6,15.2,6.6,16.8,6.6); }
  // 턱끈
  if(side){ g.beginPath();g.moveTo(20.5,12);g.bezierCurveTo(19.4,23,13,26,7.2,23);g.strokeStyle=K1;g.lineWidth=1.35;g.stroke(); Vl(g,K1,1.2,24,12,19,18); } else if(!back){ g.beginPath();g.moveTo(6.8,12);g.bezierCurveTo(6.8,28.4,25.2,28.4,25.2,12);g.strokeStyle=K1;g.lineWidth=1.35;g.stroke(); } }
/* 눈은 빛 없이 한 가지 잉크로만, 일러스트처럼 타원 */
function eyes(c,d,ox,oy,bx=0,top=0){ const g=c.getContext('2d'); for(const x of d===0?[12.2,19.8]:d===1?[9.4,14.8]:[]){ const X=Math.round(bx+(ox+x)*SC)-2,Y=top+Math.round((oy+15.6)*SC)-2; R(g,K1,X,Y+1,4,3); R(g,K1,X+1,Y,2,5); } }
const BX=2.7, TOP=14;
function catHead(g,d,y){ const side=d===1, back=d===3, H=[14,18,20,20,22,22,22,22,22,22,22,22,20,20,18,16]; g.save(); g.translate(0,y);
  if(side){ for(let i=0;i<8;i++){R(g,PA,24-(i*.6|0),9+i,1+(i*.75|0),1);R(g,PA,11-(i>4?1:0),9+i,1+(i*.8|0),1);} for(let i=3;i<7;i++)R(g,K4,12,9+i,1+((i-3)*.6|0),1); }
  else for(let i=0;i<9;i++){ const k=i*.85|0; Mr(g,PA,9-k,8+i,1+k+(i>4?1:0),1); if(!back&&i>3)Mr(g,K4,9-((i-2)*.75|0),8+i,1+((i-3)*.6|0),1); }
  rowsOf(g,PA,15,H); shadeR(g,K4,15,H,3); if(!back){ for(const x of side?[9,15]:[12,20]){R(g,K1,x,22,4,3);R(g,K1,x+1,21,2,5);} R(g,K2,side?11:13,32,side?10:10,1);R(g,YE,side?11:17,33,2,2);R(g,'#d9a92c',side?12:18,34,1,1); }
  for(const [x,yy,w,h] of side?[[28,44,3,2],[30,39,2,6],[29,37,2,2]]:[[30,43,3,2],[32,38,2,6],[31,36,2,2]])R(g,PA,x,yy,w,h); g.restore(); }
function ghostCell(d,f,cat=false){ const bob=f%2, c=crisp(CWp,CHp,g=>{ g.translate(BX,TOP); g.scale(SC,SC); const s=f===1?-1:f===3?1:0, side=d===1;
    // 반바지, 무릎, 무릎 아래까지 오는 끈 부츠
    const boot=(x,up)=>{ const y=-up, t=side?2.2:0; Vp(g,K2,null,0,x-2.6,29,x+3,29,x+2.6,35.4,x-2.4,35.4); R(g,SK,x-1.6,34.6+y,3.6,3.4); R(g,K4,x+1.1,34.6+y,.9,3.4); Vp(g,PA,K1,.95,x-1.9,37.4+y,x+2.4,37.4+y,x+2.5,46+y,x-2-t,46+y,x-2-t,44+y,x-1.9,43+y); for(let i=0;i<3;i++)side?R(g,K2,x-1.1,39+i*2.2+y,1.1,1.1):d===0&&R(g,K2,x-.4,39+i*2.2+y,1.1,1.1); Vl(g,K1,1.5,x-2.2-t,46.2+y,x+2.8,46.2+y); };
    if(side){ boot(16.3+s*2.8,s<0?1:0); boot(15.4-s*2.8,s>0?1:0); } else { boot(12,s<0?2:0); boot(21.2,s>0?2:0); }
    g.translate(1,bob?1:0); ghostUp(g,d,f,cat); const hand=(x,y)=>Ve(g,SK,x,y,1.7,1.9,{s:K1,w:.9}); if(d===0){hand(4.2,28.8-(s<0?1:0));hand(27.8,28.8-(s>0?1:0));Vl(g,K1,1.4,26.6,27,29,27);} else if(side){hand(13+s*2,28.4);Vl(g,K1,1.4,11.8+s*2,26.4,14.2+s*2,26.4);} },GPAL,rgb(K1));
  if(cat)catHead(c.getContext('2d'),d,bob); else eyes(c,d,1,bob?1:0,BX,TOP); edge2(c,K1);
  if(cat&&d!==3){ const g=c.getContext('2d'),y=bob; if(d===1){R(g,K3,2,25+y,4,1);R(g,K3,3,28+y,3,1);} else {Mr(g,K3,12,25+y,4,1);Mr(g,K3,12,28+y,3,1);} }
  return c; }
function cellOf(draw,line,post){ const c=mk(CWp,CHp),g=c.getContext('2d'); draw(g); edge2(c,line); if(post)post(c.getContext('2d')); return c; }
const sheetOf=(cell,m)=>{const c=mk(CWp*4,CHp*4),g=c.getContext('2d');for(const d of [0,1,3])for(let f=0;f<4;f++){const k=cell(d,f);g.drawImage(k,f*CWp,d*CHp);if(d===1)g.drawImage(flipX(k),f*CWp,2*CHp);}c.m=[CWp,CHp,-10,-42];return c;};
const ghostSheet=sheetOf((d,f)=>ghostCell(d,f,false)), catSheet=sheetOf((d,f)=>ghostCell(d,f,true));
/* 스쿠터: 몸체는 얇은 선, 위의 유령은 같은 픽셀 */
const SW=56, SHh=62;
function scooterCell(d,f){ const put=(g,x,y,dd)=>{g.save();g.translate(x,y+f*.5);ghostUp(g,dd,f);g.restore();};
  const c=crisp(SW,SHh,g=>{ g.scale(SC,SC); g.translate(0,4.4); const wheel=(x,y,r)=>{Ve(g,K1,x,y,r,r);Ve(g,K3,x,y,r-1.6,r-1.6);Ve(g,PA,x,y,r*.42,r*.42,{s:K1,w:.9});const a=f*.6;Vl(g,K4,.9,x+Math.cos(a)*(r-1.8),y+Math.sin(a)*(r-1.8),x-Math.cos(a)*(r-1.8),y-Math.sin(a)*(r-1.8));}, note=(x,y)=>{Ve(g,K2,x,y+3,1.1,.9);Vl(g,K2,.9,x+1,y+3,x+1,y);Vl(g,K2,.9,x+1,y,x+3,y+.6);}, w=1.05;
  if(d===1||d===2){ wheel(12,52,6.4); wheel(45,52,6.4); put(g,16,1,1);
    Vp(g,PA,K1,w,32,39,50,38,56,44,55,50,34,50); Ve(g,K4,49,46,6,3.4); Vl(g,K3,w,36,42,44,41); Vl(g,K1,w,57,40,57,44); Vp(g,K1,null,0,30,36,48,35,51,38,31,39.4); Vl(g,K3,w,33,37,46,36.4);
    Vp(g,PA,K1,w,17,25,24,25,26,34,29,48,36,48,36,51,20,51,17,44,15,34); Vl(g,K4,w,22,28,25,44); Vp(g,PA,K1,w,3,49,5,44,11,41,18,43,20,50,14,47,8,47); R(g,K4,17.5,34,6,3.4); R(g,K2,19,35.4,3,.9); note(20,39); Ve(g,K4,19.5,30,1.7,1.7);
    Vp(g,PA,K1,w,12,21,19,19.5,24,23,22,27,15,27); Ve(g,K4,12,23.5,2.2,3.6,{s:K1,w}); Vl(g,K1,2,22,23,28,24); Vl(g,K2,1,18,20,16,13); Ve(g,PA,16,11.5,2.4,2.8,{s:K1,w}); Ve(g,SK,27,24.5,2.3,2.1,{s:K1,w});
    Vp(g,K1,null,0,32,35,39,35,38,39,32,39); R(g,SK,31,38,4.4,4); Vp(g,PA,K1,w,30,41,35.5,41,35,50,27,50.5,27,48.5,30,47); for(let i=0;i<3;i++)Vl(g,K2,.9,30.6,42.4+i*2,33,42.8+i*2); Vl(g,K1,1.3,26.6,51.2,35.4,51.2); Ve(g,K4,43.5,44,2.6,1.5); }
  else { const bk=d===3; if(bk){ for(const k of [1,-1]){Vl(g,K1,2.2,30+k*10,28,30+k*18,27);Vl(g,K2,1,30+k*13,27,30+k*16,19);Ve(g,PA,30+k*16.5,17.5,2.6,2.8,{s:K1,w});} } put(g,14,bk?3:1,bk?3:0);
    Vp(g,K2,null,0,27,48,33,48,33.4,59,26.6,59); for(let i=0;i<3;i++)Vl(g,K4,1,28,51+i*3+f,30,52+i*3+f,32,51+i*3+f);
    for(const x of [17.5,42.5]){ R(g,SK,x-2,40,4,4); Vp(g,PA,K1,w,x-2.6,43,x+2.6,43,x+2.6,52,x-2.6,52); for(let i=0;i<3;i++)Vl(g,K3,.9,x-1.2,45+i*2.2,x+1.2,45+i*2.2); Vl(g,K1,1.4,x-3,53,x+3,53); }
    if(!bk){ Vp(g,PA,K1,w,19,31,41,31,42,40,38,48,30,51,22,48,18,40); Vl(g,K4,w,30,32,30,50); g.fillStyle=K4;g.fillRect(36,33,4,10); Vp(g,PA,K1,w,23,49,37,49,36,54,30,55.5,24,54); R(g,K4,20.5,37,7.5,3.6); R(g,K2,22,38.4,4.4,1); note(33,36); Ve(g,K4,24,44,1.9,1.9); Vl(g,K2,2,12,27,48,27); Vl(g,K1,2.6,10,27,15,27);Vl(g,K1,2.6,45,27,50,27); Ve(g,PA,30,28,5,4.6,{s:K1,w}); Ve(g,K4,30,28.4,3,2.8); for(const k of [1,-1]){Ve(g,SK,30+k*14.5,26.6,2.4,2.2,{s:K1,w});Vl(g,K2,1,30+k*12,26,30+k*17,18);Ve(g,PA,30+k*17.5,16.5,2.6,2.8,{s:K1,w});} }
    else { Vp(g,K1,null,0,21,37,39,37,40,41,20,41); Vp(g,PA,K1,w,20,40,40,40,42,47,38,52,22,52,18,47); g.fillStyle=K4;g.fillRect(35,42,5,8); R(g,K2,27,42,6,2.4); Vp(g,PA,K2,w,26,46.5,34,46.5,34,50.5,26,50.5); R(g,K2,28,48,4,1); } }
  },GPAL,rgb(K1)); if(d===0)eyes(c,0,14,1+f*.5,0,4); else if(d!==3)eyes(c,1,16,1+f*.5,0,4); edge2(c,K1); return d===2?flipX(c):c; }
function edge2(c,col){ const p=px(c),{b,w,h}=p,add=[],cc=u32(col); for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(b[i]>>>24)continue;if((x>0&&b[i-1]>>>24)||(x<w-1&&b[i+1]>>>24)||(y>0&&b[i-w]>>>24)||(y<h-1&&b[i+w]>>>24))add.push(i);}add.forEach(i=>b[i]=cc);return p.done(); }
const scooterSheet=(()=>{const c=mk(SW*2,SHh*4),g=c.getContext('2d');for(let d=0;d<4;d++)for(let f=0;f<2;f++)g.drawImage(scooterCell(d,f),f*SW,d*SHh);return c;})();

/* ---------- 파란 잉크 인쇄 효과: 종이·파랑 잉크·연필 빗금 + 은행잎의 노랑 ---------- */
const INK=ramp(['#34448e','#4658a3','#6073b8','#8d9acb','#bcc5e2','#dfe3ef','#f1f2f1','#fbfbf7']), YEL=ramp(['#a88a3c','#d9ab2c','#f0c53c','#f9dd6a','#fdeea6']);
const PASS=new Set(['#34448e','#4658a3','#6073b8','#8d9acb','#bcc5e2','#dfe3ef','#f1f2f1','#fbfbf7','#f0c53c','#f9dd6a'].map(h=>u32(h)&0xffffff));
const inkOn=true;
function inkPixels(b,w,h,X,Y,lift){ for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const i=y*w+x,c=b[i],a=c>>>24; if(!a||PASS.has(c&0xffffff))continue; const r=c&255,g=c>>8&255,bl=c>>16&255; let v=(.3*r+.59*g+.11*bl)/255; const wx=x+X,wy=y+Y; let o;
    if(r>146&&g>100&&bl<g*.62&&r-bl>72&&r<g*1.55){ o=YEL[Math.max(0,Math.min(4,((v-.36)*7.2+bay(wx,wy)*.7)|0))]; }
    else { v=Math.pow(v,lift)+(nz(N8,wx,wy)-.5)*.05; const w_=wx+wy+(nz(N32,wx,wy)*5|0), h3=((w_%3)+3)%3===0, h4=((w_%4)+4)%4===0, h6=((w_%6)+6)%6===0, c5=(((wx-wy)%5)+5)%5===0;
      o=v>.84?INK[7]:v>.75?(h6?INK[5]:INK[7]):v>.66?(h4?INK[4]:INK[7]):v>.56?(h4?INK[3]:INK[6]):v>.46?(h3?INK[3]:INK[5]):v>.36?(h3?INK[2]:INK[4]):v>.27?(h3||c5?INK[1]:INK[3]):v>.18?(h3?INK[0]:INK[1]):INK[0]; }
    b[i]=(o&0xffffff|a<<24)>>>0; } }
function inkCanvas(c,X=0,Y=0,lift=.8){ const p=px(c); inkPixels(p.b,p.w,p.h,X,Y,lift); return p.done(); }
/* 물건의 가장자리를 끊기지 않는 잉크 선으로 */
function rim(c){ const p=px(c),{b,w,h}=p,k=u32('#4658a3'),add=[]; for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if((b[i]>>>24)<200)continue;if(x===0||y===0||x===w-1||y===h-1||!(b[i-1]>>>24)||!(b[i+1]>>>24)||!(b[i-w]>>>24)||!(b[i+w]>>>24))add.push(i);}add.forEach(i=>b[i]=k);return p.done(); }
/* 번짐 없는 또렷한 글씨 */
function crispText(g,t,x,y,font,col,ol){ const c=mk(Math.ceil(t.length*30)+20,44),q=c.getContext('2d'); q.font=font; q.textAlign='center'; q.textBaseline='middle'; q.fillStyle='#000'; q.fillText(t,c.width/2,22); const p=px(c),cc=u32(col),oc=ol&&u32(ol),src=p.b.slice(),w=c.width,on=i=>(src[i]>>>24)>96; for(let i=0;i<src.length;i++){ p.b[i]=on(i)?cc:ol&&(on(i-1)||on(i+1)||on(i-w)||on(i+w)||on(i-w-1)||on(i-w+1)||on(i+w-1)||on(i+w+1))?oc:0; } p.done(); g.drawImage(c,Math.round(x-c.width/2),Math.round(y-22)); }
const inkCache=new WeakMap(), rawArt=new WeakSet([ghostSheet,catSheet,scooterSheet]);
const Q=img=>{ if(!inkOn||rawArt.has(img))return img; let c=inkCache.get(img); if(!c){ c=mk(img.width,img.height); c.getContext('2d').drawImage(img,0,0); if(img.floorY){const p=px(c),cut=img.floorY*p.w; inkPixels(p.b.subarray(0,cut),p.w,img.floorY,0,0,.52); inkPixels(p.b.subarray(cut),p.w,p.h-img.floorY,0,img.floorY,.17); p.done();} else { inkCanvas(c,0,0,img.lift||.6); if(!img.noEdge)rim(c); } inkCache.set(img,c); } return c; };
/* 주민: 몸은 사람, 얼굴은 동물. 모두 정수 픽셀, 외곽선 1px */
const SPECIES={ rabbit:['토끼',PA,PA,K4], wolf:['늑대',K3,PA,K2], raccoon:['너구리',K4,PA,K1], fox:['여우',YE,PA,K1], bear:['곰',K3,PA,K2], deer:['사슴',YL,PA,K2], owl:['부엉이',K3,PA,K2], dog:['강아지',PA,PA,K3], squirrel:['다람쥐',YL,PA,K2], otter:['수달',K2,PA,K1] };
const HY=15, HEADF=[8,12,14,16,18,18,20,20,20,20,20,20,20,18,18,16,14,10], HEADS=[[14,8],[12,12],[11,14],[10,16],[9,18],[9,18],[8,19],[8,19],[8,19],[8,19],[8,19],[8,19],[9,18],[9,18],[10,16],[11,14],[13,10],[14,8]];
const EARW={wolf:1,fox:1}, EARR={raccoon:6,bear:6,otter:4,squirrel:5};
function earsPx(g,sp,d,P){ const side=d===1, back=d===3, f=P.fur, m=P.mark;
  if(sp==='rabbit'){ if(side){ R(g,f,17,3,3,1);R(g,f,16,4,5,13);R(g,f,21,6,3,1);R(g,f,20,7,5,10);R(g,m,17,6,2,9); } else { Mr(g,f,3,2,3,1);Mr(g,f,2,3,5,14); if(!back)Mr(g,m,3,6,3,9); } }
  if(EARW[sp]){ if(side){ for(let i=0;i<8;i++){R(g,f,19+(i*.1|0),8+i,1+(i*.75|0),1);R(g,f,13,9+i,1+(i*.6|0),1);} for(let i=3;i<7;i++)R(g,m,19,9+i,1+((i-3)*.5|0),1); } else for(let i=0;i<9;i++){ const k=i*.7|0; Mr(g,f,8-k,8+i,2+k,1); if(!back&&i>2&&i<8)Mr(g,m,8-((i-2)*.55|0),8+i,1+((i-3)*.4|0),1); } if(sp==='fox'){ if(side)R(g,m,19,8,1,2);else Mr(g,m,8,8,2,2);} }
  if(EARR[sp]){ const r=EARR[sp],y=sp==='otter'?17:sp==='squirrel'?10:12, ws=r===6?[4,6,6,6,6,6]:r===5?[2,4,4,4,4,4,4]:[3,4,4,4]; if(side){ ws.forEach((w,i)=>R(g,f,21-(w>>1),y+i,w,1)); if(r>4)R(g,m,20,y+2,2,3); } else ws.forEach((w,i)=>{Mr(g,f,(sp==='otter'?9:sp==='squirrel'?7:7)-(w-6>>1)-1,y+i,w,1);}); if(!side&&!back&&r>4)Mr(g,m,sp==='squirrel'?8:7,y+2,2,3); }
  if(sp==='deer'){ if(side){R(g,f,24,19,6,3);R(g,f,25,18,4,5);R(g,P.light,26,20,3,1);} else {Mr(g,f,9,19,6,3);Mr(g,f,10,18,4,5);if(!back)Mr(g,P.light,11,20,3,1);} }
  if(sp==='owl'){ if(side)for(let i=0;i<6;i++)R(g,f,21-i,10+i,1+i,1); else for(let i=0;i<8;i++)Mr(g,f,9-(i*.8|0),10+i,1+(i*.8|0),1); } }
function headPx(g,sp,d,P){ const y=HY, f=P.fur, l=P.light, m=P.mark, e=P.eye, side=d===1, back=d===3; earsPx(g,sp,d,P);
  if(side){ const L={wolf:4,fox:4,deer:2,dog:2,raccoon:2,rabbit:0,bear:1,otter:0,squirrel:0,owl:-1}[sp]; HEADS.forEach(([x,w],i)=>{R(g,f,x,y+i,w,1);R(g,P.fsh,x+w-3,y+i,3,1);});
    if(sp==='owl'){ R(g,l,8,y+6,7,9);R(g,m,9,y+7,5,5);R(g,l,10,y+8,3,3);R(g,e,10,y+8,2,3);R(g,YE,6,y+11,3,2);R(g,YE,7,y+13,2,1); return; }
    if(sp==='raccoon'){ R(g,m,8,y+8,9,4);R(g,l,8,y+7,8,1); } if(sp==='squirrel'){R(g,m,14,y,1,5);R(g,m,18,y,1,5);}
    for(let j=0;j<6;j++)R(g,l,8-L+(j===0||j===5?1:0),y+10+j,7+L-(j===5?2:0),1); R(g,e,7-L,y+10,2,2); R(g,P.in,8-L,y+14,3,1); if(sp==='rabbit')R(g,YE,11,y+13,2,1);
    if(sp==='dog'){ R(g,m,18,y+3,6,11);R(g,m,19,y+14,4,2);R(g,P.in,18,y+4,1,9); } if(sp==='deer'){R(g,l,14,y+3,1,1);R(g,l,17,y+2,1,1);R(g,l,16,y+5,1,1);}
    sp==='raccoon'?R(g,l,11,y+9,2,2):R(g,e,11,y+8,2,3); return; }
  rowsOf(g,f,y,HEADF); shadeR(g,P.fsh,y+3,HEADF.slice(3),2);
  if(back){ if(sp==='dog'){Mr(g,m,8,y+3,4,10);} if(sp==='squirrel')for(const x of [15,18,21])R(g,m,x-1,y+1,1,12); if(sp==='wolf'||sp==='raccoon')R(g,m,17,y+1,2,12); if(sp==='owl')for(let j=0;j<3;j++)Mr(g,m,2+j,y+4+j*4,2,1); return; }
  if(sp==='owl'){ Mr(g,l,1,y+5,8,9);Mr(g,l,2,y+4,6,11);Mr(g,m,2,y+6,6,6);Mr(g,l,3,y+7,4,4);Mr(g,e,4,y+8,2,3);R(g,YE,17,y+11,2,3);R(g,YE,16,y+11,4,1); return; }
  if(sp==='wolf'||sp==='fox'){ for(let i=0;i<8;i++)Mr(g,l,0,y+10+i,[2,3,9,9,8,7,6,4][i],1); for(let i=0;i<4;i++)Mr(g,l,9-i,y+9+i,1+Math.min(i,1),1); if(sp==='wolf'){R(g,m,17,y+1,2,4);Mr(g,m,2,y+2,1,3);} }
  if(sp==='raccoon'){ Mr(g,m,2,y+7,7,4);Mr(g,m,3,y+11,6,1);Mr(g,l,2,y+5,6,1); }
  if(sp==='bear'||sp==='otter'){ const k=sp==='otter'?1:0; rowsOf(g,l,y+10,[6+k*2,8+k*4,10+k*4,10+k*4,8+k*2,6]); }
  if(sp==='squirrel'){ R(g,m,15,y,1,5);R(g,m,20,y,1,5);R(g,m,17,y,2,4); Mr(g,l,4,y+11,5,4);rowsOf(g,l,y+12,[6,8,6]); }
  if(sp==='deer'){ rowsOf(g,l,y+11,[6,8,8,6]);for(const [x,yy] of [[15,3],[18,2],[21,3],[17,5],[20,5]])R(g,l,x-.5|0,y+yy,1,1); }
  if(sp==='dog'){ Mr(g,m,8,y+3,4,11);Mr(g,m,8,y+14,3,1);Mr(g,P.in,8,y+4,1,9); R(g,m,20,y+6,5,6); }
  if(sp==='rabbit'){ Mr(g,YE,6,y+12,2,1); R(g,K2,17,y+11,2,1); } else if(sp==='dog'||sp==='bear'||sp==='otter'){R(g,e,16,y+10,4,2);R(g,e,17,y+12,2,1);} else R(g,e,17,y+11,2,2);
  R(g,P.in,17,y+13,2,1);Mr(g,P.in,1,y+14,1,1);Mr(g,P.in,2,y+13,1,1);
  sp==='raccoon'?Mr(g,l,4,y+8,2,2):Mr(g,e,4,y+8,2,3); }
function tailPx(g,sp,d,P){ if(d===0)return; const x=d===1?23:24, y=43, f=P.fur; if(sp==='fox'||sp==='wolf'){R(g,f,x,y,5,3);R(g,f,x+3,y-5,4,7);R(g,f,x+4,y-8,3,3);R(g,P.light,x+4,y-9,3,3);} else if(sp==='raccoon'){R(g,f,x,y,5,3);R(g,f,x+3,y-5,4,7);R(g,P.mark,x+3,y-2,4,1);R(g,P.mark,x+3,y-6,4,2);} else if(sp==='squirrel'){R(g,f,x,y,4,3);R(g,f,x+2,y-9,5,11);R(g,f,x,y-12,5,4);R(g,P.mark,x+4,y-9,1,9);} else if(sp==='rabbit'||sp==='deer'){R(g,P.light,x-1,y-1,4,4);} else if(sp==='dog'){R(g,f,x,y-1,2,2);R(g,f,x+2,y-5,2,5);} else if(sp==='otter'){R(g,f,x-1,y+1,4,3);R(g,f,x+2,y+3,4,2);} }
function bodyPx(g,d,f,P,o){ const s=f===1?-1:f===3?1:0, side=d===1, back=d===3;
  const shoe=(x,up,w=6)=>{R(g,P.shoe,x,54-up,w,2);R(g,K3,x,55-up,w,1);};
  if(o.skirt){ if(side){R(g,PA,17+s*2,48,3,6);shoe(15+s*2,0);R(g,PA,16-s*2,48,3,6);shoe(14-s*2,0);} else {R(g,PA,13,48,3,6-(s<0?1:0));shoe(12,s<0?1:0,5);R(g,PA,20,48,3,6-(s>0?1:0));shoe(19,s>0?1:0,5);} rowsOf(g,P.pants,43,[14,14,16,16,18,18,18]);for(const x of [13,17,21])R(g,P.psh,x,45,1,5); }
  else if(side){ const leg=(x,up,c)=>{R(g,c,x,44,5,10-up);shoe(x-2,up,7);}; leg(16+s*3,s<0?1:0,P.psh);leg(15-s*3,s>0?1:0,P.pants); }
  else { R(g,P.pants,12,44,12,4); const leg=(x,up)=>{R(g,P.pants,x,44,5,10-up);}; leg(12,s<0?2:0);leg(19,s>0?2:0);R(g,P.psh,17,45,2,2);shoe(11,s<0?2:0);shoe(19,s>0?2:0); }
  const yb=f%2; g.save(); g.translate(0,yb);
  if(o.gcase&&!back){ side?R(g,K1,24,24,6,20):R(g,K1,24,20,5,24); if(!side)R(g,K2,25,21,1,20); }
  if(side){ R(g,P.shirt,13,32,10,1);R(g,P.shirt,12,33,12,12);R(g,P.ssh,21,33,3,12); if(o.jacket){R(g,PA,12,33,3,12);R(g,P.in,15,33,1,12);} if(o.pat)for(const j of [35,39])R(g,P.trim,12,j,12,2); if(o.jacket)R(g,YE,12,44,12,1); R(g,P.shirt,12,32,0,0); }
  else { rowsOf(g,P.shirt,32,[10,14,14,14,14,14,14,14,14,14,14,14,14]); R(g,P.ssh,23,34,2,11); if(o.pat)for(const j of [35,39])R(g,P.trim,11,j,14,2); if(o.jacket&&!back){R(g,PA,16,32,4,13);R(g,P.in,15,32,1,13);R(g,P.in,20,32,1,13);} if(o.jacket)R(g,YE,11,44,14,1); if(!o.jacket&&!back)R(g,P.trim,16,32,4,1); }
  // 팔
  const hold=o.hold&&!back;
  if(side){ const x=15+(hold?-2:s*3); R(g,P.sleeve,x,34,4,8);R(g,P.in,x+4,35,1,7);R(g,PA,x,42,4,2); if(hold)R(g,PA,10,38,3,2); }
  else if(hold){ Mr(g,P.sleeve,7,33,3,5);Mr(g,P.sleeve,4,38,5,2);Mr(g,PA,2,38,2,2); }
  else { const al=s>0?-1:0,ar=s<0?-1:0; R(g,P.sleeve,8,33+al,3,9);R(g,PA,8,42+al,3,2);R(g,P.sleeve,25,33+ar,3,9);R(g,PA,25,42+ar,3,2);R(g,P.in,11,35,1,8);R(g,P.in,24,35,1,8); }
  if(hold){ if(o.hold==='sax'){R(g,YE,side?11:17,32,2,10);R(g,YE,side?9:17,41,5,3);R(g,YE,side?7:22,38,3,5);R(g,'#d9a92c',side?12:18,33,1,9);R(g,PA,side?11:17,35,1,1);R(g,PA,side?11:17,38,1,1);} else if(o.hold==='book'){R(g,PA,side?8:13,36,side?5:10,7);R(g,K3,side?9:15,38,side?3:6,1);R(g,K3,side?9:15,40,side?2:5,1);R(g,K2,side?12:18,36,1,7);} else {R(g,PA,side?9:16,36,4,5);R(g,YE,side?9:16,38,4,1);} }
  if(o.gcase&&back){ R(g,K1,16,22,4,10);R(g,K1,14,30,8,14);R(g,K2,15,31,1,12);R(g,K3,12,38,12,1); }
  g.restore(); }
function personCell(d,f,P,o){ const yb=f%2; return cellOf(g=>{ g.save();g.translate(0,yb);tailPx(g,o.sp,d,P);g.restore(); bodyPx(g,d,f,P,o); g.save();g.translate(0,yb); headPx(g,o.sp,d,P);
    if(o.scarf){ d===1?R(g,YE,11,32,12,3):R(g,YE,11,32,14,3); R(g,'#d9a92c',d===1?20:22,32,3,3); if(d!==3)R(g,YE,d===1?11:20,35,3,6); }
    if(o.phones){ const y=HY; d===1?(R(g,K1,17,y-1,2,8),R(g,YE,16,y+6,4,6)):(rowsOf(g,K1,y-2,[12,16]),Mr(g,K1,9,y,1,6),Mr(g,YE,9,y+6,3,6)); } g.restore(); },LN2,
  g=>{ g.translate(0,yb); if(o.sp==='deer'){ if(d===1){for(const [x,y,w,h] of [[19,4,1,11],[20,7,3,1],[22,4,1,3],[16,6,1,9],[14,8,2,1],[14,5,1,3]])R(g,K2,x,y,w,h);} else for(const [a,y,w,h] of [[4,4,1,12],[5,8,3,1],[7,5,1,3],[5,12,2,1]])Mr(g,K2,a,y,w,h); }
    if(o.sp==='otter'&&d===0){Mr(g,K3,9,HY+12,4,1);Mr(g,K3,9,HY+14,3,1);} if(o.sp==='otter'&&d===1)R(g,K3,3,HY+13,4,1);
    if(o.glass&&d!==3){ if(d===1){for(const [x,y,w,h] of [[9,HY+7,6,1],[9,HY+11,6,1],[9,HY+7,1,5],[14,HY+7,1,5],[15,HY+8,6,1]])R(g,K1,x,y,w,h);} else {for(const [a,y,w,h] of [[2,HY+7,6,1],[2,HY+11,6,1],[2,HY+7,1,5],[7,HY+7,1,5]])Mr(g,K1,a,y,w,h);R(g,K1,16,HY+8,4,1);} } }); }
const LN2='#4a5da8';
function personSheet(o){ const sd=strSeed(JSON.stringify(o)), ks=Object.keys(SPECIES), sp=o.sp||ks[sd%ks.length], [label,fur,light,mark]=SPECIES[sp];
  o={...o,sp,pat:!o.jacket&&(o.pat??sd%3===0),scarf:o.scarf??(sd%5===0),phones:o.phones??(sd%9===2&&!/rabbit|deer|owl/.test(sp)),skirt:o.skirt??(sd%4===1),hold:o.hold||(o.sax?'sax':['','','','book','','','','cup'][sd>>4&7])};
  const shirt=o.jacket?K2:[K2,PA,K3,K1,YE][sd%5]===fur?K2:[K2,PA,K3,K1,YE][sd%5], dark=shirt===K1||shirt===K2, pants=dark?[K4,K3][sd>>2&1]:[K2,K1][sd>>2&1];
  const P={fur,light,mark,fsh:{[PA]:K4,[K4]:K3,[K3]:K2,[K2]:K1,[YE]:'#dca92f',[YL]:YE}[fur],eye:K0,in:K2,shirt,ssh:{[PA]:K4,[K3]:K2,[K2]:K1,[K1]:K0,[YE]:'#dca92f'}[shirt],trim:dark?PA:K2,sleeve:o.jacket?PA:shirt,pants,psh:{[K4]:K3,[K3]:K2,[K2]:K1,[K1]:K0}[pants],shoe:PA};
  if(dark)P.in=K0===shirt?K2:K1; if(fur===K2)P.in=K1;
  const out=sheetOf((d,f)=>personCell(d,f,P,o)); out.m=[CWp,CHp,-10,-42]; out.sp=sp; out.label=label; rawArt.add(out); return out; }
const strSeed=t=>{let h=2166136261;for(const c of t){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return (h^h>>>15)>>>0;};
