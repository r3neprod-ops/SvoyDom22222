import { NextResponse } from 'next/server';
import { readDb } from '@/lib/admin/store';
import { verifyPassword, startSession } from '@/lib/admin/auth';

export async function POST(req) {
  const form = await req.formData();
  const login = String(form.get('login') || '');
  const password = String(form.get('password') || '');
  const db = readDb();
  const user = db.users.find((u) => u.login === login && u.is_active);
  if (!user || !verifyPassword(password, user.password_hash)) return NextResponse.redirect(new URL('/admin/login?error=1', req.url));
  startSession(user.id);
  return NextResponse.redirect(new URL('/admin', req.url));
}
