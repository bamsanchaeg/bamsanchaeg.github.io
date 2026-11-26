/* ===== 실내: 학생회관 103호 푸른방(허브)과 낫컴플리트(잼) ===== */
/* 명암과 결이 있는 상자 */
function box(g,x,y,w,h,c,o={}){ for(let j=0;j<h;j++)for(let i=0;i<w;i++){ let k=1.04-(j/h)*.16-(i/w)*.08; if(o.grain)k+=(nz(N8,(x+i)*(o.v?4:1),(y+j)*(o.v?1:4))-.5)*.28; else k+=(hash(x+i,y+j,3)-.5)*.05; if(j<1)k*=1.28; else if(i<1)k*=1.14; if(j>=h-1)k*=.6; else if(i>=w-1)k*=.72; g.fillStyle=lit(c,k); g.fillRect(x+i,y+j,1,1); } }
const pic=(w,h,f,k=.4)=>{const c=mk(w,h);f(c.getContext('2d'));return edge(c,k);};
const ART={
  drum:pic(78,62,g=>{ // 라이드, 크래시, 탐, 스네어, 베이스
    for(const [x,y,h] of [[12,10,44],[66,8,46],[8,30,26]]){R(g,'#4a4d58',x,y,1,h);R(g,'#8b8f9c',x-1,y,1,h);R(g,'#3a3d46',x-5,y+h-1,11,2);}
    ball(g,39,42,17,'#2a5fae');ball(g,39,42,14,'#e9e2d0');ball(g,39,42,12,'#f3eee0');R(g,'#2a5fae',31,39,16,5);R(g,'#f3eee0',33,41,12,1);
    box(g,22,17,15,13,'#2f68bd');box(g,41,17,15,13,'#2f68bd');ball(g,29,18,7,'#efe8d8',.4);ball(g,48,18,7,'#efe8d8',.4);
    box(g,56,34,18,18,'#2a5fae');ball(g,65,35,9,'#efe8d8',.4); box(g,8,36,16,9,'#b9bec8');ball(g,16,37,8,'#f2ecde',.4);R(g,'#6a6e7a',15,45,2,12);
    ball(g,12,10,11,'#d9ac3c',.34);R(g,'#f6dc84',4,8,12,1);ball(g,66,8,11,'#d9ac3c',.34);R(g,'#f6dc84',58,6,12,1);ball(g,7,29,7,'#c99a30',.34);R(g,'#f6dc84',12,9,1,1);}),
  piano:pic(64,50,g=>{ box(g,2,4,60,30,'#4a2a20',{grain:1});box(g,6,9,24,18,'#5b3426',{grain:1});box(g,34,9,24,18,'#5b3426',{grain:1});R(g,'#d9b35a',30,16,4,1);box(g,0,30,64,7,'#3a2018',{grain:1});R(g,'#f4efe2',3,32,58,5);for(let i=0;i<19;i++){R(g,'#b8b0a0',3+i*3,32,1,5);if(![2,6,9,13,16].includes(i))R(g,'#17141a',5+i*3,32,1,3);}box(g,2,37,60,12,'#40241b',{grain:1});R(g,'#1e120e',4,47,6,3);R(g,'#1e120e',54,47,6,3);R(g,'#e9e2cf',22,0,20,9);for(let i=0;i<3;i++)R(g,'#55505a',24,2+i*2,16,1);R(g,'#c8a23c',28,45,2,2);R(g,'#c8a23c',34,45,2,2);}),
  bass:pic(26,62,g=>{ R(g,'#2a1a12',12,2,3,30);R(g,'#4a3020',12,2,1,30);ball(g,13,3,3,'#5a3820');R(g,'#8a6a3a',9,5,3,1);R(g,'#8a6a3a',15,8,3,1);ball(g,13,30,8,'#a5622c');ball(g,13,45,12,'#a5622c');R(g,'#c98445',7,36,3,12);R(g,'#1c120c',12,20,3,22);R(g,'#1c120c',7,38,1,6);R(g,'#1c120c',19,38,1,6);R(g,'#d8b078',9,45,9,2);R(g,'#e8e0d0',12,8,1,44);R(g,'#e8e0d0',14,8,1,44);R(g,'#6a6e7a',13,57,1,4);}),
  amp:pic(28,28,g=>{box(g,0,0,28,26,'#26242a');R(g,'#8a6a3c',1,1,26,5);for(let i=0;i<5;i++)R(g,'#e6dcc0',4+i*4,3,2,2);R(g,'#d8573c',24,3,2,2);for(let y=8;y<23;y++)for(let x=3;x<25;x++)R(g,(x+y)&1?'#4a4038':'#362f2a',x,y,1,1);ball(g,14,15,6,'#3a342e');R(g,'#14141a',1,26,4,2);R(g,'#14141a',23,26,4,2);}),
  guitar:pic(20,46,g=>{R(g,'#3a2418',9,2,3,24);R(g,'#5c3c26',9,2,1,24);R(g,'#22160f',8,0,5,5);ball(g,10,28,5,'#8c2f1e');ball(g,10,36,8,'#8c2f1e');R(g,'#c9562f',5,30,2,8);R(g,'#1a1010',8,30,5,2);R(g,'#1a1010',8,35,5,2);R(g,'#d9c99a',8,39,5,1);R(g,'#e8e0d0',10,5,1,34);R(g,'#55586a',3,43,14,2);}),
  sax:pic(20,36,g=>{R(g,'#e6ad35',9,3,3,20);R(g,'#f9df86',9,3,1,20);R(g,'#a8741a',11,5,1,18);R(g,'#2a2420',4,2,4,2);R(g,'#e6ad35',7,3,3,2);ball(g,12,25,5,'#e0a52e');R(g,'#e6ad35',14,16,4,8);R(g,'#f9df86',13,14,6,3);for(let i=0;i<5;i++)R(g,'#fff0bd',12,7+i*3,2,2);R(g,'#55586a',4,33,14,2);R(g,'#55586a',9,28,2,6);}),
  mic:pic(16,42,g=>{R(g,'#70747f',7,8,2,31);R(g,'#a5a9b4',7,8,1,31);R(g,'#4a4e58',2,38,12,3);ball(g,8,5,4,'#8a8e98');R(g,'#3a3d46',6,8,4,5);}),
  shelf:pic(66,62,g=>{box(g,0,0,66,62,'#5d3b28',{grain:1});for(let r=0;r<3;r++){R(g,'#22140e',4,5+r*19,58,15);for(let x=5;x<61;){const w=1+(hash(x,r,3)*2|0);const c=pick(['#c8453a','#e0a030','#2f7f9a','#3a5aa8','#e6ded0','#5a3f8a','#2f7f5a','#1f1f2a','#d87a9a'],hash(x,r,4));R(g,c,x,6+r*19,w,14);R(g,lit(c,1.3),x,6+r*19,w,1);x+=w+(hash(x,r,5)<.15?1:0);}R(g,'#8a5f40',2,20+r*19,62,3);}R(g,'#e6ded0',44,3,14,14);ball(g,51,10,5,'#1c1c24');ball(g,51,10,2,'#c8453a');}),
  turn:pic(50,38,g=>{box(g,0,12,50,24,'#6a4630',{grain:1});box(g,4,4,42,12,'#3a3038');ball(g,19,10,10,'#1c1c24',.5);ball(g,19,10,6,'#2c2c36',.5);ball(g,19,10,3,'#d8573c',.5);R(g,'#c8ccd4',32,5,2,7);R(g,'#c8ccd4',26,10,7,2);R(g,'#e6b84a',40,8,3,2);R(g,'#3f2a1c',4,20,19,12);R(g,'#3f2a1c',27,20,19,12);for(const [x,c] of [[6,'#c8453a'],[9,'#2f7f9a'],[12,'#e6ded0'],[15,'#e0a030'],[29,'#3a5aa8'],[33,'#5a3f8a'],[37,'#e6ded0']])R(g,c,x,22,2,9);}),
  sofa:pic(74,40,g=>{box(g,2,2,70,22,'#27508f');box(g,4,4,32,18,'#2f5fa8');box(g,38,4,32,18,'#2f5fa8');box(g,4,19,32,12,'#3a70bf');box(g,38,19,32,12,'#3a70bf');box(g,0,12,8,24,'#244a86');box(g,66,12,8,24,'#244a86');R(g,'#15284c',6,31,62,4);R(g,'#2a1c14',6,36,4,3);R(g,'#2a1c14',64,36,4,3);box(g,12,9,14,12,'#e0a030');R(g,'#f6c860',13,10,4,2);}),
  table:pic(44,26,g=>{box(g,0,2,44,14,'#8a5f3c',{grain:1});R(g,'#5c3c24',3,16,4,9);R(g,'#5c3c24',37,16,4,9);R(g,'#f4efe2',6,4,13,9);R(g,'#c8c0b0',12,4,1,9);for(let i=0;i<3;i++){R(g,'#7a7684',7,6+i*2,4,1);R(g,'#7a7684',14,6+i*2,4,1);}R(g,'#e8e4da',28,4,7,6);R(g,'#6a4028',29,5,5,2);R(g,'#e8e4da',35,5,2,3);R(g,'#d9722a',22,6,4,4);}),
  board:pic(64,42,g=>{box(g,0,0,64,42,'#6a4428',{grain:1});R(g,'#b98d5a',3,3,58,36);for(let i=0;i<240;i++)R(g,hash(i,1)<.5?'#a57c4c':'#c99f6c',3+hash(i,2)*58|0,3+hash(i,3)*36|0,1,1);for(const [x,y,w,h,c] of [[6,6,15,12,'#f4efe2'],[24,5,13,16,'#f2d06a'],[40,7,17,11,'#bfe0ff'],[8,22,18,13,'#f7c6c0'],[30,24,12,11,'#f4efe2'],[45,21,13,15,'#cfe8b8']]){R(g,'rgba(40,20,10,.35)',x+1,y+1,w,h);R(g,c,x,y,w,h);for(let k=3;k<h-2;k+=2)R(g,'#77707a',x+2,y+k,w-4-(k%4),1);R(g,'#d8453a',x+w/2-1|0,y,2,2);}}),
  map:pic(54,42,g=>{box(g,0,0,54,42,'#2f2a33');R(g,'#d8cfae',3,3,48,36);R(g,'#8fae6a',5,5,18,14);R(g,'#8fae6a',30,22,18,14);R(g,'#f6f0de',4,20,46,2);R(g,'#f6f0de',26,4,2,34);R(g,'#b5774a',31,7,9,7);R(g,'#b5774a',8,25,8,8);R(g,'#e8b83a',33,25,4,4);R(g,'#d8453a',12,12,2,3);R(g,'#3a6ac8',43,8,3,3);}),
  poster:(c,t,d)=>pic(30,42,g=>{R(g,c,0,0,30,42);R(g,lit(c,1.25),0,0,30,2);ball(g,15,18,9,d);R(g,lit(c,.5),13,8,3,18);R(g,'#f4efe2',4,32,22,2);R(g,'#f4efe2',8,36,14,1);}),
  neon:(()=>{const c=mk(110,34),g=c.getContext('2d');crispText(g,'Groov',55,17,'italic bold 30px Georgia,"Times New Roman",serif','#fbfbf7','#34448e');c.noEdge=true;return c;})(),
  plant:pic(28,44,g=>{box(g,8,30,12,13,'#b5653c');const c=g.canvas,p=px(c);foliage(p,[[14,16,9,2],[8,22,7],[20,22,7],[14,8,6,3]],LEAF.n,9);p.done();}),
  pump:PIC.k,
  counter:pic(112,52,g=>{box(g,0,14,112,38,'#7a5236',{grain:1,v:1});box(g,0,12,112,8,'#d8d2c6');for(let i=0;i<7;i++)R(g,'#4f3422',6+i*16,24,1,26);box(g,10,0,34,15,'#9aa0aa');R(g,'#d5dae2',12,1,30,2);R(g,'#2a2c34',14,6,26,5);R(g,'#c9ced8',18,11,3,3);R(g,'#c9ced8',32,11,3,3);R(g,'#f4efe2',18,13,4,3);box(g,56,4,30,12,'#c8d6da');R(g,'#e8f2f4',58,5,26,2);R(g,'#d9a15a',60,9,7,4);R(g,'#8a4a2a',69,9,6,4);R(g,'#f2d6a0',77,9,6,4);R(g,'#2b2630',92,4,12,10);R(g,'#7fb0c4',93,5,10,7);}),
  ctab:pic(34,30,g=>{ball(g,17,9,15,'#a97a4e',.5);R(g,'#6a4a30',15,14,4,12);R(g,'#4a3422',9,26,16,3);R(g,'#f4efe2',11,5,6,4);R(g,'#5c3a24',12,6,4,1);}),
  chair:pic(16,26,g=>{box(g,2,0,12,12,'#8a5f3c',{grain:1});box(g,1,11,14,6,'#a97a4e',{grain:1});R(g,'#5c3c24',2,17,2,8);R(g,'#5c3c24',12,17,2,8);}),
  rdoor:pic(30,58,g=>{box(g,0,0,30,58,'#23386e');box(g,3,3,24,55,'#3f66b8');R(g,'#2b4a8e',6,7,18,18);R(g,'#2b4a8e',6,30,18,22);R(g,'#f2cf62',22,30,2,4);R(g,'#f4f2ea',9,10,12,12);R(g,'#4658a3',11,14,3,4);R(g,'#4658a3',16,14,3,4);}),
  juke:pic(44,62,g=>{ball(g,22,20,20,'#3f55a6');box(g,2,20,40,40,'#3f55a6');ball(g,22,20,15,'#f3d35a');box(g,7,20,30,12,'#f3d35a');R(g,'#2c3a78',9,22,26,10);ball(g,22,20,9,'#1f2a55',.6);ball(g,22,20,3,'#f7f5ec',.6);for(let i=0;i<4;i++){R(g,'#f7f5ec',9,34+i*4,12,3);R(g,'#f7f5ec',23,34+i*4,12,3);R(g,'#8d9acb',11,35+i*4,7,1);R(g,'#8d9acb',25,35+i*4,7,1);}R(g,'#2c3a78',8,52,28,7);for(let i=0;i<9;i++)R(g,'#8d9acb',9+i*3,53,1,5);}),
  cabinet:pic(52,48,g=>{box(g,0,0,52,48,'#6a4a34',{grain:1});for(let j=0;j<4;j++)for(let i=0;i<3;i++){box(g,3+i*16,4+j*10,14,8,'#9a7350',{grain:1});R(g,'#f4efe2',6+i*16,6+j*10,8,3);R(g,'#e6b84a',9+i*16,10+j*10,2,1);}R(g,'#f4efe2',8,-0,12,2);}),
  bed:pic(40,56,g=>{box(g,0,0,40,10,'#6a4a34',{grain:1});box(g,2,8,36,46,'#e9e6dc');box(g,6,11,28,11,'#fbfaf4');box(g,2,24,36,30,'#5a70ba');for(let i=0;i<5;i++)R(g,'#7f92d0',2,28+i*5,36,1);R(g,'#4a3424',0,52,4,4);R(g,'#4a3424',36,52,4,4);}),
  stairs:pic(48,40,g=>{for(let i=0;i<8;i++){R(g,lit('#a58260',1.15-i*.08),0,i*5,48,4);R(g,'#3a2a20',0,i*5+4,48,1);}R(g,'#4a3424',0,0,3,40);R(g,'#4a3424',45,0,3,40);}),
  rack:pic(40,34,g=>{R(g,'#2a2c34',2,0,36,34);for(let i=0;i<4;i++){R(g,'#4a4e5a',4,3+i*8,32,6);R(g,'#7ad0ff',7,5+i*8,2,2);R(g,'#ff9a5a',11,5+i*8,2,2);R(g,'#9aa0aa',20,5+i*8,12,1);}}),
};
function makeRoom(name,w,h,wallH,o){ const solidR=new Uint8Array(w*h), c=mk(w*T,h*T), g=c.getContext('2d'); c.floorY=wallH*T; for(let y=0;y<h;y++)for(let x=0;x<w;x++) if(y<wallH||x===0||x===w-1||y===h-1) solidR[y*w+x]=1;
  const ov=mk(w*T,h*T); ov.lift=.62; const r={name,W:w,H:h,solid:solidR,bg:c,g,over:ov,og:ov.getContext('2d'),walls:[],lines:[],things:[],spots:{},npcs:[],lamps:[],ambient:o.ambient,title:o.title,
    spot(x,y,tw,th,s){for(let j=0;j<th;j++)for(let i=0;i<tw;i++)r.spots[(x+i)+','+(y+j)]=s;},
    prop(img,tx,ty,tw,th,s,dx=0,dy=0){ for(let j=0;j<th;j++)for(let i=0;i<tw;i++)solidR[(ty+j)*w+tx+i]=1; r.things.push({x:tx*T+(tw*T-img.width)/2+dx|0,y:(ty+th)*T-img.height+dy,img,base:(ty+th)*T-1}); if(s)r.spot(tx,ty,tw,th,s); },
    wall(img,x,y,s,tx,tw){ r.walls.push([img,x,y]); if(s)r.spot(tx,wallH-1,tw,1,s); } };
  return r; }
