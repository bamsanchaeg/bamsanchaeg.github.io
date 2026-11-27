/* ===== 장면, 이동, 그리기, 입력 ===== */
const DIR={down:[0,1,0],left:[-1,0,1],right:[1,0,2],up:[0,-1,3]};
const actor=(x,y,img,extra)=>Object.assign({tx:x,ty:y,px:x*T,py:y*T,dir:0,step:0,moving:false,img},extra);
const me=actor(hub.start[0],hub.start[1],ghostSheet);
const isRoad=k=>k==='r'||k==='c'||k==='d';
const placeAt=n=>MAP.places.find(p=>p[0]===n).slice(1);
const world={name:'world',W,H,solid,spots:{},npcs:[]};
let scene=hub, keys=[], route=[], after=null, run=false, night=false;
const near=(x,y)=>{ for(const open of [1,0]) for(let d=0;d<(open?14:40);d++)for(let j=-d;j<=d;j++)for(let i=-d;i<=d;i++){ const X=x+i,Y=y+j; if(Math.max(Math.abs(i),Math.abs(j))!==d||!inMap(X,Y)||!reach[I(X,Y)]||isRoad(at(X,Y))||world.npcs.some(n=>n.tx===X&&n.ty===Y))continue; if(open&&(bid(X,Y+1)||bid(X,Y+2)||bid(X,Y+3)))continue; return [X,Y]; } return placeAt('학생회관'); };
/* Groov 부원과 동네 사람 */
const castLooks=[{sp:'rabbit',shirt:'#1f4a36',sleeve:'#e6dcc4',jacket:1,pants:'#2c3350',glass:1},{sp:'wolf',shirt:'#7a2a3a',pants:'#33364a',scarf:true,gcase:1},{sp:'raccoon',shirt:'#39508a',pants:'#4a4038',phones:true},{sp:'fox',shirt:'#3f6a8a',pants:'#3a4a66',skirt:true},{sp:'bear',shirt:'#e0c890',pants:'#5a5044',gcase:1},{sp:'owl',shirt:'#2a2a34',pants:'#4a4650',hold:'cup'},{sp:'deer',shirt:'#8a5aa8',pants:'#34406e',hold:'book'}].map(personSheet);
/* 같은 부원은 어디서나 같은 동물 */
const LOOK={'피아노 부원':0,'베이스 부원':1,'드럼 부원':2,'보컬 부원':3,'기타 부원':4}, lookFor=n=>castLooks[LOOK[n]??(strSeed(n||'')%castLooks.length)];
const person=(x,y,img,name,lines,range=2)=>{const p=near(x,y),n=actor(...p,img,{name,lines,home:p,range});world.npcs.push(n);return n;};
person(...placeAt('명륜당 은행나무').map((v,i)=>v+(i?6:5)),personSheet({sp:'otter',shirt:'#34406e',pants:'#2a2a3a',sax:1,scarf:true}),'은행나무 아래 색소폰',npcTalk('sax'));
person(...placeAt('학생회관'),castLooks[0],'Groov 부원',npcTalk('member'));
person(...placeAt('금잔디광장'),castLooks[3],'금잔디의 보컬',npcTalk('vocal'));
person(...placeAt('낫컴플리트 골목'),castLooks[2],'골목의 드러머',npcTalk('drum'));
{ const C=['#c8453a','#4f8a6a','#48709e','#e0a030','#8a5aa8','#3a3a4a'];
  const looks=Object.keys(SPECIES).map((sp,i)=>personSheet({sp,shirt:pick(C,hash(i,1)),pants:pick(['#34406e','#4a4650','#6a4630'],hash(i,6)),glass:hash(i,9)<.2,jacket:hash(i,3)<.3?1:0,sleeve:'#e6dcc4',v:i}));
  for(let i=0;i<46;i++){ const p=MAP.places[i%MAP.places.length],lk=looks[(i*7+3)%looks.length]; person(p[1]+(hash(i,2)*18-9|0),p[2]+(hash(i,3)*14-7|0),lk,`${lk.label} ${hash(i,12)<.7?'학생':'주민'}`,npcTalk(hash(i,12)<.7?'student':'resident'),4); } }
