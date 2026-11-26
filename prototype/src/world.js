/* ===== 바깥 세상: 성균관대 인문사회과학캠퍼스와 문묘 ===== */
const W=MAP.W, H=MAP.H, I=(x,y)=>y*W+x, inMap=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const G=[]; for(const m of MAP.g.matchAll(/(\d*)(\D)/g)) for(let n=+m[1]||1;n--;) G.push(m[2]);
const BID=new Uint16Array(W*H); { let o=0; for(let i=0;i<MAP.b.length;i+=2) BID.fill(MAP.b[i],o,o+=MAP.b[i+1]); }
const at=(x,y)=>inMap(x,y)?G[I(x,y)]:'f', bid=(x,y)=>inMap(x,y)?BID[I(x,y)]:0;
const solid=new Uint8Array(W*H); for(let i=0;i<W*H;i++) if(BID[i]||'wWL'.includes(G[i])) solid[i]=1;
const CH=16, CP=CH*T, buckets=new Map();
const bucket=(x,y)=>{const k=(x/CH|0)+','+(y/CH|0); if(!buckets.has(k))buckets.set(k,{things:[],lamps:[]}); return buckets.get(k);};
const GK=MAP.ginkgo.map(([x,y,b])=>({x:x*T+8,y:y*T+10,big:b}));

/* ---------- 바닥 질감 ---------- */
const P_={ g:ramp(['#3d6b33','#4c7f39','#5f9441','#78a94a','#94bd57']), f:ramp(['#3a3d22','#4b4a28','#5f5730','#74653a','#8a7444']), m:ramp(['#b08d58','#c2a069','#d2b27b','#dfc28e','#ebd2a2']),
  e:ramp(['#8d8271','#ab9f8b','#b9ad98','#c5b9a4','#d0c5b1']), u:ramp(['#847b70','#9c9387','#a89f92','#b3aa9d','#bdb4a7']), a:ramp(['#6d6866','#7d7875','#88827e','#938d88','#9d9791']), r:ramp(['#464955','#50535f','#585b68','#616471','#6d707c']),
  s:ramp(['#83776d','#a89a8c','#b5a799','#c0b3a5','#cbbfb1']), P:ramp(['#7f4c3a','#a8674e','#b5745a','#c08168','#cb8f76']), p:ramp(['#94714a','#a98359','#b99368','#c8a378','#d5b288']), q:ramp(['#7f7d75','#a3a198','#b1afa5','#bfbdb3','#cdcbc1']),
  j:ramp(['#9c7a2c','#b38f36','#c9a543','#dcbb55','#ecd075']), y:ramp(['#a36a42','#b47a4e','#c2895b','#cf986a','#daa77a']), w:ramp(['#1f4f6e','#2a6586','#387c9d','#4d95b3','#79b6c9']), t:ramp(['#6f6a60','#8f897d','#a59f92','#bab4a6','#cdc8ba']) };
P_.c=P_.d=P_.r;
/* 잉크 화면용: 도로와 길이 종이 위에서 또렷하도록 */
const P_INK={ j:ramp(['#f2cf58','#f6de80','#fdf9ea','#fdf9ea','#fdf9ea']), r:ramp(['#020203','#040405','#060608','#09090b','#0c0c0f']), a:ramp(['#0e0e10','#1a1a1d','#222226','#2b2b30','#36363b']), s:ramp(['#101012','#4c4c50','#707075','#8c8c92','#a8a8ae']), P:ramp(['#08080a','#2c2c30','#48484d','#66666c','#84848a']), e:ramp(['#2c2c30','#8a8a90','#a0a0a6','#b4b4ba','#c8c8ce']), g:ramp(['#101012','#1c1c20','#2c2c30','#44444a','#68686e']), f:ramp(['#040405','#08080a','#101013','#1c1c20','#303034']), w:ramp(['#030304','#060608','#0b0b0d','#131316','#303034']), q:ramp(['#101012','#5c5c62','#808086','#a0a0a6','#c0c0c6']), u:ramp(['#707076','#b8b8be','#d0d0d4','#e0e0e4','#f0f0f2']), t:ramp(['#08080a','#3c3c40','#606066','#8c8c92','#c0c0c6']) };
P_INK.c=P_INK.d=P_INK.r;
const LEAFC=ramp(['#e7b93a','#f4d55e','#c98a28','#b5522c','#d8793a','#8f5a28']), GOLD=ramp(['#f9e07a','#eec445','#d9a42d','#fff0a8','#c58d22']);
const soft='gfejymwpu';
function texel(k,x,y){ const rp=(inkOn&&P_INK[k])||P_[k], d=bay(x,y); let v;
  switch(k){
    case 'g': v=1.2+(nz(N32,x,y)-.5)*2.4+(nz(N8,x,y)-.5)*1.7+(nz(N4,x*2,y)-.5)*1.6+d*.8+.8; break;
    case 'f': v=.9+(nz(N16,x,y)-.5)*2.6+(nz(N4,x,y)-.5)*2.6+d+.9; break;
    case 'j': v=1+(nz(N32,x,y)-.5)*1.8+(nz(N4,x*2,y*.5|0)-.5)*2.6+d+1; break;
    case 'm': v=2+(nz(N32,x,y)-.5)*2+(nz(N4,x,y)-.5)*.9+d*.8; if(hash(x,y,1)<.012)v-=1.6; if(hash(x>>1,y>>1,2)<.008)v+=1.2; break;
    case 'p': v=2+(nz(N16,x,y)-.5)*2.2+(nz(N4,x,y)-.5)*1.5+d*.8; if(hash(x>>1,y>>1,6)<.03)v-=1.3; break;
    case 'y': v=2+(nz(N64,x,y)-.5)*1.6+(nz(N4,x,y)-.5)*1.2+d; break;
    case 'w': v=1.6+Math.sin((y+nz(N16,x,y)*14)*.55)*.9+(nz(N32,x,y)-.5)*1.6+d; break;
    case 'q': { const by=Math.floor(y/13),o=(by*17)%31,bx=Math.floor((x+o)/(20)),lx=((x+o)%20+20)%20,ly=((y%13)+13)%13; v=2.2+hash(bx,by,3)*1.4-.4+(nz(N4,x,y)-.5)*1.1+d*.5; if(lx<1||ly<1)v=.2; else if(lx===1||ly===1)v+=.7; else if(lx===19||ly===12)v-=.7; break; }
    case 'e': { const by=Math.floor(y/8),lx=((x+(by&1)*8)%16+16)%16,ly=((y%8)+8)%8,bx=Math.floor((x+(by&1)*8)/16); v=2.1+hash(bx,by,4)*1.1-.4+(nz(N4,x,y)-.5)*.8+(nz(N64,x,y)-.5)*1.2+d*.5; if(lx<1||ly<1)v=.5; else if(ly===1)v+=.4; break; }
    case 's': { const by=Math.floor(y/6),lx=((x+(by&1)*5)%10+10)%10,ly=((y%6)+6)%6,bx=Math.floor((x+(by&1)*5)/10); v=2+hash(bx,by,5)*1.5-.6+d*.4; if(lx<1||ly<1)v=.4; break; }
    case 'P': { const z=Math.floor(x/6)+Math.floor(y/6)&1,lx=((x%6)+6)%6,ly=((y%6)+6)%6; v=2+hash(x/6|0,y/6|0,5)*1.6-.6+d*.4; if((z?lx:ly)<1)v=.4; break; }
    case 't': { const ly=((y%7)+7)%7; v=ly===0?4.3:ly<4?3:ly<6?2:0; v+=(nz(N4,x,y)-.5)*.8; break; }
    case 'u': v=2.1+(nz(N64,x,y)-.5)*1.8+(nz(N8,x,y)-.5)*1+d*.7; { const lx=((x%48)+48)%48,ly=((y%48)+48)%48; if(lx<1||ly<1)v-=1.3; } if(nz(N16,x+90,y+40)>.8&&hash(x,y,7)<.5)v-=.8; break;
    case 'a': v=2+(nz(N64,x,y)-.5)*2+(nz(N4,x,y)-.5)*1.3+d*.8; if(Math.abs(nz(N32,x*2,y*2)-.5)<.008)v-=1.5; break;
    default: v=1.8+(nz(N64,x,y)-.5)*1.5+(hash(x,y,9)-.5)*1.2+d*.6; if(Math.abs(nz(N32,x,y)-.52)<.006)v-=1; }
  return rp[v<0?0:v>4?4:v|0]; }
