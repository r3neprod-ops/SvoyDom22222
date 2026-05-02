import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/admin/db';
import { signToken } from '@/lib/admin/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, message: 'Укажите логин и пароль' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json({ ok: false, message: 'Неверный логин или пароль' }, { status: 401 });
    }

    const token = await signToken({ id: user.id, role: user.role, name: user.name, username: user.username });

    const response = NextResponse.json({ ok: true, role: user.role, name: user.name });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ ok: false, message: 'Ошибка сервера' }, { status: 500 });
  }
}
