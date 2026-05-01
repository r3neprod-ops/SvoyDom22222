import { getSessionUser, createAdmin } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = getSessionUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const db = readDb();
  return Response.json({ ok: true, users: db.users.map((u) => ({ id: u.id, login: u.login, role: u.role, created_at: u.created_at })) });
}

export async function POST(req) {
  const user = getSessionUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const form = await req.formData();
  const login = String(form.get('login') || '').trim();
  const password = String(form.get('password') || '');
  if (!login || password.length < 6) return NextResponse.redirect(new URL('/admin/admins?error=1', req.url));
  try { createAdmin(login, password); } catch { return NextResponse.redirect(new URL('/admin/admins?error=1', req.url)); }
  return NextResponse.redirect(new URL('/admin/admins', req.url));
}
