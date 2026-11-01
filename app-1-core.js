const ic=(n,s=22,c='currentColor')=>`<svg width="${s}" height="${s}" viewBox="0 0 256 256" fill="${c}" aria-hidden="true" style="flex:none;display:block;color:${c}">${A.PH[n]||''}</svg>`;
const px=(n,s=40,extra='')=>A.PX[n].replace('<svg ',`<svg class="px" width="${s}" height="${s}" style="${extra}" aria-hidden="true" `);
const av=(k,s=40,bg='#FFF3CC')=>`<div style="width:${s}px;height:${s}px;border-radius:${s/4}px;background:${bg};display:flex;align-items:center;justify-content:center;flex:none">${px('av'+k,s*0.86)}</div>`;
const $=s=>document.querySelector(s);
const img=(k,w=40,_x='',h)=>`<img src="${PHOTO[k]}" alt="" style="width:${w}px;height:${h||w}px;object-fit:cover;border-radius:${w>60?12:8}px;display:block;flex:none">`;

/* ---------- one source of truth for names, items and dates ---------- */
const D={
  today:'Fri 30 Oct',
  peter:{name:'Peter M.',av:'01',bg:'#FFF3CC',area:'Neukölln'},
  lena:{name:'Lena K.',av:'06',bg:'#F6E6E2',area:'Friedrichshain'},
  title:'Kitchen essentials set'
};
const BASE=[
 {k:'pot',px:'pot',short:'Pot',name:'Cooking pot',qty:1,cond:'Good · small scratch'},
 {k:'pan',px:'frying_pan',short:'Pan',name:'Non-stick pan',qty:1,cond:'Very good'},
 {k:'plates',px:'plates',short:'Plates',name:'Dinner plates',qty:4,cond:'Good'},
 {k:'mug',px:'mug',short:'Mugs',name:'Coffee mugs',qty:2,cond:'Clean'},
 {k:'cutlery',px:'cutlery',short:'Cutlery',name:'Cutlery set',qty:6,cond:'Forks & spoons'}];
let ITEMS=BASE.slice();
const MAXQ=16;
const pieces=()=>ITEMS.reduce((a,b)=>a+b.qty,0);
let S;
function reset(){S={role:null,screen:'cover',published:false,cutleryOk:false,items:BASE.map(i=>({...i})),qty:Object.fromEntries(BASE.map(i=>[i.k,i.qty])),editing:null,eq:1,lastRemoved:null,draftStep:'p-review',chosen:null,typing:false,custom:null,pickOpen:false,pDay:null,pTime:null,room:'kitchen',purpose:'cooking',bundle:'flexible',
  title:D.title,deadline:'until',place:'nearby',times:new Set(['Afternoons','Weekends']),agree:false,
  pick:new Set(['pot','plates','cutlery']),offered:null,offerSel:new Set(['a','b','c']),slot:'ask',note:'Hi Peter, I’d love these for my first flat! I’ll bring a bag.',requested:false,
  saved:new Set(),draft:false,planned:false,got:new Set(),given:new Set(),stage:null,lenaTyping:false,done:false,fromOpt:null,fromDate:'',untilOpt:null,untilDate:'',plans:[],invSel:new Set(),invRoom:'all',planIx:0,notif:{msg:true,remind:true,nearby:false},overlay:null,toast:null,history:[]};}