hub.npcs.push(actor(7,9,catSheet,{name:'익명의 유령',lines:npcTalk('ghost'),home:[7,9],range:1}));
cafe.npcs.push(actor(20,8,castLooks[5],{name:'부엉이 바리스타',lines:npcTalk('barista'),home:[20,8],range:0}));
cafe.npcs.push(actor(15,12,castLooks[6],{name:'사슴 손님',lines:npcTalk('guest'),home:[15,12],range:0,dir:2}));
/* 건강한 빵집: 곰 제빵사와 다람쥐 단골, 가게 앞 강아지 손님 */
bakery.npcs.push(actor(9,6,personSheet({sp:'bear',shirt:'#fbfbf7',pants:'#4a4650',jacket:0,pat:false,hold:'bread'}),{name:'곰 제빵사',lines:npcTalk('baker'),home:[9,6],range:1}));
bakery.npcs.push(actor(12,10,personSheet({sp:'squirrel',shirt:'#8a5aa8',pants:'#34406e',hold:'bread'}),{name:'다람쥐 단골',lines:npcTalk('regular'),home:[12,10],range:0,dir:2}));
person(MAP.doors.bk.door[0]+4,MAP.doors.bk.door[1]+2,personSheet({sp:'dog',shirt:'#e0a030',pants:'#34406e',hold:'bread'}),'빵 봉투 든 강아지',npcTalk('breadfan'),2);
for(const n in MAP.exits)world.spots[MAP.exits[n].join()]={name:'출구',run:()=>say(`혜화역 ${n}번 출구`,[n==='4'?'대명거리로 나가는 출구. 성균관대 가는 사람들로 늘 북적인다.':'대학로 쪽 출구. 공연 포스터가 빼곡하다.'])};
/* 문과 랜드마크 */
const DOORS={hub:['푸른방',()=>goHub()],nc:['낫컴플리트',()=>{hide();warp(cafe,...cafe.start,3);}],bk:['건강한 빵집',()=>{hide();warp(bakery,...bakery.start,3);}]};
for(const k in DOORS){ const [x,y]=MAP.doors[k].door; world.spots[x+','+y]={door:true,name:DOORS[k][0],run:DOORS[k][1]}; }
const doorOf={}; for(const k in DOORS) doorOf[MAP.doors[k].id]=MAP.doors[k].door;
const leave=k=>{ const [x,y]=MAP.doors[k].door; warp(world,x,y+1,0); }, leaveHub=()=>leave('hub'), leaveCafe=()=>leave('nc'), leaveBakery=()=>leave('bk');
function goHub(){ hide(); warp(hub,...hub.start,3); tellNews(); }
const INFO={ '명륜당':['유생들이 글을 배우던 강당. 가운데 채 양옆으로 낮은 날개채가 붙어 있다.','앞뜰의 두 은행나무는 천연기념물이다.'],'대성전':['문묘의 중심 건물. 정면 다섯 칸, 팔작지붕이 당당하다.'],'동재':['유생들의 기숙사. 서재와 마주 보고 서 있다.'],'서재':['유생들의 기숙사. 동재와 마주 보고 서 있다.'],'동무':['대성전 앞뜰 동쪽을 두른 긴 집채.'],'서무':['대성전 앞뜰 서쪽을 두른 긴 집채.'],'신삼문':['대성전으로 드는 남쪽 문. 태극 무늬가 그려져 있다.'],'비천당':['명륜당 서북쪽에 자리한 건물.'],'학생회관':['동아리방이 모여 있는 건물. 103호 파란 문이 푸른방이다.'],'중앙학술정보관':['시험 기간이면 불이 꺼지지 않는다.'],'600주년기념관':['언덕 위로 우뚝 선 기념관.'],'낫컴플리트':['성균관로 골목의 카페. 문으로 들어가 보자.'],'건강한 빵집':['정문 앞 빵집. 통밀과 호밀 냄새가 길까지 난다.'] };
const solidAt=(s,x,y)=>x<0||y<0||x>=s.W||y>=s.H||s.solid[y*s.W+x];
const busy=(x,y,self)=>(me!==self&&me.tx===x&&me.ty===y)||scene.npcs.some(a=>a!==self&&a.tx===x&&a.ty===y);
const free=(x,y,self)=>!solidAt(scene,x,y)&&!busy(x,y,self);
function go(a,name){ const [dx,dy,r]=DIR[name]; a.dir=r; if(!free(a.tx+dx,a.ty+dy,a))return false; a.tx+=dx;a.ty+=dy;a.moving=true;return true; }
const face=()=>{const d=Object.values(DIR).find(v=>v[2]===me.dir);return [me.tx+d[0],me.ty+d[1]];};
function interact(x,y){ const n=scene.npcs.find(n=>n.tx===x&&n.ty===y); if(n){ if(!n.moving&&!n.stage)n.dir=[3,2,1,0][me.dir]; const l=typeof n.lines==='function'?n.lines(n):n.lines; say(n.name,l,n.onDone); n.onDone=null; return; }
  const s=scene.spots[x+','+y]; if(s){s.run();return;} if(scene!==world)return; const b=bid(x,y)&&MAP.B[bid(x,y)-1]; if(b&&b[2]){say(b[2],INFO[b[2]]||['지금은 들어갈 수 없다.']);return;}
  if(giants.some(q=>Math.abs(q.cx/16-x)<3&&Math.abs(q.by/16-y)<3)) say('명륜당 은행나무',['수백 년을 살아온 천연기념물 은행나무.','굵은 가지 밑으로 유주가 고드름처럼 자라 있고, 발밑은 온통 노랗다.']); }
