/* ===== 광장(공지·공연·지난 공연), 편지, 공연 초대장, 가입 초대장 =====
   권한은 서버(데이터베이스)가 막고, 여기서는 보여 주고 안내만 한다.
   공지는 리더만, 공연은 부원 누구나. 편지는 보낸 사람과 받는 사람만 읽는다. */
const CAST_PARTS=[...PARTS,'트럼펫','트롬본','기타 악기','스태프'];
const DOW='일월화수목금토';
const todayStr=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);   // 한국 날짜
const fmtDate=d=>{ const [y,m,dd]=String(d).split('-').map(Number); if(!dd)return String(d||''); return `${m}월 ${dd}일 (${DOW[new Date(Date.UTC(y,m-1,dd)).getUTCDay()]})`; };
const fmtAt=t=>{ const d=new Date(new Date(t).getTime()+9*3600e3); return `${d.getUTCMonth()+1}.${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`; };
const lines_=(v,max,len)=>v.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,max).map(x=>x.slice(0,len));
const baseUrl=()=>location.origin+location.pathname;
const plazaOff=()=>cloud.noPlaza?el('div',{cls:'warn',textContent:'광장과 편지는 서버 준비가 끝나면 열려요.'}):null;
async function copyText(t,msg){ try{ await navigator.clipboard.writeText(t); msg.textContent='복사했어요.'; }catch(e){ msg.textContent='복사하지 못했어요. 길게 눌러 직접 복사해 주세요.'; } }

/* NPC 가 이야기할 다가올 공연: 부원은 광장의 공연, 방문자는 초대장이 있는 공연 */
function plazaEvents(){ const l=cloud.member&&db.shows?db.shows.map(s=>({name:s.title,date:s.date,place:s.place,time:s.time})):(cloud.pubShows||[]).map(s=>({name:String(s.title||''),date:String(s.date||''),place:String(s.place||''),time:String(s.time||'')}));
  return l.filter(e=>e.name&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)); }

/* ---------- 광장 ---------- */
const plaza={tab:'notice'};
function openPlaza(tab){ if(tab)plaza.tab=tab; const T_=[['notice','공지'],['show','공연'],['past','지난 공연']];
  const tabs=el('div',{cls:'tabs',role:'tablist'},...T_.map(([k,t])=>el('button',{cls:'tab'+(plaza.tab===k?' on':''),type:'button',role:'tab',textContent:t,onclick:()=>openPlaza(k)})));
  if(!cloud.member){ const pubs=cloud.pubShows||[];
    show('Groov 광장',tabs,el('div',{cls:'gate'},el('span',{textContent:plaza.tab==='show'?'둘러보기: 초대장이 있는 공연만 이름 없이 보여요.':'공지와 지난 공연은 승인받은 부원만 볼 수 있어요.'}),btn('로그인',()=>needLogin(()=>openPlaza()))),
      ...(plaza.tab==='show'?(pubs.length?pubs.map(s=>el('article',{cls:'card'},el('div',{cls:'grow'},el('div',{cls:'ttl',textContent:String(s.title||'')}),sub(`${fmtDate(s.date)} ${String(s.time||'')} · ${String(s.place||'')}`)),el('span',{cls:'stamp',textContent:'공연'}))):[empty('지금 밖에 알린 공연이 없어요.')]):[]));
    return; }
  const today=todayStr(), shows=db.shows||[], up=shows.filter(s=>s.date>=today).sort((a,b)=>a.date<b.date?-1:1), past=shows.filter(s=>s.date<today);
  const body_=plaza.tab==='notice'?noticeList():plaza.tab==='show'?(up.length?up.map(showCard):[empty('다가올 공연이 없어요. 공연을 올려 보세요.')]):(past.length?past.map(showCard):[empty('아직 지난 공연 기록이 없어요.')]);
  const add=plaza.tab==='notice'?(cloud.leader?btn('공지 쓰기',()=>openNoticeForm()):null):plaza.tab==='show'?btn('공연 올리기',()=>openShowForm()):null;
  show('Groov 광장',tabs,plazaOff(),plaza.tab==='past'?sub('끝난 공연이 셋리스트, 출연진, 후기와 함께 남아요.'):null,acts(add,btn('우편함',()=>openMailbox()),btn('아카이브',()=>openArchive())),...body_); }