const inkAmb={hub:'#dfe5f8',cafe:'#fdfaf0'};
function planks(g,x0,y0,x1,y1,c,seed){ for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){ const row=(y-y0)/8|0,o=(row*37)%64,b=((x+o)/64)|0; let k=.9+hash(b,row,seed)*.2+(nz(N8,x,y*5)-.5)*.16; if((y-y0)%8===0)k*=.66; if((x+o)%64===0)k*=.72; if((y-y0)%8===1)k*=1.08; if(y-y0<6)k*=.72+(y-y0)*.04; g.fillStyle=lit(c,k);g.fillRect(x,y,1,1);} }
/* 지하층 창밖: 잉크 팔레트 색만 써서 인쇄 효과를 거쳐도 또렷하다 */
const pen=(g,X,Y)=>(c,x,y,w,h)=>R(g,c,X+x,Y+y,w,h);
function corridor(g,X,Y){ const p=pen(g,X,Y),A='#34448e',B='#4658a3',C='#8d9acb',D='#bcc5e2',E='#dfe3ef',W='#fbfbf7',L='#f0c53c';   // 학생회관 지하 복도
  p(E,0,0,58,31);p(D,0,22,58,9);p(C,0,21,58,1);p(B,0,31,58,1);p(C,0,32,58,6);for(let x=-6;x<58;x+=8)for(let k=0;k<6;k++)p(D,x+k+2,32+k,1,1);
  p(B,0,0,58,2);p(D,0,2,58,1);p(A,0,3,58,1);for(const x of [6,24,50])p(A,x,0,2,4);                                   // 배관
  for(const x of [3,35]){p(B,x-1,5,18,4);p('#f9dd6a',x,6,16,2);}                                                      // 형광등
  for(let q=0;q<3;q++){const x=1+q*8;p(A,x,12,7,19);p('#6073b8',x+1,13,5,17);for(let v=0;v<2;v++)p(A,x+2,15+v*2,3,1);p(L,x+4,22,1,2);}      // 사물함
  p(B,33,10,7,9);p(W,34,11,5,7);p(A,35,12,3,3);p(A,35,16,3,1);                                                       // 포스터
  p(A,46,10,11,21);p('#6073b8',47,11,9,20);p(W,49,13,5,5);p(A,51,13,1,5);p(L,48,22,1,2);                              // 옆방 문
  p(A,36,27,8,5);p(A,37,22,6,5);p(A,38,20,4,3);p(A,39,13,2,8);p(C,37,27,1,4);p(C,38,22,1,4);p(W,39,16,2,1); }        // 세워 둔 악기 케이스
