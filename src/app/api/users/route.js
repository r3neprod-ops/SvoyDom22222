import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthUser } from '@/lib/admin/auth';
import { getSql, ensureSchema } from '@/lib/admin/db';

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json();
  const username = body.username?.trim();
  const name = body.name?.trim();
  const { password } = body;

  if (!username || !password || !name) {
    return NextResponse.json({ ok: false, message: 'Все поля обязательны' }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ ok: false, message: 'Пароль минимум 4 символа' }, { status: 400 });
  }

  await ensureSchema();
  const sql = getSql();

  const [existing] = await sql`SELECT id FROM users WHERE username = ${username}`;
  if (existing) {
    return NextResponse.json({ ok: false, message: 'Логин уже занят' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await sql`
    INSERT INTO users (username, password_hash, role, name)
    VALUES (${username}, ${passwordHash}, 'employee', ${name})
    RETURNING id, username, name, role
  `;

  return NextResponse.json({ ok: true, user: created }, { status: 201 });
}