function noticeList(){ const l=db.notices||[]; if(!l.length)return [empty('아직 공지가 없어요.')];
  return l.map(n=>el('article',{cls:'card notice'+(n.pinned?' pin':'')},el('div',{cls:'grow'},el('div',{cls:'ttl',textContent:`${n.pinned?'[고정] ':''}${n.title}`}),sub(`${nm(n.by)} · ${fmtAt(n.at)}`),n.body?el('div',{cls:'letter',textContent:n.body}):null),
    cloud.leader?el('div',{cls:'side'},btn('고치기',()=>openNoticeForm(n)),btn('지우기',()=>asMember(async()=>must(await cloud.sb.from('notices').delete().eq('id',n.id)),()=>openPlaza('notice')))):null)); }

function openNoticeForm(n){ const t=input(n&&n.title,60,{required:true}),b=el('textarea',{value:n?n.body:'',maxLength:1000,rows:6}),pin=el('input',{type:'checkbox',checked:!!(n&&n.pinned)}),msg=warnBox();
  const form=el('form',{onsubmit:e=>{e.preventDefault(); const v={title:t.value.trim(),body:b.value.trim(),pinned:pin.checked}; if(!v.title){msg.textContent='제목을 적어 주세요.';return;}
    asMember(async()=>must(n?await cloud.sb.from('notices').update(v).eq('id',n.id):await cloud.sb.from('notices').insert(v)),()=>openPlaza('notice'));}},
    field('제목',t),field('내용',b),el('label',{cls:'check'},pin,el('span',{textContent:'맨 위에 고정'})),el('button',{cls:'btn',textContent:n?'고치기':'올리기'}),msg);
  show(n?'공지 고치기':'공지 쓰기',form,acts(btn('그만두기',()=>openPlaza('notice')))); }

function castLine(s){ return s.cast.length?s.cast.map(c=>`${c.part} ${nm(c.who)}`).join(' · '):'아직 출연진이 없어요'; }
function showCard(s){ const past=s.date<todayStr(), canEdit=s.mine||cloud.leader, me_=s.cast.find(c=>c.me);
  return el('article',{cls:'sheet show'},el('div',{cls:'song'},s.setlist[0]?cover({title:s.setlist[0],artist:s.title}):null,el('div',{cls:'grow'},el('div',{cls:'ttl',textContent:s.title}),sub(`${fmtDate(s.date)}${s.time?` ${s.time}`:''} · ${s.place}`),sub(`올린 사람 ${nm(s.by)}${s.token&&!past?' · 초대장 있음':''}`))),
    s.setlist.length?el('div',{cls:'chips'},...s.setlist.map(sticker)):null, s.memo?el('div',{cls:'memo',textContent:s.memo}):null, sub(`출연 ${castLine(s)}`),
    past&&s.recap?el('div',{cls:'letter',textContent:s.recap}):null, past&&s.links.length?acts(...s.links.map((u,i)=>el('a',{cls:'btn',textContent:`사진·영상 ${i+1}`,href:u,target:'_blank',rel:'noopener noreferrer'}))):null,
    acts(past?null:me_?btn('출연 취소',()=>asMember(async()=>must(await cloud.sb.from('show_cast').delete().eq('show_id',s.id).eq('user_id',cloud.uid)),()=>openPlaza())):btn('나도 출연',()=>openCastForm(s)),
      canEdit&&!past?btn(s.token?'초대장':'초대장 만들기',()=>openShowInvite(s)):null, canEdit?btn(past?'후기 남기기':'고치기',()=>openShowForm(s)):null,
      canEdit?btn('지우기',()=>openDropShow(s)):null)); }

function openCastForm(s){ const p=select(CAST_PARTS,(cloud.info&&cloud.info.part&&CAST_PARTS.includes(cloud.info.part))?cloud.info.part:PARTS[0]);
  show(`${s.title} 출연`,sub(`${fmtDate(s.date)} · ${s.place}`),el('form',{onsubmit:e=>{e.preventDefault();asMember(async()=>must(await cloud.sb.from('show_cast').insert({show_id:s.id,part:p.value})),()=>openPlaza());}},field('파트',p),el('button',{cls:'btn',textContent:'출연하기'})),acts(btn('그만두기',()=>openPlaza()))); }