function nextRoom(g,X,Y){ const p=pen(g,X,Y),A='#34448e',B='#4658a3',C='#8d9acb',D='#bcc5e2',E='#dfe3ef',W='#fbfbf7',L='#f0c53c';      // 옆 합주실
  for(let y=0;y<27;y++)for(let x=0;x<46;x++)p(((x>>2)+(y>>2))&1?D:E,x,y,1,1);p(B,0,27,46,1);p(C,0,28,46,8);for(let x=-4;x<46;x+=6)p(D,x,31,3,1);
  for(const x of [5,28]){p(B,x-1,1,14,4);p('#f9dd6a',x,2,12,2);}
  const disc=(x,y,r,c,o=A)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const d=i*i+j*j;if(d<=r*r+r*.6)p(d>(r-1)*(r-1)+(r-1)*.6?o:c,x+i,y+j,1,1);}};
  p(A,3,14,1,18);p(L,0,13,7,2);p(A,20,15,1,17);p(L,17,14,7,2);p(A,5,17,6,6);p('#6073b8',6,18,4,4);p(A,12,17,6,6);p('#6073b8',13,18,4,4);disc(11,27,5,W);p(L,10,26,3,3); // 드럼
  p(A,30,19,14,14);p('#6073b8',31,20,12,2);for(const x of [32,35,38])p(W,x,20,1,1);p(B,31,23,12,9);for(let y=24;y<31;y+=2)p(C,32,y,10,1);p(A,26,11,2,16);p(L,24,23,6,8);p(A,26,25,2,3); } // 앰프와 기타