function find(gx,gy){ const s=scene, w=s.W, ix=(x,y)=>y*w+x; if(gx<0||gy<0||gx>=s.W||gy>=s.H)return null; const goal=new Map(), around=(x,y,hit)=>Object.values(DIR).forEach(([a,b])=>{if(x+a>=0&&y+b>=0&&x+a<s.W&&y+b<s.H)goal.set(ix(x+a,y+b),hit);});
  const id=s===world?bid(gx,gy):0, door=doorOf[id]; if(door)around(...door,door); else if(id&&MAP.B[id-1][2]){ for(let i=0;i<W*H;i++)if(BID[i]===id)around(i%W,i/W|0,[i%W,i/W|0]); } else if(s.spots[gx+','+gy]&&!solidAt(s,gx,gy))goal.set(ix(gx,gy),null); else if(s.spots[gx+','+gy]||s.npcs.some(n=>n.tx===gx&&n.ty===gy)||solidAt(s,gx,gy))around(gx,gy,[gx,gy]); else goal.set(ix(gx,gy),null);
  const prev=new Int32Array(s.W*s.H).fill(-1), st=ix(me.tx,me.ty), q=[st]; prev[st]=st;
  for(let h=0;h<q.length&&h<24000;h++){ const i=q[h],x=i%w,y=i/w|0; if(goal.has(i)){ const r=[]; let c=i; while(c!==st){const p=prev[c];r.unshift(Object.keys(DIR).find(k=>DIR[k][0]===c%w-p%w&&DIR[k][1]===(c/w|0)-(p/w|0)));c=p;} return {r,hit:goal.get(i)}; }
    for(const [a,b] of Object.values(DIR)) if(!solidAt(s,x+a,y+b)){const j=ix(x+a,y+b); if(prev[j]<0&&!busy(x+a,y+b,me)){prev[j]=i;q.push(j);}} } return null; }
function warp(s,x,y,dir){ endTalk(); const ch=scene!==s; scene=s; if(ch){resize();bgmSync();} [me.tx,me.ty]=[x,y]; me.px=x*T;me.py=y*T;me.moving=false;route=[];after=null;keys.length=0; if(dir!==undefined)me.dir=dir; if(jam.on&&s!==cafe)stopJam(); fade=1; }
let fade=0;
function advance(a,dt,v){ const gx=a.tx*T,gy=a.ty*T,m=v*dt; a.px+=Math.sign(gx-a.px)*Math.min(m,Math.abs(gx-a.px)); a.py+=Math.sign(gy-a.py)*Math.min(m,Math.abs(gy-a.py)); a.step+=dt*(v>120?12:8); if(a.px===gx&&a.py===gy){a.moving=false;return true;} }
const uiOpen=()=>panel.classList.contains('on')||talk.classList.contains('on');
function update(dt){ fade=Math.max(0,fade-dt*2.6); if(me.moving&&advance(me,dt,riding()?225:run?170:110)){ const s=scene.spots[me.tx+','+me.ty]; if(s&&s.door){s.run();return;} }
  if(!me.moving&&!uiOpen()&&!jam.on){ if(keys.length){ route=[];after=null; if(!go(me,keys[keys.length-1])){const [x,y]=face(),s=scene.spots[x+','+y]; if(s&&s.door){keys.length=0;s.run();return;}} } else if(route.length){ if(!go(me,route.shift())){route=[];after=null;} } else if(after){ const [x,y]=after; after=null; const d=Object.values(DIR).find(v=>me.tx+v[0]===x&&me.ty+v[1]===y); if(d){me.dir=d[2];interact(x,y);} } }
  for(const n of scene.npcs){ if(n.moving){advance(n,dt,38);continue;} n.wait=(n.wait??1+Math.random()*3)-dt; if(n.wait<0&&!uiOpen()&&n.range){ n.wait=1+Math.random()*3; const name=pick(Object.keys(DIR),Math.random()),[a,b]=DIR[name]; if(Math.abs(n.tx+a-n.home[0])<=n.range&&Math.abs(n.ty+b-n.home[1])<=n.range&&!(scene===world&&isRoad(at(n.tx+a,n.ty+b)))&&!scene.spots[(n.tx+a)+','+(n.ty+b)]) go(n,name); } }
  for(const k in jam.bounce)jam.bounce[k]=Math.max(0,jam.bounce[k]-dt*6);
  for(const p of notes){p.y-=dt*26;p.t+=dt;} notes=notes.filter(p=>p.t<1.4); }
