/* ===== Cabinet 업데이트 소식 =====
   배포하거나 기능을 추가하면 UPDATES 맨 위에 한 항목을 더한다.
   - id: 배포한 날짜 'YYYY-MM-DD' (같은 날 두 번이면 'YYYY-MM-DD-2'). 새 항목일수록 큰 값이어야 한다.
   - title: 한 줄 제목, lines: 유령이 읽어 줄 짧은 문장 1~3개 (존댓말)
   어디서 보이나: 금잔디광장 게시판의 '업데이트' 탭(누구나), 부원의 '새 소식' 창(안 본 것만),
   둘러보는 손님에게는 게임을 시작할 때 익명의 유령이 읽어 준다. 본 기록은 기기마다(localStorage) 남는다. */
const UPDATES=[
  { id:'2026-11-27-2', title:'게시판에서 업데이트 소식을 볼 수 있어요', lines:[
    '금잔디광장 게시판에 ‘업데이트’ 탭이 생겼어요. Cabinet에 새로 생긴 것들이 여기에 모여요.',
    '부원은 익명의 유령이 모아 주는 새 소식에서도 업데이트를 함께 볼 수 있어요.'] },
  { id:'2026-11-27', title:'정문 앞에 건강한 빵집이 생겼어요', lines:[
    '곰 제빵사, 다람쥐 단골, 빵 봉투 든 강아지를 만나 보세요.',
    '바게트앙, 소프트앙, 무화과 타르트가 메뉴에 올랐어요.',
    '휴대폰에서도 벽에 걸린 메뉴판과 게시판을 눌러 볼 수 있어요.'] },
];
const UPD_KEY='cabinet.updates.seen';
/* 처음 온 기기는 최근 2주 소식만 알려 준다 */
function updSeen(){ try{ const v=localStorage.getItem(UPD_KEY); if(v)return v; }catch(e){} return new Date(Date.now()-14*864e5).toISOString().slice(0,10); }
const freshUpdates=()=>{ const s=updSeen(); return UPDATES.filter(u=>u.id>s); };
/* 유령이 알려 주거나 새 소식 창에서 본 것으로 쳐도, 게시판 탭을 처음 열 때까지는 NEW 도장을 남긴다 */
let updBefore=null;
function markUpdates(){ if(updBefore===null)updBefore=updSeen(); try{ if(UPDATES[0])localStorage.setItem(UPD_KEY,UPDATES[0].id); }catch(e){} }
const updDate=id=>{ const [,m,d]=id.split('-').map(Number); return `${m}월 ${d}일`; };
/* 게시판 '업데이트' 탭의 카드. 보여 준 뒤에는 본 것으로 친다 */
function updateCards(){ markUpdates(); const s=updBefore; updBefore=null; if(typeof hudAcct==='function')hudAcct();
  return UPDATES.length?UPDATES.map(u=>el('article',{cls:'card notice'},el('div',{cls:'grow'},el('div',{cls:'ttl',textContent:u.title}),sub(`Cabinet 업데이트 · ${updDate(u.id)}`),el('div',{cls:'letter',textContent:u.lines.join('\n')})),u.id>s?el('span',{cls:'stamp',textContent:'NEW'}):null)):[empty('아직 업데이트 소식이 없어요.')]; }
const openUpdates=()=>openPlaza('update');
/* 안 본 소식이 있으면 유령이 읽어 주고, 다 들으면 next 로 이어 간다 */
function tellUpdates(next){ const f=freshUpdates(); if(!f.length){ next&&next(); return; }
  const L=[`…Cabinet에 새 소식이 있어. ‘${f[0].title}’.`,...f[0].lines];
  if(f.length>1)L.push(`그 밖에 ${f.length-1}개 더 있어. 금잔디광장 게시판의 ‘업데이트’ 탭에서 볼 수 있어.`);
  markUpdates(); say('익명의 유령',L,()=>{ next&&setTimeout(next,0); }); }