const baseK=k=>k==='c'||k==='d'?'r':k==='L'?'g':k==='W'?'f':k;
/* 가장자리가 자연스럽게 이어지도록 이웃 네 칸을 섞어 픽셀마다 재질을 정한다 */
function matAt(x,y){ const tx0=x>>4,ty0=y>>4,k0=baseK(at(tx0,ty0)), org=soft.includes(k0);
  const amp=org?9:2, sx=x-8+(nz(N8,x+31,y)-.5)*amp, sy=y-8+(nz(N8,x,y+77)-.5)*amp, i=Math.floor(sx/16), j=Math.floor(sy/16), a=sx/16-i, b=sy/16-j;
  const A=baseK(at(i,j)),B=baseK(at(i+1,j)),C=baseK(at(i,j+1)),D=baseK(at(i+1,j+1));
  let k=A; if(A!==B||A!==C||A!==D){ const w=[[A,(1-a)*(1-b)],[B,a*(1-b)],[C,(1-a)*b],[D,a*b]]; let best=-1; for(let m=0;m<4;m++){ let s=0; for(let n=0;n<4;n++)if(w[n][0]===w[m][0])s+=w[n][1]; if(s>best){best=s;k=w[m][0];} } }
  if(k==='e'){ const q=nz(N64,x+20,y+9)*.7+nz(N16,x,y)*.3; if(q<.42&&!near4(tx0,ty0))k='g'; }
  return k; }
const near4=(x,y)=>{ for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if('aPr'.includes(at(x+i,y+j)))return true; return false; };
const LAWN='gfj';
function paintGround(g,cx,cy){ const n=CP, X0=cx*CP, Y0=cy*CP, im=g.createImageData(n,n), b=new Uint32Array(im.data.buffer), m=new Array((n+1)*(n+1));
  for(let y=-1;y<n;y++)for(let x=-1;x<n;x++) m[(y+1)*(n+1)+x+1]=matAt(X0+x,Y0+y);
  const gk=GK.filter(q=>q.x>X0-230&&q.x<X0+n+230&&q.y>Y0-200&&q.y<Y0+n+200);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){ const q=(y+1)*(n+1)+x+1,k=m[q],up=m[q-n-1],lf=m[q-1],wx=X0+x,wy=Y0+y; let c=texel(k,wx,wy);
    if(k!==up){ if(LAWN.includes(up)&&!LAWN.includes(k))c=mixU(c,.66); else if(LAWN.includes(k)&&!LAWN.includes(up))c=mixU(c,.8); else if(k==='r')c=mixU(c,.62); else if(up==='r')c=mixU(c,1.22); else if(k==='w')c=mixU(c,.6); else c=mixU(c,.82); }
    else if(k!==lf){ c=k==='r'?mixU(c,.75):mixU(c,.86); }
    if(LAWN.includes(k)||k==='e'||k==='m'){ const lv=hash(wx>>1,wy>>1,21); if(lv<(k==='f'?.035:k==='m'?.004:.007))c=LEAFC[(hash(wx>>1,wy>>1,22)*6)|0]; }
    for(const t of gk){ const d=Math.hypot((wx-t.x)*.8,(wy-t.y-6)*1.15)/(t.big?150:125); if(d<1.15&&k!=='r'){ const den=Math.max(0,1.12-d)*.8*(.55+nz(N16,wx,wy)*.9); if(hash((wx+(wy>>1&1))>>1,wy>>1,31)<den)c=GOLD[(hash(wx>>1,wy>>1,32)*5)|0]; } }
    b[y*n+x]=c; }
  g.putImageData(im,0,0);
  // 풀포기
  for(let j=-1;j<n/7;j++)for(let i=-1;i<n/7;i++){ const wi=Math.floor(X0/7)+i,wj=Math.floor(Y0/7)+j,r=hash(wi,wj,41); if(r>.42)continue; const x=wi*7+(hash(wi,wj,42)*6|0)-X0,y=wj*7+(hash(wi,wj,43)*6|0)-Y0; if(x<1||y<4||x>=n-1||y>=n)continue; const k=m[(y+1)*(n+1)+x+1]; if(k!=='g'&&k!=='j'&&k!=='f')continue;
    const L=k==='g'?['#a9cd66','#34602f']:k==='j'?(inkOn?['#e2b83a','#f0c94e']:['#f6e08e','#8d6d26']):['#8f8a4a','#2e331c']; R(g,L[1],x-1,y,3,1);R(g,L[0],x-1,y-2,1,2);R(g,L[0],x+1,y-3,1,3);R(g,L[1],x,y-2,1,2); if(r<.02&&k==='g'){const f=pick(['#f4efe0','#e8a0b8','#f2d04a','#b48ad8'],hash(wi,wj,44));R(g,f,x-1,y-4,3,1);R(g,f,x,y-5,1,3);R(g,'#c9972e',x,y-4,1,1);} }
  // 횡단보도와 중앙선
  for(let j=0;j<CH;j++)for(let i=0;i<CH;i++){ const k=G[I(cx*CH+i,cy*CH+j)]; if(inMap(cx*CH+i,cy*CH+j)&&(k==='c'||k==='d')) for(const o of [1,9]) for(let z=0;z<16;z++) if(hash(cx*CP+i*16+z,o+j,5)>.06) k==='c'?R(g,'#ffffff',i*16+o,j*16+z,5,1):R(g,'#ffffff',i*16+z,j*16+o,1,5); }
  for(const p of MAP.lines){ let len=0; for(let i=0;i+3<p.length;i+=2){ const dx=p[i+2]-p[i],dy=p[i+3]-p[i+1],nn=Math.ceil(Math.hypot(dx,dy)); for(let k=0;k<nn;k++,len++){ const x=Math.round(p[i]+dx*k/nn),y=Math.round(p[i+1]+dy*k/nn); if(x>=X0&&y>=Y0&&x<X0+n&&y<Y0+n&&at(x>>4,y>>4)==='r'&&hash(x,y,3)>.05)R(g,'#d9ac3a',x-X0,y-Y0,2,2); } } }
}