let notes=[]; const noteFx=()=>{ notes.push({x:me.px+Math.random()*18-4,y:me.py-18,t:0,c:pick(['#ffe49a','#9fd8ff','#ffb0c8'],Math.random())}); };
/* ---------- 그리기 ---------- */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),layer=document.getElementById('labels'); let S=3,VW=320,VH=240,cx=0,cy=0,clock=0; const lm=mk(8,8),lc=lm.getContext('2d');
let sizeKey='';
function resize(){
  sizeKey=innerWidth+'x'+innerHeight;
  const fit=scene===world?Math.min(innerWidth/400,innerHeight/270):Math.min(innerWidth/(scene.W*T),(innerHeight-(jam.on?170:0))/(scene.H*T));
  // 작은 화면의 실내는 방 전체가 보이게 맞추고, 지도와 데스크탑의 픽셀 배율은 유지한다.
  S=scene!==world&&innerWidth<=640?Math.max(.75,fit):Math.max(2,Math.floor(fit));
  VW=Math.ceil(innerWidth/S);VH=Math.ceil(innerHeight/S);
  cv.width=lm.width=VW;cv.height=lm.height=VH;
  cv.style.width=VW*S+'px';cv.style.height=VH*S+'px';
}
addEventListener('resize',resize); resize();
const labels=[]; const addLabel=(name,x,y,hot)=>{const e=document.createElement('div');e.className='label'+(hot?' hot':'');e.textContent=name;e.style.display='none';layer.append(e);labels.push({x,y,el:e,on:false});};
B.forEach(b=>{ if(!b.n||b.k==='N')return; if(b.k==='u')addLabel(b.n,(b.x0+b.x1)/2,(b.y0+b.y1)/2-b.h); else if(b.k!=='K'||b.x1-b.x0>60)addLabel(b.n,(b.x0+b.x1)/2,b.k==='V'?(b.y0+b.y1)/2:b.y1+16); });
setupPlazaBoard();
for(const n in MAP.exits)addLabel(`혜화역 ${n}번 출구`,MAP.exits[n][0]*16+8,MAP.exits[n][1]*16-30,1); addLabel('낫컴플리트',MAP.doors.nc.door[0]*16+8,MAP.doors.nc.door[1]*16-40,1); addLabel('건강한 빵집',MAP.doors.bk.door[0]*16+8,MAP.doors.bk.door[1]*16-40,1); addLabel('명륜당 은행나무',giants[0].cx,giants[0].by+40,1);
const glow=mk(128,128); {const p=px(glow);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const d=Math.hypot(x-63.5,y-63.5)/64;if(d<1){const v=Math.pow(1-d,1.5)+bay(x>>1,y>>1)*.05;const a=Math.max(0,Math.min(255,v*235|0));p.b[y*128+x]=(a<<24|150<<16|214<<8|255)>>>0;}}p.done();}
const cam=(p,v,m)=>v>=m?Math.round((m-v)/2):Math.round(Math.max(0,Math.min(m-v,p-v/2)));
function drawActor(a,al=1){ const fr=a.moving?Math.floor(a.step)%4:0, bz=a.stage&&jam.bounce[a.stage]?1:a===me&&jam.on&&jam.part&&jam.bounce[jam.part]?1:0, idle=!a.moving&&a===me&&Math.sin(clock*2.4)>.55?1:0, x=Math.round(a.px)-4,y=Math.round(a.py)-21-bz; if(al<1)ctx.globalAlpha=al; if(a===me&&riding())ctx.drawImage(scooterSheet,(a.moving?Math.floor(a.step*2)%2:0)*SW,a.dir*SHh,SW,SHh,Math.round(a.px)-19,Math.round(a.py)-43,SW,SHh); else { const im=a.img,[w,h,ox,oy]=im.m; ctx.drawImage(im,fr*w,a.dir*h,w,h,Math.round(a.px)+ox,Math.round(a.py)+oy-bz,w,h); } ctx.globalAlpha=1; }
let ride=false; const riding=()=>scene===world&&(run||ride);
function drawLight(ambient,lamps,vis){ lc.globalCompositeOperation='source-over'; lc.globalAlpha=1; R(lc,ambient,0,0,VW,VH); lc.globalCompositeOperation='lighter'; if(vis)for(const [c,x,y] of vis)lc.drawImage(c.lit,x-cx,y-cy); for(const [x,y,r] of lamps){const f=r*(1+Math.sin(clock*3+x)*.02);lc.drawImage(glow,x-cx-f,y-cy-f,f*2,f*2);} ctx.globalCompositeOperation='multiply'; ctx.drawImage(lm,0,0); ctx.globalCompositeOperation='source-over'; }
let placeKey=''; const placeEl=document.getElementById('place'); const portrait=mk(44,44); document.getElementById('who0').prepend(portrait); { const im=new Image(); im.onload=()=>{const g=portrait.getContext('2d');g.drawImage(im,84,0,66,66,0,0,44,44);}; im.src=TITLE_PNG; document.getElementById('ti').src=TITLE_PNG; }
function draw(){ const s=scene; cx=cam(jam.on&&s===cafe?100:me.px+8,VW,s.W*T); cy=jam.on&&s===cafe&&s.H*T<VH-170/S?Math.round((s.H*T-(VH-170/S))/2):cam(me.py,VH,s.H*T); ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; ctx.imageSmoothingEnabled=false; R(ctx,inkOn?'#f6f5f0':s===world?'#2b3320':'#080a16',0,0,VW,VH); ctx.save(); ctx.translate(-cx,-cy); s===world?drawWorld():drawRoom(s);
  for(const p of notes){ctx.globalAlpha=Math.max(0,1-p.t/1.4);const x=Math.round(p.x+Math.sin(p.t*6)*3),y=Math.round(p.y);R(ctx,'#2a2030',x-1,y-1,6,9);R(ctx,p.c,x+3,y,1,6);R(ctx,p.c,x,y+5,3,2);R(ctx,p.c,x+3,y,2,1);} ctx.globalAlpha=1;
  ctx.restore(); if(fade>0){ctx.globalAlpha=fade;R(ctx,'#080a16',0,0,VW,VH);ctx.globalAlpha=1;}
  for(const l of labels){const x=(l.x-cx)*S,y=(l.y-cy)*S,on=s===world&&x>-120&&x<VW*S+120&&y>-10&&y<VH*S+30; if(on!==l.on){l.on=on;l.el.style.display=on?'':'none';} if(on)l.el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;}
  const pk=s.name+me.tx+','+me.ty; if(pk!==placeKey){placeKey=pk; if(s!==world)placeEl.textContent=s.title; else {let b=1e9,n='';for(const [m,x,y] of MAP.places){const d=(x-me.tx)**2+(y-me.ty)**2;if(d<b){b=d;n=m;}}placeEl.textContent=n;}} }