/* ---------- 푸른방 ---------- */
const hub=makeRoom('hub',20,15,5,{ambient:'#8f9fe6',title:'학생회관 103호 · 푸른방'});
{ const g=hub.g,w=320,h=240; planks(g,0,80,w,h,'#7a5a4c',3);
  for(let y=0;y<80;y++)for(let x=0;x<w;x++){ let k=.82+y/80*.26+(nz(N16,x,y)-.5)*.14+(hash(x,y,2)-.5)*.05; const br=(y/8|0),o=(br&1)*9; if(y%8===0||(x+o)%18===0)k*=.87; g.fillStyle=lit('#3166b4',k);g.fillRect(x,y,1,1);}
  box(g,0,72,w,8,'#1d3a6c'); R(g,'#0f1d38',0,0,w,5);
  // 창문: 지하층이라 바깥은 하늘이 아니라 학생회관 복도 (형광등, 배관, 포스터, 사물함, 악기 케이스)
  box(g,110,10,64,44,'#e6ded0'); corridor(g,113,13); 
  R(g,'#e6ded0',141,12,3,40);R(g,'#e6ded0',112,30,60,2);box(g,106,53,72,5,'#f4efe2');
  // 줄조명
  for(let i=0;i<40;i++){const x=i*8+4,y=8+Math.abs(Math.sin(i*.4))*6|0;R(g,'#22222e',x,y-1,8,1);R(g,['#ffd36a','#7ad0ff','#ff9ac0'][i%3],x+3,y,2,3);hub.lamps.push([x+4,y+1,13]);}
  hub.wall(ART.neon,186,8); hub.lamps.push([234,23,70]);
  hub.wall(ART.rdoor,82,22,{name:'방으로 가는 문',run:()=>openRooms()},5,2);
  hub.wall(ART.board,184,36,{name:'게시판',run:()=>openArchive('jam')},12,3); hub.wall(ART.map,254,36,{name:'동네 지도',run:()=>openMenu()},16,3);
  // 러그
  for(let y=0;y<74;y++)for(let x=0;x<146;x++){ const dx=(x-73)/73,dy=(y-37)/37,d=dx*dx+dy*dy; if(d>1)continue; const ring=Math.min(8,Math.sqrt(d)*9|0); let c=['#f0e6cc','#2a5aa8','#1d3f7a','#e0a030','#1d3f7a','#2a5aa8','#3f78c8','#2a5aa8','#f0e6cc'][ring]; hub.og.fillStyle=lit(c,.88+(nz(N4,x,y)-.5)*.3+((x+y)&1?.03:0)); hub.og.fillRect(87+x,128+y,1,1);} }
