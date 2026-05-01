import crypto from 'crypto';
import { cookies } from 'next/headers';
import { readDb, writeDb, nextId, nowIso } from './store';

const COOKIE = 'admin_session';

function pbkdf2(password, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return pbkdf2(password, salt);
}

export function verifyPassword(raw, storedHash) {
  if (!storedHash) return false;
  if (storedHash.startsWith('pbkdf2$')) {
    const [, iter, salt, hash] = storedHash.split('$');
    const check = crypto.pbkdf2Sync(raw, salt, Number(iter), 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
  }
  const legacy = crypto.createHash('sha256').update(raw).digest('hex');
  return legacy === storedHash;
}

export function getActiveSession() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const db = readDb();
  return db.sessions.find((s) => s.token === token) || null;
}

export function getSessionUser() {
  const session = getActiveSession();
  if (!session) return null;
  const db = readDb();
  return db.users.find((u) => u.id === session.user_id && u.is_active) || null;
}

export function startSession(userId) {
  const db = readDb();
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({ token, user_id: userId, created_at: nowIso() });
  writeDb(db);
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export function endSession() {
  const token = cookies().get(COOKIE)?.value;
  if (token) {
    const db = readDb();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    writeDb(db);
  }
  cookies().delete(COOKIE);
}

export function hasAnyAdmin() {
  const db = readDb();
  return db.users.some((u) => u.role === 'admin' && u.is_active);
}

export function createAdmin(login, password) {
  const db = readDb();
  if (db.users.some((u) => u.login === login)) throw new Error('LOGIN_EXISTS');
  const ts = nowIso();
  const user = {
    id: nextId(db, 'users'),
    login,
    password_hash: hashPassword(password),
    role: 'admin',
    is_active: true,
    created_at: ts,
    updated_at: ts,
  };
  db.users.push(user);
  writeDb(db);
  return user;
}