reset();
/* dates: everything comes from the two choices Peter makes in the Pickup step */
const TODAY=new Date(2026,9,30);
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const fmt=d=>`${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
const toIso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fromIso=v=>{if(!v)return null;const [y,m,dd]=v.split('-').map(Number);return new Date(y,m-1,dd);};
const winStart=()=>fromIso(S.fromDate);
const winEnd=st=>{if(!st)return null;const o=S.untilOpt;return o==='1w'?addD(st,7):o==='2w'?addD(st,14):o==='1m'?(()=>{const x=new Date(st);x.setMonth(x.getMonth()+1);return x;})():o==='date'?fromIso(S.untilDate):null;};
const winEnd2=(st,o)=>o==='1w'?addD(st,7):o==='2w'?addD(st,14):(()=>{const x=new Date(st);x.setMonth(x.getMonth()+1);return x;})();
const winOk=()=>{const a=winStart(),b=winEnd(a);return !!(a&&b&&b>=a);};
const win=()=>winOk()?{start:winStart(),end:winEnd(winStart())}:{start:new Date(2026,10,20),end:new Date(2026,10,30)};
const pDays=()=>{const w=win();let d=w.start>TODAY?new Date(w.start):addD(TODAY,1);if(d>w.end)d=new Date(w.end);const out=[];while(d<=w.end&&out.length<42){out.push(new Date(d));d=addD(d,1);}return out.length?out:[new Date(w.end)];};
const day1=()=>pDays()[0],day2=()=>pDays()[Math.min(1,pDays().length-1)];
Object.defineProperty(D,'from',{get(){return fmt(win().start);}});
Object.defineProperty(D,'until',{get(){return fmt(win().end);}});
Object.defineProperty(D,'window',{get(){return `${fmt(win().start)} – ${fmt(win().end)}`;}});
Object.defineProperty(D,'ask',{get(){return {day:fmt(day1()),time:'afternoon',place:'Hermannplatz · U8 exit'};}});
Object.defineProperty(D,'slots',{get(){return [['a',day1(),'14:00'],['b',day1(),'16:00'],['c',day2(),'11:00']].map(([id,d,t])=>({id,day:fmt(d),time:t,label:`${fmt(d)} · ${t}`,place:'Hermannplatz · U8 exit'}));}});
const picked=()=>ITEMS.filter(i=>S.pick.has(i.k));
const pickedNames=()=>picked().map(i=>i.name).join(', ');
const placeLbl=()=>S.place==='nearby'?'Hermannplatz · U8 exit':'Peter’s place · address in chat';
const placeShort=()=>S.place==='nearby'?'Hermannplatz':'Peter’s place';
const TIMES=['10:00','12:00','14:00','16:00','18:00'];
const chosen=()=>{const x=S.chosen==='custom'?S.custom:D.slots.find(y=>y.id===S.chosen);return x?{...x,place:placeLbl()}:null;};
const reqAsk=()=>S.slot==='other'?{day:fmt(day2()),time:'morning',place:D.ask.place}:D.ask;
const slot=()=>chosen()||reqAsk();
const given=()=>ITEMS.filter(i=>S.given.has(i.k));
const left=()=>ITEMS.filter(i=>!S.given.has(i.k));
const samItem=()=>{const r=ITEMS.filter(i=>!S.pick.has(i.k));return r.find(i=>i.k==='mug')||r[0];};
const syncItems=()=>{ITEMS=S.items.filter(i=>!i.removed).map(i=>({...i,qty:S.qty[i.k]}));if(S.bundle==='all')S.pick=new Set(ITEMS.map(i=>i.k));};
const allIn=()=>S.bundle==='all';

/* ---------- shared building blocks ---------- */
const sb=(dark)=>`<div class="sb${dark?' dark':''}"><span>9:41</span><span><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="24" height="12" viewBox="0 0 24 12"><rect x=".5" y=".5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><rect x="21.5" y="4" width="1.5" height="4" rx=".7" fill="currentColor" opacity=".5"/></svg></span></div>`;
const head=(t,{back='back',right='',step=''}={})=>`<div class="hd">${back?`<button class="circ" data-a="${back}" aria-label="Back">${ic('arrow-left',18)}</button>`:''}${step?`<div class="step">${step}</div>`:`<h1>${t}</h1>`}${right}</div>`;
const exitBtn=`<button class="exit" data-a="exitFlow">Exit ${ic('x',13)}</button>`;
const prog=(k,n=5)=>`<div class="prog">${Array.from({length:n},(_,i)=>`<i class="${i<k?'on':''}"></i>`).join('')}</div>`;
const nav=(on)=>{const t=[['discover','magnifying-glass','Discover'],['home','cube','Dashboard'],null,['messages','chat-circle','Messages'],['profile','user','Profile']];
  const unread=(S.role==='peter'&&S.published&&!S.chosen)||(S.role==='lena'&&S.requested&&!S.chosen)?1:0;
  return `<nav class="nav" aria-label="Main">${t.map(x=>x?`<button class="${on===x[0]?'on':''}" data-a="tab:${x[0]}">${ic(x[1],22)}${x[2]}${x[0]==='messages'&&unread?'<span class="badge">1</span>':''}</button>`:`<button data-a="create" aria-label="Create">${'<span class="fab">'+ic('plus',24)+'</span>'}</button>`).join('')}</nav>`;};
