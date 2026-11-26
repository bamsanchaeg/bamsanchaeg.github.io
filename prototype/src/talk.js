/* ===== NPC 대사 =====
   말을 걸 때마다 대사를 새로 고른다.
   1) 그 인물다운 재즈 이야기 한 줄
   2) 지금 화제 한 줄: 다가올 공연 → 빈자리 있는 잼 → 재즈 거장 생일 → 계절 이야기 → 추천곡
   같은 줄이 연달아 나오지 않게 직전 대사는 피한다.
   존댓말을 쓰는 인물(polite)은 화제도 존댓말로, 주민은 학생 이야기(방학·동방·시험)를 하지 않는다. */

/* 다가올 행사. 광장에 올린 공연(plazaEvents)을 먼저 쓰고, 서버 없이 시험할 때만 여기에 적는다 (지난 행사는 저절로 빠진다).
   예) { name:'12월 정기공연', date:'2026-12-12', place:'낫컴플리트', time:'19:00' } */
const EVENTS=[];
const allEvents=()=>[...EVENTS,...(typeof plazaEvents==='function'?plazaEvents():[])];

/* 한국 시간 기준 오늘 (기기 시간대와 상관없이) */
const kstNow=()=>new Date(Date.now()+9*3600e3);
const dayNum=d=>Math.floor(d.getTime()/864e5);
const md=d=>[d.getUTCMonth()+1,d.getUTCDate()];
const anyOf=a=>a[Math.random()*a.length|0];
const fresh=(n,key,pool)=>{ const seen=n.said||(n.said={}), l=pool.length>1?pool.filter(x=>x!==seen[key]):pool, x=anyOf(l); seen[key]=x; return x; };

/* 다가올 행사: 오늘부터 30일 안 */
function nextEvent(){ const t=dayNum(kstNow()); let best=null;
  for(const e of allEvents()){ const d=Date.parse(e.date+'T00:00:00Z'); if(isNaN(d))continue; const left=Math.floor(d/864e5)-t; if(left>=0&&left<=30&&(!best||left<best.left))best={...e,left}; }
  return best; }
const EV_MOOD={
  색소폰:['솔로 몇 코러스 돌지 아직 못 정했어.','리드 새로 갈아 두고 길들이는 중이야.'],
  보컬:['그날 목 아끼려고 찬 음료 끊었어.','가사 카드 만들어서 주머니에 넣고 다녀.'],
  드럼:['카운트 템포 정하는 게 제일 떨려.','브러시도 챙길까 고민 중이야. 발라드가 있으면 필요하거든.'],
  부원:['포스터 붙이는 거 도와줄 사람!','셋리스트 순서 짜느라 단톡이 불났어.'],
  주민:['동네에 재즈 공연이라니, 구경 가야겠네.','우리 가게에도 포스터 하나 붙여 줘.'],
  유령:['…그날은 나도 맨 뒷줄에서 들을게. 아무도 못 보겠지만.'],
  바리스타:['그날은 커피를 넉넉히 내려 둘게요.','공연 끝나고 오시면 따뜻한 거 한 잔 드릴게요.'],
  손님:['그날은 일찍 와서 앞자리에 앉으려고요.','책은 집에 두고 가야겠어요.'] };
const jong=w=>{ const c=(w||'').trim().slice(-1).charCodeAt(0); return !(c>=0xac00&&c<=0xd7a3)||(c-0xac00)%28>0; };   /* 받침이 있으면(한글이 아니면) true */
const iya=w=>w+(jong(w)?'이야':'야'), iga=w=>w+(jong(w)?'이':'가'), ieyo=w=>w+(jong(w)?'이에요':'예요');
function eventLines(role,polite){ const e=nextEvent(); if(!e)return []; const [m,d]=e.date.split('-').slice(1).map(Number);
  const where=[e.place&&`${e.place}에서`,e.time].filter(Boolean).join(' '), w=where?` ${where}.`:'', moods=EV_MOOD[role]||EV_MOOD.부원;
  const head=polite?(e.left===0?`오늘이 ${ieyo(e.name)}!${w}`:e.left===1?`내일이 ${ieyo(e.name)}.${w}`:e.left<=7?`${e.name}까지 ${e.left}일 남았대요.${w}`:`${m}월 ${d}일에 ${iga(e.name)} 있대요.${w}`)
    :(e.left===0?`오늘이 ${iya(e.name)}!${w} 늦지 마.`:e.left===1?`내일이 ${iya(e.name)}.${w}`:e.left<=7?`${e.name}까지 D-${e.left}.${w}`:`${m}월 ${d}일에 ${iga(e.name)} 있대.${w}`);
  return e.left===0?[head]:moods.map(x=>`${head} ${x}`); }

