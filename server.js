// Site-builder server: hosts the builder, every published site, and each site's admin screen.
// Zero npm dependencies (Node.js 22+). Data lives in Turso (production) or a local SQLite file.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const db = require('./db');
const bill = require('./billing');

const PORT = Number(process.env.PORT) || 3000;
const PUBLISH_CODE = (process.env.PUBLISH_CODE || '').trim();      // optional: a code people need in order to publish
const OWNER_PASSWORD = (process.env.OWNER_PASSWORD || '').trim();  // your password for the owner panel at /owner
const SINGLE = /^(1|true|yes)$/i.test(process.env.SINGLE_SITE || '');  // private server: one business, its site at the main address
const DAY = 86400000, GRACE_DAYS = 3;
const MAX_BODY = 14 * 1024 * 1024;
const PUB = path.join(__dirname, 'public');
const BUILDER_RAW = fs.readFileSync(path.join(PUB, 'builder.html'), 'utf8');
const ADMIN_JS = fs.readFileSync(path.join(PUB, 'admin-runtime.js'), 'utf8');
const OWNER_HTML = fs.readFileSync(path.join(PUB, 'owner.html'), 'utf8');
async function ownerSettings() {
  const r = await db.exec('SELECT k, v FROM settings WHERE site = ?', ['__owner']);
  const o = { mode: 'own', bankOn: false, bankMode: 'trust', bank: {}, biz: '', contact: '', hosting: '', domainPrice: '', privatePrice: '', packages: JSON.stringify(DEFAULT_PACKAGES) }; r.forEach(x => { o[x.k] = x.v; });
  try { o.packages = JSON.parse(o.packages); if (!Array.isArray(o.packages)) throw 0; } catch (e) { o.packages = DEFAULT_PACKAGES; }
  if (typeof o.bank === 'string') { try { o.bank = JSON.parse(o.bank) || {}; } catch (e) { o.bank = {}; } }
  o.bankOn = o.bankOn === true || o.bankOn === 'true'; o.bankMode = o.bankMode === 'approve' ? 'approve' : 'trust';
  return o;
}
const DEFAULT_PACKAGES = [
  { name: 'אתר אחד', sites: 1, price: '390 ₪', link: '' },
  { name: 'חבילת 3 אתרים', sites: 3, price: '990 ₪', link: '' },
  { name: 'חבילת 5 אתרים', sites: 5, price: '1,490 ₪', link: '' },
];
const DEPLOY_REPO = (process.env.DEPLOY_REPO || process.env.PRIVATE_REPO || 'https://github.com/MM67938/site-builder').trim();
const DEPLOY_URL = 'https://render.com/deploy?repo=' + DEPLOY_REPO;
const DEPLOY_FREE_URL = 'https://render.com/deploy?repo=' + DEPLOY_REPO.replace(/\/+$/, '') + '/tree/' + (process.env.DEPLOY_FREE_BRANCH || 'free');
const REQUIRE_CODE = () => !!OWNER_PASSWORD && !SINGLE;   // with an owner panel, publishing a new site needs a purchase code
function cleanPackages(list) {
  return (Array.isArray(list) ? list : []).slice(0, 6).map(p => ({
    name: cleanStr(p.name || '', 60), sites: Math.max(1, Math.min(100, parseInt(p.sites, 10) || 1)), price: cleanStr(p.price || '', 40),
    link: /^https:\/\/[^\s"'<>]+$/.test(p.link || '') ? String(p.link) : '',
  })).filter(p => p.name);
}
async function builderHtml() {
  const os = await ownerSettings();
  const sell = REQUIRE_CODE();
  const privateUrl = /^https:\/\/[^\s"'<>]+$/.test(process.env.PRIVATE_SERVER_URL || '') ? process.env.PRIVATE_SERVER_URL : '';
  return BUILDER_RAW.replace('<head>', '<head><script>window.__SERVER__=' + JSON.stringify({ needCode: !!PUBLISH_CODE, single: SINGLE, privateUrl: SINGLE ? '' : privateUrl, buy: sell, packages: sell ? cleanPackages(os.packages) : [], contact: sell ? String(os.contact || '').replace(/[^\d+]/g, '') : '', hosting: sell ? cleanStr(os.hosting || '', 40) : '', biz: cleanStr(os.biz || '', 80), own: sell && os.mode !== 'hosted' ? { deploy: DEPLOY_URL, deployFree: DEPLOY_FREE_URL, paypal: bill.enabled.paypal, bank: os.bankOn && os.bank.account ? Object.assign({ mode: os.bankMode }, os.bank) : null } : null, pay: sell && os.mode === 'hosted' && bill.enabled.paypal ? { paypal: true, domain: cleanStr(os.domainPrice || '', 40), private: bill.enabled.private ? cleanStr(os.privatePrice || '', 40) : '', mail: bill.enabled.mail } : null }).replace(/</g, '\\u003c') + '</script>');
}
const RESERVED = new Set(['api', 'admin', 'owner', 'builder', 'static', 'assets', 'www', 'app', 'health', 'login', 'robots-txt', 'favicon-ico', 'admin-runtime-js', 'new', 'help']);
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/* ---------------- helpers ---------------- */
const sha = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const newToken = () => crypto.randomBytes(24).toString('base64url');
function hashPass(p) { const salt = crypto.randomBytes(16).toString('hex'); return salt + '$' + crypto.scryptSync(String(p), salt, 32).toString('hex'); }
function checkPass(p, stored) {
  if (!stored || !stored.includes('$')) return false;
  const [salt, h] = stored.split('$');
  const a = crypto.scryptSync(String(p || ''), salt, 32), b = Buffer.from(h, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function todayIL() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date()); }
function clientIp(req) { return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim(); }

const buckets = new Map();
function limited(key, max, windowMs) {
  const now = Date.now(); let b = buckets.get(key);
  if (!b || b.reset < now) { b = { n: 0, reset: now + windowMs }; buckets.set(key, b); }
  b.n++; return b.n > max;
}
setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k); }, 60000).unref();

function send(res, status, body, headers) {
  const h = Object.assign({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' }, headers || {});
  res.writeHead(status, h); res.end(body);
}
const gzCache = new Map();
function sendHtml(req, res, html, etag, extra) {
  const h = Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'Vary': 'Accept-Encoding' }, extra || {});
  if (etag) { h.ETag = '"' + etag + '"'; if (req.headers['if-none-match'] === h.ETag) return send(res, 304, '', h); }
  if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    let gz = etag && gzCache.get(etag);
    if (!gz) { gz = zlib.gzipSync(html); if (etag) { gzCache.set(etag, gz); if (gzCache.size > 60) gzCache.delete(gzCache.keys().next().value); } }
    h['Content-Encoding'] = 'gzip'; return send(res, 200, req.method === 'HEAD' ? '' : gz, h);
  }
  send(res, 200, req.method === 'HEAD' ? '' : html, h);
}
function json(res, status, obj, extra) { send(res, status, JSON.stringify(obj), Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extra || {})); }
class HttpErr extends Error { constructor(status, msg) { super(msg); this.status = status; } }

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new HttpErr(413, 'too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(new HttpErr(400, 'bad json')); } });
    req.on('error', reject);
  });
}

// Make admin config safe to embed: no markup characters in any string; colours, font and logo strictly checked.
function cleanStr(s, max) { return String(s).replace(/"/g, '״').replace(/'/g, '׳').replace(/[<>&`\\]/g, '').slice(0, max || 400); }
function deepClean(v, depth) {
  if (depth > 8) return null;
  if (typeof v === 'string') return cleanStr(v);
  if (typeof v === 'number' || typeof v === 'boolean' || v === null) return v;
  if (Array.isArray(v)) return v.slice(0, 200).map(x => deepClean(x, depth + 1));
  if (typeof v === 'object') { const o = {}; Object.keys(v).slice(0, 80).forEach(k => { if (/^[\w-]{1,30}$/.test(k)) o[k] = deepClean(v[k], depth + 1); }); return o; }
  return null;
}
const HEX = /^#[0-9a-f]{6}$/i;
function cleanCfg(cfg, slug) {
  const t = (cfg && cfg.theme) || {};
  const theme = {
    p: HEX.test(t.p) ? t.p : '#1e3a5f', a: HEX.test(t.a) ? t.a : '#c9a227', at: HEX.test(t.at) ? t.at : '#16181d',
    pt: HEX.test(t.pt) ? t.pt : '#ffffff', soft: HEX.test(t.soft) ? t.soft : '#f1f4f8',
    fam: /^[\w\s',-]{1,80}$/.test(t.fam || '') ? t.fam : "'Heebo',sans-serif", q: /^[\w+:;@.]{1,80}$/.test(t.q || '') ? t.q : 'Heebo:wght@400;700',
  };
  const logo = typeof cfg.logo === 'string' && cfg.logo.length < 2.5e6 && /^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(cfg.logo) ? cfg.logo : '';
  const c = deepClean({ name: cfg.name, services: cfg.services, integ: cfg.integ, mods: cfg.mods }, 0) || {};
  const icon = typeof cfg.icon === 'string' && cfg.icon.length < 1.5e6 && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(cfg.icon) ? cfg.icon : '';
  return Object.assign(c, { theme, logo, icon, slug, key: 'srv-' + slug, api: '', page: true, preview: false });
}

async function getSite(slug) { const r = await db.exec('SELECT slug, owner_hash, pass_hash, cfg FROM sites WHERE slug = ?', [slug]); return r[0] || null; }
async function auth(req, slug) {
  const m = /^Bearer\s+(.+)$/.exec(req.headers.authorization || '');
  if (!m) throw new HttpErr(401, 'login');
  const r = await db.exec('SELECT site, expires FROM sessions WHERE token_hash = ?', [sha(m[1])]);
  if (!r[0] || r[0].site !== slug || r[0].expires < Date.now()) throw new HttpErr(401, 'login');
}
function normCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20); }
function newCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; const r = crypto.randomBytes(10); for (let i = 0; i < 10; i++) s += A[r[i] % A.length]; return s; }
function needSlug(slug) { if (!SLUG_RE.test(String(slug || ''))) throw new HttpErr(400, 'bad slug'); return slug; }