function openDropShow(s){ show('공연 지우기',el('div',{cls:'warn',textContent:`‘${s.title}’을(를) 지우면 출연진과 후기도 함께 사라지고, 초대장 주소도 닫혀요.`}),acts(btn('지우기',()=>asMember(async()=>must(await cloud.sb.from('shows').delete().eq('id',s.id)),()=>openPlaza())),btn('그만두기',()=>openPlaza()))); }

function openShowForm(s){ const past=!!s&&s.date<todayStr(), t=input(s&&s.title,40,{required:true,placeholder:'예: 12월 정기공연'}), d=input(s?s.date:'',10,{type:'date',required:true}), tm=input(s&&s.time,10,{placeholder:'예: 19:00'}), pl=input(s?s.place:'낫컴플리트',40,{required:true}),
    sl=el('textarea',{value:s?s.setlist.join('\n'):'',rows:5,placeholder:'한 줄에 한 곡 (서른 곡까지)'}), mm=el('textarea',{value:s?s.memo:'',maxLength:500,rows:3,placeholder:'준비물, 리허설 시간 등 (부원만 봐요)'}),
    rc=el('textarea',{value:s?s.recap:'',maxLength:1000,rows:4,placeholder:'어땠나요? 다음에 기억할 것'}), lk=el('textarea',{value:s?s.links.join('\n'):'',rows:3,placeholder:'사진·영상 주소, 한 줄에 하나 (다섯 개까지)'}), msg=warnBox();
  const form=el('form',{onsubmit:e=>{e.preventDefault(); const links=lines_(lk.value,5,200); if(links.some(u=>!/^https?:\/\/\S+$/.test(u))){msg.textContent='사진·영상 주소는 http:// 나 https:// 로 시작해야 해요.';return;}
    const v={title:t.value.trim(),show_on:d.value,show_time:tm.value.trim(),place:pl.value.trim()||'낫컴플리트',setlist:lines_(sl.value,30,60),memo:mm.value.trim()};
    if(!v.title||!v.show_on){msg.textContent='이름과 날짜를 적어 주세요.';return;}
    asMember(async()=>must(s?await cloud.sb.from('shows').update({...v,recap:rc.value.trim(),links}).eq('id',s.id):await cloud.sb.from('shows').insert(v)),()=>openPlaza(v.show_on<todayStr()?'past':'show'));}},
    field('공연 이름',t),el('div',{cls:'three'},field('날짜',d),field('시간',tm),field('장소',pl)),field('셋리스트',sl),field('메모',mm),
    s?h2('지난 공연 기록'):null,s?sub(past?'끝난 공연의 후기와 사진·영상 주소를 남겨요.':'공연이 끝나면 여기에 후기를 남겨요.'):null,s?field('후기',rc):null,s?field('사진·영상',lk):null,
    el('button',{cls:'btn',textContent:s?'저장하기':'올리기'}),msg);
  show(s?(past?'지난 공연 기록':'공연 고치기'):'공연 올리기',s?null:sub('부원 누구나 올릴 수 있어요. 고치기와 지우기는 올린 사람과 리더만 해요.'),form,acts(btn('그만두기',()=>openPlaza(past?'past':'show')))); }