/* ---------- 건물 ---------- */
const FL=22;
const B=MAP.B.map(([k,lv,n,p],i)=>{ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,ar=0; const q=[]; for(let j=0;j<p.length;j+=2){q.push([p[j],p[j+1]]);x0=Math.min(x0,p[j]);x1=Math.max(x1,p[j]);y0=Math.min(y0,p[j+1]);y1=Math.max(y1,p[j+1]);} q.forEach(([x,y],j)=>{const [a,b]=q[(j+1)%q.length];ar+=x*b-a*y;}); if(ar<0)q.reverse();
  const sd=hash(i,71), h=k==='u'?FL*Math.max(2,Math.min(4,lv||3))+8:k==='N'?52:k==='x'?(x1-x0>110?46:sd<.4?24:44):k==='n'?46:40; return {k,lv,n,q,x0,y0,x1,y1,h,sd,i}; });
const HAN={ D:{bays:5,wh:40,ph:16,rise:30,ov:16,open:1,steps:[.2,.5,.8],stepW:36,dbl:1,jap:1,sign:3,text:'大成殿',lift:12,ridge:.32}, K:{bays:3,wh:24,ph:7,rise:14,ov:9,stepW:22,lift:6}, S:{bays:3,wh:34,ph:6,rise:16,ov:9,gable:1,lattice:false,taegeuk:1,door:'#8f3a2a',stepW:60} };
function hanokOf(b){ if(b.spr)return b.spr; const w=b.x1-b.x0,d=b.y1-b.y0;
  if(b.k==='V') return b.spr=[[hanokNS(w,d),0,0]];
  if(b.k==='Y'){ const ww=w*.335|0, mw=w-ww*2+14; const wing={bays:3,wh:26,ph:10,rise:16,ov:9,gable:1,steps:[],lift:5}; return b.spr=[[hanok(ww,d-34,wing),0,34-0],[hanok(ww,d-34,wing),w-ww,34],[hanok(mw,d,{bays:3,wh:38,ph:12,rise:28,ov:13,gable:1,steps:[.5],stepW:52,sign:3,text:'明倫堂',lift:9,door:'#6f3626'}),ww-7,0]].map(([s,x,y])=>[s,x,y]); }
  if(b.k==='K'&&w<56) return b.spr=[[hanok(w,d,{...HAN.K,bays:1,wh:20,ph:5,rise:10,ov:7,stepW:14}),0,0]];
  return b.spr=[[hanok(w,d,HAN[b.k]||HAN.K),0,0]]; }
