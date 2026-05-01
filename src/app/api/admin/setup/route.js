import { NextResponse } from 'next/server';
import { createAdmin, hasAnyAdmin } from '@/lib/admin/auth';

export async function POST(req) {
  if (hasAnyAdmin()) return NextResponse.redirect(new URL('/admin/login', req.url));
  const form = await req.formData();
  const login = String(form.get('login') || '').trim();
  const password = String(form.get('password') || '');
  if (!login || password.length < 6) return NextResponse.redirect(new URL('/admin/setup?error=Минимум+6+символов', req.url));
  try { createAdmin(login, password); } catch { return NextResponse.redirect(new URL('/admin/setup?error=Не+удалось+создать', req.url)); }
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