hub.prop(ART.shelf,1,5,4,1,{name:'푸른방 LP장',run:()=>openArchive('rec')});
hub.prop(ART.turn,8,5,3,1,{name:'턴테이블',run:()=>openArchive('rec')});
hub.prop(ART.piano,14,6,4,2,{name:'피아노',run:()=>say('업라이트 피아노',['건반이 조금 닳았지만 소리는 따뜻하다.','잼은 낫컴플리트에서! 문을 나가거나 지도를 펼쳐 보자.'])});
hub.prop(ART.drum,1,8,5,2,{name:'드럼',run:()=>say('드럼 세트',['스틱이 탐탐 위에 가지런히 놓여 있다.'])});
hub.prop(ART.bass,18,9,1,1,{name:'콘트라베이스',run:()=>say('콘트라베이스',['현을 튕기자 푸른방이 낮게 울린다.'])});
hub.prop(ART.guitar,17,9,1,1,{name:'기타',run:()=>say('할로우바디 기타',['누군가 어제 막 줄을 갈아 둔 것 같다.'])});
hub.prop(ART.amp,16,9,1,1); hub.prop(ART.sax,1,11,1,1,{name:'색소폰',run:()=>say('테너 색소폰',['리드가 아직 촉촉하다. 방금까지 누가 불고 있었나?'])});
hub.prop(ART.sofa,13,12,5,1,{name:'소파',run:()=>say('푸른 소파',['푹신하다. 여기서 한 곡만 더 듣고 가자.'])}); hub.prop(ART.table,14,10,2,1,{name:'방명록 노트',run:()=>openGuest()},4);
hub.prop(ART.pump,11,5,1,1); hub.prop(ART.pump,18,13,1,1,null,0,-4); hub.prop(ART.plant,1,13,1,1);
hub.lamps.push([142,34,60],[184,86,26],[296,216,30],[120,92,40],[232,96,40]);
hub.lines.push([109,9,66,46],[0,79,320,1],[0,4,320,1]);
{ const g=hub.og; R(g,'#0b1226',144,224,32,16); box(g,146,226,28,14,'#2f6fc4'); R(g,'#bfe0ff',150,229,20,2); hub.solid[14*20+9]=hub.solid[14*20+10]=0; for(const x of [9,10])hub.spots[x+',14']={door:true,name:'문',run:()=>leaveHub()}; }
hub.start=[10,11];
/* ---------- 낫컴플리트 2층 ---------- */
const cafe=makeRoom('cafe',24,16,5,{ambient:'#f2e2cc',title:'낫컴플리트 2층'});
{ const g=cafe.g,w=384,h=256; planks(g,0,80,w,h,'#a3764e',8);
  for(let y=0;y<80;y++)for(let x=0;x<w;x++){ let k=.95+(nz(N32,x,y)-.5)*.14+(hash(x,y,2)-.5)*.05+(y>66?-.06:0); g.fillStyle=lit('#cfc8bb',k);g.fillRect(x,y,1,1);} box(g,0,73,w,7,'#8a6a4c',{grain:1}); R(g,'#5a5048',0,0,w,4);
  // 사방의 큰 창
  for(let i=0;i<4;i++){ const x=14+i*62; box(g,x,10,54,52,'#6a4a30',{grain:1}); for(let yy=0;yy<46;yy++)for(let xx=0;xx<48;xx++){ let c=lit('#a9cfe4',1.12-yy/60); const t=nz(N8,xx*2+i*50,yy*2); if(yy>22+Math.sin((xx+i*20)*.25)*5)c=lit(t>.5?'#e2b43c':'#c98f2c',.75+t*.5); if(yy>38)c=lit('#8f8378',.8+t*.4); g.fillStyle=c;g.fillRect(x+3+xx,13+yy,1,1);} R(g,'#6a4a30',x+26,12,2,48);R(g,'#6a4a30',x+2,34,50,2);R(g,'rgba(255,255,255,.35)',x+6,16,3,14);R(g,'rgba(255,255,255,.25)',x+11,15,2,10);box(g,x-2,61,58,4,'#8a5f3c',{grain:1}); cafe.lamps.push([x+27,46,66]); }
  for(let i=0;i<4;i++) for(let y=0;y<90;y++){ g.fillStyle='rgba(255,236,180,.10)'; g.fillRect(20+i*62+y*.35|0,84+y,44,1); }
  // 칠판 메뉴
  box(g,262,12,72,48,'#3a2a20',{grain:1});R(g,'#34448e',265,15,66,42);R(g,'#34448e',271,17,54,38);crispText(g,'not complete',298,24,'bold 9px Georgia,"Times New Roman",serif','#fbfbf7');for(let i=0;i<4;i++){R(g,'#c8d0c4',275,33+i*5,24+(i*7)%14,1);R(g,'#e0b050',314,33+i*5,7,1);}
  // 펜던트 조명
  for(const x of [60,160,260,340]){R(g,'#2a2420',x,4,1,12);R(g,'#2a2420',x-6,16,13,4);R(g,'#ffe6a8',x-4,20,9,3);cafe.lamps.push([x,26,44]);}
  // 무대 단과 러그
  const og=cafe.og; box(og,24,96,152,62,'#b08a64',{grain:1}); R(og,'#3a2518',24,154,152,5); for(let y=0;y<46;y++)for(let x=0;x<128;x++){const e=Math.min(x,127-x,y,45-y);let c=e<3?'#e6d6b0':e<6?'#7a2430':(((x>>3)+(y>>3))&1)?'#8f2e38':'#a03a40';og.fillStyle=lit(c,.86+(nz(N4,x,y)-.5)*.3);og.fillRect(36+x,102+y,1,1);} }