const ROOFS={}; function roofTex(name,base,seam){ const c=mk(48,48),p=px(c),rp=ramp(base); for(let y=0;y<48;y++)for(let x=0;x<48;x++){ let v=2+(nz(N16,x*5.33|0,y*5.33|0)-.5)*1.4+(hash(x,y,seam)-.5)*.9+bay(x,y)*.6; if(x%24===0||y%24===0)v-=1; p.b[y*48+x]=rp[Math.max(0,Math.min(4,v|0))]; } ROOFS[name]=p.done(); }
roofTex('green',['#3f6b52','#4f7d60','#5e8d6e','#6d9c7c','#7cab8a'],1); roofTex('grey',['#6d6f78','#7d7f88','#8b8d96','#999ba4','#a8aab2'],2); roofTex('warm',['#7c7268','#8c8277','#9b9185','#aaa094','#b8afa3'],3); roofTex('slate',['#4e535f','#5b606c','#686d79','#757a86','#838894'],4);
function inkRoof(name,f){const c=mk(48,48),g=c.getContext('2d');f(g);ROOFS[name]=c;}
inkRoof('ink1',g=>{R(g,'#dfe3ef',0,0,48,48);for(let i=0;i<48;i++){for(const o of [0,24])R(g,'#bcc5e2',(i+o)%48,i,1,1);}for(let i=0;i<14;i++)R(g,'#f1f2f1',hash(i,1,7)*46|0,hash(i,2,7)*46|0,2,1);});
inkRoof('ink2',g=>{R(g,'#bcc5e2',0,0,48,48);for(let i=0;i<48;i++)for(const o of [0,8,16,24,32,40])R(g,'#8d9acb',(i+o)%48,i,1,1);});
inkRoof('ink3',g=>{R(g,'#f1f2f1',0,0,48,48);for(let j=0;j<48;j+=8)for(let i=0;i<48;i+=8)R(g,'#bcc5e2',i+(j%16?4:0),j,2,2);});
const WALLS={ u:[['#b7795c','#8f5743'],['#cbb695','#a08c6c'],['#b9a48e','#8f7c68'],['#a8664e','#80493a']], n:[['#c9bba4','#9a8d78'],['#b0a9a2','#857e78'],['#d4c6a8','#a3967c'],['#9d8a80','#74645c']], x:[['#a4553f','#7a3a2c'],['#b5674a','#874733'],['#c2a688','#947b60'],['#9c8f86','#716660']], N:[['#d9d6cf','#aaa69e']] };
const SIGN=['#c8453a','#e0a030','#2f7f72','#3a5aa8','#a83a6a','#5a3f8a','#e6ded0'];
function poly(g,q,dx,dy){ g.beginPath(); q.forEach(([x,y],i)=>i?g.lineTo(x+dx,y+dy):g.moveTo(x+dx,y+dy)); g.closePath(); }
const IKM={'#2b2630':'#34448e','#4a4a55':'#4658a3','#a9c6d2':'#dfe3ef','#4f4650':'#4658a3','#3a2a22':'#34448e','#8a6a50':'#8d9acb','#d4e4ea':'#fbfbf7','#2a1e1c':'#34448e','#6f5242':'#8d9acb','#cfdde2':'#fbfbf7','#e8e0d0':'#fbfbf7','#ded6c8':'#4658a3','#3c3a42':'#4658a3','#6f93a8':'#dfe3ef','#a8c8d4':'#fbfbf7','#517689':'#bcc5e2'}, ik=c=>inkOn?IKM[c]||c:c, SIGNK=['#34448e','#f0c53c','#8d9acb','#fbfbf7','#6073b8','#34448e','#dfe3ef'];
function drawModern(g,l,b,L,Rr){ const {q,h,k,sd}=b,[wc,wd]=pick(WALLS[k],sd), floors=Math.max(1,Math.round(h/FL)), fh=h/floors, shop=k==='n'||k==='N';
  const ed=[]; q.forEach((p,i)=>{const n=q[(i+1)%q.length]; if(p[0]>n[0]+.5)ed.push([n,p]);}); ed.sort((a,c)=>(a[0][1]+a[1][1])-(c[0][1]+c[1][1]));
  for(const [a,c] of ed){ const len=Math.hypot(c[0]-a[0],c[1]-a[1]),sl=(c[1]-a[1])/(c[0]-a[0]), sh=sl>.25?.84:sl<-.25?1.06:1; if(Math.abs(sl)>7)continue;
    for(let x=Math.max(L,Math.ceil(a[0]));x<Math.min(Rr,c[0]);x++){ const y=Math.round(a[1]+(x-a[0])*sl), u=(x-a[0])*len/(c[0]-a[0]); g.globalAlpha=1; l.clearRect(x,y-h,1,h);
      g.fillStyle=wc; g.fillRect(x,y-h,1,h);
      if(k==='x'||k==='u'&&sd<.75){ for(let v=0;v<h;v+=3){ if(hash((u/5|0)+(v%2)*9,v,b.i)<.3){g.fillStyle=hash(u/5|0,v,3)<.5?'rgba(255,230,200,.12)':'rgba(50,10,0,.16)';g.fillRect(x,y-v-3,1,3);} g.fillStyle='rgba(40,10,0,.16)'; g.fillRect(x,y-v-1,1,1); } }
      else for(let v=0;v<h;v+=2) if(hash(x,v,b.i)<.12){g.fillStyle='rgba(70,50,40,.12)';g.fillRect(x,y-v-2,1,2);}
      const mod=k==='u'?15:k==='N'?26:19, lead=(len%mod)/2, cu=Math.floor((u-lead)/mod), uu=u-lead-cu*mod, okc=u>lead+1&&u<len-lead-1;
      for(let f=0;f<floors;f++){ const fy=y-f*fh, gr=f===0;
        if(k==='u'){ g.fillStyle=wd; g.fillRect(x,fy-2,1,2); if(f)  {g.fillStyle='rgba(255,240,215,.45)';g.fillRect(x,fy-3,1,1);} }
        if(shop&&gr&&len>30){ const si=Math.floor(u/34),su=u-si*34; g.fillStyle=ik('#2b2630');g.fillRect(x,fy-17,1,17);
          if(su>2&&su<32){ const dr=su>22&&su<30; if(dr){g.fillStyle=su<24||su>28?ik('#3a2a22'):ik('#8a6a50');g.fillRect(x,fy-17,1,17);g.fillStyle=ik('#d4e4ea');if(su>=24&&su<=28)g.fillRect(x,fy-15,1,9);} else {g.fillStyle=su%9<1?ik('#4a4a55'):ik('#a9c6d2');g.fillRect(x,fy-15,1,12);g.fillStyle='rgba(230,245,250,.5)';if((su+6)%12<3)g.fillRect(x,fy-13,1,6);g.fillStyle=ik('#4f4650');g.fillRect(x,fy-3,1,3); if(hash(si,b.i,5)<.7){l.fillStyle='#ffcf7a';l.fillRect(x,fy-13,1,10);} } }
          if(k==='n'){ const sc=pick(inkOn?SIGNK:SIGN,hash(si,b.i,6)); g.fillStyle=sc;g.fillRect(x,fy-21,1,5);g.fillStyle='rgba(255,255,255,.28)';g.fillRect(x,fy-21,1,1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,fy-17,1,1); if(su>6&&su<26&&hash(su|0,si,b.i)<.55){g.fillStyle=inkOn?(sc==='#34448e'||sc==='#6073b8'?'#fbfbf7':'#34448e'):sc==='#e6ded0'?'#3a3030':'#fff4da';g.fillRect(x,fy-20,1,1+(hash(su|0,si,8)*3|0));} l.fillStyle=sc; if(hash(si,b.i,9)<.6)l.fillRect(x,fy-21,1,4); } continue; }
        if(!okc)continue; const z=uu, ww0=k==='u'?3:k==='N'?3:5, ww1=k==='u'?12:k==='N'?23:14;
        if(gr&&cu===Math.floor((len-lead*2)/mod/2)&&k!=='N'&&len>28){ if(z>=ww0&&z<ww1){ g.fillStyle=z<ww0+1||z>=ww1-1?ik('#2a1e1c'):ik('#6f5242'); g.fillRect(x,fy-19,1,19); if(z>ww0+1&&z<ww1-2){g.fillStyle=ik('#cfdde2');g.fillRect(x,fy-17,1,8);} g.fillStyle=ik('#e8e0d0');g.fillRect(x,fy-21,1,2);} continue; }
        if(z>=ww0&&z<ww1){ const fr=z<ww0+1||z>=ww1-1||Math.abs(z-(ww0+ww1)/2)<.6, wt=fh-(k==='N'?3:4.5), wb=k==='N'?5:6; g.fillStyle=k==='x'?ik('#ded6c8'):ik('#3c3a42'); g.fillRect(x,fy-wt,1,wt-wb);
          if(!fr){ g.fillStyle=ik('#6f93a8');g.fillRect(x,fy-wt+1,1,wt-wb-2);g.fillStyle=ik('#a8c8d4');g.fillRect(x,fy-wt+1,1,3);g.fillStyle=ik('#517689');g.fillRect(x,fy-wb-3,1,2); if(hash(cu,f,b.i)<(k==='N'?1:.42)){l.fillStyle=k==='N'?'#ffd48a':'#ffc46a';l.fillRect(x,fy-wt+1,1,wt-wb-2);} }
          g.fillStyle='rgba(30,15,10,.4)';g.fillRect(x,fy-wt-1,1,1); g.fillStyle='rgba(255,245,225,.6)';g.fillRect(x,fy-wb,1,1); } }
      g.fillStyle='rgba(20,10,10,.42)';g.fillRect(x,y-3,1,3); g.fillStyle='rgba(20,10,20,.25)';g.fillRect(x,y-h,1,4);
      if(sh!==1){g.fillStyle=sh<1?'rgba(20,15,40,.18)':'rgba(255,240,210,.1)';g.fillRect(x,y-h,1,h);}
      if(x-Math.ceil(a[0])<1||c[0]-x<=1){g.fillStyle='rgba(25,15,20,.55)';g.fillRect(x,y-h,1,h);} } }
  // 옥상
  l.save(); l.globalCompositeOperation='destination-out'; poly(l,q,0,-h); l.fill(); l.restore();
  const rt=inkOn?pick(['ink1','ink2','ink1','ink3'],hash(b.i,83)):k==='u'?pick(['warm','grey','slate'],hash(b.i,81)):k==='N'?'slate':pick(['green','green','grey','warm','slate'],hash(b.i,82));
  g.save(); poly(g,q,0,-h); g.fillStyle=g.createPattern(ROOFS[rt],'repeat'); g.fill(); g.clip(); g.lineJoin='miter';
  if(inkOn){ g.strokeStyle='#8d9acb'; g.lineWidth=12; g.stroke(); g.strokeStyle='#fbfbf7'; g.lineWidth=9; g.stroke(); }
  else { g.strokeStyle='rgba(20,16,30,.45)'; g.lineWidth=13; g.stroke(); g.strokeStyle='#8d8a88'; g.lineWidth=9; g.stroke(); g.strokeStyle=k==='u'?'#d6cdbd':'#c9c4bb'; g.lineWidth=7; g.stroke(); g.strokeStyle='#6b6663'; g.lineWidth=2; g.stroke(); } g.restore();
  if(inkOn){ const ln=(x0,y0,x1,y1)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)R(g,'#4658a3',Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),1,1);}; q.forEach((p0,i)=>{const n=q[(i+1)%q.length];ln(p0[0],p0[1]-h,n[0],n[1]-h);}); for(const [a,c] of ed){ ln(a[0],a[1]-1,c[0],c[1]-1); ln(a[0],a[1]-h,a[0],a[1]-1); ln(c[0]-1,c[1]-h,c[0]-1,c[1]-1); } }
  // 옥상 시설
  for(let ty=(b.y0>>4)+1;ty<(b.y1>>4)-1;ty++)for(let tx=Math.max((b.x0>>4)+1,(L>>4)-2);tx<(b.x1>>4)-1&&tx<(Rr>>4)+2;tx++){ if(![[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[2,0],[0,2]].every(([m,n])=>bid(tx+m,ty+n)===b.i+1))continue; const r=hash(tx,ty,91),X=tx*16,Y=ty*16-h;
    if(r<.018&&k!=='u'){ const t=hash(tx,ty,92)<.5; R(g,'rgba(20,20,30,.35)',X+3,Y+12,18,6);R(g,t?'#c99a22':'#2d5f98',X,Y,15,16);R(g,t?'#f0c648':'#4a86c4',X+2,Y+1,5,13);R(g,t?'#ffe68a':'#8ab8e4',X+3,Y+2,2,10);R(g,t?'#8f6a14':'#1d4370',X+12,Y,3,16);R(g,t?'#f8dc7a':'#6aa2d8',X,Y-2,15,3);R(g,'#22222a',X,Y+15,15,1); }
    else if(r<.04){ R(g,'rgba(20,20,30,.35)',X+2,Y+9,16,5);R(g,'#8f949a',X,Y+1,15,11);R(g,'#c6cbd0',X,Y,15,3);R(g,'#5a6068',X+2,Y+5,7,5);R(g,'#3c4148',X+4,Y+6,3,3);R(g,'#70767e',X+11,Y+4,3,7); }
    else if(r<.047&&k==='u'){ R(g,'rgba(20,20,30,.3)',X+4,Y+14,22,6);R(g,'#b5aa9a',X,Y-6,24,22);R(g,'#d4cabb',X,Y-6,24,5);R(g,'#8f8473',X+18,Y-1,6,17);R(g,'#4a4038',X+6,Y+4,8,12); } }
  if(k==='n'&&b.x1-b.x0>56){ const e=ed[ed.length-1]; if(e){ const [a,c]=e,n=Math.max(1,(c[0]-a[0])/60|0); for(let m=0;m<n;m++){ const t=(m+.5)/n, x=Math.round(a[0]+(c[0]-a[0])*t)+(hash(b.i,m,61)*14-7|0), y=Math.round(a[1]+(c[1]-a[1])*t), col=pick(['#34448e','#f0c53c','#f4f2ea','#6073b8'],hash(b.i,m,62)), dk=col==='#f0c53c'||col==='#f4f2ea'; if(x<L-12||x>Rr+12)continue; R(g,'#1c2450',x-1,y-h+3,11,23);R(g,col,x,y-h+4,9,21);R(g,'rgba(255,255,255,.35)',x,y-h+4,1,21); for(let q=0;q<4;q++)for(let u=0;u<5;u++)if(hash(u+q*7,b.i,m+63)<.55)R(g,dk?'#34448e':'#f7f5ec',x+2+u,y-h+6+q*5,1,3); l.globalAlpha=.8; R(l,'#ffe9a8',x,y-h+4,9,21); l.globalAlpha=1; } } }
  if(k==='N'){ const mx=(b.x0+b.x1)/2|0,y=b.y1; R(g,'#34448e',mx-52,y-h+18,104,14);R(g,'#6073b8',mx-52,y-h+18,104,1); crispText(g,'not complete',mx,y-h+25,'bold 12px "Courier Prime","Courier New",monospace','#fbfbf7'); l.fillStyle='#f4efe4'; l.globalAlpha=.4; l.fillRect(mx-40,y-h+22,80,5); l.globalAlpha=1;
    R(g,'#241a14',mx-9,y-19,18,19);R(g,'#8a5f3c',mx-7,y-17,14,17);R(g,'#b0814f',mx-7,y-17,14,1);R(g,'#d5e2e0',mx-5,y-15,10,9);R(g,'#e8c25a',mx+4,y-7,2,2);l.fillStyle='#ffd890';l.fillRect(mx-5,y-15,10,9); for(const o of [-24,18]){R(g,'#6a4a34',mx+o,y-6,8,6);R(g,'#3f7040',mx+o-1,y-13,10,8);R(g,'#68a058',mx+o+1,y-13,4,4);} } }
