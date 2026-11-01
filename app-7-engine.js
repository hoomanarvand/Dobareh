/* ---------- engine ---------- */
function go(name,replace){if(!replace&&S.screen&&S.screen!==name)S.history.push(S.screen);S.screen=name;S.overlay=null;render();}
function render(){syncItems();const app=$('#app');const r=SCR[S.screen]();
 let html=`<div class="scr" style="background:${r.bg||'var(--off)'}">${r.html}${r.nav?nav(r.nav):''}</div>`;
 if(S.overlay==='create')html+=`<div class="ov" data-a="close"><div class="sheet" data-stop><div style="width:40px;height:4px;border-radius:2px;background:#C9C3B0;margin:0 auto 16px"></div><h2 class="h1" style="font-size:20px">What do you want to do?</h2>
  <div class="gap8" style="margin-top:14px"><button class="radio" data-a="${S.role==='peter'?'go:p-photo':'toast:Giving from this account is coming soon.'}">${px('bundle_all_in_one',40)}<span style="flex:1"><b style="font-size:16px">Give things away</b><span class="lb" style="display:block">Take one photo, we list your items</span></span>${ic('caret-right',18)}</button>
  <button class="radio" data-a="${S.role==='lena'?'tab:discover':'tab:discover'}"><span style="width:40px;height:40px;border-radius:10px;background:var(--teal-l);display:flex;align-items:center;justify-content:center">${ic('magnifying-glass',22,'#1A7F7A')}</span><span style="flex:1"><b style="font-size:16px">Look for something</b><span class="lb" style="display:block">Tell us what you need</span></span>${ic('caret-right',18)}</button></div>
  <button class="link" data-a="close">Cancel</button></div></div>`;
 if(S.overlay==='edit'){const it=S.items.find(x=>x.k===S.editing);const unsure=it.k==='cutlery'&&!S.cutleryOk;
 html+=`<div class="ov" style="align-items:center"><div class="dlg" data-stop style="background:var(--off)">
 <h2 class="h1" style="font-size:20px;text-align:center">${unsure?'Check AI-unsure item':'Edit item'}</h2><p class="bd" style="text-align:center;margin-bottom:14px">${unsure?'AI could not confidently count this item. Please check.':'Change the name, quantity or condition.'}</p>
 <div class="row" style="justify-content:center;margin-bottom:12px">${img(it.k,96)}</div>
 <div class="card" style="padding:10px 14px"><label for="ename" class="lb">Item name</label><input type="text" id="ename" value="${it.name}" style="border:0;padding:4px 0;font-weight:700"></div>
 <div class="card" style="padding:10px 14px;margin-top:8px"><div class="row" style="justify-content:space-between"><span class="lb">Quantity</span><span class="mono" style="font-size:11px;color:var(--teal-d)">Limit: ${MAXQ}</span></div>
  <div class="row" style="justify-content:space-between;margin-top:6px"><button class="step-btn" aria-label="Fewer" data-a="eq:-1" ${S.eq<=1?'disabled style="opacity:.4"':''}>${ic('minus',14)}</button><b style="font-size:18px">${S.eq}</b><button class="step-btn" aria-label="More" data-a="eq:1" ${S.eq>=MAXQ?'disabled style="opacity:.4"':''}>${ic('plus',14)}</button></div>
  ${unsure?`<div class="lb" style="margin-top:6px">AI counted 6 (forks &amp; spoons). Some overlap in the photo.</div>`:''}</div>
 <div class="card" style="padding:10px 14px;margin-top:8px"><label for="econd" class="lb">Condition</label><input type="text" id="econd" value="${it.cond.replace(/"/g,'&quot;')}" style="border:0;padding:4px 0;font-weight:700"></div>
 <div class="row" style="gap:10px;margin-top:16px"><button class="btn" style="flex:1;height:48px;font-size:15px" data-a="saveEdit">Save changes</button><button class="btn3" style="flex:1" data-a="close">Cancel</button></div></div></div>`;}
 if(S.overlay==='exit')html+=`<div class="ov" style="align-items:center"><div class="dlg" data-stop><h2 class="h1" style="font-size:20px">Leave this offer?</h2><p class="bd">Your ${ITEMS.length} items are saved as a draft. Continue any time from your Dashboard.</p>
  <button class="btn" style="margin-top:18px" data-a="saveDraft">Save draft &amp; leave</button><button class="link" style="color:var(--navy)" data-a="close">Keep editing</button><button class="link" style="color:var(--err-d)" data-a="discard">Discard offer</button></div></div>`;
 if(S.toast)html+=`<div class="toast">${ic('info',18,'#FFD662')}<span>${S.toast}</span></div>`;
 app.innerHTML=html;const cs=$('#chatsc');if(cs)cs.scrollTop=cs.scrollHeight;
 const t=$('#title');if(t)t.oninput=e=>S.title=e.target.value||D.title;const n=$('#note');if(n)n.oninput=e=>S.note=e.target.value;const fd=$('#fromDate');if(fd)fd.onchange=e=>{S.fromDate=e.target.value;render();};const ud=$('#untilDate');if(ud)ud.onchange=e=>{S.untilDate=e.target.value;render();};}