function drawRoom(s){ if(inkOn)R(ctx,K1,-2,-2,s.W*T+4,s.H*T+4); ctx.drawImage(Q(s.bg),0,0); if(inkOn){ctx.fillStyle='#4658a3';for(const [x,y,w,h] of s.lines){if(w===1||h===1)ctx.fillRect(x,y,w,h);else{ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h);}}} for(const [im,x,y] of s.walls)ctx.drawImage(Q(im),x,y); ctx.drawImage(Q(s.over),0,0); const list=[...s.things,...[me,...s.npcs].map(a=>({a,base:a.py+14}))].sort((p,q)=>p.base-q.base); for(const t of list){ if(t.a){ctx.drawImage(Q(SH.t),Math.round(t.a.px),Math.round(t.a.py)+9);drawActor(t.a);} else ctx.drawImage(Q(t.img),t.x,t.y); } if(!inkOn){ ctx.save(); ctx.translate(cx,cy); drawLight(s.ambient,s.lamps); ctx.restore(); } if(s===hub&&!inkOn){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55+Math.sin(clock*9)*.04;ctx.drawImage(ART.neon,186,8);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';} }
let budget=0;
let built=0, frameNo=0; const chunkNow=(i,j)=>{ if(chunks.has(i+','+j))return chunk(i,j); if(built)return null; built++; return chunk(i,j); };
function drawWorld(){ built=0; frameNo++; const x0=Math.max(0,Math.floor(cx/CP)),x1=Math.min(Math.ceil(W/CH)-1,Math.floor((cx+VW)/CP)),y0=Math.max(0,Math.floor(cy/CP)),y1=Math.min(Math.ceil(H/CH)-1,Math.floor((cy+VH)/CP)), vis=[],list=[],lamps=[];
  for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++){const c=chunkNow(i,j);if(!c)continue;vis.push([c,i*CP,j*CP]);ctx.drawImage(c.base,i*CP,j*CP);if(night)ctx.drawImage(c.lit,i*CP,j*CP);}
  const seen=(x,y,w,h)=>x+w>cx&&x<cx+VW&&y+h>cy&&y<cy+VH;
  for(let j=y0-1;j<=y1+1;j++)for(let i=x0-1;i<=x1+1;i++){const b=buckets.get(i+','+j);if(!b)continue;for(const t of b.things)if(seen(t.x,t.y,t.img.width,t.img.height))list.push(t);for(const l of b.lamps)if(seen(l[0]-l[2],l[1]-l[2],l[2]*2,l[2]*2))lamps.push(l);}
  const acts=[me,...world.npcs].filter(a=>seen(a.px-4,a.py-22,24,40)); for(const t of list)if(t.sh)ctx.drawImage(Q(t.sh[0]),t.sh[1],t.sh[2]);
  for(const q of giants)if(seen(q.x,q.y,q.w,q.h+30)){ctx.drawImage(Q(SH.big),q.cx-95,q.by-38);const m=q.fence; ctx.save();ctx.translate(q.cx,q.by-6);ctx.scale(1,-1);ctx.drawImage(Q(m),-m.width/2|0,-2);ctx.restore();}
  for(const a of acts){ctx.drawImage(Q(SH.t),Math.round(a.px),Math.round(a.py)+9);list.push({a,base:a.py+14});}
  list.sort((p,q)=>p.base-q.base); for(const t of list){ if(t.a)drawActor(t.a); else { const hid=t.tree&&me.py+14<t.base&&me.px+14>t.x+6&&me.px<t.x+50&&me.py>t.y+2; t.al=(t.al??1)+((hid?.45:1)-(t.al??1))*.2; if(t.al<.98)ctx.globalAlpha=t.al; ctx.drawImage(Q(t.img),t.x,t.y); ctx.globalAlpha=1; } }
  for(const [c,x,y] of vis)ctx.drawImage(c.top,x,y);
  ctx.fillStyle=inkOn?K1:'#22222e'; for(const [a,b,c,d] of wires){ if(Math.max(a,c)<cx||Math.min(a,c)>cx+VW||Math.max(b,d)+30<cy||Math.min(b,d)>cy+VH)continue; const n=Math.ceil(Math.hypot(c-a,d-b)); for(const o of [0,7])for(let i=0;i<=n;i++){const t=i/n;ctx.fillRect(Math.round(a+(c-a)*t)+o-7,Math.round(b+(d-b)*t+Math.sin(t*Math.PI)*n*.06),1,1);} }
  drawActor(me,.28); // 건물 뒤에 있어도 비쳐 보이게
  for(const q of giants){ if(!seen(q.x,q.y,q.w,q.h+30))continue; const under=me.py+10<q.base&&((me.px+8-q.cx)/(q.w*.43))**2+((me.py-(q.by-q.h*.55))/(q.h*.44))**2<1; q.a+=((under?.5:1)-q.a)*.1; ctx.globalAlpha=q.a; ctx.drawImage(Q(q.img),q.x,q.y); ctx.globalAlpha=1; ctx.drawImage(Q(q.fence),q.cx-q.fence.width/2|0,q.by-8); for(const a of acts)if(a.py+14>q.base&&a.px>q.x-20&&a.px<q.x+q.w&&a.py<q.by+60)drawActor(a); if(under)drawActor(me,.6); }
  // 다음에 보일 구역을 미리 그려 둔다: 움직일 때는 한 칸 둘레를 매 프레임, 멈춰 있을 때는 두 칸 둘레를 네 프레임에 하나씩
  const go_=me.moving||route.length, rr=go_?1:2; if(!built&&(go_||frameNo%4===0)) pre: for(let j=Math.max(0,y0-rr);j<=Math.min(Math.ceil(H/CH)-1,y1+rr);j++)for(let i=Math.max(0,x0-rr);i<=Math.min(Math.ceil(W/CH)-1,x1+rr);i++) if(!chunks.has(i+','+j)){ built++; chunk(i,j); break pre; }
  // 흩날리는 잎
  const gk=giants.some(q=>Math.hypot(me.px-q.cx,me.py-q.by)<420), n=gk?54:16; for(let i=0;i<n;i++){const sp=14+hash(i,3)*16,px_=((hash(i,1)*(VW+80)+clock*(9+hash(i,4)*12)+Math.sin(clock*1.3+i)*14)%(VW+80))-40,py_=((hash(i,2)*(VH+60)+clock*sp)%(VH+60))-30,f=Math.sin(clock*4+i*2)>0; const c=gk?pick(['#fbe27c','#f0c846','#d9a42d'],hash(i,5)):pick(inkOn?['#f0c53c',K2,K3]:['#e0a030','#c8653a','#f0c846'],hash(i,5)); R(ctx,c,cx+px_|0,cy+py_|0,f?3:2,f?2:3);}
  if(night){ ctx.save();ctx.translate(cx,cy);drawLight(inkOn?'#6f7fc4':'#4a4f92',[...lamps,...giants.map(q=>[q.cx,q.by-60,150])],vis);ctx.restore(); }
  else if(!inkOn){ ctx.globalCompositeOperation='soft-light'; ctx.globalAlpha=.22; R(ctx,'#ffb65c',cx,cy,VW,VH); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; } }