/* ---------- 공연 초대장 ---------- */
const showLink=tok=>`${baseUrl()}#show=${tok}`;
function openShowInvite(s){ const msg=warnBox(), set=on=>asMember(async()=>{ await rpc('set_show_invite',{p_show:s.id,p_on:on}); },()=>{ const n=(db.shows||[]).find(x=>x.id===s.id); n?openShowInvite(n):openPlaza('show'); });
  if(!s.token){ show('공연 초대장',sub('초대장을 만들면 주소를 받은 누구나 로그인 없이 공연 이름, 날짜, 장소, 셋리스트를 볼 수 있어요. 출연진 이름과 메모는 보이지 않아요.'),sub('초대장이 있는 공연은 동네 사람들도 이야기하게 돼요.'),acts(btn('초대장 만들기',()=>set(true)),btn('뒤로',()=>openPlaza('show')))); return; }
  const link=showLink(s.token), ta=el('textarea',{readOnly:true,value:link,rows:2,ariaLabel:'초대장 주소',onclick:()=>ta.select()});
  show('공연 초대장',inviteCard({title:s.title,date:s.date,time:s.time,place:s.place,setlist:s.setlist}),ta,msg,
    acts(navigator.share?btn('보내기',()=>navigator.share({title:`Groov 초대장 · ${s.title}`,text:`${fmtDate(s.date)} ${s.time} ${s.place}`,url:link}).catch(()=>{})):null,btn('주소 복사',()=>copyText(link,msg)),btn('달력 파일',()=>saveIcs({title:s.title,date:s.date,time:s.time,place:s.place})),btn('초대장 닫기',()=>set(false)),btn('뒤로',()=>openPlaza('show'))),
    sub('초대장 닫기를 누르면 지금 주소는 더 열리지 않아요. 다시 만들면 새 주소가 생겨요.')); }
function inviteCard(c){ const str=x=>typeof x==='string'?x:String(x??''), sl=Array.isArray(c.setlist)?c.setlist.filter(x=>typeof x==='string').slice(0,30):[];
  return el('article',{cls:'invite'},el('div',{cls:'invtop',textContent:'Groov 초대장'}),el('div',{cls:'invttl',textContent:str(c.title)}),el('div',{textContent:`${fmtDate(str(c.date))}${c.time?` ${str(c.time)}`:''}`}),el('div',{textContent:str(c.place)}),
    sl.length?el('div',{cls:'chips'},...sl.map(t=>sticker(t))):null,el('div',{cls:'sub',textContent:'성균관대 재즈 동아리 Groov'})); }