function drawWall(g,x,y,k){ const X=x*16,Y=y*16,h=k==='W'?24:17, is=(a,b)=>at(x+a,y+b)===k, V=(is(0,-1)||is(0,1))&&!is(-1,0)&&!is(1,0), b0=Y+14;
  if(!is(0,1)){ for(let v=0;v<h;v++)for(let u=0;u<16;u++){ const wx=X+u,row=(v/(k==='W'?6:5))|0,o=(row&1)*5,bx=((wx+o)/(k==='W'?11:9))|0,edgeL=(wx+o)%(k==='W'?11:9)===0||v%(k==='W'?6:5)===0; let c; if(k==='W'||v<6){const t=.8+hash(bx,row+y*3,4)*.3;c=edgeL?'#5f5a50':`rgb(${168*t|0},${160*t|0},${143*t|0})`;} else c=edgeL?'#d9cfb8':pick(['#b3694a','#a45c40','#bd7656'],hash(bx,row,6)); if(V&&(u<2||u>13))continue; g.fillStyle=c; g.fillRect(wx,b0-v-1,1,1);} R(g,'rgba(20,14,20,.3)',X,b0-2,16,2); }
  const ty=b0-h-6; if(V){ for(let j=0;j<16+ (is(0,1)?0:4);j++)for(let u=1;u<15;u++){ const r=((Y+j)%4+4)%4; const v=[1,3,4,2][r]+(u<8?.4:-.6); g.fillStyle=['#23262e','#333842','#454b55','#5a616b','#737b84','#8b9299'][Math.max(0,Math.min(5,v|0))]; g.fillRect(X+u,ty-6+j,1,1);} R(g,'#b9b6ac',X+7,ty-6,2,16+(is(0,1)?0:4)); R(g,'#1b1d23',X,ty-6,1,16);R(g,'#1b1d23',X+15,ty-6,1,16); }
  else { for(let u=0;u<16;u++){ const r=((X+u)%4+4)%4; for(let j=0;j<11;j++){ let v=[1,3,4.4,2][r]-(j>8?1:0)+(j<3?-.8:0); if(j===3||j===4)v=j===3?5:3; g.fillStyle=['#23262e','#333842','#454b55','#5a616b','#737b84','#b9b6ac'][Math.max(0,Math.min(5,v|0))]; g.fillRect(X+u,ty-3+j,1,1);} R(g,r===2?'#9aa0a6':'#1b1d23',X+u,ty+8,1,1);} } }
