import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'db.json');

const initial = {
  leads: [],
  counters: { leads: 0 },
};

function normalizeDb(db) {
  const safe = db && typeof db === 'object' ? db : {};
  const leads = Array.isArray(safe.leads) ? safe.leads : [];
  const counters = { leads: Number(safe?.counters?.leads || 0) };
  return { leads, counters };
}

export function readDbSafe() {
  try {
    if (!fs.existsSync(DB_FILE)) return normalizeDb(initial);
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return normalizeDb(JSON.parse(raw));
  } catch (error) {
    console.error('DB read error:', error);
    return normalizeDb(initial);
  }
}

export function getLeads() {
  return readDbSafe().leads;
}

export function writeDb(db) {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const normalized = normalizeDb(db);
  fs.writeFileSync(DB_FILE, JSON.stringify(normalized, null, 2));
}

export function nowIso() {
  return new Date().toISOString();
}

export function nextId(db, key) {
  const normalized = normalizeDb(db);
  normalized.counters[key] = (normalized.counters[key] || 0) + 1;
  db.counters = normalized.counters;
  return normalized.counters[key];
}

export const readDb = readDbSafe;
