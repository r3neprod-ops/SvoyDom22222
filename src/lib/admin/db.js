import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

let initialized = false;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function ensureSchema() {
  if (initialized) return;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
      name TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT,
      phone TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users`;
  if (count === 0) {
    await sql`
      INSERT INTO users (username, password_hash, role, name) VALUES
      ('admin',     ${bcrypt.hashSync('admin123', 10)}, 'admin',    'Администратор'),
      ('employee1', ${bcrypt.hashSync('emp123',   10)}, 'employee', 'Сотрудник 1'),
      ('employee2', ${bcrypt.hashSync('emp456',   10)}, 'employee', 'Сотрудник 2')
    `;
  }

  initialized = true;
}