const stageSpot={name:'무대',run:()=>openArchive('jam')};
cafe.prop(ART.piano,2,5,4,2,stageSpot); cafe.prop(ART.drum,6,5,5,2,stageSpot); cafe.prop(ART.bass,2,8,1,1,stageSpot,-4); cafe.prop(ART.amp,11,6,1,1,stageSpot,-4); cafe.prop(ART.sax,9,9,1,1,stageSpot); cafe.prop(ART.mic,6,9,1,1,stageSpot); cafe.prop(ART.guitar,10,8,1,1,stageSpot,2);
cafe.prop(ART.counter,16,6,7,2,{name:'카운터',run:()=>say('낫컴플리트 카운터',['커피 머신 소리 사이로 재즈가 낮게 흐른다.','오늘도 무대는 비어 있어요. 잼, 하실래요?'])});
for(const [x,y] of [[14,9],[18,10],[14,12],[18,13],[8,12],[4,12]]){ cafe.prop(ART.ctab,x,y,2,1,{name:'자리',run:()=>openGuest()}); cafe.prop(ART.chair,x-1,y,1,1); cafe.prop(ART.chair,x+2,y,1,1); }
cafe.prop(ART.plant,22,5+0,1,1); cafe.prop(ART.plant,22,13,1,1); cafe.prop(ART.pump,15,8,1,1,null,0,-2); cafe.prop(ART.juke,13,5,2,1,{name:'주크박스',run:()=>openArchive('rec')}); cafe.prop(ART.cabinet,1,13,3,1,{name:'기록 카드함',run:()=>openArchive('log')},0,6); cafe.lamps.push([224,90,50]);
for(let i=0;i<4;i++)cafe.lines.push([13+i*62,9,56,54],[40+i*62,12,1,48],[16+i*62,34,50,1]); cafe.lines.push([261,11,74,50],[0,73,384,1],[0,79,384,1],[60,4,1,12],[160,4,1,12],[260,4,1,12],[340,4,1,12]);
{ const g=cafe.og; g.drawImage(ART.stairs,176,220); cafe.solid[15*24+11]=cafe.solid[15*24+12]=cafe.solid[15*24+13]=0; for(const x of [11,12,13])cafe.spots[x+',15']={door:true,name:'계단',run:()=>leaveCafe()}; }
cafe.lamps.push([100,120,90],[320,110,70],[200,210,60]); cafe.start=[12,13];
/* 무대에서의 자리: 잼 할 때 사람이 서는 칸 */
const STAGE={ 피아노:[4,7,3], 드럼:[8,5,0], 베이스:[3,8,0], 기타:[10,9,0], 색소폰:[8,9,0], 보컬:[6,10,0] };