/* 조각별로 묶기 */
const binB=new Map(); const binAdd=(x0,y0,x1,y1,o)=>{ for(let j=Math.floor(y0/CP);j<=Math.floor(y1/CP);j++)for(let i=Math.floor(x0/CP);i<=Math.floor(x1/CP);i++){const k=i+','+j;(binB.get(k)||binB.set(k,[]).get(k)).push(o);} };
B.forEach(b=>binAdd(b.x0-30,b.y0-b.h-70,b.x1+30,b.y1+20,{y:b.y1,b}));
for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const k=G[I(x,y)]; if(k==='L'||k==='W') binAdd(x*16,y*16-32,x*16+16,y*16+16,{y:y*16+14,w:[x,y,k]}); }
/* 픽셀을 자주 읽는 작업용 캔버스 */
const mkR=(w,h)=>{const c=mk(w,h);c.getContext('2d',{willReadFrequently:true});return c;};
const chunks=new Map(), CHUNK_MAX=matchMedia('(pointer: coarse)').matches?40:80;   // 휴대폰은 캔버스 메모리가 넘치면 화면이 하얗게 빈다
const freeCanvas=(...l)=>{for(const c of l)if(c){c.width=c.height=0;}};   // iOS 는 크기를 0으로 해야 바로 메모리를 돌려준다
function chunk(cx,cy){ const key=cx+','+cy; let c=chunks.get(key); if(c){chunks.delete(key);chunks.set(key,c);return c;}
  c={base:mkR(CP,CP),top:mkR(CP,CP),lit:mk(CP,CP)}; const g=c.base.getContext('2d'),t=c.top.getContext('2d'),l=c.lit.getContext('2d'); paintGround(g,cx,cy); if(inkOn) inkCanvas(c.base,cx*CP,cy*CP,.28);
  const items=(binB.get(key)||[]).slice().sort((a,b)=>a.y-b.y), X=cx*CP,Y=cy*CP; for(const q of [g,t,l])q.translate(-X,-Y);
  g.fillStyle=inkOn?'rgba(70,88,163,.26)':'rgba(22,16,44,.30)'; for(const o of items) if(o.b){ if('DYVSK'.includes(o.b.k)) g.fillRect(o.b.x0+6,o.b.y0+10,o.b.x1-o.b.x0+4,o.b.y1-o.b.y0-4); else { poly(g,o.b.q,9,6); g.fill(); } } else R(g,inkOn?'rgba(70,88,163,.22)':'rgba(22,16,44,.26)',o.w[0]*16,o.w[1]*16+12,18,7);
  for(const o of items){ if(o.w){drawWall(t,...o.w);continue;} const b=o.b; if('DYVSK'.includes(b.k)) for(const [s,x,y] of hanokOf(b)){ t.drawImage(s.c,b.x0+x+s.ox,b.y0+y+s.oy); l.save();l.globalCompositeOperation='destination-out';l.drawImage(s.c,b.x0+x+s.ox,b.y0+y+s.oy);l.restore(); } else drawModern(t,l,b,X-2,X+CP+2); }
  if(inkOn){ inkCanvas(c.top,X,Y,.62); }
  g.drawImage(c.top,X,Y);
  // 가림 영역: 건물마다 '자기 발자국 바깥으로 올라온 부분'만 사람·소품 위에 덮는다
  const M=mk(CP,CP),m=M.getContext('2d'); m.translate(-X,-Y); m.fillStyle='#000';
  for(const o of items){ m.globalCompositeOperation='source-over';
    if(o.w){ const h=o.w[2]==='W'?34:27; m.fillRect(o.w[0]*16,o.w[1]*16-h+14,16,h+2); m.globalCompositeOperation='destination-out'; m.fillRect(o.w[0]*16,o.w[1]*16,16,16); continue; }
    const b=o.b; if('DYVSK'.includes(b.k)) for(const [q,x,y] of hanokOf(b)) m.drawImage(q.c,b.x0+x+q.ox,b.y0+y+q.oy);
    else { poly(m,b.q,0,-b.h); m.fill(); m.lineWidth=2; m.stroke(); b.q.forEach((p,i)=>{const n=b.q[(i+1)%b.q.length]; m.beginPath();m.moveTo(p[0],p[1]);m.lineTo(n[0],n[1]);m.lineTo(n[0],n[1]-b.h);m.lineTo(p[0],p[1]-b.h);m.closePath();m.fill();}); }
    m.globalCompositeOperation='destination-out'; poly(m,b.q,0,0); m.fill(); m.lineWidth=1.5; m.stroke(); }
  t.save(); t.setTransform(1,0,0,1,0,0); t.globalCompositeOperation='destination-in'; t.drawImage(M,0,0); t.restore();
  for(const k of ['base','top']){ const f=mk(CP,CP),o=c[k]; f.getContext('2d').drawImage(o,0,0); c[k]=f; freeCanvas(o); } freeCanvas(M);
  chunks.set(key,c); if(chunks.size>CHUNK_MAX){ const k=chunks.keys().next().value,o=chunks.get(k); chunks.delete(k); freeCanvas(o.base,o.top,o.lit); } return c; }

