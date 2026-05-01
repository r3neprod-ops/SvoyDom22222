import crypto from 'crypto';
import { cookies } from 'next/headers';
import { readDb, writeDb, nextId, nowIso } from './store';

const COOKIE = 'admin_session';
const SECRET = process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-me';

function sign(value) { return crypto.createHmac('sha256', SECRET).update(value).digest('hex'); }

export function createUserIfMissing() {
  const db = readDb();
  if (db.users.length === 0) {
    const password_hash = crypto.createHash('sha256').update('admin123').digest('hex');
    const ts = nowIso();
    db.users.push({ id: nextId(db, 'users'), name: 'Administrator', login: 'admin', password_hash, role: 'admin', is_active: true, created_at: ts, updated_at: ts });
    writeDb(db);
  }
}

export function verifyPassword(raw, hash) {
  return crypto.createHash('sha256').update(raw).digest('hex') === hash;
}

export function startSession(user) {
  const payload = `${user.id}:${Date.now()}`;
  const token = `${payload}:${sign(payload)}`;
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export function endSession() { cookies().delete(COOKIE); }

export function getSessionUser() {
  createUserIfMissing();
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const parts = token.split(':');
  if (parts.length !== 3) return null;
  const [id, ts, sig] = parts;
  if (sign(`${id}:${ts}`) !== sig) return null;
  const db = readDb();
  return db.users.find((u) => String(u.id) === id && u.is_active) || null;
}
