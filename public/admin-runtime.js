/* Admin screen runtime – generated from the builder. */
var ADMIN_CSS="#adm{position:fixed;inset:0;z-index:9999;background:#f3f4f7;color:#1c2230;font-family:var(--f);font-size:16px;line-height:1.5;display:flex;flex-direction:column;text-align:right}\n#adm[hidden]{display:none}#adm *{box-sizing:border-box}\n:where(#adm) :where(button,input,select,textarea){font-family:inherit;font-size:15px;color:inherit}\n#adm h2,#adm h3,#adm p{margin:0}\n.a-top{background:var(--p);color:var(--pt);display:flex;align-items:center;gap:12px;padding:8px 16px;min-height:58px;flex:none}\n.a-top img{height:38px;border-radius:7px;background:#fff}\n.a-top b{font-size:18px}.a-top small{opacity:.8;margin-inline-start:8px;font-size:13px}\n.a-sp{flex:1}.a-demo{background:var(--a);color:var(--at);font-size:12.5px;border-radius:20px;padding:2px 10px;font-weight:700}\n.a-tb{background:rgba(255,255,255,.16);border:0;color:inherit;border-radius:9px;padding:7px 12px;cursor:pointer;font-weight:600}\n.a-body{flex:1;display:flex;min-height:0}\n.a-nav{width:220px;flex:none;background:#fff;border-inline-end:1px solid #e4e7ec;padding:10px;overflow:auto;display:flex;flex-direction:column;gap:3px}\n.a-nav button{display:flex;align-items:center;gap:8px;border:0;background:transparent;padding:10px 12px;border-radius:10px;cursor:pointer;text-align:start;font-weight:600;color:#344054;width:100%}\n.a-nav button:hover{background:#f6f7f9}.a-nav button.on{background:var(--soft);color:var(--p)}\n.cnt{margin-inline-start:auto;background:var(--a);color:var(--at);border-radius:20px;font-size:12px;padding:0 8px;min-width:22px;text-align:center}\n.a-main{flex:1;overflow:auto;padding:22px}\n@media(max-width:760px){.a-body{flex-direction:column}.a-nav{width:auto;flex-direction:row;border:0;border-bottom:1px solid #e4e7ec;padding:6px;overflow-x:auto}.a-nav button{width:auto;white-space:nowrap;padding:8px 10px}.a-main{padding:12px}.a-top small{display:none}}\n.a-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}\n.a-h h2{font-size:23px;flex:1;color:var(--p)}\n.a-btn{border:1px solid #d0d5dd;background:#fff;border-radius:10px;padding:8px 14px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:inherit;white-space:nowrap}\n.a-btn:hover{background:#f7f8fa}.a-btn.p{background:var(--p);border-color:var(--p);color:var(--pt)}\n.a-btn.d{color:#c92a2a;border-color:#f1c0c0}.a-btn.s{padding:5px 10px}\n.a-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:12px;margin-bottom:18px}\n.a-stat{background:#fff;border-radius:14px;padding:14px 16px;border:1px solid #e4e7ec;cursor:pointer}\n.a-stat:hover{border-color:var(--p)}.a-stat small{color:#667085;display:block;font-size:13.5px}.a-stat b{font-size:26px;color:var(--p)}\n.a-box{background:#fff;border-radius:14px;border:1px solid #e4e7ec;padding:16px;margin-bottom:16px}\n.a-box.warn{border-color:#fca5a5;background:#fff7f7}\n.a-box h3{margin:0 0 10px;font-size:17px}\n.a-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:900px){.a-two{grid-template-columns:1fr}}\n.a-quick{display:flex;gap:8px;flex-wrap:wrap}\n.a-tools{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;align-items:center}\n.a-in{border:1px solid #d0d5dd;border-radius:10px;padding:9px 11px;background:#fff;outline:none;width:100%}\n.a-in:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--soft)}\ntextarea.a-in{resize:vertical}\n.a-seg{display:inline-flex;border:1px solid #d0d5dd;border-radius:10px;overflow:hidden;background:#fff}\n.a-seg button{border:0;background:transparent;padding:7px 14px;cursor:pointer;font-weight:600}.a-seg button.on{background:var(--p);color:var(--pt)}\n.a-chips{display:flex;gap:6px;flex-wrap:wrap}\n.a-chip{border:1px solid #d0d5dd;background:#fff;border-radius:20px;padding:4px 12px;cursor:pointer;font-size:13.5px}\n.a-chip.on{background:var(--p);color:var(--pt);border-color:var(--p)}\n.a-day{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.a-day b{min-width:170px;text-align:center}\n.a-list{display:flex;flex-direction:column;gap:8px}\n.a-rec{background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:12px 14px;display:flex;gap:12px;align-items:center;cursor:pointer}\n.a-rec:hover{border-color:var(--p)}.a-rec.dim{opacity:.62}\n.a-rec .tm{font-weight:800;color:var(--p);min-width:58px;text-align:center;line-height:1.25}.a-rec .tm small{display:block;font-weight:600;color:#667085}\n.a-rec .mn{flex:1;min-width:0}.a-rec .mn b{display:block}.a-rec .mn span{color:#667085;font-size:14px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.a-rec .bd{margin-top:3px;display:flex;gap:4px;flex-wrap:wrap;align-items:center}\n.a-bdg{display:inline-block;font-size:12.5px;border-radius:20px;padding:1px 9px;background:#eef0f4;font-weight:600;white-space:nowrap}\n.a-bdg.g{background:#dcfce7;color:#166534}.a-bdg.r{background:#fee2e2;color:#991b1b}.a-bdg.y{background:#fef3c7;color:#92400e}.a-bdg.b{background:var(--soft);color:var(--p)}\n.a-amt{font-weight:800;color:#1c2230;font-size:14px;margin-inline-start:4px}\n.a-act{display:flex;gap:4px}\n.a-ic{width:36px;height:36px;border-radius:9px;border:1px solid #e4e7ec;background:#fff;display:grid;place-items:center;text-decoration:none;font-size:16px}\n.a-empty{text-align:center;color:#667085;padding:30px;background:#fff;border-radius:12px;border:1px dashed #d0d5dd}\n.a-sum{margin-top:10px;color:#475467;font-weight:600}\n.a-modal{position:fixed;inset:0;background:rgba(15,20,35,.5);display:grid;place-items:center;padding:14px;z-index:10000}\n.a-mb{background:#fff;border-radius:16px;padding:20px;width:100%;max-width:520px;max-height:92vh;overflow:auto}\n.a-mb h3{margin:0 0 14px;color:var(--p);font-size:19px}\n.a-f{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}.a-f label{font-weight:600;font-size:14px}\n.a-f.err .a-in{border-color:#c92a2a;background:#fff5f5}\n.a-ck{display:flex;align-items:center;gap:8px;font-weight:600;margin:4px 0 12px}.a-ck input{width:18px;height:18px}\n.a-login{margin:auto;background:#fff;border-radius:18px;padding:30px;width:min(360px,92%);text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.1)}\n.a-li{display:flex;gap:10px;padding:9px 4px;border-bottom:1px solid #f0f1f4;align-items:center;cursor:pointer}.a-li:last-child{border:0}.a-li:hover{background:#fafbfc}\n.a-li .t{color:var(--p);font-weight:800;min-width:56px}\n.a-price{background:#f8fafc;border:1px solid #e4e7ec;border-radius:12px;padding:8px 12px;margin:0 0 10px}.a-price summary{cursor:pointer;font-weight:800;color:#1f3a48}.a-price p{margin:8px 0 0;line-height:1.65;font-size:14px;color:#344054}.a-mail .a-ok{background:#ecfdf3;color:#12805c;border-radius:20px;padding:2px 10px;font-size:13px;margin-inline-start:6px}.a-steps{display:flex;flex-direction:column;gap:8px}.a-st{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:start;border:1.5px solid #e4e7ec;border-radius:14px;padding:10px 12px;opacity:.55}.a-st.cur{opacity:1;border-color:#1f3a48;box-shadow:0 0 0 3px #d4f39b}.a-st.done{opacity:.8;background:#f6fef9}.a-st>div{display:flex;flex-direction:column;gap:6px;align-items:flex-start}.a-st span{color:#475467;line-height:1.6;font-size:14px}.a-sn{width:30px;height:30px;border-radius:50%;background:#1f3a48;color:#d4f39b;display:grid;place-items:center;font-weight:800}.a-st.done .a-sn{background:#12805c;color:#fff}.a-st .a-in{width:100%}.a-mk{display:grid;grid-template-columns:22px 1fr auto;gap:10px;align-items:center;border-bottom:1px solid #eef1f4;padding:9px 0}.a-mk small{display:block;color:#667085;font-size:12.5px}.a-conn{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}\n.a-conn div{display:flex;justify-content:space-between;gap:8px;background:#f6f7f9;border-radius:9px;padding:8px 11px;font-size:14px}\n.a-conn div b{color:#98a2b3;font-size:12.5px;white-space:nowrap}.a-conn div.on{background:#ecfdf3}.a-conn div.on b{color:#15803d}\n.a-note{color:#667085;font-size:13.5px;line-height:1.6;margin-top:10px}\n.a-ql{display:flex;gap:6px;flex-wrap:wrap;margin:-4px 0 12px}\n.a-bill{border-radius:14px;padding:14px 16px;margin-bottom:16px;display:flex;flex-direction:column;gap:6px;border:1px solid}\n.a-bill.r{background:#fef2f2;border-color:#fca5a5;color:#7f1d1d}.a-bill.y{background:#fffbeb;border-color:#fcd34d;color:#78350f}\n.a-bill div{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}\n.a-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#1c2230;color:#fff;padding:10px 18px;border-radius:12px;z-index:10001;font-weight:600}";
function pwHash(s,salt){s=String(salt)+'|'+String(s);let h=5381,g=52711;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h=((h<<5)+h+c)|0;g=((g<<6)+g+c*31)|0}return(h>>>0).toString(36)+(g>>>0).toString(36)}
var ADMIN_RUNTIME=function ADMIN_RUNTIME(C){
  var D=document,MODS=C.mods,view='home',q='',flt='',dayMode=true,curDay='',DATA=null,editing=null;
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function pad(n){return String(n).padStart(2,'0')}
  function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function today(){return iso(new Date())}
  function addDays(s,n){var d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
  function fmtD(s){if(!s)return'';var d=new Date(s+'T12:00:00');if(isNaN(d))return s;if(s===today())return'היום';if(s===addDays(today(),1))return'מחר';return d.toLocaleDateString('he-IL',{weekday:'short',day:'numeric',month:'numeric'})}
  function longD(s){var d=new Date(s+'T12:00:00'),g=d.toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'}),h='';try{h=new Intl.DateTimeFormat('he-IL-u-ca-hebrew',{day:'numeric',month:'long'}).format(d)}catch(e){}return g+(h?' · '+h:'')}
  function money(n){return'₪'+Math.round(Number(String(n).replace(/[^\d.-]/g,''))||0).toLocaleString('he-IL')}
  function num(n){return Number(String(n==null?'':n).replace(/[^\d.-]/g,''))||0}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function waN(n){var d=String(n||'').replace(/\D/g,'');if(!d)return'';if(d.charAt(0)==='0')d='972'+d.slice(1);return d}
  function has(m,k){return m.f.some(function(x){return x[0]===k})}
  function fld(m,k){return m.f.find(function(x){return x[0]===k})}
  function openable(m){return !!m.st||has(m,'done')}
  function isOpen(m,r){if(m.st)return(m.closed||[]).indexOf(r.status)<0;if(has(m,'done'))return!r.done;return true}
  function mod(id){return MODS.find(function(m){return m.id===id})}
  function recs(m){return DATA.recs[m.id]||(DATA.recs[m.id]=[])}
  function title(m,r){return r[m.title]||r.name||r.item||r.subj||r.desc||'(ללא שם)'}
  function overdue(m,r){var t=today();if(m.id==='loans')return r.status==='מושאל'&&r.due&&r.due<t;if(m.id==='tasks')return!r.done&&r.date&&r.date<t;if(m.id==='inspections'||m.id==='policies')return isOpen(m,r)&&r.due&&r.due<t;return false}
  function low(m,r){return m.id==='inventory'&&r.minq!==''&&r.minq!=null&&num(r.qty)<=num(r.minq)}
  function unpaid(m,r){return has(m,'paid')&&!r.paid&&num(r.price)>0&&(!m.st||(m.bad||[]).indexOf(r.status)<0)&&r.date&&r.date<=today()}


  var REM_DEF='שלום {שם}, תזכורת מ{עסק}: נקבע לך {תאריך} בשעה {שעה}. נשמח לראותך! לשינוי או ביטול אפשר להשיב להודעה זו.';
  function enc(x){return encodeURIComponent(x)}
  function longDate(s){var d=new Date(s+'T12:00:00');return d.toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'})}
  function remindText(m,r){var t=DATA.remind||REM_DEF;if(!r.time)t=t.replace(/\s*בשעה \{שעה\}/g,'');return t.replace(/\{שם\}/g,r.name||'').replace(/\{עסק\}/g,C.name).replace(/\{תאריך\}/g,r.date?'ב'+longDate(r.date):'').replace(/\{שעה\}/g,r.time||'').replace(/\{שירות\}/g,r.service||r.subject||r.item||r.desc||'')}
  function remindUrl(m,r){return'https://wa.me/'+waN(r.phone)+'?text='+enc(remindText(m,r))}
  function evTimes(r){var d=r.date.replace(/-/g,'');if(r.time){var e=new Date(r.date+'T'+r.time+':00');e.setHours(e.getHours()+1);return{s:d+'T'+r.time.replace(':','')+'00',e:iso(e).replace(/-/g,'')+'T'+pad(e.getHours())+pad(e.getMinutes())+'00',t:1}}return{s:d,e:addDays(r.date,1).replace(/-/g,''),t:0}}
  function details(m,r){return m.f.filter(function(f){return r[f[0]]&&f[2]!=='date'&&f[2]!=='time'&&f[2]!=='check'}).map(function(f){return f[1]+': '+(f[2]==='money'?money(r[f[0]]):r[f[0]])}).join('\n')}
  function gcalUrl(m,r){var t=evTimes(r);return'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+enc(title(m,r)+' · '+m.l)+'&dates='+t.s+'/'+t.e+'&ctz=Asia/Jerusalem&details='+enc(details(m,r))}
  function dl(name,text,type){try{var b=new Blob([text],{type:type}),x=D.createElement('a');x.href=URL.createObjectURL(b);x.download=name;D.body.appendChild(x);x.click();x.remove();toast('הקובץ הורד ✓')}catch(e){toast('ההורדה נכשלה')}}
  function icsEsc(x){return String(x).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
  function exportIcs(){var t=today(),L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//'+icsEsc(C.name)+'//HE','CALSCALE:GREGORIAN'],n=0;
    MODS.forEach(function(m){if(!has(m,'date'))return;recs(m).forEach(function(r){if(!r.date||r.date<t||(openable(m)&&!isOpen(m,r)))return;if(!m.day&&m.id!=='cases'&&m.id!=='tasks'&&m.id!=='inspections'&&m.id!=='loans')return;var e=evTimes(r);n++;
      L.push('BEGIN:VEVENT','UID:'+r.id+'@'+C.key,'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',e.t?'DTSTART;TZID=Asia/Jerusalem:'+e.s:'DTSTART;VALUE=DATE:'+e.s,e.t?'DTEND;TZID=Asia/Jerusalem:'+e.e:'DTEND;VALUE=DATE:'+e.e,'SUMMARY:'+icsEsc(title(m,r)+' · '+m.l),'DESCRIPTION:'+icsEsc(details(m,r)),'END:VEVENT')})});
    L.push('END:VCALENDAR');if(!n){toast('אין אירועים קרובים לייצוא');return}if(C.preview){toast('בתצוגה המקדימה אין נתונים אמיתיים לייצוא');return}dl('יומן-'+C.name+'.ics',L.join('\r\n'),'text/calendar')}
  function exportCsv(m){if(C.preview){toast('בתצוגה המקדימה אין נתונים אמיתיים לייצוא');return}var q=function(v){v=v===true?'כן':v===false?'':String(v==null?'':v);return'"'+v.replace(/"/g,'""')+'"'};
    var rows=[m.f.map(function(f){return q(f[1])}).join(',')].concat(recs(m).map(function(r){return m.f.map(function(f){return q(r[f[0]])}).join(',')}));
    dl(m.l+'-'+C.name+'-'+today()+'.csv','\ufeff'+rows.join('\r\n'),'text/csv;charset=utf-8')}
  function connectHTML(){
    var I=C.integ||[];
    return'<div class="a-h"><h2>🔌 חיבורים</h2></div>'+mailBoxHTML()+waBoxHTML()+
    '<div class="a-box"><h3>🌐 החיבורים של האתר</h3><div class="a-conn">'+I.map(function(x){return'<div class="'+(x[1]?'on':'')+'"><span>'+esc(x[0])+'</span><b>'+(x[1]?'✓ מחובר':'לא מחובר')+'</b></div>'}).join('')+'</div><p class="a-note">כדי להוסיף או לשנות חיבור (רשתות חברתיות, תשלומים, תרומות, ביקורות, מדידה ועוד) – נכנסים ל„אתר בקליק” ← לשונית „חיבורים”.</p></div>'+
    '<div class="a-box"><h3>🔔 תזכורות ללקוחות בוואטסאפ</h3><p class="a-note" style="margin:0 0 8px">ליד כל תור או פגישה יש כפתור 🔔 שפותח הודעת תזכורת מוכנה בוואטסאפ. כאן קובעים את הנוסח. אפשר להשתמש ב: {שם} {תאריך} {שעה} {שירות} {עסק}</p><textarea class="a-in" id="a-rem" rows="3">'+esc(DATA.remind||REM_DEF)+'</textarea><div style="display:flex;gap:8px;margin-top:8px"><button class="a-btn p" data-a="remsave">שמירת הנוסח</button><button class="a-btn" data-a="remreset">חזרה לנוסח המקורי</button></div></div>'+
    '<div class="a-box"><h3>📆 חיבור ליומן</h3><p class="a-note" style="margin:0 0 10px">בכל רשומה עם תאריך יש כפתור „ליומן גוגל”. אפשר גם לייצא את כל מה שמתוכנן לקובץ יומן אחד – שנפתח ב-Google Calendar, באייפון או ב-Outlook.</p><button class="a-btn" data-a="ics">⬇ ייצוא כל האירועים הקרובים ליומן</button></div>'+
    '<div class="a-box"><h3>📊 ייצוא לאקסל / Google Sheets</h3><p class="a-note" style="margin:0 0 10px">מורידים קובץ שנפתח באקסל או ב-Google Sheets – לרואה החשבון, להדפסה או לגיבוי.</p><div style="display:flex;gap:8px;flex-wrap:wrap">'+MODS.map(function(m){return'<button class="a-btn" data-a="csv" data-m="'+m.id+'">'+m.ic+' '+esc(m.l)+'</button>'}).join('')+'</div></div>';
  }


  /* ===== e-mails to the business's customers (own free Brevo account) ===== */
  var MAILST={connected:false,on:{lead:true,order:true,appt:true,remind:true,don:true},tpl:{}},MAILSTEP=0,WAST={connected:false,on:{lead:true,order:true,appt:true,remind:true,don:true}},WASTEP=0;
  var MAIL_KINDS=[['appt','📅 אישור תור','כשנקבע תור / פגישה ללקוח עם מייל'],['remind','⏰ תזכורת יום לפני','נשלח לבד יום לפני התור'],['order','📦 אישור הזמנה','כשלקוח מזמין מהחנות באתר'],['lead','📥 „קיבלנו את הפנייה”','כשמישהו משאיר פרטים בטופס'],['don','💝 תודה על תרומה','כשמישהו תורם באתר (נדרים פלוס)']];
  function mailLoad(){if(C.preview){MAILST.connected=!!MAILST._demo;return}if(!API||!TOK)return;api('/api/mail?slug='+encodeURIComponent(C.slug)).then(function(j){MAILST=j;if(view==='connect')render()}).catch(function(){})}
  function mailBoxHTML(){
    if(MAILST.connected){return'<div class="a-box a-mail on"><h3>📧 מיילים ללקוחות <span class="a-ok">✓ מחובר</span></h3><p class="a-note" style="margin:0 0 10px">נשלח מהכתובת <b dir="ltr">'+esc(MAILST.from||'')+'</b> – בשם העסק. בוחרים מה יישלח לבד:</p>'+
      MAIL_KINDS.map(function(k){return'<label class="a-mk"><input type="checkbox" data-mon="'+k[0]+'"'+((MAILST.on||{})[k[0]]?' checked':'')+'><span><b>'+k[1]+'</b><small>'+k[2]+'</small></span><button type="button" class="a-btn s" data-a="mtpl" data-k="'+k[0]+'">✏️ נוסח</button></label>'}).join('')+
      '<details class="a-price"><summary>💰 כמה זה עולה?</summary><p><b>🆓 חינם לתמיד</b> – עד 300 מיילים ביום, בלי כרטיס אשראי. לרוב העסקים זה מספיק.</p><p><b>💳 צריך יותר?</b> ב-Brevo יש תוכנית בתשלום (בערך מ-9$ לחודש, בלי הגבלה יומית). משדרגים <b>באתר של Brevo</b> ← „Plans” / „Upgrade”, ומשלמים <b>ישירות להם בכרטיס אשראי</b>. החיבור לאתר נשאר אותו חיבור – לא צריך לעשות כאן כלום.</p></details><p class="a-note">💡 כדי שהמייל יישלח – צריך שיהיה ללקוח מייל ברשומה (בטפסים באתר יש עכשיו שדה „מייל – לא חובה”).</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="a-btn" data-a="mtest">📨 שליחת מייל בדיקה אליי</button><button class="a-btn d" data-a="mdisc">ניתוק</button></div></div>'}
    var st=['<b>פותחים חשבון חינמי ב-Brevo</b><span>לוחצים על הכפתור ונרשמים – הכי פשוט עם <b dir="ltr">Google</b>. אם מגיע אליכם מייל אישור מ-Brevo – לוחצים עליו.</span><a class="a-btn p" href="https://onboarding.brevo.com/account/register" target="_blank" rel="noopener">1️⃣ פתיחת חשבון ב-Brevo ←</a>',
            '<b>יוצרים „מפתח” ומעתיקים אותו</b><span>בעמוד שנפתח לוחצים <b dir="ltr">Generate a new API key</b>, נותנים שם כלשהו (למשל „אתר”), ולוחצים <b dir="ltr">Copy</b>.</span><a class="a-btn p" href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener">2️⃣ פתיחת עמוד המפתחות ←</a>',
            '<b>מדביקים כאן – וזהו</b><span>אנחנו בודקים שהכל עובד ושולחים אליכם מייל בדיקה.</span><input class="a-in" id="a-mkey" dir="ltr" placeholder="xkeysib-..." autocomplete="off"><button class="a-btn p" data-a="mconn">3️⃣ חיבור ובדיקה</button><p class="a-note" id="a-mmsg"></p>'];
    return'<div class="a-box a-mail"><h3>📧 מיילים אוטומטיים ללקוחות</h3><p class="a-note" style="margin:0 0 10px">אישור תור, תזכורת יום לפני, אישור הזמנה ו„קיבלנו את הפנייה” – נשלחים לבד, מהמייל שלכם ובשם העסק. <b>חינם</b> (עד 300 מיילים ביום). חיבור חד־פעמי – 3 צעדים, כ־3 דקות:</p>'+
      '<details class="a-price"><summary>💰 כמה זה עולה?</summary><p><b>🆓 חינם לתמיד</b> – עד 300 מיילים ביום, בלי כרטיס אשראי. לרוב העסקים זה מספיק.</p><p><b>💳 צריך יותר?</b> ב-Brevo יש תוכנית בתשלום (בערך מ-9$ לחודש, בלי הגבלה יומית). משדרגים <b>באתר של Brevo</b> ← „Plans” / „Upgrade”, ומשלמים <b>ישירות להם בכרטיס אשראי</b>. החיבור לאתר נשאר אותו חיבור – לא צריך לעשות כאן כלום.</p></details><div class="a-steps">'+st.map(function(x,i){return'<div class="a-st'+(i===MAILSTEP?' cur':'')+(i<MAILSTEP?' done':'')+'"><span class="a-sn">'+(i<MAILSTEP?'✓':i+1)+'</span><div>'+x+'</div></div>'}).join('')+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:8px">'+(MAILSTEP>0?'<button class="a-btn" data-a="mback">→ הקודם</button>':'')+(MAILSTEP<2?'<button class="a-btn" data-a="mnext">עשיתי – הבא ←</button>':'')+'</div></div>'}

  /* ===== WhatsApp to the business's customers ===== */
  function waLoad(){if(C.preview||!API||!TOK)return;api('/api/wa?slug='+encodeURIComponent(C.slug)).then(function(j){WAST=j;if(view==='connect')render()}).catch(function(){})}
  function waBoxHTML(){
    var price='<details class="a-price"><summary>💰 כמה זה עולה? אילו אפשרויות יש?</summary><p><b>🆓 חינם – שליחה בלחיצה:</b> בכל רשומה יש כפתור וואטסאפ – לוחצים, וההודעה כבר כתובה. לא אוטומטי, אבל בלי שום עלות וכבר עובד.</p><p><b>🤖 אוטומטי – GREEN-API</b> (מה שמחברים כאן): יש <b>חינם לניסיון</b> (רק 3 צ׳אטים בחודש), ו<b>„Business” – בערך 12$ לחודש</b> בלי הגבלה. משלמים <b>ישירות ל-GREEN-API בכרטיס אשראי</b> באתר שלהם – לא דרכנו. זה חיבור לא רשמי של וואטסאפ: שולחים רק ללקוחות של העסק, לא הודעות פרסום המוניות, כדי שוואטסאפ לא יחסום את המספר.</p><p><b>🏢 הדרך הרשמית של וואטסאפ (Meta)</b>: מתאימה לעסקים גדולים, דורשת חשבון עסקי ב-Meta ואישור נוסחים, ומשלמים לכל הודעה (כמה אגורות). אפשר לחבר אותה דרך ספקים כמו GREEN-API (WABA) – באתר שלהם.</p></details>';
    if(WAST.connected){return'<div class="a-box a-mail on"><h3>💬 וואטסאפ אוטומטי ללקוחות <span class="a-ok">✓ מחובר</span></h3><p class="a-note" style="margin:0 0 10px">נשלח מהוואטסאפ <b dir="ltr">'+esc(WAST.phone||'')+'</b>. אותו נוסח כמו במיילים (משנים ב„✏️ נוסח” למעלה). מה יישלח לבד:</p>'+
      MAIL_KINDS.map(function(k){return'<label class="a-mk"><input type="checkbox" data-won="'+k[0]+'"'+((WAST.on||{})[k[0]]?' checked':'')+'><span><b>'+k[1]+'</b><small>'+k[2].replace('עם מייל','עם טלפון')+'</small></span><span></span></label>'}).join('')+price+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="a-btn d" data-a="wdisc">ניתוק</button></div></div>'}
    var st=['<b>פותחים חשבון ב-GREEN-API</b><span>נרשמים עם מייל וסיסמה. אחר כך לוחצים <b dir="ltr">Create an instance</b> ובוחרים <b dir="ltr">Developer</b> (חינם לניסיון) או <b dir="ltr">Business</b> (בתשלום, בלי הגבלה).</span><a class="a-btn p" href="https://console.green-api.com" target="_blank" rel="noopener">1️⃣ פתיחת חשבון ←</a>',
            '<b>סורקים את הקוד עם הוואטסאפ של העסק</b><span>במסך שלהם מופיע קוד QR. בטלפון: וואטסאפ ← ⋮ / הגדרות ← <b>„מכשירים מקושרים”</b> ← <b>„קישור מכשיר”</b> ← סורקים. הוואטסאפ ממשיך לעבוד בטלפון כרגיל.</span>',
            '<b>מעתיקים 2 קודים ומדביקים כאן</b><span>באותו מסך: <b dir="ltr">idInstance</b> (מספר) ו-<b dir="ltr">apiTokenInstance</b> (קוד ארוך).</span><input class="a-in" id="a-wid" dir="ltr" inputmode="numeric" placeholder="idInstance – למשל 7103123456"><input class="a-in" id="a-wtok" dir="ltr" placeholder="apiTokenInstance" autocomplete="off"><input class="a-in" id="a-wurl" dir="ltr" placeholder="apiUrl (אם מופיע – לא חובה)"><button class="a-btn p" data-a="wconn">3️⃣ חיבור ובדיקה</button><p class="a-note" id="a-wmsg"></p>'];
    return'<div class="a-box a-mail"><h3>💬 וואטסאפ אוטומטי ללקוחות</h3><p class="a-note" style="margin:0 0 10px">אישור תור, תזכורת יום לפני, אישור הזמנה ותודה על תרומה – נשלחים <b>לבד</b> מהוואטסאפ של העסק. 3 צעדים, כ־5 דקות:</p>'+price+
      '<div class="a-steps">'+st.map(function(x,i){return'<div class="a-st'+(i===WASTEP?' cur':'')+(i<WASTEP?' done':'')+'"><span class="a-sn">'+(i<WASTEP?'✓':i+1)+'</span><div>'+x+'</div></div>'}).join('')+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:8px">'+(WASTEP>0?'<button class="a-btn" data-a="wback">→ הקודם</button>':'')+(WASTEP<2?'<button class="a-btn" data-a="wnext">עשיתי – הבא ←</button>':'')+'</div></div>'}
  function waAct(a,el){
    if(a==='wnext'){WASTEP=Math.min(2,WASTEP+1);render();return true}
    if(a==='wback'){WASTEP=Math.max(0,WASTEP-1);render();return true}
    if(a==='wconn'){var id=((root.querySelector('#a-wid')||{}).value||'').replace(/\D/g,''),tk=((root.querySelector('#a-wtok')||{}).value||'').trim(),u=((root.querySelector('#a-wurl')||{}).value||'').trim(),msg=root.querySelector('#a-wmsg');
      if(!id||tk.length<20){msg.textContent='צריך את שני הקודים – idInstance ו-apiTokenInstance';return true}
      if(C.preview){WAST={connected:true,phone:'972501234567',on:{lead:true,order:true,appt:true,remind:true,don:true}};WASTEP=0;render();toast('מחובר ✓ (הדגמה)');return true}
      msg.textContent='בודק…';api('/api/wa/connect',{slug:C.slug,id:id,token:tk,url:u}).then(function(j){WAST.connected=true;WAST.phone=j.phone;WASTEP=0;waLoad();render();toast('מחובר ✓ – שלחנו הודעת בדיקה לוואטסאפ שלכם')}).catch(function(e){msg.textContent={'wrong key':'הקודים לא נכונים – העתיקו אותם שוב','not scanned':'עוד לא סרקתם את הקוד עם הוואטסאפ (צעד 2) – סורקים ולוחצים שוב','bad key':'הקודים לא נראים נכון – העתיקו שוב'}[e.message]||('לא הצליח: '+e.message)});return true}
    if(a==='wdisc'){if(!confirm('לנתק את הוואטסאפ האוטומטי?'))return true;if(C.preview){WAST={connected:false,on:{}};render();return true}api('/api/wa/disconnect',{slug:C.slug}).then(function(){WAST={connected:false,on:{}};render()});return true}
    if(a==='wato'&&editing){var r=editing.r,w2=D.createElement('div');w2.className='a-modal';w2.innerHTML='<div class="a-mb"><h3>💬 וואטסאפ ל'+esc(r.name||'לקוח')+'</h3><p class="a-note" dir="ltr" style="text-align:right">'+esc(r.phone)+'</p><div class="a-f"><label>הודעה</label><textarea class="a-in" id="a-wb2" rows="6">שלום '+esc(r.name||'')+',\n</textarea></div><div style="display:flex;gap:8px"><button class="a-btn p" id="a-wsend">שליחה</button><button class="a-btn" id="a-wx">ביטול</button></div></div>';root.appendChild(w2);
      w2.querySelector('#a-wx').onclick=function(){w2.remove()};
      w2.querySelector('#a-wsend').onclick=function(){if(C.preview){w2.remove();toast('בהדגמה לא נשלחת הודעה');return}api('/api/wa/send',{slug:C.slug,to:r.phone,text:w2.querySelector('#a-wb2').value}).then(function(){w2.remove();toast('נשלח בוואטסאפ ✓')}).catch(function(e){toast('לא נשלח: '+e.message)})};return true}
    return false}
  function mailAct(a,el){
    if(waAct(a,el))return true;
    if(a==='mnext'){MAILSTEP=Math.min(2,MAILSTEP+1);render();return true}
    if(a==='mback'){MAILSTEP=Math.max(0,MAILSTEP-1);render();return true}
    if(a==='mconn'){var k=(root.querySelector('#a-mkey')||{}).value||'',msg=root.querySelector('#a-mmsg');k=k.trim();
      if(!/^xkeysib-/.test(k)){msg.textContent='המפתח צריך להתחיל ב-xkeysib- – העתיקו אותו שוב מ-Brevo';return true}
      if(C.preview){MAILST={connected:true,_demo:true,from:'my-business@gmail.com',on:{lead:true,order:true,appt:true,remind:true,don:true},tpl:{}};render();toast('מחובר ✓ (הדגמה)');return true}
      msg.textContent='בודק…';api('/api/mail/connect',{slug:C.slug,key:k}).then(function(j){MAILST.connected=true;MAILST.from=j.from;MAILSTEP=0;mailLoad();render();toast('מחובר ✓ – שלחנו לכם מייל בדיקה')}).catch(function(e){msg.textContent={'wrong key':'המפתח לא נכון – העתיקו אותו שוב','no sender':'צריך לאשר את כתובת המייל שלכם ב-Brevo (חפשו מייל מ-Brevo ולחצו על האישור) – ואז ללחוץ שוב'}[e.message]||('לא הצליח: '+e.message)});return true}
    if(a==='mdisc'){if(!confirm('לנתק את המיילים ללקוחות?'))return true;if(C.preview){MAILST={connected:false,on:{},tpl:{}};render();return true}api('/api/mail/disconnect',{slug:C.slug}).then(function(){MAILST={connected:false,on:{},tpl:{}};render()});return true}
    if(a==='mtest'){if(C.preview){toast('בהדגמה לא נשלח מייל');return true}api('/api/mail/send',{slug:C.slug,to:MAILST.from,subject:'מייל בדיקה',text:'זה מייל בדיקה מהאתר שלכם. הכל עובד ✓'}).then(function(){toast('נשלח ✓')}).catch(function(e){toast('לא נשלח: '+e.message)});return true}
    if(a==='mtpl'){var kk=el.dataset.k,cur=(MAILST.tpl||{})[kk]||['',''];var w=D.createElement('div');w.className='a-modal';w.innerHTML='<div class="a-mb"><h3>✏️ נוסח המייל</h3><p class="a-note">אפשר להשתמש ב: {שם} {תאריך} {שעה} {שירות} {עסק} {טלפון_העסק} {פירוט} {סכום}</p><div class="a-f"><label>נושא</label><input class="a-in" id="a-ts" value="'+esc(cur[0])+'"></div><div class="a-f"><label>תוכן</label><textarea class="a-in" id="a-tb" rows="8">'+esc(cur[1])+'</textarea></div><div style="display:flex;gap:8px"><button class="a-btn p" id="a-tsave">שמירה</button><button class="a-btn" data-a="mclose">ביטול</button></div></div>';root.appendChild(w);
      w.querySelector('#a-tsave').onclick=function(){MAILST.tpl=MAILST.tpl||{};MAILST.tpl[kk]=[w.querySelector('#a-ts').value,w.querySelector('#a-tb').value];w.remove();if(!C.preview)api('/api/mail/settings',{slug:C.slug,tpl:MAILST.tpl}).then(function(){toast('נשמר ✓')});else toast('נשמר ✓')};return true}
    if(a==='mailto'&&editing){var r=editing.r,w2=D.createElement('div');w2.className='a-modal';w2.innerHTML='<div class="a-mb"><h3>📧 מייל ל'+esc(r.name||'לקוח')+'</h3><p class="a-note" dir="ltr" style="text-align:right">'+esc(r.email)+'</p><div class="a-f"><label>נושא</label><input class="a-in" id="a-ms" value="'+esc(C.name)+'"></div><div class="a-f"><label>הודעה</label><textarea class="a-in" id="a-mb2" rows="6">שלום '+esc(r.name||'')+',\n</textarea></div><div style="display:flex;gap:8px"><button class="a-btn p" id="a-msend">שליחה</button><button class="a-btn" data-a="mclose2">ביטול</button></div></div>';root.appendChild(w2);
      w2.querySelector('[data-a=mclose2]').onclick=function(){w2.remove()};
      w2.querySelector('#a-msend').onclick=function(){if(C.preview){w2.remove();toast('בהדגמה לא נשלח מייל');return}api('/api/mail/send',{slug:C.slug,to:r.email,subject:w2.querySelector('#a-ms').value,text:w2.querySelector('#a-mb2').value}).then(function(){w2.remove();toast('המייל נשלח ✓')}).catch(function(e){toast(e.message==='not connected'?'קודם מחברים מיילים בלשונית „חיבורים”':'לא נשלח: '+e.message)})};return true}
    return false}
  /* server sync (when the site is published on the server) */
  var API=C.api!=null,TOK=null,LAST=0;
  function tokKey(){return'adm-tok-'+C.slug}
  function api(path,body){return fetch((C.api||'')+path,{method:body?'POST':'GET',headers:Object.assign({'Content-Type':'application/json'},TOK?{Authorization:'Bearer '+TOK}:{}),body:body?JSON.stringify(body):undefined})
    .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok){var e=new Error(j.error||('HTTP '+r.status));e.status=r.status;throw e}return j})})}
  function mergeRecs(list,notify){var newLeads=0,newOrd=0;list.forEach(function(x){var arr=DATA.recs[x.mod]||(DATA.recs[x.mod]=[]),i=arr.findIndex(function(r){return r.id===x.id});
      if(x.deleted){if(i>=0)arr.splice(i,1)}else if(i>=0)arr[i]=x.data;else{arr.push(x.data);if(x.mod==='leads')newLeads++;if(x.mod==='orders'&&/^o/.test(x.id))newOrd++}});
    if(notify&&newLeads)toast('📥 '+(newLeads>1?newLeads+' פניות חדשות':'פנייה חדשה')+' מהאתר');if(notify&&newOrd)toast('🛒 '+(newOrd>1?newOrd+' הזמנות חדשות':'הזמנה חדשה')+' מהאתר!')}
  var BILL=C.demoBill||null;
  function loadServer(){mailLoad();waLoad();api('/api/billing?slug='+encodeURIComponent(C.slug)).then(function(b){BILL=b;if(root.querySelector('#a-main'))render()}).catch(function(){});
    return api('/api/data?slug='+encodeURIComponent(C.slug)+'&since=0').then(function(j){DATA={recs:{}};if(j.settings&&j.settings.remind)DATA.remind=j.settings.remind;mergeRecs(j.recs,false);LAST=j.now})}
  function billInfo(){if(!(API||C.demoBill)||!BILL||!BILL.paidUntil)return null;var left=Math.ceil((BILL.paidUntil-Date.now())/864e5);return{left:left,off:BILL.suspended||left<=-BILL.graceDays,date:new Date(BILL.paidUntil).toLocaleDateString('he-IL')}}
  function billButtons(){var h='';if(BILL.paylink)h+='<a class="a-btn p" href="'+esc(BILL.paylink)+'" target="_blank" rel="noopener">💳 לחידוש המנוי'+(BILL.price?' ('+esc(BILL.price)+')':'')+'</a>';if(BILL.contact)h+='<a class="a-btn" href="https://wa.me/'+esc(BILL.contact.replace(/^0/,'972'))+'" target="_blank" rel="noopener">💬 שאלה על המנוי</a>';return h}
  function billBanner(){var b=billInfo();if(!b&&!(C.demoBill&&BILL.suspended))return'';if(!b)b={left:1,off:true,date:''};
    if(BILL.suspended)return'<div class="a-bill r"><b>⛔ האתר מושהה כרגע ואינו מוצג ללקוחות.</b><span>לפרטים צרו קשר.</span><div>'+billButtons()+'</div></div>';
    if(b.left<=0)return'<div class="a-bill r"><b>⚠️ המנוי לאתר הסתיים'+(b.off?' – האתר אינו מוצג ללקוחות כרגע.':'.')+'</b><span>'+(b.off?'חדשו את המנוי והאתר יחזור לפעול מיד.':'האתר יפסיק להיות מוצג בעוד '+(BILL.graceDays+b.left)+' ימים אם המנוי לא יחודש.')+'</span><div>'+billButtons()+'</div></div>';
    if(b.left<=7)return'<div class="a-bill y"><b>⏳ המנוי לאתר מסתיים בעוד '+b.left+' ימים ('+b.date+').</b><span>כדי שהאתר ימשיך לפעול בלי הפסקה – חדשו את המנוי.</span><div>'+billButtons()+'</div></div>';
    return''}
  function syncErr(e){if(e&&e.status===401){toast('פג תוקף הכניסה – נא להתחבר שוב');try{localStorage.removeItem(tokKey())}catch(x){}TOK=null;login()}else toast('⚠️ לא נשמר בשרת – בדקו את החיבור לאינטרנט ונסו שוב')}
  function saveRec(m,r){if(!API){store();return}api('/api/rec',{slug:C.slug,mod:m.id,rec:r}).catch(syncErr)}
  function delRec(m,r){if(!API){store();return}api('/api/rec/delete',{slug:C.slug,mod:m.id,id:r.id}).catch(syncErr)}
  function saveSetting(k,v){if(!API){store();return}api('/api/settings',{slug:C.slug,k:k,v:v}).catch(syncErr)}
  function replaceAll(d,cb){if(!API){DATA=d;store();cb&&cb();return}api('/api/bulk',{slug:C.slug,data:d}).then(function(){return loadServer()}).then(function(){cb&&cb()}).catch(syncErr)}
  setInterval(function(){if(!API||root.hidden||!TOK||!DATA||root.querySelector('.a-modal'))return;var ae=D.activeElement;if(ae&&root.contains(ae)&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))return;
    api('/api/data?slug='+encodeURIComponent(C.slug)+'&since='+LAST).then(function(j){LAST=j.now;var ch=j.recs.length>0;if(j.settings&&(j.settings.remind||undefined)!==DATA.remind){DATA.remind=j.settings.remind||undefined;ch=true}if(ch){mergeRecs(j.recs,true);if(root.querySelector('#a-main'))render()}}).catch(function(){})},20000);

  /* storage */
  function seed(){
    var o={},names=['משה כהן','יעקב לוי','דוד פרידמן','אברהם שטרן'],S={head:['שיעור הרב ביום שלישי','מזל טוב למשפחת כהן','שינוי בשעת מנחה','קידוש בשבת'],text:['שיעור בגמרא בשעה 20:30. כיבוד קל.','להולדת הבן! השמחה בבית הכנסת.','מנחה תתקיים השבוע ב-13:45.','הקידוש השבוע בחסות משפחת לוי.'],when:['יום שלישי 20:30','','השבוע','שבת'],niftar:['ר׳ יצחק בן אברהם ז״ל','מרת רחל בת יעקב ע״ה','ר׳ שמואל בן דוד ז״ל','ר׳ חיים בן משה ז״ל'],hdate:['י״ב בכסלו','כ׳ בטבת','ג׳ בשבט','ט״ו באדר'],parasha:['וישב','מקץ','ויגש','ויחי'],seat:['12','14','27','31'],relation:['בן','בת','נכד','אח'],occasion:['בר מצווה','הולדת בת','חתונה','סיום מסכת'],item:['מיחם 40 כוסות','עגלת תינוק','הליכון','סולם'],plate:['12-345-67','89-012-34','56-789-01','34-567-89'],model:['טויוטה קורולה','יונדאי i30','סקודה אוקטביה','קיה פיקנטו'],subj:['הסכם מכר דירה','עריכת צוואה','בדיקת חוזה שכירות','תביעת עבודה'],subject:['מתמטיקה','אנגלית','הבנת הנקרא','מתמטיקה'],desc:['פירוט לדוגמה','בקשה לפרטים','עבודה לדוגמה','חומרים'],addr:['הרצל 4, בית שמש','נחל דולב 12','רבי עקיבא 7','הנביאים 21'],deposit:['צ׳ק 200 ₪','','צ׳ק 500 ₪','']};
    var times=['09:00','10:30','12:00','17:30'];
    MODS.forEach(function(m){o[m.id]=[];for(var i=0;i<4;i++){var r={id:uid()+i};m.f.forEach(function(x){var k=x[0],t=x[2],v='';
      if(t==='date')v=k==='due'?addDays(today(),(i-1)*3):addDays(today(),m.day?[0,0,1,3][i]:-[0,2,5,9][i]);
      else if(t==='time')v=times[i];else if(t==='client')v=names[i];else if(t==='tel')v='050-12345'+(60+i);
      else if(t==='money')v=[120,350,80,1500][i];else if(t==='number')v=k==='minq'?3:[5,2,12,1][i];
      else if(t==='service')v=(C.services[i%Math.max(1,C.services.length)]||{}).name||'';
      else if(t==='status')v=m.st[i%m.st.length];else if(t==='check')v=i%2===1;
      else if(t==='select')v=m.opts[k][i%m.opts[k].length];
      else if(k==='notes'||k==='email')v='';else if(m.id==='tasks'&&k==='subj')v=['להתקשר לספק','לסדר את המחסן','לשלוח הצעת מחיר','לחדש את הביטוח'][i];else v=S[k]?S[k][i%4]:'';
      r[k]=v});o[m.id].push(r)}});
    return o;
  }
  function load(){
    if(C.preview){DATA={recs:seed()};return}
    try{DATA=JSON.parse(localStorage.getItem(C.key))||{recs:{}}}catch(e){DATA={recs:{}}}
    if(!DATA.recs)DATA.recs={};
  }
  function store(){if(C.preview)return;try{localStorage.setItem(C.key,JSON.stringify(DATA))}catch(e){toast('השמירה נכשלה – ייתכן שהזיכרון בדפדפן מלא')}}
  function authed(){if(C.preview)return true;try{return sessionStorage.getItem(C.key+'-ok')==='1'}catch(e){return false}}
  function passHash(){return DATA.pass||C.pass}

  /* ui */
  var root=D.createElement('div');root.id='adm';root.hidden=true;root.setAttribute('dir','rtl');D.body.appendChild(root);
  var css=D.createElement('style');css.textContent=ADMIN_CSS;D.head.appendChild(css);
  function toast(t){var x=D.createElement('div');x.className='a-toast';x.textContent=t;root.appendChild(x);setTimeout(function(){x.remove()},2500)}
  function setView(v){view=v;q='';flt='';if(C.preview){try{parent.__admView=v}catch(e){}}render()}
  function open(){curDay=today();root.hidden=false;D.documentElement.style.overflow='hidden';if(C.preview){try{view=parent.__admView||'home'}catch(e){}}
    if(!mod(view)&&view!=='settings'&&view!=='connect')view='home';
    if(API){try{TOK=localStorage.getItem(tokKey())}catch(e){}if(!TOK){login();return}
      root.innerHTML='<div class="a-login"><div style="font-size:40px">⏳</div><p>טוען נתונים…</p></div>';
      loadServer().then(render).catch(function(e){if(e.status===401){TOK=null;try{localStorage.removeItem(tokKey())}catch(x){}login()}else root.innerHTML='<div class="a-login"><div style="font-size:40px">📡</div><p style="margin:8px 0 14px">אין חיבור לשרת כרגע.</p><button class="a-btn p" data-a="retry">נסו שוב</button></div>'});return}
    load();if(authed())render();else login()}
  function close(){if(C.page){location.href='/'+C.slug;return}root.hidden=true;D.documentElement.style.overflow='';if(C.preview){try{parent.__toSite()}catch(e){}return}
    try{if(location.hash==='#admin')history.replaceState(null,'',location.pathname+location.search)}catch(e){}}

  function login(){
    var lg=D.querySelector('.brand img');
    root.innerHTML='<form class="a-login" id="a-lf">'+(lg?'<img src="'+lg.src+'" alt="" style="height:60px;margin:0 auto 10px;border-radius:10px">':'<div style="font-size:42px">🔐</div>')+'<h2 style="margin:6px 0 4px;color:var(--p)">'+esc(C.name)+'</h2><p style="color:#667085;margin:0 0 16px">כניסה למערכת הניהול</p><input class="a-in" type="password" id="a-pw" placeholder="סיסמה" autocomplete="current-password" style="text-align:center;font-size:18px"><button class="a-btn p" style="width:100%;justify-content:center;margin-top:12px;padding:11px">כניסה</button><button type="button" class="a-btn" data-a="site" style="width:100%;justify-content:center;margin-top:8px;border:0">← חזרה לאתר</button></form>';
    root.querySelector('#a-pw').focus();
    root.querySelector('#a-lf').onsubmit=function(e){e.preventDefault();
      if(API){var b=root.querySelector('#a-lf button');b.disabled=true;api('/api/login',{slug:C.slug,pass:root.querySelector('#a-pw').value}).then(function(j){TOK=j.token;try{localStorage.setItem(tokKey(),TOK)}catch(x){}return loadServer()}).then(render).catch(function(er){b.disabled=false;toast(er.status===401?'סיסמה שגויה':er.status===429?'יותר מדי ניסיונות – נסו שוב בעוד כמה דקות':'אין חיבור לשרת');var pw=root.querySelector('#a-pw');if(pw)pw.select()});return}
      if(pwHash(root.querySelector('#a-pw').value,C.key)===passHash()){try{sessionStorage.setItem(C.key+'-ok','1')}catch(x){}render()}else{toast('סיסמה שגויה');root.querySelector('#a-pw').select()}};
  }

  function navCount(m){if(!openable(m))return'';var n=recs(m).filter(function(r){return isOpen(m,r)}).length;return n?'<span class="cnt">'+n+'</span>':''}
  function render(){
    var lg=D.querySelector('.brand img');
    var nav='<button data-a="nav" data-v="home" class="'+(view==='home'?'on':'')+'">🏠 ראשי</button>'+MODS.map(function(m){return'<button data-a="nav" data-v="'+m.id+'" class="'+(view===m.id?'on':'')+'">'+m.ic+' '+esc(m.l)+navCount(m)+'</button>'}).join('')+'<button data-a="nav" data-v="connect" class="'+(view==='connect'?'on':'')+'">🔌 חיבורים</button><button data-a="nav" data-v="settings" class="'+(view==='settings'?'on':'')+'">⚙️ הגדרות</button>';
    root.innerHTML='<div class="a-top">'+(lg?'<img src="'+lg.src+'" alt="">':'')+'<div><b>'+esc(C.name)+'</b><small>מערכת ניהול</small></div><span class="a-sp"></span>'+(C.preview?'<span class="a-demo">נתוני דוגמה</span>':'')+(API||C.preview?'<button class="a-tb" data-a="siteedit">✏️ עריכה ושדרוג</button>':'')+'<button class="a-tb" data-a="site">← לאתר</button></div><div class="a-body"><nav class="a-nav">'+nav+'</nav><main class="a-main" id="a-main"></main></div>';
    var M=root.querySelector('#a-main');
    if(view==='home')M.innerHTML=homeHTML();else if(view==='connect')M.innerHTML=connectHTML();else if(view==='settings')M.innerHTML=settingsHTML();else{M.innerHTML=modHTML(mod(view));drawList()}
    var bb=billBanner();if(bb)M.insertAdjacentHTML('afterbegin',bb);
  }

  function badge(t,c){return'<span class="a-bdg '+(c||'')+'">'+esc(t)+'</span>'}
  function recHTML(m,r,showDate){
    var tm=has(m,'time')&&r.time?r.time:'',dk=has(m,'date')?r.date:'',left='';
    if(showDate&&dk)left='<div class="tm">'+esc(fmtD(dk))+(tm?'<small>'+esc(tm)+'</small>':'')+'</div>';else if(tm)left='<div class="tm">'+esc(tm)+'</div>';
    var sub=(m.sub||[]).map(function(k){var v=r[k];if(v===''||v==null||v===false)return'';var f=fld(m,k);if(f&&f[2]==='date')return(k==='due'?'עד ':'')+fmtD(v);if(f&&f[2]==='money')return money(v);if(k==='qty')return'כמות: '+v;return String(v).split('\n')[0]}).filter(Boolean).join(' · ');
    var b='';
    if(m.st&&r.status){var cl=(m.bad||[]).indexOf(r.status)>=0?'r':(m.closed||[]).indexOf(r.status)>=0?'g':r.status===m.st[0]?'b':'y';b+=badge(r.status,cl)}
    if(has(m,'done'))b+=r.done?badge('בוצע','g'):'';
    if(has(m,'paid')&&num(r.price)>0)b+=r.paid?badge('שולם','g'):badge('לא שולם','y');
    if(overdue(m,r))b+=badge(m.id==='loans'?'באיחור!':'עבר המועד','r');
    if(low(m,r))b+=badge('מלאי נמוך','r');
    if(has(m,'price')&&num(r.price)&&m.id!=='inventory')b+='<span class="a-amt">'+money(r.price)+'</span>';
    var bell=r.phone&&waN(r.phone)&&r.date&&r.date>=today()&&has(m,'date')&&(m.day||m.id==='cases'||m.id==='inspections'||m.id==='loans')&&isOpen(m,r)?'<a class="a-ic" href="'+remindUrl(m,r)+'" target="_blank" data-stop="1" title="שליחת תזכורת בוואטסאפ">🔔</a>':'';
    var ph=bell+(r.phone?'<a class="a-ic" href="tel:'+esc(String(r.phone).replace(/[^\d+]/g,''))+'" data-stop="1" title="חיוג">📞</a>'+(waN(r.phone)?'<a class="a-ic" href="https://wa.me/'+waN(r.phone)+'" data-stop="1" title="וואטסאפ">💬</a>':''):'');
    return'<div class="a-rec'+(isOpen(m,r)||!openable(m)?'':' dim')+'" data-a="edit" data-m="'+m.id+'" data-id="'+r.id+'">'+left+'<div class="mn"><b>'+esc(title(m,r))+'</b>'+(sub?'<span>'+esc(sub)+'</span>':'')+'<div class="bd">'+b+'</div></div><div class="a-act">'+ph+'</div></div>';
  }

  function homeHTML(){
    var t=today(),wk=addDays(t,7),mon=t.slice(0,7),h='<div class="a-h"><h2>שלום! 👋</h2><span style="color:#667085">'+esc(longD(t))+'</span></div>';
    var stats=MODS.filter(function(m){return m.id!=='payments'&&m.id!=='expenses'}).map(function(m){var a=recs(m),n=openable(m)?a.filter(function(r){return isOpen(m,r)}).length:a.length;return'<div class="a-stat" data-a="nav" data-v="'+m.id+'"><small>'+m.ic+' '+esc(m.l)+(openable(m)?' פתוחים':'')+'</small><b>'+n+'</b></div>'});
    var pm=mod('payments'),em=mod('expenses'),inc=0,exp=0;
    if(pm)inc=recs(pm).filter(function(r){return(r.date||'').slice(0,7)===mon}).reduce(function(s,r){return s+num(r.price)},0);
    if(em)exp=recs(em).filter(function(r){return(r.date||'').slice(0,7)===mon}).reduce(function(s,r){return s+num(r.price)},0);
    if(pm)stats.unshift('<div class="a-stat g" data-a="nav" data-v="payments"><small>💰 '+esc(pm.l)+' החודש</small><b>'+money(inc)+'</b></div>');
    if(em)stats.splice(pm?1:0,0,'<div class="a-stat" data-a="nav" data-v="expenses"><small>💸 הוצאות החודש</small><b>'+money(exp)+'</b></div>');
    if(pm&&em)stats.splice(2,0,'<div class="a-stat"><small>📊 מאזן החודש</small><b style="color:'+(inc-exp>=0?'#15803d':'#b91c1c')+'">'+money(inc-exp)+'</b></div>');
    h+='<div class="a-cards">'+stats.join('')+'</div>';
    var td=[],up=[],al=[];
    MODS.forEach(function(m){recs(m).forEach(function(r){
      if(overdue(m,r)||low(m,r)||unpaid(m,r))al.push([m,r]);
      if(!m.day&&m.id!=='cases'&&m.id!=='tasks')return;if(!isOpen(m,r)&&openable(m))return;
      if(r.date===t)td.push([m,r]);else if(r.date>t&&r.date<=wk)up.push([m,r]);})});
    function srt(a){return a.sort(function(x,y){return((x[1].date||'')+(x[1].time||'')).localeCompare((y[1].date||'')+(y[1].time||''))})}
    function li(p,sd){var m=p[0],r=p[1];return'<div class="a-li" data-a="edit" data-m="'+m.id+'" data-id="'+r.id+'"><span class="t">'+esc(sd?fmtD(r.date):(r.time||'—'))+'</span><span style="flex:1">'+m.ic+' '+esc(title(m,r))+(r.time&&sd?' · '+esc(r.time):'')+'</span><small style="color:#667085">'+esc(m.l)+'</small></div>'}
    if(al.length)h+='<div class="a-box warn"><h3>⚠️ דורש תשומת לב ('+al.length+')</h3>'+al.slice(0,12).map(function(p){var m=p[0],r=p[1],w=overdue(m,r)?(m.id==='loans'?'לא הוחזר בזמן':'עבר המועד'):low(m,r)?'מלאי נמוך ('+r.qty+')':'לא שולם – '+money(r.price);return'<div class="a-li" data-a="edit" data-m="'+m.id+'" data-id="'+r.id+'"><span style="flex:1">'+m.ic+' '+esc(title(m,r))+'</span><span class="a-bdg r">'+esc(w)+'</span></div>'}).join('')+'</div>';
    h+='<div class="a-two"><div class="a-box"><h3>📌 היום</h3>'+(td.length?srt(td).map(function(p){return li(p,false)}).join(''):'<p style="color:#667085;margin:0">אין משהו מתוכנן להיום.</p>')+'</div>';
    h+='<div class="a-box"><h3>🗓️ השבוע הקרוב</h3>'+(up.length?srt(up).slice(0,15).map(function(p){return li(p,true)}).join(''):'<p style="color:#667085;margin:0">אין משהו מתוכנן לשבוע הקרוב.</p>')+'</div></div>';
    h+='<div class="a-quick">'+MODS.map(function(m){return'<button class="a-btn" data-a="new" data-m="'+m.id+'">＋ '+m.ic+' '+esc(m.l)+'</button>'}).join('')+'</div>';
    return h;
  }

  function modHTML(m){
    var h='<div class="a-h"><h2>'+m.ic+' '+esc(m.l)+'</h2><button class="a-btn p" data-a="new" data-m="'+m.id+'">＋ הוספה</button></div><div class="a-tools">';
    if(m.day)h+='<div class="a-seg"><button data-a="dm" data-v="1" class="'+(dayMode?'on':'')+'">לפי יום</button><button data-a="dm" data-v="0" class="'+(dayMode?'':'on')+'">הכל</button></div>';
    if(m.day&&dayMode)h+='<div class="a-day"><button class="a-btn s" data-a="day" data-v="-1">→</button><b>'+esc(longD(curDay))+'</b><button class="a-btn s" data-a="day" data-v="1">←</button>'+(curDay!==today()?'<button class="a-btn s" data-a="day" data-v="0">היום</button>':'')+'</div>';
    else h+='<input class="a-in" id="a-q" placeholder="🔍 חיפוש…" value="'+esc(q)+'" style="max-width:260px">';
    h+='</div>';
    if(m.st)h+='<div class="a-chips" style="margin-bottom:12px"><button class="a-chip '+(flt===''?'on':'')+'" data-a="flt" data-v="">הכל</button><button class="a-chip '+(flt==='__open'?'on':'')+'" data-a="flt" data-v="__open">פתוחים</button>'+m.st.map(function(s){return'<button class="a-chip '+(flt===s?'on':'')+'" data-a="flt" data-v="'+esc(s)+'">'+esc(s)+'</button>'}).join('')+'</div>';
    return h+'<div id="a-list"></div>';
  }
  function drawList(){
    var m=mod(view),L=root.querySelector('#a-list');if(!m||!L)return;
    var a=recs(m).slice(),dayV=m.day&&dayMode;
    if(dayV)a=a.filter(function(r){return r.date===curDay});
    if(m.st&&flt)a=a.filter(function(r){return flt==='__open'?isOpen(m,r):r.status===flt});
    if(q&&!dayV){var s=q.toLowerCase();a=a.filter(function(r){return m.f.some(function(x){return String(r[x[0]]==null?'':r[x[0]]).toLowerCase().indexOf(s)>=0})})}
    var asc=m.day||m.id==='tasks'||m.id==='cases'||m.id==='loans';
    a.sort(function(x,y){var k1=(x.date||'')+(x.time||''),k2=(y.date||'')+(y.time||'');if(!has(m,'date'))return String(title(m,x)).localeCompare(String(title(m,y)),'he');return asc?k1.localeCompare(k2):k2.localeCompare(k1)});
    if(asc&&openable(m))a.sort(function(x,y){return(isOpen(m,x)?0:1)-(isOpen(m,y)?0:1)});
    if(!a.length){L.innerHTML='<div class="a-empty">'+(dayV?'אין רשומות ביום הזה.':'עדיין אין רשומות.')+'<br><button class="a-btn p" data-a="new" data-m="'+m.id+'" style="margin-top:10px">＋ הוספה</button></div>';return}
    var tot=has(m,'price')&&m.id!=='inventory'?a.reduce(function(s,r){return s+((m.bad||[]).indexOf(r.status)>=0?0:num(r.price))},0):0;
    L.innerHTML='<div class="a-list">'+a.map(function(r){return recHTML(m,r,!dayV)}).join('')+'</div><div class="a-sum">'+a.length+' רשומות'+(tot?' · סה״כ '+money(tot):'')+'</div>';
  }

  function inputFor(m,f,r){
    var k=f[0],t=f[2],v=r[k]==null?'':r[k],a=' data-k="'+k+'" class="a-in"';
    if(t==='ta')return'<textarea'+a+' rows="3">'+esc(v)+'</textarea>';
    if(t==='check')return'<label class="a-ck"><input type="checkbox" data-k="'+k+'"'+(v?' checked':'')+'> '+esc(f[1])+'</label>';
    if(t==='status'||t==='select'){var o=t==='status'?m.st:m.opts[k];return'<select'+a+'>'+(t==='select'?'<option value=""></option>':'')+o.map(function(x){return'<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>'}
    var typ={date:'date',time:'time',number:'number',money:'text',tel:'tel',email:'email'}[t]||'text',ex='';
    if(t==='client'){var cm=mod('clients');if(cm&&cm!==m)ex=' list="a-dl-c"'}
    if(t==='service')ex=' list="a-dl-s"';
    if(t==='money')ex=' inputmode="decimal" placeholder="₪"';
    if(t==='tel')ex=' inputmode="tel" dir="ltr" style="text-align:right"';
    if(t==='email')ex=' dir="ltr" style="text-align:right" placeholder="לא חובה – לאישורים ותזכורות במייל"';
    return'<input type="'+typ+'"'+a+ex+' value="'+esc(v)+'">';
  }
  function editRec(m,r){
    var isNew=!r;if(isNew){r={id:uid()};m.f.forEach(function(f){r[f[0]]=f[2]==='check'?false:''});if(m.st)r.status=m.st[0];if(has(m,'date'))r.date=m.day&&dayMode&&view===m.id?curDay:today()}
    editing={m:m,r:r,isNew:isNew};
    var cm=mod('clients'),dls='';
    if(cm&&cm!==m)dls+='<datalist id="a-dl-c">'+recs(cm).map(function(c){return'<option value="'+esc(c.name)+'">'}).join('')+'</datalist>';
    dls+='<datalist id="a-dl-s">'+C.services.map(function(s){return'<option value="'+esc(s.name)+'">'}).join('')+'</datalist>';
    var body=m.f.map(function(f){return f[2]==='check'?inputFor(m,f,r):'<div class="a-f" data-f="'+f[0]+'"><label>'+esc(f[1])+(f[3]?' *':'')+'</label>'+inputFor(m,f,r)+'</div>'}).join('');
    var w=D.createElement('div');w.className='a-modal';var ql='';if(!isNew){if(r.date)ql+='<a class="a-btn s" href="'+gcalUrl(m,r)+'" target="_blank" rel="noopener">📆 ליומן גוגל</a>';if(r.phone&&waN(r.phone)&&r.date)ql+='<a class="a-btn s" href="'+remindUrl(m,r)+'" target="_blank" rel="noopener">🔔 תזכורת בוואטסאפ</a>';if(r.email&&(MAILST.connected||C.preview))ql+='<button type="button" class="a-btn s" data-a="mailto">📧 מייל ללקוח</button>';if(r.phone&&(WAST.connected||C.preview))ql+='<button type="button" class="a-btn s" data-a="wato">💬 וואטסאפ אוטומטי</button>';if(ql)ql='<div class="a-ql">'+ql+'</div>'}
    w.innerHTML='<form class="a-mb" id="a-ef"><h3>'+(isNew?'＋ ':'✏️ ')+esc(m.l)+'</h3>'+ql+dls+body+'<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><button class="a-btn p">שמירה</button><button type="button" class="a-btn" data-a="mclose">ביטול</button>'+(isNew?'':'<span style="flex:1"></span><button type="button" class="a-btn d" data-a="del">🗑 מחיקה</button>')+'</div></form>';
    root.appendChild(w);
    var F=w.querySelector('#a-ef');
    F.addEventListener('change',function(e){var k=e.target.dataset.k,ff=fld(m,k);if(!ff)return;var ph=F.querySelector('[data-k=phone]'),pr=F.querySelector('[data-k=price]');
      if(ff[2]==='client'&&cm&&ph&&!ph.value){var c=recs(cm).find(function(c){return c.name===e.target.value});if(c&&c.phone)ph.value=c.phone}
      if(ff[2]==='service'&&pr&&!pr.value){var s=C.services.find(function(s){return s.name===e.target.value});if(s&&s.price)pr.value=String(s.price).replace(/[^\d.]/g,'')}});
    F.onsubmit=function(e){e.preventDefault();var ok=true;
      m.f.forEach(function(f){var el=F.querySelector('[data-k="'+f[0]+'"]');if(!el)return;var v=el.type==='checkbox'?el.checked:el.value.trim();var box=F.querySelector('[data-f="'+f[0]+'"]');if(f[3]&&!v){ok=false;if(box)box.classList.add('err')}else if(box)box.classList.remove('err');r[f[0]]=v});
      if(!ok){toast('נא למלא את השדות המסומנים');return}
      if(isNew)recs(m).push(r);
      var nc=null;if(isNew&&cm&&cm!==m&&r.name&&!recs(cm).some(function(c){return c.name===r.name})){nc={id:uid(),name:r.name,phone:r.phone||'',email:'',addr:r.addr||'',notes:''};recs(cm).push(nc)}
      saveRec(m,r);if(nc&&API)saveRec(cm,nc);w.remove();editing=null;render();toast('נשמר ✓')};
    var first=F.querySelector('input:not([type=checkbox]):not([type=date]):not([type=time]),textarea');if(first&&isNew)setTimeout(function(){first.focus()},30);
  }

  function settingsHTML(){
    var bi=billInfo();
    return'<div class="a-h"><h2>⚙️ הגדרות</h2></div>'+(bi?'<div class="a-box"><h3>📄 המנוי לאתר</h3><p style="margin:0 0 10px;color:#475467">'+(BILL.suspended?'האתר מושהה כרגע.':bi.left>0?'המנוי בתוקף עד <b>'+bi.date+'</b> (עוד '+bi.left+' ימים).':'המנוי הסתיים ב-'+bi.date+'.')+(BILL.price?' מחיר: '+esc(BILL.price)+'.':'')+'</p><div style="display:flex;gap:8px;flex-wrap:wrap">'+billButtons()+'</div></div>':'')+
    '<div class="a-box"><h3>🔑 שינוי סיסמה</h3><div class="a-f"><label>סיסמה נוכחית</label><input class="a-in" type="password" id="a-p0"></div><div class="a-f"><label>סיסמה חדשה</label><input class="a-in" type="password" id="a-p1"></div><button class="a-btn p" data-a="pw">עדכון סיסמה</button></div>'+
    '<div class="a-box"><h3>💾 גיבוי ושחזור</h3><p style="color:#475467;margin:0 0 10px;line-height:1.6">'+(API?'הנתונים שמורים בשרת ומסונכרנים בין כל המכשירים שבהם אתם מחוברים. מומלץ בכל זאת להוריד גיבוי מדי פעם.':'הנתונים נשמרים בדפדפן של המכשיר הזה. מומלץ להוריד גיבוי מדי פעם – וכך גם אפשר להעביר את הנתונים למכשיר אחר.')+'</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="a-btn" data-a="bk">⬇ הורדת גיבוי</button><button class="a-btn" data-a="rs">⬆ שחזור מגיבוי</button></div></div>'+
    '<div class="a-box"><h3>🗑 מחיקת כל הנתונים</h3><button class="a-btn d" data-a="wipe">'+(API?'מחיקת כל הנתונים':'מחיקת כל הנתונים במכשיר זה')+'</button></div>'+
    '<div class="a-box"><button class="a-btn" data-a="logout">🚪 יציאה מהמערכת</button></div>';
  }
  function confirmBox(msg,cb){var w=D.createElement('div');w.className='a-modal';w.innerHTML='<div class="a-mb"><h3>'+esc(msg)+'</h3><div style="display:flex;gap:8px"><button class="a-btn d" id="a-y">כן</button><button class="a-btn" id="a-n">ביטול</button></div></div>';root.appendChild(w);w.querySelector('#a-y').onclick=function(){w.remove();cb()};w.querySelector('#a-n').onclick=function(){w.remove()}}

  root.addEventListener('input',function(e){if(e.target.id==='a-q'){q=e.target.value;drawList()}});
  root.addEventListener('change',function(e){var wk=e.target.dataset&&e.target.dataset.won;if(wk){WAST.on=WAST.on||{};WAST.on[wk]=e.target.checked;if(!C.preview)api('/api/wa/settings',{slug:C.slug,on:WAST.on}).then(function(){toast('נשמר ✓')});else toast('נשמר ✓');return}var mk=e.target.dataset&&e.target.dataset.mon;if(!mk)return;MAILST.on=MAILST.on||{};MAILST.on[mk]=e.target.checked;if(!C.preview)api('/api/mail/settings',{slug:C.slug,on:MAILST.on}).then(function(){toast('נשמר ✓')});else toast('נשמר ✓')});
  root.addEventListener('click',function(e){
    if(e.target.closest('[data-stop]')){e.stopPropagation();return}
    if(e.target.classList.contains('a-modal')){e.target.remove();editing=null;return}
    var el=e.target.closest('[data-a]');if(!el)return;var a=el.dataset.a,m=el.dataset.m?mod(el.dataset.m):null;
    if(a==='site')return close();
    if(mailAct(a,el))return;
    if(a==='siteedit'){if(C.preview){toast('כאן זו תצוגה מקדימה – באתר האמיתי הכפתור פותח את העורך עם האתר, לשינויים, עיצוב ותוספות');return}location.href=(C.builder||'/')+'?edit='+encodeURIComponent(C.slug);return}
    if(a==='nav')return setView(el.dataset.v);
    if(a==='new')return editRec(m,null);
    if(a==='edit'){var r=recs(m).find(function(x){return x.id===el.dataset.id});if(r)editRec(m,r);return}
    if(a==='mclose'){el.closest('.a-modal').remove();editing=null;return}
    if(a==='del'){var ed=editing;confirmBox('למחוק את הרשומה?',function(){DATA.recs[ed.m.id]=recs(ed.m).filter(function(x){return x!==ed.r});delRec(ed.m,ed.r);var md=root.querySelector('.a-modal');if(md)md.remove();editing=null;render();toast('נמחק')});return}
    if(a==='dm'){dayMode=el.dataset.v==='1';render();return}
    if(a==='day'){var v=+el.dataset.v;curDay=v===0?today():addDays(curDay,v);render();return}
    if(a==='flt'){flt=el.dataset.v;render();return}
    if(a==='pw'){var p0=root.querySelector('#a-p0').value,p1=root.querySelector('#a-p1').value;if(C.preview){toast('בתצוגה המקדימה הסיסמה נקבעת ב„אתר בקליק”');return}if(p1.length<4){toast('הסיסמה החדשה קצרה מדי');return}
      if(API){api('/api/password',{slug:C.slug,old:p0,pass:p1}).then(function(){toast('הסיסמה עודכנה ✓');render()}).catch(function(er){toast(er.status===401?'הסיסמה הנוכחית שגויה':'העדכון נכשל')});return}
      if(pwHash(p0,C.key)!==passHash()){toast('הסיסמה הנוכחית שגויה');return}if(p1.length<4){toast('הסיסמה החדשה קצרה מדי');return}DATA.pass=pwHash(p1,C.key);store();toast('הסיסמה עודכנה ✓');render();return}
    if(a==='bk'){if(C.preview){toast('בתצוגה המקדימה אין נתונים אמיתיים לגיבוי');return}try{var bl=new Blob([JSON.stringify(DATA)],{type:'application/json'}),x=D.createElement('a');x.href=URL.createObjectURL(bl);x.download='גיבוי-'+C.name+'-'+today()+'.json';D.body.appendChild(x);x.click();x.remove();toast('הגיבוי הורד ✓')}catch(er){toast('ההורדה נכשלה')}return}
    if(a==='rs'){if(C.preview){toast('זמין באתר עצמו');return}var i=D.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=function(){var f=i.files[0];if(!f)return;var fr=new FileReader();fr.onload=function(){try{var d=JSON.parse(fr.result);if(!d.recs)throw 0;confirmBox('לשחזר? הנתונים הנוכחיים יוחלפו בנתוני הגיבוי.',function(){replaceAll({recs:d.recs,remind:d.remind,pass:DATA.pass},function(){render();toast('השחזור הושלם ✓')})})}catch(er){toast('הקובץ אינו גיבוי תקין')}};fr.readAsText(f)};i.click();return}
    if(a==='wipe'){confirmBox('למחוק את כל הנתונים במכשיר הזה? אי אפשר לבטל.',function(){if(C.preview){DATA={recs:{}};render();toast('הנתונים נמחקו');return}replaceAll({recs:{},pass:DATA.pass},function(){render();toast('הנתונים נמחקו')})});return}
    if(a==='remsave'){DATA.remind=root.querySelector('#a-rem').value;saveSetting('remind',DATA.remind);toast('הנוסח נשמר ✓');return}
    if(a==='remreset'){delete DATA.remind;saveSetting('remind',null);render();toast('חזרנו לנוסח המקורי');return}
    if(a==='ics'){exportIcs();return}
    if(a==='csv'){exportCsv(m);return}
    if(a==='retry'){open();return}
    if(a==='logout'){try{sessionStorage.removeItem(C.key+'-ok');if(API){localStorage.removeItem(tokKey());TOK=null}}catch(er){}if(API){login();return}close();return}
  });
  D.addEventListener('keydown',function(e){if(e.key==='Escape'){var md=root.querySelector('.a-modal');if(md){md.remove();editing=null}}});
  if(C.preview||C.page){open()}
  else{window.addEventListener('hashchange',function(){if(location.hash==='#admin')open()});if(location.hash==='#admin')open()}
};