/* 빈자리 있는 잼: 부원은 실제 잼, 방문자는 공개된 잼 요약, 연결 전에는 예시 잼 */
function openJams(){
  if(db.jams&&db.jams.length) return db.jams.filter(j=>!j.closed).map(j=>({title:j.title,when:j.when,songs:j.songs.map(s=>({title:s.title,key:s.key,open:s.slots.filter(x=>!x.who&&!x.invited).map(x=>x.part)}))}));
  if(cloud.pub) return cloud.pub.filter(j=>j&&typeof j.title==='string').map(j=>({title:j.title,when:typeof j.when==='string'?j.when:'',songs:(j.songs||[]).map(s=>({title:String(s.title||''),key:String(s.key||''),open:Array.isArray(s.open)?s.open:[]}))}));
  return []; }
function jamLines(part,polite){ const l=openJams().flatMap(j=>j.songs.filter(s=>s.open.length).map(s=>({j,s}))); if(!l.length)return [];
  const mine=part?l.filter(x=>x.s.open.includes(part)):[], {j,s}=anyOf(mine.length?mine:l), when=j.when?`(${j.when})`:'', key=s.key?` 키는 ${s.key}.`:'';
  if(mine.length) return [`${j.title}${when}에 ${s.title} ${part} 자리가 비었더라. 나 갈까 말까….`,`${s.title}에 ${iga(part)} 없대. 이건 내 차례 아냐?${key}`];
  const p=anyOf(s.open); if(polite) return [`${j.title}${when}에 ${s.title} ${p} 자리가 비었대요. 푸른방 게시판에 있어요.`,`${s.title} 잼을 한대요.${key} ${p} 구한다던데요.`];
  return [`${j.title}${when}에 ${s.title} ${p} 자리가 비었대. 너 해 볼래? 푸른방 게시판에 있어.`,`${s.title} 잼 한대.${key} ${p} 구한다던데.`]; }

/* 재즈 거장 생일: 앞뒤 사흘 */
const BDAY=[[4,12,'허비 행콕','Watermelon Man'],[4,22,'찰스 밍거스','Goodbye Pork Pie Hat'],[4,25,'엘라 피츠제럴드','How High the Moon'],[4,29,'듀크 엘링턴','Take the "A" Train'],
  [5,26,'마일스 데이비스','So What'],[8,16,'빌 에반스','Waltz for Debby'],[8,29,'찰리 파커','Ornithology'],[9,7,'소니 롤린스','St. Thomas'],[9,23,'존 콜트레인','Giant Steps'],
  [10,10,'텔로니어스 몽크',"'Round Midnight"],[10,21,'디지 길레스피','A Night in Tunisia'],[12,23,'쳇 베이커','My Funny Valentine']];
function bdayLines(polite){ const now=kstNow(), y=now.getUTCFullYear(), t=dayNum(now), l=[];
  for(const [m,d,who,song] of BDAY) for(const yy of [y-1,y,y+1]){ const off=Math.floor(Date.UTC(yy,m-1,d)/864e5)-t; if(Math.abs(off)>3)continue;
    l.push(polite?(off===0?`오늘이 ${who} 생일이래요. 하루 종일 ${song} 틀어 둘게요.`:off>0?`${m}월 ${d}일이 ${who} 생일이래요. 그날은 ${song}부터 틀려고요.`:`며칠 전이 ${who} 생일이었대요. 요즘도 ${song} 자주 틀어요.`)
      :(off===0?`오늘 ${who} 생일이야! 하루 종일 ${song}만 들을 거야.`:off>0?`${m}월 ${d}일이 ${who} 생일이야. 그날 잼 첫 곡은 ${song}.`:`며칠 전이 ${who} 생일이었어. 아직 ${song} 반복 재생 중.`)); }
  return l; }