let last=0; function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;clock+=dt;if(sizeKey!==innerWidth+'x'+innerHeight)resize();update(dt);draw();requestAnimationFrame(loop);}
/* ---------- 입력 ---------- */
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'};
/* 배경음악: 장소마다 다른 곡을 끊김 없이 반복한다 (Web Audio).
   동아리방(푸른방)·각자의 방 = 동아리방 곡, 지도 = 체크포인트 곡, 낫컴플리트 = 음악 없음. 장소를 옮기면 서서히 바꿔 튼다.
   브라우저는 누르기 전엔 소리를 막으므로 첫 화면 버튼을 누를 때 시작한다. 끄면 기억하고, 탭을 떠나거나 다른 창이 틀면 멈춘다 */
const TRACKS={club:'audio/our_little_clubroom_8bit.mp3',walk:'audio/checkpoint_loop_jazz.m4a'}, VOL={club:.3,walk:.28};
const bgm={on:true,ctx:null,want:null,cur:null,buf:{},loading:{},src:null,gain:null}; try{ bgm.on=localStorage.getItem('groov.bgm')!=='off'; }catch(e){}
const bgmTrack=s=>s===cafe||s===bakery?null:s===world?'walk':'club';
function bgmLoad(k){ if(bgm.buf[k])return Promise.resolve(bgm.buf[k]);
  return bgm.loading[k]||(bgm.loading[k]=fetch(TRACKS[k]).then(r=>{ if(!r.ok)throw new Error('bgm '+r.status); return r.arrayBuffer(); }).then(a=>new Promise((ok,no)=>bgm.ctx.decodeAudioData(a,ok,no))).then(b=>bgm.buf[k]=b,e=>{ bgm.loading[k]=null; throw e; })); }
