import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'db.json');
const EMPTY_DB = { leads: [] };

function ensureDbFile() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY_DB, null, 2), 'utf8');
  }
}

export function readDb() {
  try {
    ensureDbFile();
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.leads)) {
      return { ...EMPTY_DB };
    }

    return { leads: parsed.leads };
  } catch (error) {
    console.error('Failed to read db.json:', error);
    return { ...EMPTY_DB };
  }
}

export function writeDb(db) {
  ensureDbFile();
  const safeDb = {
    leads: Array.isArray(db?.leads) ? db.leads : [],
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(safeDb, null, 2), 'utf8');
}

export function getLeads() {
  const db = readDb();
  return [...db.leads].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function pickName(payload) {
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {};
  return payload?.name || payload?.fullName || payload?.clientName || answers?.name || '';
}

function pickPhone(payload) {
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {};
  return payload?.phone || payload?.tel || answers?.phone || '';
}

export function addLead(payload) {
  const db = readDb();
  const now = new Date().toISOString();
  const maxId = db.leads.reduce((acc, lead) => (typeof lead?.id === 'number' && lead.id > acc ? lead.id : acc), 0);
  const lead = {
    id: maxId + 1,
    createdAt: now,
    updatedAt: now,
    name: pickName(payload),
    phone: pickPhone(payload),
    formData: payload,
    source: payload?.source || payload?.utm_source || 'site-form',
    status: 'Новый',
  };

  db.leads.unshift(lead);
  writeDb(db);
  return lead;
}