/* 계절과 학사 일정 (대략) */
function seasonLines(role,polite){ const [m,d]=md(kstNow()), n=m*100+d, l=[], dark=typeof night!=='undefined'&&night;
  if(polite&&role==='바리스타'){
    if(dark) l.push("밤에는 볼륨을 조금 낮춰요. 'Round Midnight 시간이니까요.");
    if(n>=1201&&n<=1225) l.push('12월엔 Christmas Time Is Here를 자주 틀어요. 손님들이 좋아하시더라고요.');
    if(m===12||m<=2) l.push('추운 날엔 따뜻한 라떼에 발라드가 어울려요.');
    if(m>=9&&m<=11) l.push('가을엔 Autumn Leaves 신청이 제일 많아요.');
    if(m>=6&&m<=8) l.push('더운 날엔 보사노바를 틀어요. Wave 같은 곡이요.');
    if(m>=3&&m<=5) l.push('봄엔 창문 열고 It Might as Well Be Spring을 틀어요.');
    return l; }
  if(polite){
    if(dark) l.push('밤에 오면 2층 불빛이 참 따뜻해요.');
    if(m===12||m<=2) l.push('추운 날엔 따뜻한 차 한 잔 시켜 놓고 오래 앉아 있어요.');
    if(m>=9&&m<=11) l.push('가을엔 창가 자리에서 발라드 듣는 게 좋아요.');
    if(m>=6&&m<=8) l.push('여름엔 시원한 거 시켜 놓고 보사노바 들어요.');
    if(m>=3&&m<=5) l.push('봄엔 창문을 열어 두면 골목 소리가 같이 들어와요.');
    return l; }
  if(role==='주민'){
    if(dark) l.push('밤이 되면 골목에 색소폰 소리가 더 멀리 퍼져.');
    if(m===12||m<=2) l.push('추워지니까 가게 라디오도 캐럴 재즈만 나와.');
    if(m>=9&&m<=11) l.push('은행잎 쓸다 보면 라디오에서 Autumn Leaves가 꼭 나와.');
    if(m>=6&&m<=8) l.push('여름 밤엔 골목에서 보사노바 소리가 들려.');
    if(m>=3&&m<=5) l.push('봄엔 성균관 앞 산책길이 제일 좋아.');
    return l; }
  if(dark) l.push("밤엔 템포를 반으로 내려. 'Round Midnight 시간이잖아.",'밤 골목은 리버브가 길어. 롱톤 불기 딱 좋아.');
  if(n>=1201&&n<=1225) l.push('크리스마스 다가오니까 다들 Christmas Time Is Here만 쳐. 빈스 과랄디 만세.','My Favorite Things가 캐럴이냐 재즈냐, 올해도 동방에서 싸움 났어.');
  if(n>=1226) l.push('연말엔 Auld Lang Syne도 스윙으로 쳐 줘야지.');
  if(m<=2) l.push('방학 목표는 하루 한 곡 솔로 카피. 오늘도 실패.','추워서 손이 굳어. 스케일 열 번 돌리고 나서야 손가락이 풀려.');
  if((n>=301&&n<=320)||(n>=901&&n<=920)) l.push('개강했다! 신입 부원 오면 Blue Bossa부터 같이 하자.','새 학기엔 리얼북부터 새로 사고 싶어지지.');
  if((n>=415&&n<=426)||(n>=1015&&n<=1026)||(n>=608&&n<=620)||(n>=1208&&n<=1220)) l.push('시험 기간이라 연습실이 텅 비었어…. 지금이 기회야.','공부하다 막히면 Kind of Blue 한 바퀴. 이게 내 휴식이야.');
  if(n>=427&&n<=430) l.push('4월 30일은 유네스코가 정한 세계 재즈의 날이야. 그날은 뭐라도 연주해야 해.');
  if(m===5) l.push('5월은 축제에 재즈 페스티벌까지 겹쳐서 주말이 모자라.');
  if(m===10) l.push('10월만 되면 자라섬 재즈 페스티벌 생각뿐이야. 가평 가는 기차 같이 탈래?');
  if(m===9||m===10||m===11) l.push('가을엔 Autumn Leaves 금지령 내려야 해. 잼마다 세 번씩 나와.','쌀쌀해지니까 발라드가 당겨. 오늘은 쳇 베이커 버전 My Funny Valentine.');
  if(m>=6&&m<=8) l.push('더울 땐 보사노바지. Wave 한 곡이면 에어컨 필요 없어.','여름엔 Summertime을 꼭 한 번은 하게 돼. 거슈윈이 만든 오페라 노래야.');
  if(m>=3&&m<=5) l.push('봄엔 It Might as Well Be Spring. 제목부터 설레.');
  return l; }

/* 부원이 올린 추천곡 (로그인했을 때만 보인다. 예시 곡은 말하지 않는다) */
function recLines(){ const r=db.recs&&db.recs.length&&!db.sample?anyOf(db.recs.slice(0,30)):null; if(!r)return [];
  return [`요즘 추천곡에 ${r.title} 올라왔더라. ${r.artist}… 취향 좋다.`,`턴테이블에 ${r.title} 걸려 있던데, 누가 올린 거야? 한 번 더 듣고 싶어.`]; }

