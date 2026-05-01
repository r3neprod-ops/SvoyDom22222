import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'db.json');

const initial = { users: [], leads: [], lead_comments: [], lead_history: [], counters: { users: 0, leads: 0, comments: 0, history: 0 } };

export function ensureDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

export function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function nowIso() { return new Date().toISOString(); }

export function nextId(db, key) {
  db.counters[key] = (db.counters[key] || 0) + 1;
  return db.counters[key];
}