/* ---------- 소품 ---------- */
const PIC={};
PIC.l=(()=>{const c=mk(18,48),g=c.getContext('2d');R(g,'#2c2f3a',8,14,3,31);R(g,'#4d5262',8,14,1,31);R(g,'#22252e',5,44,9,3);R(g,'#3a3e4b',6,43,7,2);R(g,'#22252e',4,3,11,2);R(g,'#3a3e4b',6,1,7,2);R(g,'#ffe9ad',5,5,9,8);R(g,'#fff8de',6,6,4,5);R(g,'#e3b860',11,6,3,7);R(g,'#22252e',4,13,11,2);return edge(c,.45);})();
PIC.b=(()=>{const c=mk(34,22),g=c.getContext('2d');for(const x of [4,27]){R(g,'#2f323c',x,8,3,13);R(g,'#525866',x,8,1,13);} for(let i=0;i<2;i++){R(g,'#9c6a3e',1,3+i*4,32,3);R(g,'#c08a54',1,3+i*4,32,1);} R(g,'#8a5a34',1,12,32,5);R(g,'#b9824e',1,12,32,2);R(g,'#5e3c22',1,16,32,1);return edge(c,.45);})();
PIC.k=(()=>{const c=mk(18,18),p=px(c);foliage(p,[[6,10,5],[12,10,5],[9,10,6,2]],['#7a3a10','#a85016','#cf6c1e','#ea8a30','#f8ad56'],3,.12);p.done();const g=c.getContext('2d');R(g,'#4c6a2c',8,2,2,4);R(g,'#7a9a44',8,2,1,3);R(g,'#ffdf6a',5,9,2,2);R(g,'#ffdf6a',11,9,2,2);R(g,'#ffdf6a',5,13,8,1);R(g,'#ffdf6a',6,14,2,1);R(g,'#ffdf6a',10,14,2,1);return edge(c,.4);})();
/* 거리 소품 그림 */
const prop_=(w,h,f)=>{const c=mk(w,h);f(c.getContext('2d'));return edge(c,.4);};
PIC.F=[0,1].map(v=>prop_(26,24,g=>{for(const [x,hh] of v?[[2,9],[14,12]]:[[4,12],[15,8]]){R(g,'#8a5a44',x,24-hh,9,hh-1);R(g,'#b07a5c',x,24-hh,9,2);R(g,'#6a4434',x+7,24-hh+2,2,hh-3);const p=px(g.canvas);foliage(p,[[x+4,24-hh-3,5],[x+2,24-hh-1,3.5],[x+7,24-hh-1,3.5]],LEAF.n,x+v);p.done();if(v)for(let i=0;i<3;i++)R(g,'#f0c53c',x+1+i*3,24-hh-6+i%2*2,2,2);}}));
PIC.V=prop_(20,34,g=>{R(g,'#34448e',1,1,18,32);R(g,'#4658a3',1,1,3,32);R(g,'#f4f2ea',4,4,9,17);for(let j=0;j<3;j++)for(let i=0;i<3;i++){R(g,['#8d9acb','#f0c53c','#6073b8'][(i+j)%3],5+i*3,5+j*5,2,4);}R(g,'#e9e6dc',14,5,3,4);R(g,'#1c2450',14,12,3,2);R(g,'#1c2450',4,24,11,5);R(g,'#f0c53c',14,17,2,2);});
PIC.S=prop_(18,24,g=>{R(g,'#5c4030',2,2,14,18);R(g,'#22284a',4,4,10,13);for(let i=0;i<4;i++)R(g,i===1?'#f0c53c':'#f4f2ea',5,6+i*3,8-(i%2)*3,1);R(g,'#5c4030',2,20,3,4);R(g,'#5c4030',13,20,3,4);});
PIC.I=(()=>{const c=mk(38,26),g=c.getContext('2d');for(const x of [9,29]){Ve(g,null,x,17,7,7,{s:'#2c3460',w:1.8});for(let a=0;a<4;a++)Vl(g,'#8d9acb',.7,x,17,x+Math.cos(a*.8)*6,17+Math.sin(a*.8)*6);}Vl(g,'#f0c53c',1.8,9,17,15,8,26,8,29,17,18,17,15,8);Vl(g,'#f0c53c',1.8,18,17,26,8);Vl(g,'#2c3460',1.6,15,8,14,5);Vl(g,'#2c3460',2.4,11,5,17,5);Vl(g,'#2c3460',1.6,26,8,25,3,28,3);const p=px(c);for(let i=0;i<p.b.length;i++)if((p.b[i]>>>24)<120)p.b[i]=0;else p.b[i]=(p.b[i]|0xff000000)>>>0;return p.done();})();
PIC.C=(()=>{const c=mk(48,38),g=c.getContext('2d');g.scale(.8,.8);const W8=x=>{Ve(g,'#4658a3',x,39,6,6);Ve(g,'#fbfbf7',x,39,2.6,2.6,{s:'#35458f',w:1});};W8(11);W8(45);Vp(g,'#8d9acb','#35458f',1.4,30,25,48,24,55,30,54,37,32,37);Vp(g,'#35458f',null,0,29,20,46,19,49,24,30,25);Vp(g,'#8d9acb','#35458f',1.4,15,11,21,11,26,33,35,34,35,38,19,38,14,20);Vl(g,'#35458f',2.2,15,11,25,9);Ve(g,'#fbfbf7',12,12,2.6,3,{s:'#35458f',w:1.2});Vp(g,'#8d9acb','#35458f',1.4,3,36,6,31,14,29,19,35);const p=px(c);for(let i=0;i<p.b.length;i++)p.b[i]=(p.b[i]>>>24)<120?0:(p.b[i]|0xff000000)>>>0;return p.done();})();
PIC.T=prop_(20,92,g=>{R(g,'#7e7a78',8,2,4,89);R(g,'#a5a19e',8,2,1,89);R(g,'#5a5654',11,2,1,89);R(g,'#4a4650',1,8,18,3);R(g,'#4a4650',3,16,14,2);for(const x of [2,9,16])R(g,'#e6e2da',x,5,2,3);R(g,'#6a6662',12,22,6,10);R(g,'#8f8b86',12,22,2,10);R(g,'#f0c53c',8,70,4,6);R(g,'#34448e',8,72,4,2);R(g,'#f4f2ea',6,52,8,9);R(g,'#8d9acb',7,54,6,1);R(g,'#8d9acb',7,57,5,1);});
const poles=[];
const reach=new Uint8Array(W*H);
for(const [x,y,k] of MAP.obj){ solid[I(x,y)]=1; if(k==='#')continue; const cx=x*T+8,by=y*T+14, v=hash(x,y,5)*3|0, jx=(hash(x,y,6)*6|0)-3;
  if('FVSICT'.includes(k)){ const im=k==='F'?PIC.F[hash(x,y,8)*2|0]:PIC[k]; bucket(x,y).things.push({x:cx-im.width/2|0,y:by-im.height+(k==='T'?2:1),img:im,base:by,sh:k==='T'?[SH.t,cx-8,by-4]:null}); if(k==='T')poles.push([cx,by-84]); if(k==='V')bucket(x,y).lamps.push([cx,by-16,34]); }
  else if(TREE[k]) bucket(x,y).things.push({x:cx-28+jx,y:by-72,img:TREE[k][v],base:by,sh:[SH.s,cx-20+jx,by-9],tree:1});
  else if(k==='h') bucket(x,y).things.push({x:cx-13,y:by-20,img:bushPic,base:by,sh:[SH.t,cx-8,by-4]});
  else if(k==='l'){ bucket(x,y).things.push({x:cx-9,y:by-46,img:PIC.l,base:by,sh:[SH.t,cx-8,by-4]}); bucket(x,y).lamps.push([cx,by-36,64]); }
  else if(k==='b') bucket(x,y).things.push({x:cx-17,y:by-20,img:PIC.b,base:by});
  else if(k==='k'){ bucket(x,y).things.push({x:cx-9,y:by-16,img:PIC.k,base:by,sh:[SH.t,cx-8,by-4]}); bucket(x,y).lamps.push([cx,by-6,34]); } }