function bgmStop(fade=.6){ if(!bgm.src)return; const {src,gain}=bgm, t=bgm.ctx.currentTime; gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(gain.gain.value,t); gain.gain.linearRampToValueAtTime(0,t+fade); try{ src.stop(t+fade+.05); }catch(e){} Object.assign(bgm,{src:null,gain:null,cur:null}); }
function bgmSync(){ const k=bgm.on&&title.hidden&&!document.hidden?bgmTrack(scene):null; bgm.want=k; if(!k){ bgmStop(); return; } if(bgm.cur===k&&bgm.src)return;
  if(!bgm.ctx){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return; bgm.ctx=new AC(); }   // 누른 순간에 만들어야 소리가 난다
  if(bgm.ctx.state!=='running')bgm.ctx.resume().catch(()=>{});
  bgmLoad(k).then(b=>{ if(bgm.want!==k||(bgm.cur===k&&bgm.src))return;   // 받는 사이에 장소가 바뀌었으면 그만
    bgmStop(); const src=bgm.ctx.createBufferSource(), gain=bgm.ctx.createGain(), t=bgm.ctx.currentTime; src.buffer=b; src.loop=true;
    gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(VOL[k],t+.8); src.connect(gain).connect(bgm.ctx.destination); src.start(t);
    Object.assign(bgm,{src,gain,cur:k}); if(bgmBus)bgmBus.postMessage('play'); },()=>{}); }
/* 게임을 창 여러 개에 열어도 음악은 한 곳에서만: 한 창이 틀면 다른 창은 멈춘다 (그 창에서 장소를 옮기면 다시 그 창이 튼다) */
const bgmBus=typeof BroadcastChannel==='function'?new BroadcastChannel('groov-bgm'):null; if(bgmBus)bgmBus.onmessage=e=>{ if(e.data==='play')bgmStop(.3); };
function bgmShow(){ const b=document.getElementById('bMusic'); b.classList.toggle('off',!bgm.on); b.ariaPressed=String(bgm.on); b.ariaLabel=bgm.on?'배경음악 끄기':'배경음악 켜기'; b.title=b.ariaLabel; }
function bgmToggle(){ bgm.on=!bgm.on; try{ localStorage.setItem('groov.bgm',bgm.on?'on':'off'); }catch(e){} bgmSync(); bgmShow(); }
document.addEventListener('visibilitychange',()=>bgmSync());
const title=document.getElementById('title'); const startGame=()=>{ if(title.hidden)return; title.hidden=true; bgmSync(); document.activeElement?.blur(); const r=/room=(GROOV1\.[\w-]+)/.exec(location.hash||''), o=r&&readCode(r[1]); if(o){addFriend(o);enterRoom(o);} }; 
/* 첫 화면 메뉴: 로그인 상태에 따라 버튼이 바뀐다. 둘러보기는 언제나 할 수 있다 */
let titleKey=''; const goBox=document.getElementById('go');
const browse=()=>{ startGame(); if(scene===hub&&!cloud.member)say('익명의 유령',['둘러보는 중이구나. 천천히 걸어 봐.',...(cloud.pub?['게시판에서는 어떤 잼이 열리는지 이름 없이 볼 수 있어.']:[]),'추천곡과 사람들의 방은 로그인하고 승인받으면 열려. 오른쪽 위에서 언제든 할 수 있어.']); };
const enterMember=()=>{ startGame(); tellNews(); };
/* 푸른방에 있을 때 새로 생긴 소식이 있으면 익명의 유령이 먼저 말을 건다 */
function tellNews(){ if(scene!==hub||!cloud.member)return; const g=ghostNews(false); if(g)say('익명의 유령',g.lines,g.done); }
function titleMenu(){ if(title.hidden)return; const st=cloud.state, shared=/room=GROOV1\./.test(location.hash||''), key=[st,cloud.note,cloud.profile&&cloud.profile.nick,shared,Date.now()-(cloud.connectedAt||0)<5000].join('|'); if(key===titleKey)return; titleKey=key;
  const login=btn('로그인',()=>needLogin()), look=btn('둘러보기',browse), visit=btn('놀러 가기',startGame), other=btn('다른 계정으로',async()=>{await cloud.sb.auth.signOut({scope:'local'});await session();needLogin();}), tell=el('div',{cls:'tip',role:'status'});
  const check=btn('승인됐는지 확인',async()=>{await session();if(cloud.member)return;tell.textContent='아직 승인 전이에요. 조금 뒤에 다시 확인해 주세요.';});
  const named=(t,b)=>{b.textContent=t;return b;}, justOn=Date.now()-(cloud.connectedAt||0)<5000;
  const [main,...more]=shared&&st!=='loading'?[visit,...(st==='out'?[login]:[])]:st==='member'?[btn(`${cloud.profile.nick} 들어가기`,enterMember),other]:st==='out'?[named('로그인하고 시작',login),look]:st==='setup'?[btn('가입 이어서 하기',()=>needLogin()),look]:st==='pending'?[named('둘러보며 기다리기',look),check]:st==='blocked'?[look,btn('내 계정',()=>needLogin())]:[look];
  tell.textContent=st==='loading'?'연결하는 중이에요…':cloud.note&&st!=='member'?cloud.note:st==='pending'?'리더의 승인을 기다리고 있어요.':!justOn?'':st==='member'?'연결됐어요. 어서 와요.':st==='out'?'연결됐어요. 로그인하거나 둘러볼 수 있어요.':'연결됐어요.';
  main.classList.add('main'); goBox.replaceChildren(el('div',{cls:'gobtns'},main,...more),tell); if(!panel.classList.contains('on'))main.focus({preventScroll:true}); }
