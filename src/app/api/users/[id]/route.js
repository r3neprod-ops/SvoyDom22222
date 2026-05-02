import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/admin/auth';
import { getSql, ensureSchema } from '@/lib/admin/db';

export async function PATCH(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ ok: false }, { status: 403 });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const body = await request.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ ok: false, message: 'Имя обязательно' }, { status: 400 });

  await ensureSchema();
  const sql = getSql();
  await sql`UPDATE users SET name = ${name} WHERE id = ${id} AND role = 'employee'`;
  return NextResponse.json({ ok: true });
}
