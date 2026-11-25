// Storage layer: Turso (over its HTTP API) in production, a local SQLite file for development.
// No npm packages needed – uses only what ships with Node.js 22+.
'use strict';
const path = require('node:path');
const fs = require('node:fs');

const TURSO_URL = (process.env.TURSO_DATABASE_URL || '').trim();
const TURSO_TOKEN = (process.env.TURSO_AUTH_TOKEN || '').trim();

function toHttpUrl(u) {
  // libsql://name-org.turso.io  ->  https://name-org.turso.io
  return u.replace(/^libsql:\/\//, 'https://').replace(/\/+$/, '');
}

function toVal(v) {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') return Number.isInteger(v) ? { type: 'integer', value: String(v) } : { type: 'float', value: v };
  if (typeof v === 'boolean') return { type: 'integer', value: v ? '1' : '0' };
  return { type: 'text', value: String(v) };
}
function fromVal(v) {
  if (!v || v.type === 'null') return null;
  if (v.type === 'integer') return Number(v.value);
  if (v.type === 'float') return Number(v.value);
  if (v.type === 'blob') return Buffer.from(v.base64, 'base64');
  return v.value;
}

let exec, kind;

if (TURSO_URL) {
  kind = 'turso';
  const endpoint = toHttpUrl(TURSO_URL) + '/v2/pipeline';
  exec = async function (sql, args = []) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + TURSO_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql, args: args.map(toVal) } }, { type: 'close' }] }),
    });
    const txt = await res.text();
    if (!res.ok) throw new Error('Turso HTTP ' + res.status + ': ' + txt.slice(0, 300));
    const j = JSON.parse(txt);
    const r = j.results && j.results[0];
    if (!r || r.type !== 'ok') throw new Error('Turso error: ' + JSON.stringify(r && r.error || j).slice(0, 300));
    const result = r.response.result;
    const cols = result.cols.map(c => c.name);
    return result.rows.map(row => { const o = {}; row.forEach((v, i) => { o[cols[i]] = fromVal(v); }); return o; });
  };
} else {
  kind = 'sqlite';
  const { DatabaseSync } = require('node:sqlite');
  const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, 'local.db'));
  exec = async function (sql, args = []) {
    const st = db.prepare(sql);
    const a = args.map(v => (typeof v === 'boolean' ? (v ? 1 : 0) : v === undefined ? null : v));
    if (/^\s*(select|with)/i.test(sql)) return st.all(...a).map(r => Object.assign({}, r));
    st.run(...a);
    return [];
  };
}

async function init() {
  const ddl = [
    `CREATE TABLE IF NOT EXISTS sites(slug TEXT PRIMARY KEY, html TEXT, cfg TEXT, src TEXT, owner_hash TEXT, pass_hash TEXT, created INTEGER, updated INTEGER)`,
    `CREATE TABLE IF NOT EXISTS recs(site TEXT, mod TEXT, id TEXT, data TEXT, deleted INTEGER DEFAULT 0, updated INTEGER, PRIMARY KEY(site, mod, id))`,
    `CREATE INDEX IF NOT EXISTS recs_upd ON recs(site, updated)`,
    `CREATE TABLE IF NOT EXISTS settings(site TEXT, k TEXT, v TEXT, PRIMARY KEY(site, k))`,
    `CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, site TEXT, expires INTEGER)`,
    `CREATE TABLE IF NOT EXISTS pending(id TEXT PRIMARY KEY, kind TEXT, data TEXT, created INTEGER, status TEXT, result TEXT, k TEXT, sub TEXT)`,
    `CREATE TABLE IF NOT EXISTS transfers(id TEXT PRIMARY KEY, data TEXT, created INTEGER, status TEXT, email TEXT, name TEXT, imported INTEGER, url TEXT)`,
    `CREATE TABLE IF NOT EXISTS bankpays(id TEXT PRIMARY KEY, data TEXT, email TEXT, name TEXT, pkg TEXT, price REAL, amount REAL, ref TEXT, proof TEXT, status TEXT, created INTEGER, decided INTEGER, revoke_at INTEGER, result TEXT, k TEXT, lic TEXT)`,
    `CREATE TABLE IF NOT EXISTS domains(domain TEXT PRIMARY KEY, slug TEXT, sub TEXT, status TEXT, created INTEGER)`,
    `CREATE TABLE IF NOT EXISTS privates(id TEXT PRIMARY KEY, name TEXT, service_id TEXT, url TEXT, sub TEXT, status TEXT, secret TEXT, created INTEGER, email TEXT, data TEXT)`,
    `CREATE TABLE IF NOT EXISTS codes(code TEXT PRIMARY KEY, credits INTEGER, used INTEGER DEFAULT 0, note TEXT, phone TEXT, pkg TEXT, created INTEGER)`,
  ];
  for (const q of ddl) await exec(q);
  // columns added in later versions (ignored if they already exist)
  for (const [col, type] of [['paid_until', 'INTEGER'], ['suspended', 'INTEGER DEFAULT 0'], ['name', 'TEXT'], ['phone', 'TEXT'], ['code', 'TEXT'], ['email', 'TEXT'], ['pp_sub', 'TEXT'], ['domain', 'TEXT'], ['terms', 'TEXT']]) {
    try { await exec(`ALTER TABLE sites ADD COLUMN ${col} ${type}`); } catch (e) { /* already there */ }
  }
}

module.exports = { exec, init, kind: () => kind };