/* 화제가 없을 때 꺼내는 재즈 이야기 */
const TRIVIA=["'Round Midnight 앞의 따옴표는 Around가 줄어든 거야. 몽크는 제목까지 멋있어.",
  '블루노트 재킷은 사진이랑 글자 배치만 봐도 어느 레이블인지 알겠더라.',
  '빌 에반스 트리오에서 스콧 라파로 베이스 들어 봐. 베이스가 반주만 하는 악기가 아니야.',
  '스탠더드는 원래 뮤지컬이나 영화 노래였던 게 많아. 가사를 알면 솔로가 달라져.',
  '찰리 파커는 Cherokee 코드 위에서 놀다가 비밥의 실마리를 찾았대.'];

/* 지금 화제 한 줄. 후보를 모아 직전과 다른 걸 고른다. 행사가 가까울수록 더 자주 나온다 */
function topical(n,v){ const {role,part,polite}=v, e=nextEvent(), pool=[], add=(l,w=1)=>{ for(let i=0;i<w;i++)pool.push(...l); };
  add(eventLines(role,polite), e?(e.left<=7?6:3):0);
  if(polite){ if(role==='바리스타')add(jamLines(null,true)); }
  else if(role!=='주민'){ add(jamLines(part),2); add(recLines()); add(TRIVIA); }
  add(bdayLines(polite),2); add(seasonLines(role,polite));
  return pool.length?fresh(n,'t',pool):null; }