const scene=(h=200,label=true)=>`<div class="scene" style="height:${h}px"><img src="${PHOTO.scene}" alt="Peter’s photo of the kitchen items on a table" style="width:100%;height:100%;object-fit:cover;display:block">${label?'<span class="lbl">Peter’s photo</span>':''}</div>`;
const hero=(sc=1)=>`<div style="position:relative;width:${96*sc}px;height:${84*sc}px;flex:none">${[['cutlery',51,0,33],['pot',4,3,46],['frying_pan',38,32,36],['plates',0,41,35],['mug',65,41,28]].map(([n,x,y,s])=>px(n,s*sc,`position:absolute;left:${x*sc}px;top:${y*sc}px`)).join('')}</div>`;
const fact=(i,l,v,h)=>`<div class="fact"><div class="fi">${ic(i,18)}</div><div style="min-width:0"><div class="lb">${l}</div><div class="v">${v}</div>${h?`<div class="lb">${h}</div>`:''}</div></div>`;
const bundleCard=(edit)=>`<div class="bcard"><div class="bhead"><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;align-items:flex-start">
 <span class="tag t-navy">${S.bundle==='flexible'?'BUNDLE · FLEXIBLE':'BUNDLE · ALL IN ONE'}</span><div class="h2" style="font-size:18px">${S.title}</div>
 <div class="row" style="gap:6px;font-size:12.5px;font-weight:600">${px('room_kitchen',16)}Kitchen</div><div class="row" style="gap:6px;font-size:12.5px;font-weight:600">${px('purpose_cooking_dining',16)}Cooking &amp; Dining</div></div>${img('scene',96,'',96)}</div>
 <div style="padding:14px 4px 0"><div class="row" style="justify-content:space-between"><b style="font-family:var(--f-head);font-weight:600">${ITEMS.length} items in this bundle</b><span class="lb">${pieces()} pieces${edit?' · <button data-a="go:p-check" style="color:var(--teal-d);font-weight:700">Edit</button>':''}</span></div>
 <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px">${ITEMS.map(i=>`<div class="tile">${img(i.k,28)}${i.short}<span class="qty">×${S.qty[i.k]}</span></div>`).join('')}</div>
 <div style="margin-top:12px;border-top:1px solid var(--line)">${fact('map-pin','Pickup area (approx.)',S.place==='nearby'?'Neukölln · near Hermannplatz':'Neukölln · at Peter’s place','Exact spot shared after you both confirm')}${fact('calendar-blank','Pickup window',D.window,'Exact time agreed in the chat')}${fact('clock','Usually available',[...S.times].join(' & ')||'Any time')}</div></div></div>`;
const reqCard=(st)=>`<div class="card" style="padding:12px 14px"><div class="row" style="justify-content:space-between"><b style="font-size:14px">${S.role==='peter'?'Lena’s request':'Your request'}</b><span class="tag ${st==='PENDING'?'t-pend':'t-ok'}">${st}</span></div>
 <div class="row" style="gap:6px;margin-top:8px">${picked().map(i=>`<div style="background:var(--soft);border-radius:8px;padding:3px">${img(i.k,24)}</div>`).join('')}<span class="lb" style="margin-left:4px">${pickedNames()}</span></div>
 <div class="lb" style="margin-top:8px">${ic('calendar-blank',13,'#5C6B7A').replace('display:block','display:inline-block;vertical-align:-2px')} ${S.chosen?`${slot().day} · ${slot().time} · ${placeShort()}`:'Pickup time: agree in the chat'}</div></div>`;