/* 전봇대 사이 전깃줄 */
const wires=[]; poles.forEach((p,i)=>{ poles.map((q,j)=>[Math.hypot(p[0]-q[0],p[1]-q[1]),j]).filter(([d,j])=>j>i&&d<300).sort((a,b)=>a[0]-b[0]).slice(0,2).forEach(([,j])=>wires.push([...p,...poles[j]])); });
/* 큰 은행나무 */
const giants=GK.map(t=>{ const img=greatGinkgo(t.big), f=fencePic(t.big?118:100); return {img,x:t.x-img.width/2|0,y:t.y-img.height+24,base:t.y+2,cx:t.x,by:t.y,w:img.width,h:img.height,fence:f,a:1}; });
{ const q=[I(MAP.doors.hub.door[0],MAP.doors.hub.door[1]+1)]; reach[q[0]]=1; while(q.length){ const i=q.pop(),x=i%W,y=i/W|0; for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]) if(inMap(x+a,y+b)){ const j=I(x+a,y+b); if(!reach[j]&&!solid[j]){reach[j]=1;q.push(j);} } } }
/* 푸른방이 있는 학생회관 문 */
{ const {id,door:[dx,dy]}=MAP.doors.hub, q=B[id-1].q, X=dx*16+8; let yb=dy*16+16,best=1e9; q.forEach((p,i)=>{const n=q[(i+1)%q.length]; if(p[0]>n[0]&&X<=p[0]&&X>=n[0]){const y=n[1]+(X-n[0])*(p[1]-n[1])/(p[0]-n[0]); if(Math.abs(y-dy*16-14)<best){best=Math.abs(y-dy*16-14);yb=y;}} });
  const c=mk(64,44),g=c.getContext('2d'); R(g,'#34448e',0,0,64,14);R(g,'#4658a3',1,1,62,12);crispText(g,'103 푸른방',32,7,'bold 11px "Apple SD Gothic Neo","Malgun Gothic",sans-serif','#fbfbf7'); g.translate(12,0); R(g,'#10182c',9,14,22,30);R(g,'#2456a0',11,16,18,28);R(g,'#3f7fd0',11,16,18,2);R(g,'#1a3f78',19,16,2,28);R(g,'#bfe0ff',13,19,5,9);R(g,'#bfe0ff',22,19,5,9);R(g,'#f2cf62',17,32,2,3);R(g,'#f2cf62',21,32,2,3);
  bucket(dx,dy).things.push({x:X-32,y:Math.round(yb)-44,img:c,base:Math.round(yb)-1}); bucket(dx,dy).lamps.push([X,yb-16,56]); }
/* 혜화역 출구 */
const exitPic=(()=>{const c=mk(44,46),g=c.getContext('2d');R(g,'#4c5160',4,16,36,28);R(g,'#1c1f2c',8,20,28,24);for(let i=0;i<7;i++)R(g,i%2?'#6a6f80':'#9aa0b0',9,23+i*3,26,2);R(g,'#e9edf5',1,12,42,4);R(g,'#2f6fb6',1,2,42,11);R(g,'#ffffff',5,5,5,5);R(g,'#ffffff',15,6,22,3);return edge(c,.4);})();
for(const [n,[x,y]] of Object.entries(MAP.exits)){ solid[I(x,y)]=1; reach[I(x,y)]=0; bucket(x,y).things.push({x:x*T-14,y:y*T-30,img:exitPic,base:y*T+14}); bucket(x,y).lamps.push([x*T+8,y*T,56]); }
bucket(...MAP.doors.nc.door).lamps.push([MAP.doors.nc.door[0]*16+8,MAP.doors.nc.door[1]*16+8,66]);