/* ---------- 각자의 방 ---------- */
/* 책장: 모양(SHELVES)과 색(WOODS)을 고르고, 곡 수만큼 음반이 꽂힌다 */
function shelfPic(n,shape='책장',wood='호두'){ const [C,dk,hi]=WOODS[wood]||WOODS.호두,H=shape==='낮은장'?42:62,c=mk(66,H),g=c.getContext('2d'); let k=n; const body_=(x,y,w,h)=>{if(wood==='호두')box(g,x,y,w,h,C,{grain:1});else{R(g,C,x,y,w,h);R(g,'#4658a3',x,y,w,1);R(g,'#4658a3',x,y+h-1,w,1);R(g,'#4658a3',x,y,1,h);R(g,'#4658a3',x+w-1,y,1,h);}};
  const discs=(x,y,w,h)=>{for(let i=x;i+2<=x+w&&k>0;i+=3,k--){const col=pick(['#4658a3','#f0c53c','#8d9acb','#fbfbf7','#34448e','#bcc5e2'].filter(x=>x!==dk),hash(k,y,4));R(g,col,i,y+(hash(k,y,7)<.25?1:0),2,h-(hash(k,y,7)<.25?1:0));}};
  const cell=(x,y,w,h)=>{R(g,dk,x,y,w,h);discs(x+1,y+1,w-2,h-1);};
  if(shape==='레코드장'){ body_(0,0,66,62); for(let r=0;r<3;r++)for(let q=0;q<3;q++)cell(3+q*21,3+r*20,18,17); }
  else if(shape==='낮은장'){ body_(0,12,66,28); R(g,hi,0,12,66,2); for(let q=0;q<2;q++)cell(4+q*30,17,28,19); for(const x of [4,58])R(g,dk,x,40,4,2); R(g,'#fbfbf7',6,0,12,12);ball(g,12,6,4,'#34448e');R(g,'#f0c53c',21,1,11,11);R(g,'#34448e',23,7,7,2); R(g,'#34448e',53,5,2,7);R(g,'#f0c53c',48,0,12,5); }
  else if(shape==='사다리선반'){ for(const [x,s_] of [[8,-1],[55,1]])for(let y=0;y<62;y++){const q=x+s_*(y*7/62|0);R(g,C,q,y,3,1);R(g,'#4658a3',q+2,y,1,1);} for(let r=0;r<4;r++){const w=40+r*4,x=33-w/2,y=13+r*15;discs(x+3,y-10,w-6,10);R(g,hi,x-3,y,w+6,1);R(g,C,x-3,y+1,w+6,2);R(g,'#4658a3',x-3,y+3,w+6,1);} }
  else if(shape==='사과상자'){ for(const [x,y,w] of [[0,41,32],[34,41,32],[0,20,32],[34,20,32],[16,0,34]]){const h=y?20:19;body_(x,y,w,h);cell(x+3,y+3,w-6,h-8);R(g,hi,x,y+h-5,w,2);R(g,dk,x,y+h-3,w,1);for(const q of [x+1,x+w-2])R(g,dk,q,y+1,1,1);} }
  else { body_(0,0,66,62); for(let r=0;r<3;r++){R(g,dk,4,5+r*19,58,15);discs(5,6+r*19,56,14);R(g,hi,2,20+r*19,62,3);} }
  return edge(c,.4); }