/* 달력 파일(.ics): 시간이 있으면 두 시간짜리 일정, 없으면 하루 일정 */
function saveIcs(c){ const esc=t=>String(t||'').replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n'), d=String(c.date).replace(/-/g,''), m=/^(\d{1,2}):(\d{2})$/.exec(String(c.time||'').trim());
  let when; if(m){ const u=new Date(Date.UTC(+d.slice(0,4),+d.slice(4,6)-1,+d.slice(6,8),+m[1]-9,+m[2])), f=x=>x.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z'; when=`DTSTART:${f(u)}\r\nDTEND:${f(new Date(u.getTime()+2*3600e3))}`; } else when=`DTSTART;VALUE=DATE:${d}`;
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Groov//KO','BEGIN:VEVENT',`UID:${d}-${strSeed(c.title+c.date)>>>0}@groov`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').slice(0,15)}Z`,when,`SUMMARY:${esc('Groov · '+c.title)}`,`LOCATION:${esc(c.place)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a=el('a',{href:URL.createObjectURL(new Blob([ics],{type:'text/calendar'})),download:'groov.ics'}); document.body.append(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); }
/* 주소의 #show= 로 들어온 사람: 로그인 없이 초대장을 본다 */
async function openShowFromHash(){ const m=/[#&]show=([0-9a-f]{32})/.exec(location.hash||''); if(!m||!cloud.sb)return false; let c=null; try{ c=must(await cloud.sb.rpc('show_invite',{p_token:m[1]})); }catch(e){ c=null; }
  const go=btn(title.hidden?'닫기':'Groov 둘러보기',()=>{ hide(); if(!title.hidden)return; browse(); });
  if(!c||typeof c!=='object'){ show('공연 초대장',sub('닫혔거나 없는 초대장이에요. 보낸 사람에게 새 주소를 받아 주세요.'),acts(go)); return true; }
  show('공연 초대장',inviteCard(c),c.past?el('div',{cls:'warn',textContent:'이미 끝난 공연이에요.'}):null,acts(c.past?null:btn('달력 파일',()=>saveIcs(c)),/낫컴플리트/.test(String(c.place))?btn('낫컴플리트 가는 길',()=>{ hide(); startGame(); const [x,y]=MAP.doors.nc.door; warp(world,x,y+1,3); say('낫컴플리트',['성균관로 골목의 카페, 2층이 무대예요.']); }):null,go)); return true; }

/* ---------- 편지 ---------- */
const unread=()=>cloud.member&&db.letters?db.letters.filter(l=>l.inbox&&!l.read).length:0;
const mail={box:'in'};
function openMailbox(box){ if(!cloud.member){needLogin(()=>openMailbox(box));return;} if(box)mail.box=box; const l=(db.letters||[]).filter(x=>mail.box==='in'?x.inbox:!x.inbox);
  const tabs=el('div',{cls:'tabs',role:'tablist'},...[['in',`받은 편지${unread()?` (${unread()})`:''}`],['out','보낸 편지']].map(([k,t])=>el('button',{cls:'tab'+(mail.box===k?' on':''),type:'button',role:'tab',textContent:t,onclick:()=>openMailbox(k)})));
  show('우편함',tabs,plazaOff(),sub('편지는 보낸 사람과 받는 사람만 읽어요. 리더도 볼 수 없어요.'),acts(btn('편지 쓰기',()=>openWrite())),
    ...(l.length?l.map(x=>el('article',{cls:'card'+(x.inbox&&!x.read?' new':'')},el('div',{cls:'grow'},el('div',{cls:'ttl',textContent:`${x.inbox?nm(x.from):`${nm(x.to)}에게`}${x.inbox&&!x.read?' · 새 편지':''}`}),sub(`${fmtAt(x.at)}${!x.inbox&&x.read?' · 읽음':''}`),el('div',{textContent:x.body.length>40?x.body.slice(0,40)+'…':x.body})),btn('열기',()=>openLetter(x)))):[empty(mail.box==='in'?'아직 받은 편지가 없어요.':'아직 보낸 편지가 없어요.')])); }
async function openLetter(x){ if(x.inbox&&!x.read){ try{ await rpc('read_letter',{p_id:x.id}); x.read=true; hudAcct(); }catch(e){} }
  show(x.inbox?`${nm(x.from)}의 편지`:`${nm(x.to)}에게 보낸 편지`,sub(fmtAt(x.at)),el('div',{cls:'letter paper',textContent:x.body}),
    acts(x.inbox&&x.fromId&&cloud.people.some(p=>p.id===x.fromId&&p.status==='approved')?btn('답장',()=>openWrite(x.fromId)):null,btn('편지함에서 빼기',()=>asMember(async()=>{ await rpc('drop_letter',{p_id:x.id}); },()=>openMailbox())),btn('뒤로',()=>openMailbox()))); }
function openWrite(to){ if(!cloud.member){needLogin(()=>openWrite(to));return;} const ppl=friends_(); if(!ppl.length){ show('편지 쓰기',empty('편지를 받을 수 있는 부원이 아직 없어요.'),acts(btn('뒤로',()=>openMailbox()))); return; }
  const who_=select(ppl.map(p=>[p.id,p.nick]),to||ppl[0].id,{ariaLabel:'받는 사람'}), b=el('textarea',{maxLength:1000,rows:8,required:true,placeholder:'천 자까지 쓸 수 있어요.'}), n=sub('0 / 1000'), msg=warnBox(); b.oninput=()=>{n.textContent=`${b.value.length} / 1000`;};
  const form=el('form',{onsubmit:e=>{e.preventDefault(); const v=b.value.trim(); if(!v){msg.textContent='내용을 적어 주세요.';return;} asMember(async()=>must(await cloud.sb.from('letters').insert({to_id:who_.value,body:v})),()=>{toast('편지를 보냈어요.');openMailbox('out');});}},
    field('받는 사람',who_),field('내용',b),n,el('button',{cls:'btn',textContent:'보내기'}),msg);
  show('편지 쓰기',sub('받는 사람만 읽어요. 하루 서른 통까지 보낼 수 있어요.'),form,acts(btn('그만두기',()=>openMailbox()))); }

/* ---------- 가입 초대장 ---------- */
const joinLink=code=>`${baseUrl()}#join=${code}`;
function openJoinInvites(){ if(!cloud.member){openAccount();return;} const now=Date.now(), mineJ=(cloud.joins||[]).filter(j=>j.created_by===cloud.uid), msg=warnBox();
  const state=j=>j.used_by?`${who(j.used_by)===ME?'나':nm(who(j.used_by))}님이 썼어요`:new Date(j.expires_at).getTime()<=now?'기한 지남':`${fmtAt(j.expires_at)}까지`;
  show('가입 초대장',sub('신입 부원에게 보내는 초대장이에요. 받은 사람이 가입하면 리더의 승인 화면에 누가 초대했는지 함께 보여요. 승인은 여전히 리더가 해요.'),plazaOff(),
    acts(btn('새 초대장 만들기',()=>asMember(async()=>{ const c=await rpc('make_join_invite',{}); cloud.lastJoin=c; },openJoinInvites)),btn('뒤로',openAccount)),msg,
    ...(mineJ.length?mineJ.map(j=>{ const live=!j.used_by&&new Date(j.expires_at).getTime()>now; return el('div',{cls:'row'},el('div',{cls:'grow'},el('div',{cls:'code',textContent:j.code}),sub(state(j))),live?btn('주소 복사',()=>copyText(joinLink(j.code),msg)):null,live&&navigator.share?btn('보내기',()=>navigator.share({title:'Groov 가입 초대장',text:`초대 코드 ${j.code}`,url:joinLink(j.code)}).catch(()=>{})):null); }):[empty('아직 만든 초대장이 없어요.')]),
    sub('쓰지 않은 초대장은 다섯 장까지, 2주 동안 쓸 수 있어요.')); }
/* 주소의 #join= 코드는 가입을 마칠 때까지 이 브라우저에 기억해 둔다 */
const JOIN_KEY='groov.join';
function joinCode(){ try{ return localStorage.getItem(JOIN_KEY)||''; }catch(e){ return ''; } }
function keepJoinCode(){ const m=/[#&]join=([A-Za-z0-9]{10})/.exec(location.hash||''); if(!m)return; try{ localStorage.setItem(JOIN_KEY,m[1].toUpperCase()); }catch(e){} }
async function useJoinCode(code,quiet){ if(!code)return ''; try{ const by=await rpc('use_join_invite',{p_code:code}); try{localStorage.removeItem(JOIN_KEY);}catch(e){} if(!quiet)toast(`${by}님의 초대장을 썼어요. 리더가 승인하면 들어갈 수 있어요.`); return by; }catch(e){ if(/already_used|bad_code/.test(String(e.message)))try{localStorage.removeItem(JOIN_KEY);}catch(x){} if(!quiet)toast(errMsg(e)); return ''; } }
function joinField(){ const c=input(joinCode(),10,{placeholder:'받은 초대 코드 (없으면 비워 두기)',autocapitalize:'characters',ariaLabel:'초대 코드',oninput:()=>{c.value=c.value.toUpperCase().replace(/[^A-Z0-9]/g,'');}}); return c; }

/* ---------- 금잔디광장 게시판 (월드) ---------- */
function setupPlazaBoard(){ const [x,y]=near(...placeAt('금잔디광장').map((v,i)=>v+(i?-3:4))), c=mk(24,32), g=c.getContext('2d');
  R(g,'#5d3b28',3,10,3,22); R(g,'#5d3b28',18,10,3,22); R(g,'#8a5a34',1,2,22,16); R(g,'#c08a54',1,2,22,2); R(g,'#fbfaf5',3,5,8,9); R(g,'#f0c53c',13,6,8,7); R(g,'#4658a3',4,7,6,1); R(g,'#4658a3',4,9,5,1); R(g,'#4658a3',4,11,6,1); R(g,'#c8453a',16,5,2,2);
  const img=edge(c,.4), cx=x*16+8, by=y*16+15; bucket(x,y).things.push({x:cx-12,y:by-31,img,base:by,sh:[SH.t,cx-8,by-4]}); solid[I(x,y)]=1;
  world.spots[x+','+y]={name:'광장 게시판',run:()=>openPlaza()}; addLabel('Groov 광장 게시판',cx,by-38,1); }