addEventListener('keydown',e=>{ if(!title.hidden&&!panel.classList.contains('on')&&!talk.classList.contains('on')){ const b=[...goBox.querySelectorAll('button')],i=b.indexOf(document.activeElement),d=e.key==='Tab'?(e.shiftKey?-1:1):/^Arrow(Down|Right)$/.test(e.key)?1:/^Arrow(Up|Left)$/.test(e.key)?-1:0; if(d&&b.length){e.preventDefault();b[(Math.max(i,d<0?0:-1)+d+b.length)%b.length].focus();} else if((e.key==='Enter'||e.key===' ')&&i<0&&!e.repeat){e.preventDefault();b[0]?.click();} return; } run=e.shiftKey; if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(panel.classList.contains('on')){ if(e.key==='Escape'){hide();return;} const f=[...panel.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea')],i=f.indexOf(document.activeElement); if(e.key==='Tab'){e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();} else if(!e.repeat&&(e.key==='ArrowDown'||e.key==='ArrowUp')&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)){e.preventDefault();f[(i+(e.key==='ArrowDown'?1:-1)+f.length)%f.length].focus();} return; }
  if(talk.classList.contains('on')){ if(['Enter',' '].includes(e.key)||e.code==='KeyZ'){e.preventDefault();if(!e.repeat)nextLine();} return; }
  if(jam.on){ if(e.key==='Escape'){stopJam(true);return;} const i=PADS.indexOf(e.code.replace('Key','')); if(i>=0&&!/INPUT|SELECT/.test(document.activeElement?.tagName)){e.preventDefault();if(!e.repeat)jamHit(i);} return; }
  const d=KEYMAP[e.code]; if(d){e.preventDefault();if(!keys.includes(d))keys.push(d);return;} if(document.activeElement?.tagName==='BUTTON')return;
  if((e.key==='Enter'||e.key===' '||e.code==='KeyZ')&&!e.repeat){e.preventDefault();if(!me.moving)interact(...face());} else if(e.code==='KeyM'||e.key==='Escape')openMenu(); else if(e.code==='KeyR')goHub(); else if(e.code==='KeyB')bR.onclick(); else if(e.code==='KeyC')openArchive(); else if(e.code==='KeyP')openPlaza(); else if(e.code==='KeyL')openMailbox(); });
addEventListener('keyup',e=>{run=e.shiftKey;const i=keys.indexOf(KEYMAP[e.code]);if(i>=0)keys.splice(i,1);}); addEventListener('blur',()=>{keys.length=0;});
cv.addEventListener('pointerdown',e=>{document.activeElement?.blur();if(uiOpen()||jam.on||!title.hidden)return;const x=Math.floor((e.clientX/S+cx)/T),y=Math.floor((e.clientY/S+cy)/T),f=find(x,y);if(f){route=f.r;after=f.hit;}});
document.getElementById('bClose').onclick=hide; document.getElementById('bMenu').onclick=()=>openMenu(); document.getElementById('bHome').onclick=()=>goHub();
const hud=document.getElementById('hud'), bMore=document.getElementById('bMore');
function mobileMenu(open){hud.classList.toggle('expanded',open);bMore.setAttribute('aria-expanded',String(open));bMore.setAttribute('aria-label',open?'추가 조작 닫기':'추가 조작 열기');}
bMore.onclick=()=>mobileMenu(!hud.classList.contains('expanded'));
hud.addEventListener('click',e=>{if(innerWidth<=640&&e.target.closest('button:not(#bMore)'))mobileMenu(false);});
document.addEventListener('pointerdown',e=>{if(innerWidth<=640&&!hud.contains(e.target))mobileMenu(false);});
addEventListener('resize',()=>{if(innerWidth>640)mobileMenu(false);});
const bR=document.getElementById('bRide'); bR.onclick=()=>{ride=!ride;bR.textContent=ride?'걷기':'스쿠터';bR.blur();};
const bN=document.getElementById('bNight'); bN.onclick=()=>{night=!night;bN.textContent=night?'낮으로':'밤으로';bN.blur();};
/* 휴대폰: 키보드나 주소창 때문에 실제로 보이는 높이가 바뀌면 창이 그 안에 들어오게 한다 */
{ const vv=window.visualViewport, root=document.documentElement.style, fit=()=>{ root.setProperty('--vh',vv.height+'px'); root.setProperty('--vt',vv.offsetTop+'px'); }; if(vv){ vv.addEventListener('resize',fit); vv.addEventListener('scroll',fit); fit(); } }
if(matchMedia('(pointer: coarse)').matches||innerWidth<768)document.getElementById('hint').textContent='가고 싶은 곳이나 사람을 눌러 보세요';
titleMenu(); cloudInit(); document.getElementById('bAcct').onclick=()=>needLogin(); document.getElementById('bMail').onclick=e=>{e.currentTarget.blur();openMailbox();}; document.getElementById('bMusic').onclick=e=>{e.currentTarget.blur();bgmToggle();}; bgmShow();
me.dir=0;
requestAnimationFrame(loop);