/* 인물별 대사 */
const VOICE={
  sax:{role:'색소폰',part:'색소폰',lines:[
    '이 은행나무 밑에서 불면 소리가 노랗게 번져.',
    'Giant Steps 체인지는 아직도 손가락이 길을 잃어. 장3도씩 도는 게 문제야.',
    '테너는 롤린스파야, 게츠파야? 나는 둘 다. 그날 날씨 따라.',
    'Body and Soul은 1939년 콜먼 호킨스 녹음부터 들어 봐. 멜로디를 거의 다 바꿔서 불어.',
    'Blue Bossa 솔로에서 Cm에서 D♭으로 넘어가는 그 순간이 제일 좋아.',
    '오늘은 덱스터 고든처럼 박자 뒤에 느긋하게 기대서 불어 보는 중이야.'],
    guide:['잼은 성균관로 골목의 낫컴플리트에서 열려. 2층이야.']},
  vocal:{role:'보컬',part:'보컬',lines:[
    '금잔디에 누워 있으면 허밍이 절로 나와.',
    '엘라의 Ella in Berlin 들어 봤어? How High the Moon 스캣은 거의 트럼펫이야.',
    '빌리 홀리데이는 박자 뒤에 살짝 기대서 불러. 그 레이백 따라 하다 보면 하루가 가.',
    '보컬한테 키 먼저 물어봐 주는 반주자가 제일 멋있어.',
    '스캣할 때 늘 두비두바만 하지 말고 음절을 바꿔 봐. 소리 색이 달라져.',
    'Misty 가사 외우다가 여기서 잠들었어. 에롤 가너가 비행기에서 떠올린 멜로디래.'],
    guide:['보컬 자리 빈 잼, 게시판에서 찾아봐.','바로 옆 광장 게시판엔 공연 소식이 붙어. 출연하고 싶으면 거기서 신청해.']},
  drum:{role:'드럼',part:'드럼',lines:[
    '라이드 심벌 레가토만 한 시간 쳤어. 칭- 칭가- 칭가-.',
    '토니 윌리엄스가 마일스 밴드에 들어갔을 때 열일곱이었대. 난 열일곱에 뭐 했지….',
    '하이햇은 2랑 4. 이것만 지켜도 잼에서 미움 안 받아.',
    '아트 블레이키 프레스 롤 들으면 심장이 같이 굴러.',
    'Take Five는 5/4박자야. 조 모렐로 솔로 박자 세다가 포기하지 마.',
    '4마디 트레이드 할 때 멜로디를 생각하면서 쳐 봐. 드럼도 노래해.'],
    guide:['낫컴플리트 무대에 올라가면 바로 잼을 시작할 수 있어.','내 자리를 신청하고 A부터 K까지 눌러 봐!']},
  member:{role:'부원',part:null,lines:[
    '동방 턴테이블에 Kind of Blue 걸어 두면 다들 말이 없어져.',
    '리얼북 코드 그대로 믿지 마. 판마다 조금씩 달라.',
    'ii–V–I만 연습했더니 신호등도 투파이브원으로 보여.',
    '첫 잼 곡은 블루스가 최고야. 12마디만 알면 누구랑도 할 수 있어.'],
    guide:['푸른방은 학생회관 103호! 파란 문을 찾아와.','어디서든 R을 누르면 푸른방으로 돌아갈 수 있어.','공지랑 공연 소식은 금잔디광장 게시판에 붙어.']},
  student:{role:'부원',part:null,lines:[
    '중도에서 공부하는데 이어폰에서 Moanin\' 나오니까 고개가 저절로 끄덕여져.',
    '빌 에반스 Sunday at the Village Vanguard는 잔 부딪히는 소리까지 음악이야.',
    '모달 재즈가 뭐냐고? 코드를 바꾸는 대신 한 스케일 위에서 오래 노는 거.',
    '하드밥 입문은 아트 블레이키 Moanin\' 앨범. 반박 안 받아.',
    '몽크는 틀린 음 같은데, 다시 들으면 그게 정답이야.',
    '랜덤 재생에 웨인 쇼터 Footprints가 나왔어. 오늘 운 다 썼다.',
    '600주년기념관 가는 오르막은 템포 240 비밥이야. 숨이 차.',
    'All the Things You Are가 왜 스탠더드 중의 스탠더드인지 잼 가 보면 알아.',
    '중고 LP 가게에서 블루노트 재킷만 보면 지갑이 열려.',
    '대명거리에서 저녁 먹고 낫컴플리트 갈래? 잼 있는 날엔 2층이 시끌벅적해.',
    '스쿠터 탄 유령이네? 부츠가 멋지다!']},
  resident:{role:'주민',part:null,lines:[
    '우리 가게 라디오는 늘 재즈 채널이야. 손님들이 오래 앉아 있거든.',
    '밤에 골목에서 학생들이 두비두바 하던데, 그게 재즈야?',
    '젊을 땐 나도 LP 모았지. 그때는 재킷 보고 골랐어.',
    '대성전 앞은 언제 와도 조용해서 좋아.',
    '낫컴플리트 2층에서 색소폰 소리 나면 장사가 잘돼.',
    '스쿠터 탄 유령이네? 부츠가 멋지다!']},
  ghost:{role:'유령',part:null,lines:[
    '…오늘 턴테이블엔 뭘 걸까. 너무 신나는 건 말고.',
    '나는 쳇 베이커 목소리가 좋아. 유령끼리 통하는 데가 있거든.',
    '방명록에 한 줄 남겨 줘. 읽는 게 내 낙이야.'],
    guide:['…어서 와. 여기는 Groov의 푸른방이야.','나는 그냥 여기 있는 유령이야. 이름은 묻지 말아 줘.','턴테이블은 추천곡, 게시판은 잼 세션이야. 파란 문을 열면 각자의 방으로 갈 수 있어.','잼을 하고 싶으면 낫컴플리트로 가 봐.']},
  barista:{role:'바리스타',part:null,polite:true,lines:[
    '2층까지 올라오셨네요. 따뜻한 거 드릴까요?',
    '오늘 원두는 쳇 베이커 같은 맛이에요. 쓸쓸하고 부드럽게.',
    '이 스피커로 Kind of Blue 틀면 손님들이 주문을 잊어요.',
    '무대는 저쪽이에요. 편하게 연주하세요. 컵은 앰프 위에 두지 말고요.']},
  guest:{role:'손님',part:null,polite:true,lines:[
    '여긴 조용해서 책 읽기도 좋아요. 잼이 시작되기 전까진요.',
    '잼이 시작되면 책은 덮어요. 4마디 트레이드는 놓칠 수 없죠.',
    '지난번 누가 Autumn Leaves를 보사노바로 하던데, 그것도 좋더라고요.']}};

/* 말을 건 횟수에 따라: 처음엔 안내, 그다음부터는 수다와 화제 */
function npcTalk(kind){ const v=VOICE[kind]; return n=>{ n.talks=(n.talks||0)+1;
  if(kind==='ghost'&&typeof ghostNews==='function'){ const g=ghostNews(true); if(g){ n.onDone=g.done; return g.lines; } }   // 새 소식이 있으면 그것부터
  if(v.guide&&n.talks===1) return kind==='ghost'?v.guide:[fresh(n,'l',v.lines),...v.guide];
  const out=[fresh(n,'l',v.lines)], t=topical(n,v); if(t)out.push(t);
  else if(v.guide&&Math.random()<.5) out.push(fresh(n,'g',v.guide));
  return out; }; }