/* ---------------- pages ---------------- */
function page404(res, msg) {
  send(res, 404, `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>לא נמצא</title></head><body style="font-family:Arial,sans-serif;text-align:center;padding:60px 20px;color:#333"><div style="font-size:54px">🔍</div><h1>${escHtml(msg || 'הדף לא נמצא')}</h1><p><a href="/">לבניית אתר חדש ←</a></p></body></html>`, { 'Content-Type': 'text/html; charset=utf-8' });
}
function inactivePage(res) {
  send(res, 503, `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>האתר אינו זמין כרגע</title></head><body style="font-family:Arial,sans-serif;text-align:center;padding:70px 20px;color:#333;background:#f6f7f9"><div style="font-size:54px">🛠️</div><h1 style="font-size:24px">האתר אינו זמין כרגע</h1><p style="color:#666">נשמח לראותכם שוב בקרוב.</p></body></html>`, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '3600' });
}
function isActive(row) { return !row.suspended && (!row.paid_until || row.paid_until + GRACE_DAYS * DAY > Date.now()); }
// Published sites are served in a sandbox (their own opaque origin), so a page built by one person can never
// read the admin login of another site that lives on this same server.
const SITE_CSP = 'sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-top-navigation-by-user-activation';
function adminPage(cfg) {
  const t = cfg.theme;
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>ניהול – ${escHtml(cfg.name)}</title>${cfg.logo ? `<link rel="icon" href="${cfg.logo}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${t.q}&display=swap" rel="stylesheet">
<style>:root{--p:${t.p};--a:${t.a};--at:${t.at};--pt:${t.pt};--soft:${t.soft};--f:${t.fam}}body{margin:0;font-family:var(--f);background:#f3f4f7}</style></head>
<body>${cfg.logo ? `<div class="brand" style="display:none"><img src="${cfg.logo}" alt=""></div>` : ''}
<script src="/admin-runtime.js"></script><script>ADMIN_RUNTIME(${JSON.stringify(cfg).replace(/</g, '\\u003c')})</script></body></html>`;
}

/* ---------------- API ---------------- */
const api = {
  async 'GET /api/slug'(req, res, rest) {
    if (limited('slug:' + clientIp(req), 120, 60000)) throw new HttpErr(429, 'slow down');
    const slug = rest;
    if (!SLUG_RE.test(slug) || RESERVED.has(slug)) return json(res, 200, { available: false, reason: 'invalid' });
    json(res, 200, { available: !(await getSite(slug)) });
  },

  async 'GET /api/code'(req, res, rest) {
    if (limited('code:' + clientIp(req), 30, 600000)) throw new HttpErr(429, 'slow down');
    const c = (await db.exec('SELECT credits, used FROM codes WHERE code = ?', [normCode(rest)]))[0];
    json(res, 200, c ? { valid: true, credits: c.credits, left: Math.max(0, c.credits - c.used) } : { valid: false });
  },

  async 'POST /api/publish'(req, res) {
    if (limited('pub:' + clientIp(req), 40, 3600000)) throw new HttpErr(429, 'slow down');
    const b = await readJson(req);
    const slug = needSlug(b.slug);
    if (RESERVED.has(slug)) throw new HttpErr(400, 'reserved');
    if (typeof b.html !== 'string' || b.html.length < 200 || !/^<!DOCTYPE html>/i.test(b.html)) throw new HttpErr(400, 'bad html');
    if (!b.cfg || typeof b.cfg !== 'object' || !b.src || typeof b.src !== 'object') throw new HttpErr(400, 'bad data');
    const cfg = JSON.stringify(cleanCfg(b.cfg, slug)), src = JSON.stringify(b.src), now = Date.now();
    const site = await getSite(slug);
    if (!site) {
      checkNewSite(b);
      if (SINGLE && (await db.exec('SELECT slug FROM sites LIMIT 1'))[0]) throw new HttpErr(403, 'single');
      let code = '';
      if (REQUIRE_CODE()) {
        code = normCode(b.buyCode);
        const c = code && (await db.exec('SELECT credits, used FROM codes WHERE code = ?', [code]))[0];
        if (!c) throw new HttpErr(402, 'no code');
        if (c.used >= c.credits) throw new HttpErr(402, 'code used');
        await db.exec('UPDATE codes SET used = used + 1 WHERE code = ? AND used < credits', [code]);
      }
      const token = await insertSite(b, slug, { code, email: cleanEmail(b.email), ip: clientIp(req) });
      return json(res, 200, { ok: true, slug, token, created: true });
    }
    const owners = String(site.owner_hash || '').split(',');
    if (!b.token || !owners.includes(sha(b.token))) throw new HttpErr(b.token ? 401 : 409, b.token ? 'not owner' : 'taken');
    const info = (b.src && b.src.info) || {};
    await db.exec('UPDATE sites SET html = ?, cfg = ?, src = ?, updated = ?, name = ?, phone = ? WHERE slug = ?', [b.html, cfg, src, now, String(info.name || '').slice(0, 120), String(info.phone || info.wa || '').slice(0, 40), slug]);
    json(res, 200, { ok: true, slug, token: b.token });
  },

  async 'POST /api/load'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug);
    if (limited('load:' + clientIp(req) + slug, 8, 600000)) throw new HttpErr(429, 'slow down');
    const site = await getSite(slug);
    if (!site) throw new HttpErr(401, 'wrong');
    if (b.pass === undefined && req.headers.authorization) await auth(req, slug); // edit button inside the site's own admin panel
    else if (!checkPass(b.pass, site.pass_hash)) throw new HttpErr(401, 'wrong');
    const token = newToken();
    const owners = String(site.owner_hash || '').split(',').filter(Boolean).slice(-9).concat(sha(token)).join(',');
    await db.exec('UPDATE sites SET owner_hash = ? WHERE slug = ?', [owners, slug]);
    const r = await db.exec('SELECT src FROM sites WHERE slug = ?', [slug]);
    json(res, 200, { slug, token, src: JSON.parse(r[0].src) });
  },

  async 'POST /api/login'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug);
    if (limited('login:' + clientIp(req) + slug, 10, 600000)) throw new HttpErr(429, 'slow down');
    const site = await getSite(slug);
    if (!site || !checkPass(b.pass, site.pass_hash)) throw new HttpErr(401, 'wrong');
    const token = newToken();
    await db.exec('INSERT INTO sessions(token_hash, site, expires) VALUES(?,?,?)', [sha(token), slug, Date.now() + 90 * 86400000]);
    json(res, 200, { token });
  },

  async 'GET /api/data'(req, res, rest, url) {
    const slug = needSlug(url.searchParams.get('slug')); await auth(req, slug);
    const since = Number(url.searchParams.get('since')) || 0, now = Date.now();
    const rows = since > 0
      ? await db.exec('SELECT mod, id, data, deleted FROM recs WHERE site = ? AND updated >= ?', [slug, since - 5000])
      : await db.exec('SELECT mod, id, data, deleted FROM recs WHERE site = ? AND deleted = 0', [slug]);
    const st = await db.exec('SELECT k, v FROM settings WHERE site = ?', [slug]);
    const settings = {}; st.forEach(x => { settings[x.k] = x.v; });
    json(res, 200, { now, settings, recs: rows.map(r => ({ mod: r.mod, id: r.id, deleted: !!r.deleted, data: r.data ? JSON.parse(r.data) : null })) });
  },

  async 'POST /api/rec'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    const rec = b.rec || {};
    if (!/^[a-z]{2,20}$/.test(b.mod || '') || !/^[\w-]{1,40}$/.test(rec.id || '')) throw new HttpErr(400, 'bad record');
    const prev = (await db.exec('SELECT data FROM recs WHERE site = ? AND mod = ? AND id = ?', [slug, b.mod, rec.id]))[0];
    let old = {}; try { old = prev ? JSON.parse(prev.data) : {}; } catch (e) { /* ignore */ }
    if (old.reminded && old.date === rec.date && old.time === rec.time) rec.reminded = true;   // keep the server's "reminder sent" mark
    if (b.mod === 'notices') { rec.created = old.created || Date.now(); rec.edited = prev && (old.head !== rec.head || old.text !== rec.text || old.when !== rec.when) ? Date.now() : (old.edited || 0); }
    const data = JSON.stringify(rec); if (data.length > 30000) throw new HttpErr(400, 'bad record');
    if (['appointments', 'lessons'].includes(b.mod)) { if (!prev && (rec.email || rec.phone)) setTimeout(() => notify(slug, 'appt', rec), 0); else if (prev && rec.email && !cleanEmail(old.email)) setTimeout(() => autoMail(slug, 'appt', rec), 0); }
    await db.exec('INSERT INTO recs(site, mod, id, data, deleted, updated) VALUES(?,?,?,?,0,?) ON CONFLICT(site, mod, id) DO UPDATE SET data = excluded.data, deleted = 0, updated = excluded.updated', [slug, b.mod, rec.id, data, Date.now()]);
    json(res, 200, { ok: true });
  },

  async 'POST /api/rec/delete'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    if (!/^[a-z]{2,20}$/.test(b.mod || '') || !/^[\w-]{1,40}$/.test(b.id || '')) throw new HttpErr(400, 'bad record');
    await db.exec('UPDATE recs SET deleted = 1, data = NULL, updated = ? WHERE site = ? AND mod = ? AND id = ?', [Date.now(), slug, b.mod, b.id]);
    json(res, 200, { ok: true });
  },

  async 'POST /api/settings'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    if (!['remind'].includes(b.k)) throw new HttpErr(400, 'bad key');
    if (b.v == null) await db.exec('DELETE FROM settings WHERE site = ? AND k = ?', [slug, b.k]);
    else await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', [slug, b.k, String(b.v).slice(0, 2000)]);
    json(res, 200, { ok: true });
  },

  async 'POST /api/password'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    const site = await getSite(slug);
    if (!checkPass(b.old, site.pass_hash)) throw new HttpErr(401, 'wrong');
    if (String(b.pass || '').length < 4) throw new HttpErr(400, 'short');
    await db.exec('UPDATE sites SET pass_hash = ? WHERE slug = ?', [hashPass(b.pass), slug]);
    json(res, 200, { ok: true });
  },

  async 'POST /api/bulk'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    const d = b.data || {}, recs = d.recs && typeof d.recs === 'object' ? d.recs : {}, now = Date.now();
    await db.exec('UPDATE recs SET deleted = 1, data = NULL, updated = ? WHERE site = ?', [now, slug]);
    for (const mod of Object.keys(recs)) {
      if (!/^[a-z]{2,20}$/.test(mod) || !Array.isArray(recs[mod])) continue;
      for (const r of recs[mod].slice(0, 5000)) {
        if (!r || !/^[\w-]{1,40}$/.test(r.id || '')) continue;
        await db.exec('INSERT INTO recs(site, mod, id, data, deleted, updated) VALUES(?,?,?,?,0,?) ON CONFLICT(site, mod, id) DO UPDATE SET data = excluded.data, deleted = 0, updated = excluded.updated', [slug, mod, r.id, JSON.stringify(r).slice(0, 30000), now]);
      }
    }
    if (typeof d.remind === 'string') await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', [slug, 'remind', d.remind.slice(0, 2000)]);
    else await db.exec('DELETE FROM settings WHERE site = ? AND k = ?', [slug, 'remind']);
    json(res, 200, { ok: true });
  },

  async 'GET /api/billing'(req, res, rest, url) {
    const slug = needSlug(url.searchParams.get('slug')); await auth(req, slug);
    const r = await db.exec('SELECT paid_until, suspended FROM sites WHERE slug = ?', [slug]); const os = await ownerSettings();
    json(res, 200, { paidUntil: r[0].paid_until || 0, suspended: !!r[0].suspended, graceDays: GRACE_DAYS, price: cleanStr(os.price || '', 120), paylink: /^https:\/\/[^\s"'<>]+$/.test(os.paylink || '') ? os.paylink : '', contact: String(os.contact || '').replace(/[^\d+]/g, '') });
  },

  /* ---- owner panel (only when OWNER_PASSWORD is set) ---- */

  /* ---------- automatic payment (PayPal) ---------- */
  async 'POST /api/pay/start'(req, res) {
    if (!bill.enabled.paypal || !REQUIRE_CODE()) throw new HttpErr(400, 'payments are not set up');
    if (limited('pay:' + clientIp(req), 20, 3600000)) throw new HttpErr(429, 'slow down');
    const b = await readJson(req);
    const slug = checkNewSite(b);
    if (await getSite(slug)) throw new HttpErr(409, 'taken');
    const email = cleanEmail(b.email); if (!email) throw new HttpErr(400, 'email');
    const os = await ownerSettings(), pk = cleanPackages(os.packages), kind = b.plan === 'private' && bill.enabled.private ? 'private' : 'site';
    const monthly = priceNum(kind === 'private' ? os.privatePrice : os.hosting);
    if (!(monthly > 0)) throw new HttpErr(400, 'monthly price is not set');
    let setup = 0, code = normCode(b.buyCode), pkg = null;
    if (code && (await codeLeft(code)) > 0) setup = 0;
    else { code = ''; pkg = pk[Math.max(0, Math.min(pk.length - 1, parseInt(b.pkg, 10) || 0))]; if (!pkg) throw new HttpErr(400, 'no package'); setup = priceNum(pkg.price); }
    const pid = crypto.randomBytes(12).toString('hex'), key = newToken();
    const data = { slug, html: b.html, cfg: b.cfg, src: b.src, adminPass: String(b.adminPass), terms: b.terms, ip: clientIp(req), email, code, pkg: pkg ? { name: pkg.name, sites: pkg.sites } : null };
    const s = await bill.startSubscription(db, { kind: kind === 'private' ? 'private' : 'site', monthly, setupFee: setup, pid, email, base: baseUrl(req) });
    await db.exec('INSERT INTO pending(id, kind, data, created, status, result, k, sub) VALUES(?,?,?,?,?,?,?,?)', [pid, kind, JSON.stringify(data), Date.now(), 'new', '', sha(key), s.id]);
    json(res, 200, { url: s.url, pid, key });
  },
  async 'GET /api/pay/result'(req, res, pid, url) {
    const r = (await db.exec('SELECT kind, status, result, k FROM pending WHERE id = ?', [pid]))[0];
    if (!r || r.k !== sha(url.searchParams.get('k') || '')) throw new HttpErr(404, 'not found');
    json(res, 200, Object.assign({ kind: r.kind, status: r.status }, r.result ? JSON.parse(r.result) : {}));
  },
  /* ---------- custom domain for a site (monthly add-on) ---------- */
  async 'POST /api/domain/start'(req, res) {
    if (!bill.enabled.paypal) throw new HttpErr(400, 'payments are not set up');
    const b = await readJson(req); const slug = needSlug(b.slug); const site = await getSite(slug);
    if (!site || !b.token || !String(site.owner_hash || '').split(',').includes(sha(b.token))) throw new HttpErr(401, 'not owner');
    const domain = cleanDomain(b.domain); if (!domain) throw new HttpErr(400, 'bad domain');
    if (!b.terms) throw new HttpErr(400, 'terms');
    if ((await db.exec('SELECT slug FROM domains WHERE domain = ? AND status != ?', [domain, 'off']))[0]) throw new HttpErr(409, 'domain taken');
    const os = await ownerSettings(), monthly = priceNum(os.domainPrice); if (!(monthly > 0)) throw new HttpErr(400, 'domain price is not set');
    const email = cleanEmail(b.email) || (await db.exec('SELECT email FROM sites WHERE slug = ?', [slug]))[0].email || '';
    const pid = crypto.randomBytes(12).toString('hex'), key = newToken();
    const s = await bill.startSubscription(db, { kind: 'domain', monthly, setupFee: 0, pid, email, base: baseUrl(req) });
    await db.exec('INSERT INTO pending(id, kind, data, created, status, result, k, sub) VALUES(?,?,?,?,?,?,?,?)', [pid, 'domain', JSON.stringify({ slug, domain, email }), Date.now(), 'new', '', sha(key), s.id]);
    json(res, 200, { url: s.url, pid, key });
  },
  async 'POST /api/domain/status'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); const site = await getSite(slug);
    if (!site || !b.token || !String(site.owner_hash || '').split(',').includes(sha(b.token))) throw new HttpErr(401, 'not owner');
    const d = (await db.exec("SELECT domain, status FROM domains WHERE slug = ? AND status != 'off' ORDER BY created DESC LIMIT 1", [slug]))[0];
    if (!d) return json(res, 200, { domain: '' });
    let st = { manual: !bill.enabled.render };
    try { st = await bill.domainStatus('www.' + d.domain); } catch (e) { st = { error: true }; }
    if (st.verified && d.status !== 'live') await db.exec("UPDATE domains SET status = 'live' WHERE domain = ?", [d.domain]);
    json(res, 200, Object.assign({ domain: d.domain, target: dnsTarget(), apexIp: APEX_IP }, st, { live: st.verified || d.status === 'live' }));
  },




  /* ---------- the customer's OWN server: pay once here, hosting is paid by the customer directly to Render ---------- */
  async 'POST /api/own/start'(req, res) {
    if (!REQUIRE_CODE()) throw new HttpErr(400, 'not a store');
    if (limited('own:' + clientIp(req), 20, 3600000)) throw new HttpErr(429, 'slow down');
    const b = await readJson(req); b.slug = 'site';
    checkNewSite(b);
    const email = cleanEmail(b.email); if (!email) throw new HttpErr(400, 'email');
    const data = { html: b.html, cfg: b.cfg, src: b.src, adminPass: String(b.adminPass), terms: b.terms, ip: clientIp(req), email, plan: String(b.plan || 'paid') };
    let code = normCode(b.buyCode);
    if (code && (await codeLeft(code)) > 0) {          // already paid (package code) – no payment needed
      await db.exec('UPDATE codes SET used = used + 1 WHERE code = ? AND used < credits', [code]);
      const t = await makeTransfer(data, email);
      const left = await codeLeft(code), result = transferResult(req, t, data, code, left);
      result.mailed = await bill.sendMail(email, (result.plan === 'existing' ? '➕ האתר החדש מחכה לשרת שלך' : '🏠 עוד כמה צעדים והאתר שלך באוויר'), bill.ownServerMail(Object.assign({}, result, { deployUrl: DEPLOY_URL, deployFreeUrl: DEPLOY_FREE_URL })));
      return json(res, 200, Object.assign({ done: true }, result));
    }
    if (!bill.enabled.paypal) throw new HttpErr(402, 'no code');
    const os = await ownerSettings(), pk = cleanPackages(os.packages);
    const pkg = pk[Math.max(0, Math.min(pk.length - 1, parseInt(b.pkg, 10) || 0))]; if (!pkg) throw new HttpErr(400, 'no package');
    const amount = priceNum(pkg.price); if (!(amount > 0)) throw new HttpErr(400, 'package price is not set');
    data.pkg = { name: pkg.name, sites: pkg.sites };
    const pid = crypto.randomBytes(12).toString('hex'), key = newToken();
    const o = await bill.startOrder({ amount, pid, base: baseUrl(req), title: pkg.name, email });
    await db.exec('INSERT INTO pending(id, kind, data, created, status, result, k, sub) VALUES(?,?,?,?,?,?,?,?)', [pid, 'own', JSON.stringify(data), Date.now(), 'new', '', sha(key), o.id]);
    json(res, 200, { url: o.url, pid, key });
  },
  // read once by the customer's new server (IMPORT_URL); the link itself is the secret
  async 'GET /api/t'(req, res, id) {
    id = String(id || '').replace(/[^A-Za-z0-9]/g, '');
    const t = (await db.exec('SELECT * FROM transfers WHERE id = ?', [id]))[0];
    if (!t || t.status === 'imported' || !t.data || Date.now() - t.created > 60 * DAY) throw new HttpErr(404, 'not found');
    await db.exec("UPDATE transfers SET status = 'sent' WHERE id = ?", [id]);
    send(res, 200, t.data, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  },
  async 'POST /api/t'(req, res, id) {
    id = String(id || '').replace(/[^A-Za-z0-9]/g, '');
    const b = await readJson(req).catch(() => ({}));
    await db.exec("UPDATE transfers SET status = 'imported', data = '', imported = ?, url = ? WHERE id = ? AND status != 'imported'", [Date.now(), String(b.url || '').slice(0, 200), id]);
    json(res, 200, { ok: true });
  },


  /* ---------- customer's own server: add another paid site to the same server ---------- */
  async 'POST /api/add'(req, res) {
    if (!SINGLE) throw new HttpErr(404, 'not found');
    if (limited('add:' + clientIp(req), 10, 3600000)) throw new HttpErr(429, 'slow down');
    const b = await readJson(req);
    const first = (await db.exec('SELECT slug, pass_hash FROM sites ORDER BY created LIMIT 1'))[0];
    if (!first || !checkPass(String(b.pass || ''), first.pass_hash)) throw new HttpErr(401, 'wrong');
    const slug = needSlug(b.slug); if (RESERVED.has(slug) || slug === 'add' || slug === 'builder') throw new HttpErr(400, 'reserved');
    if (await getSite(slug)) throw new HttpErr(409, 'taken');
    let u; try { u = new URL(String(b.transfer || '').trim()); } catch (e) { throw new HttpErr(400, 'bad link'); }
    if (!/^https?:$/.test(u.protocol) || !/^\/api\/t\/[A-Za-z0-9]+$/.test(u.pathname)) throw new HttpErr(400, 'bad link');
    const r = await fetch(u.href, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new HttpErr(410, 'link used');
    const d = await r.json();
    await insertSite(Object.assign({}, d, { slug, html: String(d.html || '').replace(/zzslugzz/g, slug) }), slug, { ip: 'add' });
    await saveLic(slug, d.lic); licTick();
    const domain = cleanDomain(b.domain);
    if (domain) { await db.exec('INSERT INTO domains(domain, slug, sub, status, created) VALUES(?,?,?,?,?) ON CONFLICT(domain) DO UPDATE SET slug = excluded.slug, status = excluded.status', [domain, slug, '', 'live', Date.now()]); domainMapAt = 0; }
    fetch(u.href, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: (process.env.RENDER_EXTERNAL_URL || '') + '/' + slug }) }).catch(() => {});
    json(res, 200, { ok: true, slug, domain });
  },


  /* ---------- bank transfer: the customer uploads a receipt; approved by the owner (or trusted and checked later) ---------- */
  async 'POST /api/own/bank'(req, res) {
    if (!REQUIRE_CODE()) throw new HttpErr(400, 'not a store');
    if (limited('bank:' + clientIp(req), 10, 3600000)) throw new HttpErr(429, 'slow down');
    const os = await ownerSettings(); if (!os.bankOn || !os.bank.account) throw new HttpErr(400, 'bank off');
    const b = await readJson(req); b.slug = 'site'; checkNewSite(b);
    const email = cleanEmail(b.email); if (!email) throw new HttpErr(400, 'email');
    const pk = cleanPackages(os.packages), pkg = pk[Math.max(0, Math.min(pk.length - 1, parseInt(b.pkg, 10) || 0))]; if (!pkg) throw new HttpErr(400, 'no package');
    const price = priceNum(pkg.price), amount = priceNum(b.amount), ref = String(b.ref || '').replace(/[^\dA-Za-z-]/g, '').slice(0, 30);
    if (ref.length < 3) throw new HttpErr(400, 'ref');
    if (!(amount >= price)) throw new HttpErr(400, 'amount');
    const proof = String(b.proof || ''); if (!/^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/.test(proof) || proof.length > 4.5e6) throw new HttpErr(400, 'proof');
    if ((await db.exec("SELECT id FROM bankpays WHERE ref = ? AND status != 'rejected'", [ref]))[0]) throw new HttpErr(409, 'ref used');
    const id = crypto.randomBytes(9).toString('hex'), key = newToken(), name = String(((b.src || {}).info || {}).name || '').slice(0, 120);
    const data = { html: b.html, cfg: b.cfg, src: b.src, adminPass: String(b.adminPass), terms: b.terms, email, plan: String(b.plan || 'paid'), pkg: { name: pkg.name, sites: pkg.sites } };
    await db.exec('INSERT INTO bankpays(id, data, email, name, pkg, price, amount, ref, proof, status, created, decided, revoke_at, result, k) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, JSON.stringify(data), email, name, pkg.name, price, amount, ref, proof, 'waiting', Date.now(), 0, 0, '', sha(key)]);
    if (os.bankMode === 'trust') { const r = await bankRelease(id, req, 'trusted'); return json(res, 200, Object.assign({ id, key, status: 'trusted' }, r)); }
    json(res, 200, { id, key, status: 'waiting' });
  },
  async 'GET /api/own/bank'(req, res, id, url) {
    const r = (await db.exec('SELECT status, result, k, revoke_at FROM bankpays WHERE id = ?', [String(id).replace(/[^a-f0-9]/g, '')]))[0];
    if (!r || r.k !== sha(url.searchParams.get('k') || '')) throw new HttpErr(404, 'not found');
    json(res, 200, Object.assign({ status: r.status, revokeAt: r.revoke_at }, r.result ? JSON.parse(r.result) : {}));
  },
  // the customer's server asks once in a while whether a trusted bank payment was confirmed
  async 'GET /api/lic'(req, res, id) {
    const r = (await db.exec('SELECT status, revoke_at FROM bankpays WHERE lic = ?', [String(id).replace(/[^A-Za-z0-9]/g, '')]))[0];
    let state = 'ok';
    if (r && r.status === 'confirmed') state = 'paid';
    else if (r && r.status === 'rejected' && r.revoke_at && r.revoke_at < Date.now()) state = 'revoked';
    else if (r && r.status === 'rejected') state = 'warning';
    json(res, 200, { state, until: r ? r.revoke_at : 0 });
  },
  async 'GET /api/owner/bankpays'(req, res) {
    await auth(req, '__owner');
    json(res, 200, { list: await db.exec('SELECT id, email, name, pkg, price, amount, ref, status, created, decided, revoke_at FROM bankpays ORDER BY created DESC LIMIT 300') });
  },
  async 'GET /api/owner/bankproof'(req, res, id) {
    await auth(req, '__owner');
    const r = (await db.exec('SELECT proof FROM bankpays WHERE id = ?', [String(id).replace(/[^a-f0-9]/g, '')]))[0];
    if (!r) throw new HttpErr(404, 'not found');
    json(res, 200, { proof: r.proof });
  },
  async 'POST /api/owner/bank'(req, res) {
    await auth(req, '__owner');
    const b = await readJson(req), id = String(b.id || '').replace(/[^a-f0-9]/g, '');
    const r = (await db.exec('SELECT * FROM bankpays WHERE id = ?', [id]))[0]; if (!r) throw new HttpErr(404, 'not found');
    if (b.action === 'confirm') {
      if (!r.result) await bankRelease(id, req, 'confirmed');
      else { await db.exec("UPDATE bankpays SET status = 'confirmed', decided = ?, revoke_at = 0 WHERE id = ?", [Date.now(), id]); bill.sendMail(r.email, '✅ התשלום שלך אושר – תודה!', bill.bankMail('confirmed', { name: r.name })); }
    } else if (b.action === 'reject') {
      const until = r.result ? Date.now() + 3 * DAY : 0;   // a trusted customer gets 3 days to sort it out
      await db.exec("UPDATE bankpays SET status = 'rejected', decided = ?, revoke_at = ? WHERE id = ?", [Date.now(), until, id]);
      bill.sendMail(r.email, '⚠️ לא מצאנו את ההעברה הבנקאית שלך', bill.bankMail(r.result ? 'warning' : 'rejected', { name: r.name, until, contact: (await ownerSettings()).contact }));
    } else if (b.action === 'revoke') await db.exec("UPDATE bankpays SET status = 'rejected', revoke_at = ? WHERE id = ?", [Date.now() - 1000, id]);
    else throw new HttpErr(400, 'action');
    json(res, 200, { ok: true });
  },


  /* ---------- the business's own e-mail sending (admin panel) ---------- */
  async 'GET /api/mail'(req, res, rest, url) {
    const slug = needSlug(url.searchParams.get('slug')); await auth(req, slug);
    const m = await mailCfg(slug) || {};
    json(res, 200, { connected: !!m.key, from: m.from || '', on: m.on || { lead: true, order: true, appt: true, remind: true, don: true }, tpl: Object.assign({}, MAIL_TPL, m.tpl || {}) });
  },
  async 'POST /api/mail/connect'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    const key = String(b.key || '').trim(); if (!/^xkeysib-[A-Za-z0-9-]{20,}$/.test(key)) throw new HttpErr(400, 'bad key');
    let chk; try { chk = await bill.brevoCheck(key); } catch (e) { throw new HttpErr(400, e.status === 401 ? 'wrong key' : 'brevo: ' + e.message); }
    if (!chk.sender) throw new HttpErr(400, 'no sender');
    const old = await mailCfg(slug) || {}, biz = await bizInfo(slug);
    const m = { key, from: chk.sender.email, name: biz.name, on: old.on || { lead: true, order: true, appt: true, remind: true, don: true }, tpl: old.tpl || {} };
    try { await bill.bizSend(m, chk.sender.email, '✅ המיילים ללקוחות מחוברים', 'מעולה! מעכשיו האתר ישלח מיילים ללקוחות שלך מהכתובת הזו:\n' + chk.sender.email + '\n\nזה מייל בדיקה – אין צורך לענות.', biz.name); }
    catch (e) { throw new HttpErr(400, 'send failed: ' + e.message); }
    await saveMailCfg(slug, m);
    json(res, 200, { connected: true, from: m.from });
  },
  async 'POST /api/mail/settings'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    const m = await mailCfg(slug); if (!m) throw new HttpErr(400, 'not connected');
    if (b.on) m.on = { lead: !!b.on.lead, order: !!b.on.order, appt: !!b.on.appt, remind: !!b.on.remind, don: !!b.on.don };
    if (b.tpl) { m.tpl = {}; for (const k of Object.keys(MAIL_TPL)) if (Array.isArray(b.tpl[k])) m.tpl[k] = [cleanStr(String(b.tpl[k][0] || ''), 200), String(b.tpl[k][1] || '').slice(0, 3000)]; }
    await saveMailCfg(slug, m); json(res, 200, { ok: true });
  },
  async 'POST /api/mail/disconnect'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    await db.exec("DELETE FROM settings WHERE site = ? AND k = 'mail'", [slug]); json(res, 200, { ok: true });
  },
  async 'POST /api/mail/send'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    if (limited('mailsend:' + slug, 60, 3600000)) throw new HttpErr(429, 'slow down');
    const m = await mailCfg(slug); if (!m || !m.key) throw new HttpErr(400, 'not connected');
    const to = cleanEmail(b.to); if (!to) throw new HttpErr(400, 'email');
    const biz = await bizInfo(slug);
    try { await bill.bizSend(m, to, String(b.subject || biz.name).slice(0, 200), String(b.text || '').slice(0, 5000), biz.name); } catch (e) { throw new HttpErr(502, e.message); }
    json(res, 200, { ok: true });
  },

  /* ---------- the business's own WhatsApp (GREEN-API instance) ---------- */
  async 'GET /api/wa'(req, res, rest, url) {
    const slug = needSlug(url.searchParams.get('slug')); await auth(req, slug);
    const w = await waCfg(slug) || {};
    json(res, 200, { connected: !!w.token, phone: w.phone || '', on: w.on || WA_ON });
  },
  async 'POST /api/wa/connect'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    const id = String(b.id || '').replace(/\D/g, '').slice(0, 20), token = String(b.token || '').trim();
    if (!id || !/^[A-Za-z0-9]{20,80}$/.test(token)) throw new HttpErr(400, 'bad key');
    const w = { id, token, url: String(b.url || '').trim().slice(0, 100) };
    let chk; try { chk = await bill.waCheck(w); } catch (e) { throw new HttpErr(400, e.status === 401 || e.status === 403 || e.status === 404 ? 'wrong key' : 'wa: ' + e.message); }
    if (chk.state !== 'authorized') throw new HttpErr(400, 'not scanned');
    const old = await waCfg(slug) || {}, biz = await bizInfo(slug);
    Object.assign(w, { phone: String(chk.wid || '').replace(/@.*/, ''), on: old.on || WA_ON });
    if (w.phone) { try { await bill.waSend(w, w.phone + '@c.us', '✅ הוואטסאפ של ' + (biz.name || 'האתר') + ' מחובר!\nמעכשיו האתר ישלח מכאן אישורים ותזכורות ללקוחות.'); } catch (e) { /* the test message is a bonus */ } }
    await saveSet(slug, 'wa', w);
    json(res, 200, { connected: true, phone: w.phone });
  },
  async 'POST /api/wa/settings'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    const w = await waCfg(slug); if (!w) throw new HttpErr(400, 'not connected');
    if (b.on) { w.on = {}; for (const k of Object.keys(WA_ON)) w.on[k] = !!b.on[k]; }
    await saveSet(slug, 'wa', w); json(res, 200, { ok: true });
  },
  async 'POST /api/wa/disconnect'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    await db.exec("DELETE FROM settings WHERE site = ? AND k = 'wa'", [slug]); json(res, 200, { ok: true });
  },
  async 'POST /api/wa/send'(req, res) {
    const b = await readJson(req); const slug = needSlug(b.slug); await auth(req, slug);
    if (limited('wasend:' + slug, 60, 3600000)) throw new HttpErr(429, 'slow down');
    const w = await waCfg(slug); if (!w || !w.token) throw new HttpErr(400, 'not connected');
    if (!bill.waChat(b.to)) throw new HttpErr(400, 'phone');
    try { await bill.waSend(w, b.to, String(b.text || '').slice(0, 4000)); } catch (e) { throw new HttpErr(502, e.message); }
    json(res, 200, { ok: true });
  },


  // Public: the notices the gabbai published from the admin panel (shown on the site's notice board, with the bell)
  async 'GET /api/notices'(req, res, rest, url) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
    const slug = needSlug(url.searchParams.get('slug'));
    const today = todayIL(), rows = await db.exec("SELECT data FROM recs WHERE site = ? AND mod = 'notices' AND deleted = 0", [slug]);
    const out = [];
    for (const r of rows) { let d; try { d = JSON.parse(r.data); } catch (e) { continue; } if (d.until && d.until < today) continue; out.push({ head: String(d.head || '').slice(0, 200), text: String(d.text || '').slice(0, 3000), when: String(d.when || '').slice(0, 100), pinned: !!d.pinned, created: d.created || 0, edited: d.edited || 0 }); }
    out.sort((a, b) => (b.pinned - a.pinned) || ((b.edited || b.created) - (a.edited || a.created)));
    json(res, 200, { notices: out.slice(0, 60) }, cors);
  },

  // Public: a donation made on the payment page (/give). The callback from Nedarim Plus marks it as verified.
  async 'POST /api/don'(req, res) {
    if (limited('don:' + clientIp(req), 6, 60000)) throw new HttpErr(429, 'slow down');
    const b = await readJson(req); const slug = needSlug(b.slug);
    if (!(await getSite(slug))) throw new HttpErr(404, 'no site');
    const amount = Math.max(0, Math.min(1e6, Number(b.amount) || 0)); if (!amount) throw new HttpErr(400, 'amount');
    const tid = cleanStr(String(b.tid || ''), 60);
    if (tid && (await findDon(slug, tid))) return json(res, 200, { ok: true });
    const rec = donRec(tid, cleanStr(String(b.name || ''), 120), String(b.phone || '').slice(0, 40), cleanEmail(b.email), amount, cleanStr(String(b.purpose || 'תרומה'), 100), b.keva ? Math.max(0, parseInt(b.months, 10) || 0) : -1, false);
    await db.exec('INSERT INTO recs(site, mod, id, data, deleted, updated) VALUES(?,?,?,?,0,?)', [slug, 'payments', rec.id, JSON.stringify(rec), Date.now()]);
    notify(slug, 'don', rec);
    json(res, 200, { ok: true });
  },
  async 'POST /api/nedarim/cb'(req, res, rest, url) {
    const slug = needSlug(url.searchParams.get('slug'));
    let raw = ''; for await (const c of req) { raw += c; if (raw.length > 20000) break; }
    let b = {}; try { b = JSON.parse(raw); } catch (e) { b = Object.fromEntries(new URLSearchParams(raw)); }
    const tid = cleanStr(String(b.TransactionId || b.Id || b.TransactionID || ''), 60);
    if (tid && (await getSite(slug))) {
      const ex = await findDon(slug, tid);
      if (ex) { ex.d.verified = true; ex.d.desc = String(ex.d.desc || '').replace(/ ✓ אומת$/, '') + ' ✓ אומת'; await db.exec('UPDATE recs SET data = ?, updated = ? WHERE site = ? AND mod = ? AND id = ?', [JSON.stringify(ex.d), Date.now(), slug, 'payments', ex.id]); }
      else {
        const rec = donRec(tid, cleanStr(String(b.ClientName || b.FirstName || ''), 120), String(b.Phone || '').slice(0, 40), cleanEmail(b.Mail), Number(b.Amount) || 0, cleanStr(String(b.Groupe || b.Comments || 'תרומה'), 100), /HK/.test(String(b.PaymentType || '')) ? 0 : -1, true);
        await db.exec('INSERT INTO recs(site, mod, id, data, deleted, updated) VALUES(?,?,?,?,0,?)', [slug, 'payments', rec.id, JSON.stringify(rec), Date.now()]);
      }
    }
    send(res, 200, 'OK', { 'Content-Type': 'text/plain' });
  },

  async 'POST /api/owner/login'(req, res) {
    if (!OWNER_PASSWORD) throw new HttpErr(404, 'owner panel disabled');
    if (limited('owner:' + clientIp(req), 8, 900000)) throw new HttpErr(429, 'slow down');
    const b = await readJson(req);
    const a = Buffer.from(sha(b.pass || '')), c = Buffer.from(sha(OWNER_PASSWORD));
    if (!crypto.timingSafeEqual(a, c)) throw new HttpErr(401, 'wrong');
    const token = newToken();
    await db.exec('INSERT INTO sessions(token_hash, site, expires) VALUES(?,?,?)', [sha(token), '__owner', Date.now() + 30 * DAY]);
    json(res, 200, { token });
  },
  async 'GET /api/owner/sites'(req, res) {
    await auth(req, '__owner');
    const rows = await db.exec('SELECT slug, name, phone, created, updated, paid_until, suspended, code, email, pp_sub, domain FROM sites ORDER BY created DESC');
    const leads = await db.exec("SELECT site, COUNT(*) AS n FROM recs WHERE mod = 'leads' AND deleted = 0 GROUP BY site");
    const lm = {}; leads.forEach(x => { lm[x.site] = x.n; });
    const privates = await db.exec('SELECT id, name, url, status, email, sub, created FROM privates ORDER BY created DESC');
    const transfers = await db.exec('SELECT name, email, status, created, imported, url FROM transfers ORDER BY created DESC LIMIT 300');
    json(res, 200, { now: Date.now(), graceDays: GRACE_DAYS, sites: rows.map(r => Object.assign(r, { suspended: !!r.suspended, billing: !!r.paid_until, leads: lm[r.slug] || 0 })), privates, transfers });
  },
  async 'POST /api/owner/site'(req, res) {
    await auth(req, '__owner');
    const b = await readJson(req); const slug = needSlug(b.slug);
    const r = await db.exec('SELECT paid_until FROM sites WHERE slug = ?', [slug]); if (!r[0]) throw new HttpErr(404, 'no site');
    if (b.action === 'extend') {
      const days = Math.max(1, Math.min(3660, Number(b.days) || 0));
      const base = Math.max(Date.now(), r[0].paid_until || 0);
      await db.exec('UPDATE sites SET paid_until = ?, suspended = 0 WHERE slug = ?', [base + days * DAY, slug]);
    } else if (b.action === 'setdate') {
      const t = Date.parse(String(b.date || '') + 'T23:59:00'); if (!t) throw new HttpErr(400, 'bad date');
      await db.exec('UPDATE sites SET paid_until = ? WHERE slug = ?', [t, slug]);
    } else if (b.action === 'forever') {
      await db.exec('UPDATE sites SET paid_until = 0, suspended = 0 WHERE slug = ?', [slug]);
    } else if (b.action === 'suspend') {
      await db.exec('UPDATE sites SET suspended = ? WHERE slug = ?', [b.value ? 1 : 0, slug]);
    } else if (b.action === 'delete') {
      if (b.confirm !== slug) throw new HttpErr(400, 'confirm');
      await db.exec('DELETE FROM recs WHERE site = ?', [slug]); await db.exec('DELETE FROM settings WHERE site = ?', [slug]);
      await db.exec('DELETE FROM sessions WHERE site = ?', [slug]); await db.exec('DELETE FROM sites WHERE slug = ?', [slug]);
    } else throw new HttpErr(400, 'bad action');
    json(res, 200, { ok: true });
  },
  async 'GET /api/owner/codes'(req, res) {
    await auth(req, '__owner');
    const rows = await db.exec('SELECT code, credits, used, note, phone, pkg, created FROM codes ORDER BY created DESC');
    json(res, 200, { codes: rows });
  },
  async 'POST /api/owner/codes'(req, res) {
    await auth(req, '__owner'); const b = await readJson(req);
    const credits = Math.max(1, Math.min(100, parseInt(b.credits, 10) || 1)), code = newCode();
    await db.exec('INSERT INTO codes(code, credits, used, note, phone, pkg, created) VALUES(?,?,?,?,?,?,?)',
      [code, credits, 0, cleanStr(b.note || '', 120), String(b.phone || '').replace(/[^\d+]/g, '').slice(0, 20), cleanStr(b.pkg || '', 60), Date.now()]);
    json(res, 200, { code, credits });
  },
  async 'POST /api/owner/code'(req, res) {
    await auth(req, '__owner'); const b = await readJson(req); const code = normCode(b.code);
    if (b.action === 'add') await db.exec('UPDATE codes SET credits = MIN(100, credits + ?) WHERE code = ?', [Math.max(1, Math.min(50, parseInt(b.n, 10) || 1)), code]);
    else if (b.action === 'delete') await db.exec('DELETE FROM codes WHERE code = ?', [code]);
    else throw new HttpErr(400, 'bad action');
    json(res, 200, { ok: true });
  },
  async 'GET /api/owner/settings'(req, res) { await auth(req, '__owner'); json(res, 200, Object.assign(await ownerSettings(), { integrations: bill.enabled })); },
  async 'POST /api/owner/settings'(req, res) {
    await auth(req, '__owner'); const b = await readJson(req);
    if (b.packages !== undefined) {
      if ((Array.isArray(b.packages) ? b.packages : []).some(p => p.link && !/^https:\/\/[^\s"'<>]+$/.test(p.link))) throw new HttpErr(400, 'קישור תשלום חייב להתחיל ב-https://');
      await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', ['__owner', 'packages', JSON.stringify(cleanPackages(b.packages))]);
    }
    if (b.contact !== undefined) await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', ['__owner', 'contact', String(b.contact).trim().slice(0, 30)]);
    if (b.hosting !== undefined) await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', ['__owner', 'hosting', cleanStr(String(b.hosting), 40)]);
    if (b.bank !== undefined) { const bk = b.bank || {}; await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', ['__owner', 'bank', JSON.stringify({ name: cleanStr(String(bk.name || ''), 40), branch: cleanStr(String(bk.branch || ''), 10), account: cleanStr(String(bk.account || ''), 20), holder: cleanStr(String(bk.holder || ''), 60), bit: cleanStr(String(bk.bit || ''), 20) })]); }
    for (const k of ['bankOn', 'bankMode']) if (b[k] !== undefined) await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', ['__owner', k, String(b[k])]);
    for (const k of ['domainPrice', 'privatePrice', 'biz', 'mode']) if (b[k] !== undefined) await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', ['__owner', k, cleanStr(String(b[k]), 40)]);
    json(res, 200, Object.assign(await ownerSettings(), { integrations: bill.enabled }));
  },

  // Public: an order from the shopping cart on a published site → the "orders" tool in the admin screen.
  async 'POST /api/order'(req, res) {
    const cors = { 'Access-Control-Allow-Origin': '*' };
    if (limited('order:' + clientIp(req), 6, 60000)) throw Object.assign(new HttpErr(429, 'slow down'), { headers: cors });
    const b = await readJson(req); const slug = needSlug(b.slug);
    const meta = await db.exec('SELECT paid_until, suspended FROM sites WHERE slug = ?', [slug]);
    if (!meta[0] || !isActive(meta[0])) throw Object.assign(new HttpErr(404, 'no site'), { headers: cors });
    const name = String(b.name || '').trim().slice(0, 120), phone = String(b.phone || '').trim().slice(0, 40);
    const items = Array.isArray(b.items) ? b.items.slice(0, 100) : [];
    if (!name || !phone || !items.length) throw Object.assign(new HttpErr(400, 'missing'), { headers: cors });
    const money = n => '₪' + (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('he-IL');
    const lines = items.map(i => '• ' + String(i.n || '').slice(0, 120) + ' × ' + Math.max(1, Math.min(999, parseInt(i.q, 10) || 1)) + ' – ' + money((Number(i.p) || 0) * (parseInt(i.q, 10) || 1)));
    const ship = Number(b.ship) || 0, total = Math.max(0, Number(b.total) || 0);
    const desc = lines.join('\n') + (ship ? '\nמשלוח: ' + money(ship) : '') + (b.notes ? '\nהערות: ' + String(b.notes).slice(0, 800) : '');
    const id = 'o' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
    const rec = { id, date: todayIL(), time: '', name, phone, email: cleanEmail(b.email), addr: String(b.addr || '').slice(0, 200), desc, price: String(Math.round(total * 100) / 100), paid: false, status: 'חדשה' };
    await db.exec('INSERT INTO recs(site, mod, id, data, deleted, updated) VALUES(?,?,?,?,0,?)', [slug, 'orders', id, JSON.stringify(rec), Date.now()]);
    notify(slug, 'order', rec);
    json(res, 200, { ok: true }, cors);
  },

  // Public: the contact form on a published site. Sites run sandboxed, so this is a cross-origin call.
  async 'POST /api/lead'(req, res) {
    const cors = { 'Access-Control-Allow-Origin': '*' };
    if (limited('lead:' + clientIp(req), 6, 60000)) throw Object.assign(new HttpErr(429, 'slow down'), { headers: cors });
    const b = await readJson(req); const slug = needSlug(b.slug);
    if (!(await getSite(slug))) throw Object.assign(new HttpErr(404, 'no site'), { headers: cors });
    const name = String(b.name || '').trim().slice(0, 120), phone = String(b.phone || '').trim().slice(0, 40), msg = String(b.msg || '').trim().slice(0, 3000);
    if (!name) throw Object.assign(new HttpErr(400, 'name'), { headers: cors });
    const id = 'l' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
    const rec = { id, date: todayIL(), name, phone, email: cleanEmail(b.email), desc: msg, status: 'חדשה' };
    await db.exec('INSERT INTO recs(site, mod, id, data, deleted, updated) VALUES(?,?,?,?,0,?)', [slug, 'leads', id, JSON.stringify(rec), Date.now()]);
    notify(slug, 'lead', rec);
    json(res, 200, { ok: true }, cors);
  },
};





// the Nedarim Plus payment page. Sites run sandboxed, so the secure card form opens here, on a normal page.
function givePage(q) {
  const g = k => String(q.get(k) || '').slice(0, 200);
  const cfg = { slug: g('s').replace(/[^a-z0-9-]/g, ''), mosad: g('m').replace(/\D/g, ''), av: g('v').replace(/[^A-Za-z0-9]/g, ''), amount: Math.max(0, Number(g('a')) || 0), purpose: g('p'), keva: g('k') === '1', months: Math.max(0, parseInt(g('t'), 10) || 0), name: g('n'), phone: g('ph'), email: g('e'), biz: g('b'), back: /^https?:\/\//.test(g('r')) ? g('r') : '' };
  const J = JSON.stringify(cfg).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>תרומה – ${escHtml(cfg.biz)}</title>
<style>body{margin:0;font-family:system-ui,'Segoe UI',Arial;background:linear-gradient(160deg,#f4f1ea,#e9eef5);color:#1d2430;min-height:100vh}.w{max-width:520px;margin:0 auto;padding:22px 16px 40px}
.c{background:#fff;border-radius:20px;box-shadow:0 10px 40px rgba(20,30,60,.1);padding:22px}h1{font-size:22px;margin:0 0 4px}.sum{background:#f6f3ec;border-radius:14px;padding:14px 16px;margin:14px 0;display:flex;justify-content:space-between;align-items:center;gap:10px}
.sum b{font-size:26px;color:#1e3a5f}.mut{color:#667085;font-size:14px}iframe{width:100%;border:0;min-height:300px}.btn{display:block;width:100%;border:0;border-radius:14px;padding:15px;font:inherit;font-size:18px;font-weight:800;background:#1e3a5f;color:#fff;cursor:pointer;margin-top:10px}
.btn:disabled{opacity:.5}.err{color:#b42318;font-weight:700;margin-top:8px}.ok{text-align:center;padding:30px 10px}.ok .i{font-size:60px}.lock{font-size:13px;color:#12805c;text-align:center;margin-top:10px}a{color:#1e3a5f}</style></head><body><div class="w"><div class="c" id="box">
<h1>💝 תרומה ל${escHtml(cfg.biz || 'בית הכנסת')}</h1><div class="mut">${escHtml(cfg.purpose)}${cfg.name ? ' · ' + escHtml(cfg.name) : ''}</div>
<div class="sum"><span>${cfg.keva ? 'הוראת קבע חודשית' + (cfg.months ? ' ל-' + cfg.months + ' חודשים' : '') : 'סכום התרומה'}</span><b>₪${cfg.amount.toLocaleString('he-IL')}</b></div>
<div id="wait" class="mut">טוען את טופס האשראי המאובטח…</div><iframe id="nf" title="תשלום מאובטח – נדרים פלוס"></iframe>
<button class="btn" id="go" disabled>לתרומה של ₪${cfg.amount.toLocaleString('he-IL')} ←</button><div class="err" id="err"></div><div class="lock">🔒 התשלום מתבצע אצל נדרים פלוס – פרטי האשראי לא עוברים דרכנו</div></div></div>
<script>var C=${J};var F=document.getElementById('nf'),G=document.getElementById('go'),E=document.getElementById('err');
if(!C.mosad||!C.av||!C.amount){document.getElementById('box').innerHTML='<p>חסרים פרטים לתשלום. חזרו לאתר ונסו שוב.</p>'}
else{F.src='https://matara.pro/nedarimplus/iframe?language=he';
window.addEventListener('message',function(e){var d=e.data||{};if(d.Name==='Height'){F.style.height=(parseInt(d.Value,10)+15)+'px';document.getElementById('wait').style.display='none';G.disabled=false}
 if(d.Name==='TransactionResponse'){var v=d.Value||{};if(v.Status==='Error'){E.textContent=v.Message||'התשלום לא עבר';G.disabled=false;G.textContent='לנסות שוב'}else done(v)}});
setTimeout(function(){G.disabled=false},6000);
G.onclick=function(){E.textContent='';G.disabled=true;G.textContent='מעבד…';var nm=String(C.name||'').trim().split(/\\s+/);
 F.contentWindow.postMessage({Name:'FinishTransaction2',Value:{Mosad:C.mosad,ApiValid:C.av,PaymentType:C.keva?'HK':'Ragil',Currency:'1',Zeout:'',FirstName:nm[0]||'',LastName:nm.slice(1).join(' '),Street:'',City:'',Phone:C.phone,Mail:C.email,Amount:String(C.amount),Tashlumim:C.keva?String(C.months||''):'1',Groupe:C.purpose,Comment:C.purpose,Param1:C.slug,Param2:'',CallBack:C.slug?location.origin+'/api/nedarim/cb?slug='+C.slug:'',Tokef:''}},'*')};}
function done(v){if(C.slug)fetch('/api/don',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:C.slug,name:C.name,phone:C.phone,email:C.email,amount:C.amount,purpose:C.purpose,keva:C.keva,months:C.months,tid:String(v.TransactionId||v.Confirmation||'')})}).catch(function(){});
 document.getElementById('box').innerHTML='<div class="ok"><div class="i">💝</div><h1>תודה רבה!</h1><p>התרומה התקבלה בהצלחה.<br>תזכו למצוות!</p>'+(C.back?'<p><a href="'+C.back.replace(/"/g,'')+'">← חזרה לאתר</a></p>':'<p class="mut">אפשר לסגור את החלון</p>')+'</div>'}
</script></body></html>`;
}

/* ---------------- e-mails from the business to its customers (own Brevo key, per site) ---------------- */
const MAIL_TPL = {
  lead: ['קיבלנו את הפנייה שלך – {עסק}', 'שלום {שם},\nתודה שפנית אלינו! קיבלנו את ההודעה ונחזור אליך בהקדם.\n\n{עסק}\n{טלפון_העסק}'],
  order: ['ההזמנה שלך התקבלה – {עסק}', 'שלום {שם},\nתודה על ההזמנה! זה הפירוט:\n{פירוט}\nסה״כ: {סכום} ₪\n\nנעדכן אותך כשההזמנה תהיה מוכנה.\n{עסק}\n{טלפון_העסק}'],
  appt: ['התור שלך נקבע – {עסק}', 'שלום {שם},\nהתור שלך נקבע ל-{תאריך} בשעה {שעה}{שירות}.\nלשינוי או ביטול: {טלפון_העסק}\n\nמחכים לך!\n{עסק}'],
  don: ['תודה על התרומה! – {עסק}', 'שלום {שם},\nתודה רבה על תרומתך בסך {סכום} ₪ – {פירוט}.\nתזכו למצוות!\n\n{עסק}\n{טלפון_העסק}'],
  remind: ['תזכורת: מחר יש לך תור – {עסק}', 'שלום {שם},\nרק מזכירים – מחר, {תאריך}, בשעה {שעה}{שירות}.\nלשינוי או ביטול: {טלפון_העסק}\n\nמחכים לך!\n{עסק}'],
};

const WA_ON = { lead: true, order: true, appt: true, remind: true, don: true };
async function getSet(slug, k) { const r = (await db.exec('SELECT v FROM settings WHERE site = ? AND k = ?', [slug, k]))[0]; if (!r) return null; try { return JSON.parse(r.v); } catch (e) { return null; } }
async function saveSet(slug, k, v) { await db.exec("INSERT INTO settings(site, k, v) VALUES(?,?,'') ON CONFLICT(site, k) DO NOTHING", [slug, k]); await db.exec('UPDATE settings SET v = ? WHERE site = ? AND k = ?', [JSON.stringify(v), slug, k]); }
function waCfg(slug) { return getSet(slug, 'wa'); }
async function autoWa(slug, kind, rec) {
  try {
    if (!bill.waChat(rec.phone)) return;
    const w = await waCfg(slug); if (!w || !w.token || !(w.on || {})[kind]) return;
    const m = await mailCfg(slug) || {}, biz = await bizInfo(slug), tp = ((m.tpl || {})[kind]) || MAIL_TPL[kind];
    await bill.waSend(w, rec.phone, fillTpl(tp[1], rec, biz));
    return true;
  } catch (e) { console.error('auto wa', slug, kind, e.message); }
}
// one message to the customer on every channel the business connected
async function notify(slug, kind, rec) { const a = await autoMail(slug, kind, rec), b = await autoWa(slug, kind, rec); return !!(a || b); }
async function findDon(slug, tid) {
  const rows = await db.exec("SELECT id, data FROM recs WHERE site = ? AND mod = 'payments' AND deleted = 0", [slug]);
  for (const r of rows) { try { const d = JSON.parse(r.data); if (d.tid === tid) return { id: r.id, d }; } catch (e) { /* skip */ } }
  return null;
}
function donRec(tid, name, phone, email, amount, purpose, months, verified) {
  const keva = months >= 0 ? ' (הוראת קבע' + (months ? ' ל-' + months + ' חודשים' : '') + ')' : '';
  return { id: 'd' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex'), date: todayIL(), name: name || 'תורם/ת', phone, email, desc: purpose + keva + (verified ? ' ✓ אומת' : ''), price: String(Math.round(amount * 100) / 100), method: 'נדרים פלוס', tid, verified };
}
async function mailCfg(slug) {
  const r = (await db.exec("SELECT v FROM settings WHERE site = ? AND k = 'mail'", [slug]))[0];
  if (!r) return null; try { return JSON.parse(r.v); } catch (e) { return null; }
}
async function saveMailCfg(slug, m) { await db.exec("INSERT INTO settings(site, k, v) VALUES(?,?,'') ON CONFLICT(site, k) DO NOTHING", [slug, 'mail']); await db.exec("UPDATE settings SET v = ? WHERE site = ? AND k = 'mail'", [JSON.stringify(m), slug]); }
function fillTpl(t, rec, biz) {
  const d = String(rec.date || ''), dd = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split('-').reverse().join('.') : d;
  const map = { 'שם': rec.name || '', 'תאריך': dd, 'שעה': rec.time || '', 'שירות': rec.service || rec.subject ? ' – ' + (rec.service || rec.subject) : '', 'עסק': biz.name || '', 'טלפון_העסק': biz.phone || '', 'פירוט': rec.desc || '', 'סכום': rec.price || '' };
  return String(t || '').replace(/\{([^}]+)\}/g, (m, k) => (k in map ? map[k] : m));
}
async function bizInfo(slug) { const r = (await db.exec('SELECT name, phone FROM sites WHERE slug = ?', [slug]))[0] || {}; return { name: r.name || '', phone: r.phone || '' }; }
async function autoMail(slug, kind, rec) {
  try {
    const email = cleanEmail(rec.email); if (!email) return;
    const m = await mailCfg(slug); if (!m || !m.key || !(m.on || {})[kind]) return;
    const biz = await bizInfo(slug), tp = ((m.tpl || {})[kind]) || MAIL_TPL[kind];
    await bill.bizSend(m, email, fillTpl(tp[0], rec, biz), fillTpl(tp[1], rec, biz), biz.name);
    return true;
  } catch (e) { console.error('auto mail', slug, kind, e.message); }
}
// once in a while: reminder e-mails for tomorrow's appointments
async function reminderTick() {
  try {
    const sites = await db.exec("SELECT DISTINCT site FROM settings WHERE k IN ('mail','wa')");
    const t = new Date(Date.now() + 86400000), tomorrow = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(t);
    for (const s of sites) {
      const m = await mailCfg(s.site), w = await waCfg(s.site);
      const mOn = !!(m && m.key && (m.on || {}).remind), wOn = !!(w && w.token && (w.on || {}).remind);
      if (!mOn && !wOn) continue;
      const rows = await db.exec("SELECT mod, id, data FROM recs WHERE site = ? AND deleted = 0 AND mod IN ('appointments','lessons')", [s.site]);
      for (const r of rows) {
        let d; try { d = JSON.parse(r.data); } catch (e) { continue; }
        if (d.date !== tomorrow || !((mOn && cleanEmail(d.email)) || (wOn && bill.waChat(d.phone))) || d.reminded || /בוטל/.test(d.status || '')) continue;
        if (await notify(s.site, 'remind', d)) { d.reminded = true; await db.exec('UPDATE recs SET data = ?, updated = ? WHERE site = ? AND mod = ? AND id = ?', [JSON.stringify(d), Date.now(), s.site, r.mod, r.id]); }
      }
    }
  } catch (e) { console.error('reminders', e.message); }
}

/* ---------------- transfers: a paid site waiting to move to the customer's own server ---------------- */
async function makeTransfer(data, email) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; let id = ''; const r = crypto.randomBytes(18); for (let i = 0; i < 18; i++) id += A[r[i] % A.length];
  await db.exec('INSERT INTO transfers(id, data, created, status, email, name, imported, url) VALUES(?,?,?,?,?,?,?,?)',
    [id, JSON.stringify({ html: data.html, cfg: data.cfg, src: data.src, adminPass: data.adminPass, terms: data.terms, lic: data.lic || '' }), Date.now(), 'new', email || '', String(((data.src || {}).info || {}).name || '').slice(0, 120), 0, '']);
  return id;
}
function transferResult(req, id, data, code, left) {
  return { own: true, plan: ['free', 'paid', 'existing'].includes(data.plan) ? data.plan : 'paid', deployFree: DEPLOY_FREE_URL, transfer: baseUrl(req) + '/api/t/' + id, deploy: DEPLOY_URL, name: ((data.src || {}).info || {}).name || '', email: data.email, code: left > 0 ? code : '', left };
}


// payment received (or trusted for now): create the transfer link, package code and e-mail
async function bankRelease(id, req, status) {
  const r = (await db.exec('SELECT * FROM bankpays WHERE id = ?', [id]))[0];
  const d = JSON.parse(r.data); let code = '', left = 0;
  if (d.pkg && d.pkg.sites > 1) {
    code = newCodeStr();
    await db.exec('INSERT INTO codes(code, credits, used, note, phone, pkg, created) VALUES(?,?,?,?,?,?,?)', [code, d.pkg.sites, 1, d.email, '', d.pkg.name + ' (העברה בנקאית)', Date.now()]);
    left = d.pkg.sites - 1;
  }
  let lic = '';
  if (status === 'trusted') { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', rb = crypto.randomBytes(16); for (let i = 0; i < 16; i++) lic += A[rb[i] % A.length]; d.lic = baseUrl(req) + '/api/lic/' + lic; }
  const t = await makeTransfer(d, d.email), result = transferResult(req, t, d, code, left);
  if (status === 'trusted') result.trusted = true;
  result.mailed = await bill.sendMail(d.email, result.plan === 'existing' ? '➕ האתר החדש מחכה לשרת שלך' : '🏠 עוד כמה צעדים והאתר שלך באוויר', bill.ownServerMail(Object.assign({}, result, { deployUrl: DEPLOY_URL, deployFreeUrl: DEPLOY_FREE_URL })));
  await db.exec('UPDATE bankpays SET status = ?, decided = ?, result = ?, data = ?, lic = ? WHERE id = ?', [status, Date.now(), JSON.stringify(result), '', lic, id]);
  return result;
}

/* ---------------- custom domains ---------------- */
const APEX_IP = (process.env.APEX_IP || '216.24.57.1').trim();   // Render's address for root domains
function dnsTarget() { try { return new URL(process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || 'https://example.onrender.com').host; } catch (e) { return 'example.onrender.com'; } }
function cleanDomain(d) {
  d = String(d || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  return /^(?=.{4,100}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(d) && !/onrender\.com$/.test(d) ? d : '';
}
let DOMAIN_MAP = new Map(), domainMapAt = 0;
async function domainSlug(host) {
  if (Date.now() - domainMapAt > 30000) {
    domainMapAt = Date.now();
    try { const rows = await db.exec("SELECT domain, slug FROM domains WHERE status != 'off'"); DOMAIN_MAP = new Map(rows.map(r => [r.domain, r.slug])); } catch (e) { /* keep old map */ }
  }
  return DOMAIN_MAP.get(String(host || '').toLowerCase().split(':')[0].replace(/^www\./, ''));
}

/* ---------------- after PayPal: publish the site / connect the domain / build the private server ---------------- */

async function completeOwn(p, req) {
  const pid = p.id, cap = await bill.captureOrder(p.sub, pid);
  if (!cap.ok) throw new HttpErr(402, 'not paid');
  await db.exec("UPDATE pending SET status = 'working' WHERE id = ? AND status = 'new'", [pid]);
  if ((await db.exec('SELECT status FROM pending WHERE id = ?', [pid]))[0].status !== 'working') return (await db.exec('SELECT * FROM pending WHERE id = ?', [pid]))[0];
  try {
    const d = JSON.parse(p.data), email = d.email || cleanEmail(cap.email);
    let code = '', left = 0;
    if (d.pkg && d.pkg.sites > 1) {
      code = newCodeStr();
      await db.exec('INSERT INTO codes(code, credits, used, note, phone, pkg, created) VALUES(?,?,?,?,?,?,?)', [code, d.pkg.sites, 1, email, '', d.pkg.name + ' (PayPal)', Date.now()]);
      left = d.pkg.sites - 1;
    }
    const t = await makeTransfer(d, email), result = transferResult(req, t, Object.assign({}, d, { email }), code, left);
    result.mailed = await bill.sendMail(email, (result.plan === 'existing' ? '➕ האתר החדש מחכה לשרת שלך' : '🏠 עוד כמה צעדים והאתר שלך באוויר'), bill.ownServerMail(Object.assign({}, result, { deployUrl: DEPLOY_URL, deployFreeUrl: DEPLOY_FREE_URL })));
    await db.exec("UPDATE pending SET status = 'done', data = '', result = ? WHERE id = ?", [JSON.stringify(result), pid]);
  } catch (e) {
    console.error('completeOwn failed', pid, e);
    await db.exec("UPDATE pending SET status = 'error', result = ? WHERE id = ?", [JSON.stringify({ error: String(e.message).slice(0, 200) }), pid]);
  }
  return (await db.exec('SELECT * FROM pending WHERE id = ?', [pid]))[0];
}

async function completePayment(pid, req) {
  const p = (await db.exec('SELECT * FROM pending WHERE id = ?', [pid]))[0];
  if (!p) throw new HttpErr(404, 'unknown payment');
  if (p.status === 'done' || p.status === 'building') return p;
  if (p.kind === 'own') return completeOwn(p, req);
  const sub = await bill.getSubscription(p.sub);
  if (sub.custom_id !== pid || !['ACTIVE', 'APPROVED'].includes(sub.status)) throw new HttpErr(402, 'not paid');
  // claim it (two quick returns must not publish twice)
  await db.exec("UPDATE pending SET status = 'working' WHERE id = ? AND status = 'new'", [pid]);
  if ((await db.exec('SELECT status FROM pending WHERE id = ?', [pid]))[0].status !== 'working') return (await db.exec('SELECT * FROM pending WHERE id = ?', [pid]))[0];
  const d = JSON.parse(p.data), base = baseUrl(req), payerEmail = cleanEmail(sub.subscriber && sub.subscriber.email_address);
  const email = d.email || payerEmail;
  const os = await ownerSettings();
  try {
    if (p.kind === 'domain') {
      await bill.addDomain('www.' + d.domain).catch(e => console.error(e.message));
      await bill.addDomain(d.domain).catch(e => console.error(e.message));
      await db.exec('INSERT INTO domains(domain, slug, sub, status, created) VALUES(?,?,?,?,?) ON CONFLICT(domain) DO UPDATE SET slug = excluded.slug, sub = excluded.sub, status = excluded.status', [d.domain, d.slug, p.sub, 'pending', Date.now()]);
      await db.exec('UPDATE sites SET domain = ? WHERE slug = ?', [d.domain, d.slug]); domainMapAt = 0;
      const result = { slug: d.slug, domain: d.domain, target: dnsTarget(), apexIp: APEX_IP, manual: !bill.enabled.render };
      bill.sendMail(email, '🌐 הדומיין ' + d.domain + ' – צעד אחרון', bill.domainMail({ domain: d.domain, siteUrl: base + '/' + d.slug, target: result.target, apexIp: APEX_IP }));
      await db.exec("UPDATE pending SET status = 'done', result = ? WHERE id = ?", [JSON.stringify(result), pid]);
    } else {
      // purchase credits: a package of N sites gives a code for the other N-1
      let code = d.code, left = 0;
      if (code) { await db.exec('UPDATE codes SET used = used + 1 WHERE code = ? AND used < credits', [code]); left = await codeLeft(code); }
      else if (d.pkg && d.pkg.sites > 1) {
        code = newCodeStr();
        await db.exec('INSERT INTO codes(code, credits, used, note, phone, pkg, created) VALUES(?,?,?,?,?,?,?)', [code, d.pkg.sites, 1, email, '', d.pkg.name + ' (PayPal)', Date.now()]);
        left = d.pkg.sites - 1;
      }
      if (p.kind === 'private') {
        const secret = newToken();
        const svc = await bill.createPrivateServer({ name: 'site-' + d.slug, env: { SINGLE_SITE: '1', DATA_DIR: '/var/data', PUBLISH_CODE: secret, KEEP_AWAKE: 'off', NODE_VERSION: '22' } });
        await db.exec('INSERT INTO privates(id, name, service_id, url, sub, status, secret, created, email, data) VALUES(?,?,?,?,?,?,?,?,?,?)',
          [pid, String((d.src.info || {}).name || d.slug).slice(0, 120), svc.id, svc.url, p.sub, 'building', secret, Date.now(), email, p.data]);
        await db.exec("UPDATE pending SET status = 'building', result = ? WHERE id = ?", [JSON.stringify({ code, left, email }), pid]);
        setTimeout(privateTick, 5000);
      } else {
        let slug = d.slug;
        if (await getSite(slug)) slug = (slug.slice(0, 34) + '-' + crypto.randomBytes(2).toString('hex'));
        const token = await insertSite(Object.assign({}, d, { slug }), slug, { code, email, sub: p.sub, ip: d.ip });
        const result = { slug, token, siteUrl: base + '/' + slug, adminUrl: base + '/admin/' + slug, code, left, email };
        result.mailed = await bill.sendMail(email, '🎉 האתר שלך באוויר – ' + String((d.src.info || {}).name || ''), bill.sitePublishedMail({ name: (d.src.info || {}).name, siteUrl: result.siteUrl, adminUrl: result.adminUrl, editUrl: base + '/?edit=' + slug, code, left, hosting: os.hosting }));
        await db.exec("UPDATE pending SET status = 'done', result = ? WHERE id = ?", [JSON.stringify(result), pid]);
      }
    }
  } catch (e) {
    console.error('completePayment failed', pid, e);
    await db.exec("UPDATE pending SET status = 'error', result = ? WHERE id = ?", [JSON.stringify({ error: String(e.message).slice(0, 200) }), pid]);
  }
  return (await db.exec('SELECT * FROM pending WHERE id = ?', [pid]))[0];
}
function newCodeStr() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; const r = crypto.randomBytes(10); for (let i = 0; i < 10; i++) c += A[r[i] % A.length]; return c; }

// Private servers take a few minutes to build. Once one answers, the customer's site is published to it.
let privBusy = false;
async function privateTick() {
  if (privBusy) return; privBusy = true;
  try {
    const rows = await db.exec("SELECT * FROM privates WHERE status = 'building'");
    for (const r of rows) {
      try {
        let url = r.url;
        if (!url) { url = (await bill.getService(r.service_id)).url; if (url) await db.exec('UPDATE privates SET url = ? WHERE id = ?', [url, r.id]); }
        if (!url) continue;
        const h = await fetch(url + '/health').catch(() => null);
        if (!h || !h.ok) { if (Date.now() - r.created > 40 * 60000) await db.exec("UPDATE privates SET status = 'error' WHERE id = ?", [r.id]); continue; }
        const d = JSON.parse(r.data);
        const pr = await fetch(url + '/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: 'site', html: d.html, cfg: d.cfg, src: d.src, adminPass: d.adminPass, code: r.secret }) });
        const j = await pr.json().catch(() => ({}));
        if (!pr.ok && pr.status !== 403) throw new Error('publish to private server failed: ' + pr.status);
        await db.exec("UPDATE privates SET status = 'ready', data = '' WHERE id = ?", [r.id]);
        const pend = (await db.exec('SELECT result FROM pending WHERE id = ?', [r.id]))[0];
        const res0 = pend && pend.result ? JSON.parse(pend.result) : {};
        const result = Object.assign(res0, { private: true, siteUrl: url, adminUrl: url + '/admin/site', editUrl: url + '/builder', token: j.token || '' });
        result.mailed = await bill.sendMail(r.email, '🏠 השרת הפרטי שלך מוכן – ' + r.name, bill.privateMail({ name: r.name, url }));
        await db.exec("UPDATE pending SET status = 'done', result = ? WHERE id = ?", [JSON.stringify(result), r.id]);
      } catch (e) { console.error('private server', r.id, e.message); }
    }
    if (rows.length) setTimeout(privateTick, 20000);
  } finally { privBusy = false; }
}

// Twice a day: check every subscription. Stopped/failed payments take the site (or domain / private server)
// down a few days after the last paid month ends; a renewed payment brings it right back.
async function billingSweep() {
  if (!bill.enabled.paypal) return;
  const subStatus = async id => { try { const s = await bill.getSubscription(id); return { active: s.status === 'ACTIVE', until: Date.parse((s.billing_info && s.billing_info.next_billing_time) || '') || 0 }; } catch (e) { return null; } };
  for (const s of await db.exec("SELECT slug, pp_sub, suspended FROM sites WHERE pp_sub IS NOT NULL AND pp_sub != ''")) {
    const st = await subStatus(s.pp_sub); if (!st) continue;
    if (st.active) { if (s.suspended === 2 || s.suspended === 0) await db.exec('UPDATE sites SET paid_until = 0, suspended = 0 WHERE slug = ? AND suspended IN (0, 2)', [s.slug]); }
    else await db.exec('UPDATE sites SET paid_until = ? WHERE slug = ? AND (paid_until IS NULL OR paid_until = 0)', [st.until || Date.now(), s.slug]);
  }
  for (const d of await db.exec("SELECT domain, sub FROM domains WHERE status != 'off' AND sub != ''")) {
    const st = await subStatus(d.sub); if (!st || st.active) continue;
    if ((st.until || 0) + GRACE_DAYS * DAY < Date.now()) { await db.exec("UPDATE domains SET status = 'off' WHERE domain = ?", [d.domain]); await bill.removeDomain('www.' + d.domain); await bill.removeDomain(d.domain); domainMapAt = 0; }
  }
  for (const r of await db.exec("SELECT id, service_id, sub, status FROM privates WHERE status IN ('ready', 'stopped')")) {
    const st = await subStatus(r.sub); if (!st) continue;
    if (!st.active && r.status === 'ready' && (st.until || 0) + GRACE_DAYS * DAY < Date.now()) { await bill.suspendService(r.service_id, true); await db.exec("UPDATE privates SET status = 'stopped' WHERE id = ?", [r.id]); }
    if (st.active && r.status === 'stopped') { await bill.suspendService(r.service_id, false); await db.exec("UPDATE privates SET status = 'ready' WHERE id = ?", [r.id]); }
  }
}


/* ---------------- new sites (shared by free publishing and paid publishing) ---------------- */
function cleanEmail(e) { e = String(e || '').trim().toLowerCase(); return /^[^@\s"'<>]+@[^@\s"'<>]+\.[a-z]{2,}$/.test(e) && e.length < 120 ? e : ''; }
function checkNewSite(b) {
  const slug = needSlug(b.slug);
  if (RESERVED.has(slug)) throw new HttpErr(400, 'reserved');
  if (typeof b.html !== 'string' || b.html.length < 200 || !/^<!DOCTYPE html>/i.test(b.html)) throw new HttpErr(400, 'bad html');
  if (!b.cfg || typeof b.cfg !== 'object' || !b.src || typeof b.src !== 'object') throw new HttpErr(400, 'bad data');
  if (PUBLISH_CODE && String(b.code || '').trim() !== PUBLISH_CODE) throw new HttpErr(403, 'code');
  if (String(b.adminPass || '').length < 4) throw new HttpErr(400, 'password too short');
  if (!SINGLE && !/^\d{4}-\d{2}-\d{2}$/.test(String(b.terms || ''))) throw new HttpErr(400, 'terms');
  return slug;
}
async function insertSite(b, slug, extra) {
  const token = newToken(), now = Date.now(), info = (b.src && b.src.info) || {};
  await db.exec('INSERT INTO sites(slug, html, cfg, src, owner_hash, pass_hash, created, updated, paid_until, suspended, name, phone, code, email, pp_sub, terms) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [slug, b.html, JSON.stringify(cleanCfg(b.cfg, slug)), JSON.stringify(b.src), sha(token), hashPass(String(b.adminPass)), now, now, 0, 0,
      String(info.name || '').slice(0, 120), String(info.phone || info.wa || '').slice(0, 40), extra.code || '', extra.email || '', extra.sub || '', String(b.terms || '').slice(0, 10) + ' ' + new Date().toISOString().slice(0, 16) + ' ' + String(extra.ip || '').slice(0, 45)]);
  return token;
}
function baseUrl(req) {
  const env = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '');
  if (env) return env;
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0];
  return proto + '://' + req.headers.host;
}
const priceNum = s => { const n = parseFloat(String(s || '').replace(/[^\d.]/g, '')); return isFinite(n) ? n : 0; };
async function codeLeft(code) { const c = code && (await db.exec('SELECT credits, used FROM codes WHERE code = ?', [code]))[0]; return c ? c.credits - c.used : 0; }


/* ---------------- explainer video (with Range support for phones) ---------------- */
function serveMedia(req, res, name) {
  const file = path.join(__dirname, 'public', 'media', name);
  let st; try { st = fs.statSync(file); } catch (e) { return send(res, 404, 'not found'); }
  const type = name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg', base = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400' };
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (m) {
    let start = m[1] === '' ? st.size - Number(m[2]) : Number(m[1]), end = m[1] !== '' && m[2] !== '' ? Number(m[2]) : st.size - 1;
    if (!(start >= 0 && start <= end && end < st.size)) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end(); }
    res.writeHead(206, Object.assign(base, { 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 }));
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, Object.assign(base, { 'Content-Length': st.size }));
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}



/* ---------------- customer's own server: a bank payment that was trusted is checked later ---------------- */
const LIC = new Map();   // slug -> 'revoked'
async function licTick() {
  if (!SINGLE) return;
  try {
    const rows = await db.exec("SELECT site, v FROM settings WHERE k = 'lic'");
    for (const r of rows) {
      try {
        const x = await (await fetch(r.v)).json();
        if (x.state === 'paid') { await db.exec("DELETE FROM settings WHERE site = ? AND k = 'lic'", [r.site]); LIC.delete(r.site); }
        else if (x.state === 'revoked') LIC.set(r.site, 'revoked'); else LIC.delete(r.site);
      } catch (e) { /* the builder's server is unreachable – never block the site because of that */ }
    }
  } catch (e) { /* ignore */ }
}
async function saveLic(slug, url) { if (/^https?:\/\/[^\s]+\/api\/lic\/[A-Za-z0-9]+$/.test(String(url || ''))) await db.exec('INSERT INTO settings(site, k, v) VALUES(?,?,?) ON CONFLICT(site, k) DO UPDATE SET v = excluded.v', [slug, 'lic', url]); }
function revokedPage() {
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>האתר מושהה</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f5f2;font-family:Arial,sans-serif;color:#1f3a48;text-align:center;padding:20px}.c{background:#fff;border-radius:20px;padding:30px;max-width:440px;box-shadow:0 10px 30px #0001}</style></head><body><div class="c"><div style="font-size:46px">⏸️</div><h1 style="font-size:22px">האתר מושהה זמנית</h1><p>האתר יחזור לפעול בקרוב.</p></div></body></html>`;
}

/* ---------------- customer's own server: bring the paid site over (once) ---------------- */
const IMPORT_URL = (process.env.IMPORT_URL || '').trim();
let importState = IMPORT_URL ? 'waiting' : 'none';
async function importTick() {
  if (!SINGLE || !IMPORT_URL || importState === 'done') return;
  try {
    if ((await db.exec('SELECT slug FROM sites LIMIT 1'))[0]) { importState = 'done'; return; }
    const r = await fetch(IMPORT_URL, { headers: { Accept: 'application/json' } });
    if (r.status === 404) { importState = 'gone'; return; }
    if (!r.ok) throw new Error('import ' + r.status);
    const d = await r.json();
    await insertSite(Object.assign({}, d, { slug: 'site', html: String(d.html || '').replace(/zzslugzz/g, 'site') }), 'site', { ip: 'import' });
    await saveLic('site', d.lic); licTick();
    importState = 'done';
    const self = (process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '');
    fetch(IMPORT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: self }) }).catch(() => {});
    console.log('site imported from the builder ✓');
  } catch (e) { console.error('import failed, retrying', e.message); setTimeout(importTick, 20000); }
}
function settingUpPage() {
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="8"><title>האתר בהקמה…</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#1f6f78,#174f5c);font-family:Arial,sans-serif;color:#fff;text-align:center}.c{padding:30px}.s{width:56px;height:56px;border-radius:50%;border:5px solid #d4f39b55;border-top-color:#d4f39b;margin:0 auto 18px;animation:r 1s linear infinite}@keyframes r{to{transform:rotate(360deg)}}h1{margin:0 0 8px}p{opacity:.85}</style></head>
<body><div class="c"><div class="s"></div><h1>${importState === 'gone' ? 'קישור ההעברה כבר נוצל או פג תוקפו' : 'האתר שלכם עובר לשרת החדש…'}</h1><p>${importState === 'gone' ? 'כנסו ל-/builder וטענו את האתר מקובץ, או פנו למי שמכר לכם את הבנייה.' : 'זה לוקח עד דקה. הדף יתרענן לבד.'}</p></div></body></html>`;
}


function addSitePage() {
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>הוספת אתר לשרת שלך</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;background:linear-gradient(135deg,#1f6f78,#174f5c);font-family:Arial,Helvetica,sans-serif;display:grid;place-items:center;padding:16px;color:#1f3a48}
.c{background:#fff;border-radius:22px;padding:26px;width:min(480px,100%);box-shadow:0 30px 70px #0005}h1{margin:0 0 6px;font-size:23px}p{color:#5b6b75;margin:0 0 16px;line-height:1.6}
label{display:block;font-weight:bold;margin:12px 0 5px;font-size:14px}input{width:100%;border:1.5px solid #d0d5dd;border-radius:12px;padding:11px 12px;font-size:15px;outline:none}input:focus{border-color:#1f3a48;box-shadow:0 0 0 3px #d4f39b}
.row{display:flex;direction:ltr;border:1.5px solid #d0d5dd;border-radius:12px;overflow:hidden}.row span{background:#f2f4f7;padding:11px 8px;color:#667085;font-size:14px;white-space:nowrap}.row input{border:0;border-radius:0}
small{color:#667085;font-size:12.5px}button{margin-top:18px;width:100%;border:0;border-radius:14px;padding:14px;background:#1f3a48;color:#d4f39b;font-weight:bold;font-size:16px;cursor:pointer}
#m{min-height:20px;margin-top:10px;font-size:14px}.ok{background:#ecfdf3;border:1px solid #a7f3d0;border-radius:12px;padding:12px;color:#12805c}.ok a{color:#1f3a48;font-weight:bold}</style></head>
<body><div class="c"><h1>➕ הוספת אתר נוסף לשרת שלך</h1><p>קניתם אתר נוסף? מכניסים כאן את קישור ההעברה שלו – והוא יעלה על אותו שרת, בלי שרת ובלי תשלום חודשי נוסף.</p>
<label>קישור ההעברה של האתר החדש</label><input id="t" dir="ltr" placeholder="https://…/api/t/…">
<label>הכתובת של האתר החדש</label><div class="row"><span>${(process.env.RENDER_EXTERNAL_URL || '').replace(/^https?:\/\//, '') || 'השרת-שלכם'}/</span><input id="s" placeholder="my-shop"></div><small>אותיות באנגלית, מספרים ומקפים</small>
<label>דומיין משלכם לאתר הזה (לא חובה)</label><input id="d" dir="ltr" placeholder="my-shop.co.il"><small>צריך להוסיף אותו גם ב-Render ← Settings ← Custom Domains</small>
<label>סיסמת מסך הניהול של האתר הראשון בשרת</label><input id="p" type="password"><small>כדי לוודא שרק בעל השרת מוסיף אתרים</small>
<button id="go">➕ הוספת האתר</button><div id="m"></div></div>
<script>var t=new URLSearchParams(location.hash.slice(1)).get('t');if(t)document.getElementById('t').value=t;
document.getElementById('go').onclick=function(){var m=document.getElementById('m'),b=this;m.textContent='מוסיף…';b.disabled=true;
fetch('/api/add',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transfer:document.getElementById('t').value,slug:document.getElementById('s').value.trim().toLowerCase(),domain:document.getElementById('d').value,pass:document.getElementById('p').value})}).then(function(r){return r.json().then(function(j){return[r.status,j]})}).then(function(x){b.disabled=false;
if(x[0]===200){m.innerHTML='<div class="ok">🎉 האתר נוסף!<br>כתובת: <a href="/'+x[1].slug+'">'+location.host+'/'+x[1].slug+'</a><br>מסך הניהול: <a href="/admin/'+x[1].slug+'">'+location.host+'/admin/'+x[1].slug+'</a></div>';return}
m.style.color='#c92a2a';m.textContent={401:'הסיסמה לא נכונה',409:'הכתובת הזו כבר תפוסה – בחרו אחרת',410:'קישור ההעברה כבר נוצל או פג תוקפו',400:'בדקו את הקישור ואת הכתובת'}[x[0]]||'משהו השתבש – נסו שוב'}).catch(function(){b.disabled=false;m.textContent='אין חיבור – נסו שוב'})}</script></body></html>`;
}

/* ---------------- router ---------------- */
async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);

  if (req.method === 'OPTIONS' && (p === '/api/lead' || p === '/api/order')) return send(res, 204, '', { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' });
  if (p.startsWith('/api/')) {
    const keys = Object.keys(api);
    let fn = api[req.method + ' ' + p], rest = '';
    if (!fn) { const k = keys.find(k => { const [m, base] = k.split(' '); return m === req.method && p.startsWith(base + '/'); }); if (k) { fn = api[k]; rest = p.slice(k.split(' ')[1].length + 1); } }
    if (!fn) return json(res, 404, { error: 'not found' });
    return fn(req, res, rest, url);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed');
  const dslug = await domainSlug(req.headers.host);
  if (dslug) {
    if (p === '/' || p === '/index.html') return serveSite(req, res, dslug);
    if (p === '/admin' || p === '/admin/') { const r = await db.exec('SELECT cfg FROM sites WHERE slug = ?', [dslug]); if (r[0]) return send(res, 200, adminPage(Object.assign(JSON.parse(r[0].cfg), { builder: (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '') + '/' })), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Frame-Options': 'DENY' }); }
  }
  if (p === '/media/how.mp4' || p === '/media/how.jpg') return serveMedia(req, res, p.slice(7));
  if (p === '/pay/return') {
    const pid = String(url.searchParams.get('pid') || '').replace(/[^a-f0-9]/g, '');
    try { await completePayment(pid, req); } catch (e) { return send(res, 302, '', { Location: '/?payerr=1' }); }
    return send(res, 302, '', { Location: '/?paid=' + pid });
  }
  if (p === '/pay/cancel') return send(res, 302, '', { Location: '/?paycancel=1' });
  if (SINGLE && (p === '/add' || p === '/add/')) return send(res, 200, addSitePage(), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' });
  if (p === '/give' || p === '/give/') return send(res, 200, givePage(url.searchParams), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  if (p === '/builder' || p === '/builder/') return sendHtml(req, res, await builderHtml(), null);
  if (p === '/' || p === '/index.html') {
    if (SINGLE) { const one = await db.exec('SELECT slug FROM sites ORDER BY created LIMIT 1'); if (one[0]) return serveSite(req, res, one[0].slug); if (IMPORT_URL) return send(res, 200, settingUpPage(), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); }
    return sendHtml(req, res, await builderHtml(), null);
  }
  if (p === '/owner' || p === '/owner/') { if (!OWNER_PASSWORD) return page404(res); return sendHtml(req, res, OWNER_HTML, null, { 'X-Frame-Options': 'DENY' }); }
  if (p === '/health') return json(res, 200, { ok: true, db: db.kind() });
  if (p === '/admin-runtime.js') return send(res, 200, ADMIN_JS, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
  if (p === '/robots.txt') return send(res, 200, 'User-agent: *\nDisallow: /admin/\nDisallow: /api/\n', { 'Content-Type': 'text/plain' });
  if (p === '/favicon.ico') return send(res, 204, '');

  const am = /^\/app\/([a-z0-9-]+)\/([a-z.]*)$/.exec(p);
  if (am) return serveApp(req, res, am[1], am[2]);
  if (/^\/app\/[a-z0-9-]+$/.test(p)) return send(res, 301, '', { Location: p + '/' });
  let m = /^\/admin\/([a-z0-9-]+)\/?$/.exec(p);
  if (m) {
    const r = await db.exec('SELECT cfg FROM sites WHERE slug = ?', [m[1]]);
    if (!r[0]) return page404(res, 'האתר לא נמצא');
    return send(res, 200, adminPage(Object.assign(JSON.parse(r[0].cfg), { builder: SINGLE ? '/builder' : '/' })), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Frame-Options': 'DENY' });
  }
  m = /^\/([a-z0-9-]+)\/?$/.exec(p);
  if (m) return serveSite(req, res, m[1]);
  page404(res);
}

/* ---------- install a site on the home screen (a small app shell around the sandboxed site) ---------- */
async function serveApp(req, res, slug, file) {
  const r = await db.exec('SELECT name, cfg FROM sites WHERE slug = ?', [slug]);
  if (!r[0]) return page404(res, 'האתר לא נמצא');
  let cfg = {}; try { cfg = JSON.parse(r[0].cfg) || {}; } catch (e) { /* ignore */ }
  const name = String(r[0].name || cfg.name || slug).slice(0, 60), color = (cfg.theme && cfg.theme.p) || '#1e3a5f', base = '/app/' + slug + '/';
  if (file === 'icon.png' || file === 'icon.svg') {
    if (cfg.icon && file === 'icon.png') return send(res, 200, Buffer.from(cfg.icon.split(',')[1], 'base64'), { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' });
    const L = escHtml(name.trim().charAt(0) || 'א');
    return send(res, 200, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${color}"/><text x="256" y="300" font-size="280" font-family="Arial" font-weight="700" fill="#fff" text-anchor="middle">${L}</text></svg>`, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' });
  }
  const icon = cfg.icon ? { src: base + 'icon.png', sizes: '192x192 512x512', type: 'image/png', purpose: 'any' } : { src: base + 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' };
  if (file === 'manifest.json') return send(res, 200, JSON.stringify({ name, short_name: name.slice(0, 14), lang: 'he', dir: 'rtl', start_url: base, scope: base, display: 'standalone', background_color: '#ffffff', theme_color: color, icons: [icon, Object.assign({}, icon, { purpose: 'maskable' })] }), { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-cache' });
  if (file === 'sw.js') return send(res, 200, "self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(fetch(e.request).catch(()=>new Response('<meta charset=utf-8><body style=\"font-family:sans-serif;text-align:center;padding:40px\" dir=rtl><h2>אין חיבור לאינטרנט</h2><p>נסו שוב כשהחיבור יחזור</p>',{headers:{'Content-Type':'text/html; charset=utf-8'}})))});", { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
  if (file) return page404(res);
  const site = SINGLE ? '/' : '/' + slug;
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${escHtml(name)}</title>
<link rel="manifest" href="${base}manifest.json"><meta name="theme-color" content="${color}"><link rel="apple-touch-icon" href="${base}${cfg.icon ? 'icon.png' : 'icon.svg'}"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="${escHtml(name.slice(0, 14))}">
<style>html,body{margin:0;height:100%;overflow:hidden;font-family:system-ui,Arial}iframe{border:0;width:100%;height:100%;display:block}#bn{position:fixed;left:12px;right:12px;bottom:14px;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:14px;display:none;gap:12px;align-items:center;z-index:9}
#bn img{width:48px;height:48px;border-radius:12px}#bn div{flex:1}#bn b{display:block;font-size:16px}#bn small{color:#667085}#bn button{border:0;border-radius:12px;padding:11px 16px;font:inherit;font-weight:800;background:${color};color:#fff;cursor:pointer}#bn .x{background:none;color:#667085;padding:6px;font-size:18px}
#ios{position:fixed;inset:auto 12px 14px;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:16px;display:none;z-index:9;line-height:1.7}</style></head><body>
<iframe src="${site}" title="${escHtml(name)}" allow="clipboard-write; web-share"></iframe>
<div id="bn"><img src="${base}${cfg.icon ? 'icon.png' : 'icon.svg'}" alt=""><div><b>${escHtml(name)}</b><small>להתקין כאפליקציה במסך הבית</small></div><button id="go">התקנה</button><button class="x" id="no">✕</button></div>
<div id="ios"><b>📲 להתקנה באייפון:</b><br>לוחצים על „שיתוף” ⬆️ בתחתית ספארי ← „הוספה למסך הבית” ← „הוסף”.<br><button onclick="this.parentNode.style.display='none'" style="margin-top:8px;border:0;border-radius:10px;padding:8px 14px;background:${color};color:#fff;font:inherit">הבנתי</button></div>
<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('${base}sw.js',{scope:'${base}'}).catch(function(){});
var st=matchMedia('(display-mode: standalone)').matches||navigator.standalone,ev=null,bn=document.getElementById('bn');
addEventListener('beforeinstallprompt',function(e){e.preventDefault();ev=e;if(!st)bn.style.display='flex'});
document.getElementById('go').onclick=function(){if(!ev)return;ev.prompt();ev.userChoice.then(function(){bn.style.display='none';ev=null})};document.getElementById('no').onclick=function(){bn.style.display='none'};
if(!st&&/iphone|ipad|ipod/i.test(navigator.userAgent))document.getElementById('ios').style.display='block';
setTimeout(function(){if(!st&&!ev&&!/iphone|ipad|ipod/i.test(navigator.userAgent)){var i=document.getElementById('ios');i.innerHTML='<b>📲 להתקנה:</b><br>בכרום לוחצים על ⋮ למעלה ← „הוספה למסך הבית” / „התקנת אפליקציה”.<br><button onclick="this.parentNode.style.display=\\'none\\'" style="margin-top:8px;border:0;border-radius:10px;padding:8px 14px;background:${color};color:#fff;font:inherit">הבנתי</button>';i.style.display='block'}},4000);</script></body></html>`;
  return send(res, 200, html, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
}
async function serveSite(req, res, slug) {
  if (SINGLE && LIC.get(slug) === 'revoked') return send(res, 200, revokedPage(), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  const meta = await db.exec('SELECT updated, paid_until, suspended FROM sites WHERE slug = ?', [slug]);
  if (!meta[0]) return page404(res, 'האתר לא נמצא');
  if (!isActive(meta[0])) return inactivePage(res);
  const etag = slug + '-' + meta[0].updated;
  if (req.headers['if-none-match'] === '"' + etag + '"') return send(res, 304, '', { ETag: '"' + etag + '"', 'Content-Security-Policy': SITE_CSP });
  const r = await db.exec('SELECT html FROM sites WHERE slug = ?', [slug]);
  return sendHtml(req, res, r[0].html, etag, { 'Content-Security-Policy': SITE_CSP });
}

db.init().then(() => {
  http.createServer((req, res) => {
    handle(req, res).catch(e => {
      const status = e.status || 500;
      if (status === 500) console.error(e);
      if (!res.headersSent) json(res, status, { error: status === 500 ? 'server error' : e.message }, e.headers);
    });
  }).listen(PORT, () => console.log(`Site builder running on port ${PORT} (database: ${db.kind()}${SINGLE ? ', private single-site server' : ''})`));
  if (bill.enabled.paypal) { setTimeout(billingSweep, 60000); setInterval(() => billingSweep().catch(e => console.error('billing sweep', e.message)), 12 * 3600000); }
  setTimeout(privateTick, 15000);
  setTimeout(importTick, 1500);
  setTimeout(reminderTick, 30000); setInterval(reminderTick, 30 * 60000);
  if (SINGLE) { setTimeout(licTick, 5000); setInterval(licTick, 6 * 3600000); }
  // Keep a free Render instance awake: it sleeps after 15 minutes without visits, so visit ourselves every 10.
  const selfUrl = (process.env.KEEP_AWAKE_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '');
  if (selfUrl && process.env.KEEP_AWAKE !== 'off') {
    setInterval(() => { fetch(selfUrl + '/health').catch(() => {}); }, 10 * 60000);
    console.log('Keep-awake: pinging ' + selfUrl + '/health every 10 minutes');
  }
}).catch(e => { console.error('Database init failed:', e); process.exit(1); });
