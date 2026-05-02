import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(process.cwd(), 'database', 'leads.db');

export function getDb() {
  if (!globalThis._sqdb) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    globalThis._sqdb = db;
  }
  return globalThis._sqdb;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (count === 0) {
    const insert = db.prepare(
      'INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)'
    );
    db.transaction(() => {
      insert.run('admin',     bcrypt.hashSync('admin123', 10), 'admin',    'Администратор');
      insert.run('employee1', bcrypt.hashSync('emp123',   10), 'employee', 'Сотрудник 1');
      insert.run('employee2', bcrypt.hashSync('emp456',   10), 'employee', 'Сотрудник 2');
    })();
  }
}