let tt;function toast(m){S.toast=m;render();clearTimeout(tt);tt=setTimeout(()=>{S.toast=null;render()},2200);}
function later(fn,ms){setTimeout(()=>{fn();render();},ms);}
const ACT={
 back:()=>{const p=S.history.pop();S.screen=p||'home';S.overlay=null;render();},
 close:()=>{S.overlay=null;render();}, create:()=>{S.overlay='create';render();}, exitFlow:()=>{S.overlay='exit';render();},
 saveDraft:()=>{S.draft=true;S.draftStep=['p-photo','p-detect'].includes(S.screen)?'p-photo':S.screen;S.history=[];go('home',true);toast('Draft saved. Find it in Dashboard › Saved.');}, discard:()=>{S.draft=false;S.items=BASE.map(i=>({...i}));S.qty=Object.fromEntries(BASE.map(i=>[i.k,i.qty]));S.cutleryOk=false;S.title=D.title;S.agree=false;S.lastRemoved=null;S.history=[];go('home',true);toast('Offer discarded.');},
 restart:()=>{reset();render();},
 sendOffer:()=>{S.offered=[...S.offerSel];render();later(()=>{S.lenaTyping=true;},900);later(()=>{S.lenaTyping=false;if(!S.chosen)S.chosen=S.offered[0];},2600);},
 confirmTime:()=>{S.planned=true;render();},
 confirmPickup:()=>{S.stage='wait';S.given=new Set(picked().filter(i=>S.got.has(i.k)).map(i=>i.k));render();later(()=>{S.stage=null;S.done=true;if(S.screen==='day'){S.history=[];go('done',true);}},2200);},
 saveEdit:()=>{const it=S.items.find(x=>x.k===S.editing);const n=$('#ename').value.trim(),c=$('#econd').value.trim();if(n)it.name=n;if(c)it.cond=c;S.qty[it.k]=S.eq;if(it.k==='cutlery')S.cutleryOk=true;S.overlay=null;render();toast('Changes saved.');},
 undo:()=>{const it=S.items.find(x=>x.k===S.lastRemoved);if(it)it.removed=false;S.lastRemoved=null;render();},
 savePlan:()=>{const items=[...S.invSel];if(!items.length)return;S.plans.push({room:invItem(items[0]).room,items});S.invSel=new Set();S.planIx=S.plans.length-1;go('plan');toast('Planned. Publish it whenever you’re ready.');},
 editPlan:()=>{const p=S.plans.splice(S.planIx,1)[0];S.invSel=new Set(p.items);S.invRoom=p.room;ACT.back();},
 deletePlan:()=>{S.plans.splice(S.planIx,1);ACT.back();toast('Plan deleted.');},
 publishPlan:()=>{const p=S.plans.splice(S.planIx,1)[0];S.items=BASE.map(i=>({...i,removed:!p.items.includes(i.k)}));S.pick=new Set([...S.pick].filter(k=>p.items.includes(k)));if(!S.pick.size)S.pick=new Set(p.items.slice(0,1));S.history=[];go('p-photo');},
 logout:()=>{S.history=[];S.overlay=null;S.screen='role';render();toast('You are logged out.');},
 switchRole:()=>{S.history=[];S.overlay=null;S.screen='role';render();},
 toggleSave:()=>{S.saved.has('kitchen')?S.saved.delete('kitchen'):S.saved.add('kitchen');toast(S.saved.has('kitchen')?'Saved. Find it in Dashboard › Saved.':'Removed from Saved.');},
 cutleryOk:()=>{S.cutleryOk=true;render();},
 agree:()=>{S.agree=!S.agree;render();},
 publish:()=>{S.published=true;S.draft=false;S.history=[];go('p-published',true);},
 clearPick:()=>{S.pick.clear();render();},
 sendRequest:()=>{S.requested=true;S.history=[];go('l-sent',true);},
 peterAccept:()=>{go('p-chat');toast('Request accepted. Agree on a time in the chat.');},
};
function ensureRequest(){S.requested=true;}
document.addEventListener('click',e=>{const el=e.target.closest('[data-a],[data-stop]');if(!el)return;if(el.hasAttribute('data-stop')&&!el.hasAttribute('data-a'))return;
 const a=el.getAttribute('data-a');if(!a)return;e.stopPropagation();
 if(el.classList.contains('ov')&&e.target!==el)return;
 const [k,v,w]=a.split(':');
 if(k==='go'){if(v==='p-detect'){go(v);return;}go(v);return;}
 if(k==='tab'){S.history=[];S.overlay=null;S.screen=v==='home'?'home':v;render();return;}
 if(k==='role'){S.role=v;S.history=[];S.screen=v==='peter'?'home':'discover';render();return;}
 if(k==='toast'){toast(a.slice(6));return;}
 if(k==='qty'){S.qty[v]=Math.min(MAXQ,Math.max(1,S.qty[v]+(+w)));render();return;}
 if(k==='edit'){S.editing=v;S.eq=S.qty[v];S.overlay='edit';render();return;}
 if(k==='eq'){S.eq=Math.min(MAXQ,Math.max(1,S.eq+(+v)));const n=$('#ename'),c=$('#econd');const keep=[n&&n.value,c&&c.value];render();if(keep[0]!=null){$('#ename').value=keep[0];$('#econd').value=keep[1];}return;}
 if(k==='remove'){if(ITEMS.length<=1){toast('An offer needs at least one item.');return;}S.items.find(x=>x.k===v).removed=true;S.pick.delete(v);S.lastRemoved=v;render();return;}
 if(k==='offerSel'){S.offerSel.has(v)?S.offerSel.delete(v):S.offerSel.add(v);render();return;}
 if(k==='togglePick'){S.pickOpen=!S.pickOpen;render();return;}
 if(k==='pDay'){S.pDay=+v;render();return;}
 if(k==='pTime'){S.pTime=a.slice(6);render();return;}
 if(k==='sendCustom'){const d=pDays()[S.pDay];S.custom={id:'custom',day:fmt(d),time:S.pTime,label:`${fmt(d)} · ${S.pTime}`};S.chosen='custom';S.typing=true;S.pickOpen=false;render();later(()=>{S.typing=false;S.planned=true;},1300);return;}
 if(k==='pickTime'){S.chosen=v;S.typing=true;render();later(()=>{S.typing=false;S.planned=true;},1300);return;}
 if(k==='room'){S.room=v;render();return;} if(k==='purpose'){S.purpose=v;render();return;} if(k==='bundle'){S.bundle=v;render();return;}
 if(k==='deadline'){S.deadline=v;render();return;} if(k==='place'){S.place=v;render();return;}
 if(k==='time'){S.times.has(v)?S.times.delete(v):S.times.add(v);render();return;}
 if(k==='pick'){S.pick.has(v)?S.pick.delete(v):S.pick.add(v);render();return;}
 if(k==='slot'){S.slot=v;render();return;}
 if(k==='invRoom'){S.invRoom=v;render();return;}
 if(k==='invPick'){const it=invItem(v);const cur=[...S.invSel].map(invItem);if(!S.invSel.has(v)&&cur.length&&cur[0].room!==it.room){toast('One offer = one place it’s from. Save this plan first.');return;}S.invSel.has(v)?S.invSel.delete(v):S.invSel.add(v);render();return;}
 if(k==='openPlan'){S.planIx=+v;go('plan');return;}
 if(k==='fromOpt'){S.fromOpt=v;render();return;}
 if(k==='untilOpt'){S.untilOpt=v;render();return;}
 if(k==='dRoom'){S.dRoom=v;render();return;}
 if(k==='notif'){S.notif[v]=!S.notif[v];render();return;}
 if(k==='got'){S.got.has(v)?S.got.delete(v):S.got.add(v);render();return;}
 if(ACT[k])ACT[k]();
});



render();
