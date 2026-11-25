// Automatic billing (PayPal), custom domains (Render API) and e-mails (Brevo).
// Each part turns on by itself once its keys are set in the server's environment variables.
'use strict';

const PP_ID = (process.env.PAYPAL_CLIENT_ID || '').trim();
const PP_SECRET = (process.env.PAYPAL_SECRET || '').trim();
const PP_API = (process.env.PAYPAL_API || (/^sandbox$/i.test(process.env.PAYPAL_MODE || '') ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com')).replace(/\/+$/, '');
const RENDER_KEY = (process.env.RENDER_API_KEY || '').trim();
const RENDER_SERVICE = (process.env.RENDER_SERVICE_ID || '').trim();   // Render sets this one automatically
const RENDER_API = (process.env.RENDER_API || 'https://api.render.com/v1').replace(/\/+$/, '');
const BREVO_KEY = (process.env.BREVO_API_KEY || '').trim();
const BREVO_API = (process.env.BREVO_API || 'https://api.brevo.com/v3').replace(/\/+$/, '');
const MAIL_FROM = (process.env.MAIL_FROM || '').trim();
const MAIL_NAME = (process.env.MAIL_FROM_NAME || 'אתר בקליק').trim();
const BRAND = (process.env.BRAND_NAME || 'אתר בקליק').trim();

const enabled = { paypal: !!(PP_ID && PP_SECRET), render: !!(RENDER_KEY && RENDER_SERVICE), mail: !!(BREVO_KEY && MAIL_FROM) };

/* ---------------- PayPal ---------------- */
let ppTok = null, ppTokExp = 0;
async function ppToken() {
  if (ppTok && Date.now() < ppTokExp) return ppTok;
  const r = await fetch(PP_API + '/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(PP_ID + ':' + PP_SECRET).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error('PayPal login failed (' + r.status + ') – check PAYPAL_CLIENT_ID / PAYPAL_SECRET');
  ppTok = j.access_token; ppTokExp = Date.now() + Math.max(60, (j.expires_in || 3000) - 120) * 1000;
  return ppTok;
}
async function pp(method, path, body) {
  const r = await fetch(PP_API + path, {
    method,
    headers: { Authorization: 'Bearer ' + (await ppToken()), 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text(); let j = {}; try { j = txt ? JSON.parse(txt) : {}; } catch (e) { /* empty */ }
  if (!r.ok) { const e = new Error('PayPal ' + method + ' ' + path + ' → ' + r.status + ' ' + (j.message || j.name || txt.slice(0, 200))); e.status = r.status; throw e; }
  return j;
}
const money = n => (Math.round(Number(n) * 100) / 100).toFixed(2);

// One product + one monthly plan per price. Plan ids are remembered in the settings table.
async function ensurePlan(db, kind, amount) {
  const key = 'pp_plan_' + kind;
  const got = (await db.exec('SELECT v FROM settings WHERE site = ? AND k = ?', ['__owner', key]))[0];
  let saved = null; try { saved = got && JSON.parse(got.v); } catch (e) { /* ignore */ }
  if (saved && saved.amount === money(amount) && saved.api === PP_API) return saved.id;
  let prod = (await db.exec('SELECT v FROM settings WHERE site = ? AND k = ?', ['__owner', 'pp_product']))[0];
  let prodId = null; try { const p = prod && JSON.parse(prod.v); if (p && p.api === PP_API) prodId = p.id; } catch (e) { /* ignore */ }
  if (!prodId) {
    const p = await pp('POST', '/v1/catalogs/products', { name: BRAND + ' – אחסון אתרים', type: 'SERVICE', category: 'SOFTWARE' });
    prodId = p.id;
    await setSetting(db, 'pp_product', JSON.stringify({ id: prodId, api: PP_API }));
  }
  const plan = await pp('POST', '/v1/billing/plans', {
    product_id: prodId,
    name: kind === 'domain' ? BRAND + ' – דומיין משלכם' : BRAND + ' – דמי אחסון ותחזוקה',
    status: 'ACTIVE',
    billing_cycles: [{ frequency: { interval_unit: 'MONTH', interval_count: 1 }, tenure_type: 'REGULAR', sequence: 1, total_cycles: 0, pricing_scheme: { fixed_price: { value: money(amount), currency_code: 'ILS' } } }],
    payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: 'CANCEL', payment_failure_threshold: 2 },
  });
  await setSetting(db, key, JSON.stringify({ id: plan.id, amount: money(amount), api: PP_API }));
  return plan.id;
}
async function setSetting(db, k, v) {
  await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', ['__owner', k, v]);
}
// Returns the PayPal page the customer is sent to.
async function startSubscription(db, { kind, monthly, setupFee, pid, email, base, title }) {
  const planId = await ensurePlan(db, kind, monthly);
  const body = {
    plan_id: planId,
    custom_id: pid,
    application_context: {
      brand_name: BRAND.slice(0, 127), locale: 'he-IL', shipping_preference: 'NO_SHIPPING', user_action: 'SUBSCRIBE_NOW',
      return_url: base + '/pay/return?pid=' + pid, cancel_url: base + '/pay/cancel?pid=' + pid,
    },
  };
  if (email) body.subscriber = { email_address: email };
  if (setupFee > 0) body.plan = { payment_preferences: { setup_fee: { value: money(setupFee), currency_code: 'ILS' }, setup_fee_failure_action: 'CANCEL' } };
  const s = await pp('POST', '/v1/billing/subscriptions', body);
  const link = (s.links || []).find(l => l.rel === 'approve');
  if (!link) throw new Error('PayPal did not return an approval link');
  return { id: s.id, url: link.href };
}
const getSubscription = id => pp('GET', '/v1/billing/subscriptions/' + encodeURIComponent(id));

/* ---------------- Render custom domains ---------------- */
async function render(method, path, body) {
  const r = await fetch(RENDER_API + path, { method, headers: { Authorization: 'Bearer ' + RENDER_KEY, Accept: 'application/json', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text(); let j = {}; try { j = txt ? JSON.parse(txt) : {}; } catch (e) { /* empty */ }
  if (!r.ok) { const e = new Error('Render ' + method + ' ' + path + ' → ' + r.status + ' ' + (j.message || txt.slice(0, 200))); e.status = r.status; throw e; }
  return j;
}
async function addDomain(name) {
  if (!enabled.render) return { manual: true };
  try { return await render('POST', '/services/' + RENDER_SERVICE + '/custom-domains', { name }); }
  catch (e) { if (e.status === 409) return { exists: true }; throw e; }
}
async function domainStatus(name) {
  if (!enabled.render) return { manual: true };
  try { await render('POST', '/services/' + RENDER_SERVICE + '/custom-domains/' + encodeURIComponent(name) + '/verify'); } catch (e) { /* not ready yet */ }
  const d = await render('GET', '/services/' + RENDER_SERVICE + '/custom-domains/' + encodeURIComponent(name));
  return { verified: d.verificationStatus === 'verified', status: d.verificationStatus || 'unverified' };
}
async function removeDomain(name) {
  if (!enabled.render) return;
  try { await render('DELETE', '/services/' + RENDER_SERVICE + '/custom-domains/' + encodeURIComponent(name)); } catch (e) { /* already gone */ }
}

/* ---------------- e-mail (Brevo) ---------------- */
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function mailLayout(title, inner) {
  return `<!DOCTYPE html><html lang="he" dir="rtl"><body style="margin:0;background:#f3f5f2;font-family:Arial,Helvetica,sans-serif;color:#1f3a48">
<div style="max-width:560px;margin:0 auto;padding:24px 14px">
<div style="background:#1f3a48;border-radius:18px 18px 0 0;padding:22px;text-align:center;color:#fff;font-size:22px;font-weight:bold">${esc(BRAND)}</div>
<div style="background:#fff;border-radius:0 0 18px 18px;padding:26px 24px;line-height:1.7;font-size:15px">
<h1 style="margin:0 0 12px;font-size:22px;color:#1f3a48">${title}</h1>${inner}</div>
<p style="text-align:center;color:#8a9aa3;font-size:12px;margin-top:14px">${esc(BRAND)} · בונים אתר לעסק בכמה דקות</p></div></body></html>`;
}
const btn = (href, text, dark) => `<a href="${esc(href)}" style="display:inline-block;margin:6px 0;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:bold;background:${dark ? '#1f3a48' : '#d4f39b'};color:${dark ? '#d4f39b' : '#1f3a48'}">${text}</a>`;
const box = (label, url) => `<div style="background:#f2f8e4;border:1px solid #d4f39b;border-radius:12px;padding:10px 14px;margin:8px 0"><div style="font-size:12px;color:#5b6b75">${label}</div><a href="${esc(url)}" dir="ltr" style="color:#1f3a48;font-weight:bold;word-break:break-all">${esc(url)}</a></div>`;
function sitePublishedMail({ name, siteUrl, adminUrl, editUrl, code, left, hosting }) {
  return mailLayout('🎉 האתר שלך באוויר!', `
<p>שלום,<br>האתר <b>${esc(name || '')}</b> פורסם בהצלחה ונמצא עכשיו באינטרנט.</p>
${box('כתובת האתר – לשלוח ללקוחות', siteUrl)}
${box('מסך הניהול – רק בשבילך (עם הסיסמה שבחרת)', adminUrl)}
<p>${btn(siteUrl, 'לצפייה באתר ←')} ${btn(adminUrl, 'למסך הניהול ←', true)}</p>
<p><b>✏️ שינויים ושדרוגים:</b> נכנסים למסך הניהול ולוחצים „✏️ עריכה ושדרוג” – או <a href="${esc(editUrl)}" style="color:#1f3a48">בקישור הזה</a>. כל שינוי עולה מיד, בלי תשלום נוסף.</p>
${code && left > 0 ? `<p style="background:#fff7e0;border-radius:12px;padding:10px 14px"><b>🎟️ נשארו לך עוד ${left} ${left > 1 ? 'אתרים' : 'אתר'} בחבילה.</b> הקוד שלך: <b dir="ltr">${esc(code)}</b> – מכניסים אותו בחלון הפרסום של האתר הבא („יש לי כבר קוד רכישה”).</p>` : ''}
${hosting ? `<p style="color:#5b6b75;font-size:13px">דמי האחסון (${esc(hosting)} לחודש) נגבים אוטומטית ב-PayPal. אפשר לבטל בכל עת מחשבון ה-PayPal שלך – והאתר יישאר באוויר עד סוף התקופה ששולמה.</p>` : ''}`);
}
function domainMail({ domain, siteUrl, target, apexIp }) {
  return mailLayout('🌐 הדומיין שלך בדרך', `
<p>התשלום על הדומיין <b dir="ltr">${esc(domain)}</b> התקבל. נשאר צעד אחד אצל החברה שממנה קניתם את הדומיין – להוסיף שתי רשומות DNS:</p>
<table dir="ltr" style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0"><tr style="background:#f2f8e4"><th style="padding:8px;text-align:left">Type</th><th style="padding:8px;text-align:left">Name</th><th style="padding:8px;text-align:left">Value</th></tr>
<tr><td style="padding:8px">CNAME</td><td style="padding:8px">www</td><td style="padding:8px">${esc(target)}</td></tr>
<tr><td style="padding:8px">A</td><td style="padding:8px">@</td><td style="padding:8px">${esc(apexIp)}</td></tr></table>
<p>אחרי שהרשומות נקלטות (בדרך כלל עד שעה, לפעמים עד יום) – האתר יופיע בכתובת שלכם, עם מנעול אבטחה. עד אז הוא ממשיך לעבוד כרגיל ב:<br>${box('הכתובת הנוכחית', siteUrl)}</p>`);
}
async function sendMail(to, subject, html) {
  if (!enabled.mail || !to) return false;
  try {
    const r = await fetch(BREVO_API + '/smtp/email', {
      method: 'POST', headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ sender: { email: MAIL_FROM, name: MAIL_NAME }, to: [{ email: to }], subject, htmlContent: html }),
    });
    if (!r.ok) { console.error('Brevo send failed', r.status, (await r.text()).slice(0, 200)); return false; }
    return true;
  } catch (e) { console.error('Brevo send failed', e.message); return false; }
}

module.exports = { enabled, startSubscription, getSubscription, addDomain, domainStatus, removeDomain, sendMail, sitePublishedMail, domainMail, money };

/* ---------------- private servers (a separate Render service per customer, in the owner's account) ---------------- */
const PRIVATE_REPO = (process.env.PRIVATE_REPO || 'https://github.com/MM67938/site-builder').trim();
const PRIVATE_BRANCH = (process.env.PRIVATE_BRANCH || 'main').trim();
const RENDER_OWNER = (process.env.RENDER_OWNER_ID || '').trim();
const PRIVATE_REGION = (process.env.PRIVATE_REGION || 'frankfurt').trim();
enabled.private = enabled.render && !!PRIVATE_REPO;
async function ownerId() {
  if (RENDER_OWNER) return RENDER_OWNER;
  const list = await render('GET', '/owners?limit=1');
  const o = Array.isArray(list) && list[0] && (list[0].owner || list[0]);
  if (!o || !o.id) throw new Error('Render: could not find the workspace id – set RENDER_OWNER_ID');
  return o.id;
}
async function createPrivateServer({ name, env }) {
  const body = {
    type: 'web_service', name, ownerId: await ownerId(), repo: PRIVATE_REPO, branch: PRIVATE_BRANCH, autoDeploy: 'yes',
    envVars: Object.entries(env).map(([key, value]) => ({ key, value: String(value) })),
    serviceDetails: {
      runtime: 'node', plan: 'starter', region: PRIVATE_REGION, healthCheckPath: '/health',
      envSpecificDetails: { buildCommand: 'echo no-build', startCommand: 'node server.js' },
      disk: { name: 'data', mountPath: '/var/data', sizeGB: 1 },
    },
  };
  const r = await render('POST', '/services', body);
  const s = r.service || r;
  return { id: s.id, url: (s.serviceDetails && s.serviceDetails.url) || '' };
}
async function getService(id) { const r = await render('GET', '/services/' + encodeURIComponent(id)); return { url: (r.serviceDetails && r.serviceDetails.url) || '', suspended: r.suspended }; }
async function suspendService(id, on) { try { await render('POST', '/services/' + encodeURIComponent(id) + (on ? '/suspend' : '/resume')); } catch (e) { console.error(e.message); } }
function privateMail({ name, url }) {
  return mailLayout('🏠 השרת הפרטי שלך מוכן!', `
<p>האתר <b>${esc(name || '')}</b> עלה על שרת פרטי משלך – בכתובת הראשית שלו.</p>
${box('כתובת האתר', url)}${box('מסך הניהול', url + '/admin/site')}${box('העורך – לשינויים ושדרוגים', url + '/builder')}
<p>${btn(url, 'לצפייה באתר ←')} ${btn(url + '/admin/site', 'למסך הניהול ←', true)}</p>
<p style="color:#5b6b75;font-size:13px">נכנסים למסך הניהול עם הסיסמה שבחרת. בכפתור „✏️ עריכה ושדרוג” משנים את האתר, וכל שינוי עולה מיד.</p>`);
}
Object.assign(module.exports, { createPrivateServer, getService, suspendService, privateMail });

/* ---------------- one-time payment (PayPal order) ---------------- */
async function startOrder({ amount, pid, base, title, email }) {
  const o = await pp('POST', '/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{ custom_id: pid, description: String(title || BRAND).slice(0, 120), amount: { currency_code: 'ILS', value: money(amount) } }],
    payer: email ? { email_address: email } : undefined,
    application_context: { brand_name: BRAND.slice(0, 127), locale: 'he-IL', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW', return_url: base + '/pay/return?pid=' + pid, cancel_url: base + '/pay/cancel?pid=' + pid },
  });
  const link = (o.links || []).find(l => l.rel === 'approve' || l.rel === 'payer-action');
  if (!link) throw new Error('PayPal did not return an approval link');
  return { id: o.id, url: link.href };
}
async function captureOrder(id, pid) {
  let o;
  try { o = await pp('POST', '/v2/checkout/orders/' + encodeURIComponent(id) + '/capture', {}); }
  catch (e) { if (e.status === 422) o = await pp('GET', '/v2/checkout/orders/' + encodeURIComponent(id)); else throw e; } // already captured
  const pu = (o.purchase_units || [])[0] || {};
  return { ok: o.status === 'COMPLETED' && pu.custom_id === pid, email: (o.payer && o.payer.email_address) || '' };
}
function ownServerMail({ name, transfer, deployUrl, deployFreeUrl, code, left, plan }) {
  const tbox = box('קישור ההעברה (אישי – לא לשתף)', transfer);
  let steps;
  if (plan === 'existing') steps = `<ol style="padding-inline-start:20px;line-height:2">
<li>נכנסים לכתובת של השרת הקיים שלכם + <b dir="ltr">/add</b> (למשל <span dir="ltr">my-business-site.onrender.com/add</span>).</li>
<li>מדביקים את קישור ההעברה:${tbox}</li>
<li>בוחרים כתובת לאתר החדש, מקלידים את סיסמת הניהול של האתר הראשון ולוחצים <b>➕ הוספת האתר</b>.</li></ol>
<p>זהו – האתר החדש באותו שרת, בלי תשלום חודשי נוסף.</p>`;
  else if (plan === 'free') steps = `<ol style="padding-inline-start:20px;line-height:2">
<li>נרשמים ל-<b>Turso</b> (מסד הנתונים החינמי שבו נשמר האתר): <span dir="ltr">turso.tech</span> ← <b>Sign in with Google</b> ← <b dir="ltr">Create Database</b>. מעתיקים את ה-<b dir="ltr">URL</b>, ובלשונית <b dir="ltr">Create Token</b> מעתיקים את הטוקן.</li>
<li>לוחצים כאן: ${btn(deployFreeUrl, '🚀 הקמת השרת החינמי ←', true)} ונרשמים ל-Render עם <b>Sign in with Google</b>. לא צריך כרטיס אשראי.</li>
<li>ממלאים שלושה שדות: <b dir="ltr">IMPORT_URL</b> = קישור ההעברה${tbox}<b dir="ltr">TURSO_DATABASE_URL</b> = ה-URL מ-Turso · <b dir="ltr">TURSO_AUTH_TOKEN</b> = הטוקן.</li>
<li>לוחצים <b dir="ltr">Deploy Blueprint</b>.</li></ol>
<p style="background:#fff7e0;border-radius:12px;padding:10px 14px;font-size:14px">🆓 <b>מה זה אומר "בחינם":</b> 750 שעות שרת בחודש (מספיק לשרת אחד שפועל כל החודש). השרת מנסה להישאר ער, אבל אם הוא נרדם (אחרי 15 דקות בלי מבקרים) – הכניסה הראשונה נטענת עד דקה. Render רשאים לאתחל שרת חינמי בכל זמן. אפשר לשדרג בכל רגע ב-Render ← <span dir="ltr">Settings ← Instance Type</span>.</p>`;
  else steps = `<ol style="padding-inline-start:20px;line-height:2">
<li>לוחצים כאן: ${btn(deployUrl, '🚀 הקמת השרת ←', true)}</li>
<li>נרשמים ל-Render – הכי פשוט: <b>Sign in with Google</b>.</li>
<li>בשדה <b dir="ltr">IMPORT_URL</b> מדביקים את קישור ההעברה:${tbox}</li>
<li>מכניסים כרטיס אשראי ולוחצים <b dir="ltr">Deploy Blueprint</b>. העלות: בערך 7.25$ לחודש, ישירות ל-Render.</li></ol>`;
  return mailLayout(plan === 'existing' ? '➕ האתר החדש מחכה לשרת שלך' : '🏠 עוד כמה צעדים והאתר שלך באוויר', `
<p>תודה על הרכישה! האתר <b>${esc(name || '')}</b> מוכן לעבור לשרת שלך – שרת על שמך, בלי שום מנוי אצלנו.</p>${steps}
${plan !== 'existing' ? `<p>תוך 3–5 דקות האתר עולה בכתובת שמופיעה אצלך ב-Render (משהו כמו <span dir="ltr">my-business-site.onrender.com</span>).<br>מסך הניהול: הכתובת + <b dir="ltr">/admin/site</b> · עריכה ושדרוג: הכתובת + <b dir="ltr">/builder</b> · אתר נוסף לאותו שרת: הכתובת + <b dir="ltr">/add</b></p>` : ''}
${code && left > 0 ? `<p style="background:#fff7e0;border-radius:12px;padding:10px 14px"><b>🎟️ נשארו לך עוד ${left} ${left > 1 ? 'אתרים' : 'אתר'} בחבילה.</b> הקוד: <b dir="ltr">${esc(code)}</b> – ואת האתרים הבאים אפשר להוסיף לאותו שרת.</p>` : ''}
<p style="color:#5b6b75;font-size:13px">הקישור תקף ל-60 יום ונמחק אחרי שהאתר עבר לשרת שלך.</p>`);
}
Object.assign(module.exports, { startOrder, captureOrder, ownServerMail });

/* ---------------- bank-transfer e-mails ---------------- */
function bankMail(kind, { name, until, contact }) {
  if (kind === 'confirmed') return mailLayout('✅ התשלום אושר', `<p>תודה! ההעברה הבנקאית עבור <b>${esc(name || 'האתר')}</b> נמצאה ואושרה. אין צורך לעשות שום דבר נוסף.</p>`);
  const d = until ? new Date(until).toLocaleDateString('he-IL') : '';
  return mailLayout('⚠️ לא מצאנו את ההעברה', `<p>שלום, בדקנו את חשבון הבנק ולא מצאנו את ההעברה עבור <b>${esc(name || 'האתר')}</b>.</p>
${kind === 'warning' ? `<p><b>כדי שהאתר ימשיך לפעול – יש להסדיר את התשלום עד ${esc(d)}.</b> אחרי התאריך הזה האתר יושהה עד שהתשלום יוסדר.</p>` : '<p>הבקשה לא אושרה. אם כבר העברתם – שלחו לנו את האסמכתא שוב.</p>'}
${contact ? `<p>לבירור: <a href="https://wa.me/${esc(String(contact).replace(/\D/g, '').replace(/^0/, '972'))}">וואטסאפ ${esc(contact)}</a></p>` : ''}`);
}
module.exports.bankMail = bankMail;

/* ---------------- e-mails a business sends its OWN customers, with the business's own free Brevo key ---------------- */
async function brevoReq(key, method, path, body) {
  const r = await fetch(BREVO_API + path, { method, headers: { 'api-key': key, Accept: 'application/json', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) { /* ignore */ }
  if (!r.ok) { const e = new Error(j.message || ('Brevo ' + r.status)); e.status = r.status; throw e; }
  return j;
}
async function brevoCheck(key) {
  const acc = await brevoReq(key, 'GET', '/account');
  let senders = []; try { senders = (await brevoReq(key, 'GET', '/senders')).senders || []; } catch (e) { /* older keys */ }
  const act = senders.filter(s => s.active !== false);
  const pick = act.find(s => s.email === acc.email) || act[0];
  return { account: acc.email || '', sender: pick ? { email: pick.email, name: pick.name || '' } : null };
}
function bizMailHtml(biz, text) {
  const body = esc(text).replace(/\n/g, '<br>');
  return `<!DOCTYPE html><html lang="he" dir="rtl"><body style="margin:0;background:#f3f5f2;font-family:Arial,Helvetica,sans-serif;color:#1c2230"><div style="max-width:560px;margin:0 auto;padding:22px 14px"><div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px #0000000f"><div style="background:#1f3a48;color:#fff;padding:16px 22px;font-size:19px;font-weight:bold">${esc(biz)}</div><div style="padding:22px;line-height:1.8;font-size:15px">${body}</div></div></div></body></html>`;
}
async function bizSend(m, to, subject, text, biz) {
  await brevoReq(m.key, 'POST', '/smtp/email', { sender: { email: m.from, name: (biz || m.name || '').slice(0, 70) }, to: [{ email: to }], subject: String(subject).slice(0, 200), htmlContent: bizMailHtml(biz, text), textContent: text });
}
Object.assign(module.exports, { brevoCheck, bizSend });

/* ---------- WhatsApp for the business (its own GREEN-API instance, scanned with its own phone) ---------- */
const GREEN_API = (process.env.GREEN_API || 'https://api.green-api.com').replace(/\/+$/, '');
function waBase(w) {
  const u = String(w.url || '').replace(/\/+$/, '');
  if (u && (/^https:\/\/([a-z0-9-]+\.)*green-?api\.com$/i.test(u) || u === GREEN_API)) return u;
  return GREEN_API;
}
async function waReq(w, method, op, body) {
  const r = await fetch(waBase(w) + '/waInstance' + encodeURIComponent(w.id) + '/' + op + '/' + encodeURIComponent(w.token), { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) { /* ignore */ }
  if (!r.ok) { const e = new Error(j.message || ('WhatsApp ' + r.status)); e.status = r.status; throw e; }
  return j;
}
function waChat(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '972' + d.slice(1);
  return d.length >= 11 && d.length <= 15 ? d + '@c.us' : '';
}
async function waCheck(w) {
  const st = await waReq(w, 'GET', 'getStateInstance');
  let wid = ''; try { wid = (await waReq(w, 'GET', 'getSettings')).wid || ''; } catch (e) { /* ignore */ }
  return { state: st.stateInstance || '', wid };
}
async function waSend(w, phone, text) {
  const chatId = /@c\.us$/.test(phone) ? phone : waChat(phone); if (!chatId) throw new Error('phone');
  return waReq(w, 'POST', 'sendMessage', { chatId, message: String(text).slice(0, 4000) });
}
Object.assign(module.exports, { waCheck, waSend, waChat });