function buildRoom(o){ const r=makeRoom('room-'+o.id,16,12,5,{ambient:'#f0ece2',title:o.title}); r.owner=o.id; const g=r.g,w=256,h=192; planks(g,0,80,w,h,'#9a7452',strHash(o.id)&63); const wc=THEMES[o.theme]||THEMES.종이;
  for(let y=0;y<80;y++)for(let x=0;x<w;x++){ let k=.95+(nz(N32,x,y)-.5)*.1+(hash(x,y,2)-.5)*.04; if(x%16===0)k*=.9; if(((x+8)%16===8)&&y%12===6)k*=1.2; g.fillStyle=lit(wc,k);g.fillRect(x,y,1,1);} box(g,0,73,w,7,lit2(wc,.6)); R(g,'#2c3560',0,0,w,3);
  box(g,104,10,52,42,'#f4efe2');nextRoom(g,107,13);R(g,'#f4efe2',129,12,2,38);R(g,'#f4efe2',105,30,50,2);box(g,100,51,60,4,'#f4efe2');
  o.songs.slice(0,6).forEach((s,i)=>{ const x=[10,42,74,164,196,226][i],cv_=coverPic(s); const fr=mk(32,32),fg=fr.getContext('2d');fg.imageSmoothingEnabled=false;R(fg,'#34448e',0,0,32,32);R(fg,'#fbfbf7',1,1,30,30);fg.drawImage(cv_,3,3,26,26);r.walls.push([fr,x-3,5]); });
  r.spot(0,4,16,1,{name:'벽에 건 커버',run:()=>openRoom(o)});
  for(let y=0;y<54;y++)for(let x=0;x<112;x++){const dx=(x-56)/56,dy=(y-27)/27,d=dx*dx+dy*dy;if(d>1)continue;const q=Math.sqrt(d)*6|0;r.og.fillStyle=lit(['#f7f5ec','#8d9acb','#f7f5ec','#4658a3','#8d9acb','#4658a3'][Math.min(5,q)],.9+(nz(N4,x,y)-.5)*.25);r.og.fillRect(76+x,112+y,1,1);}
  r.prop(shelfPic(o.total??o.songs.length,...shelfOf(o)),1,5,4,1,{name:'음반장',run:()=>openRoom(o)}); r.prop(ART.turn,6,5,3,1,{name:'턴테이블',run:()=>o.songs[0]?openSong(o.songs[0],o):openRoom(o)}); r.prop(ART.bed,12,5,3,3,{name:'침대',run:()=>say('침대',[o.mine?'한 곡만 더 듣고 자야지.':`${o.nick}의 침대다. 눕지는 말자.`])}); r.prop(ART.table,1,8,3,1,{name:'방명록',run:()=>openRoom(o)}); r.prop(ART.plant,14,10,1,1); r.prop(ART.sofa,9,9+0,5,1,{name:'소파',run:()=>say('소파',['푹신하다. 음악이 잘 들리는 자리다.'])},4,4);
  r.lamps.push([130,40,60],[128,120,80]); R(r.og,'#2c3560',112,176,32,16);box(r.og,114,178,28,14,'#4658a3'); r.lines.push([103,9,54,44],[0,73,256,1],[0,79,256,1],[0,3,256,1]); for(const x of [7,8]){r.solid[11*16+x]=0;r.spots[x+',11']={door:true,name:'문',run:()=>{warp(hub,6,6,0);}};}
  r.start=[7,9]; if(!o.mine)r.npcs.push(actor(5,9,lookFor(o.nick),{name:o.nick,lines:[`${o.title}에 온 걸 환영해!`,'음반장을 구경하고, 마음에 드는 곡은 네 방에 보관해도 돼.'],home:[5,9],range:1})); return r; }
const lit2=(c,k)=>{const [r,g,b]=rgb(c),h=v=>Math.min(255,v*k|0).toString(16).padStart(2,'0');return '#'+h(r)+h(g)+h(b);};
function enterRoom(o){ hide(); const r=buildRoom(o); warp(r,...r.start,3); }
