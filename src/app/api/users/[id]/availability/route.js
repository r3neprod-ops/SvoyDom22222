import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getAuthUser } from '@/lib/admin/auth';
import { getSql, ensureSchema } from '@/lib/admin/db';

export async function PATCH(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ ok: false }, { status: 403 });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  await ensureSchema();
  const sql = getSql();

  const body = await request.json();
  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json({ ok: false, message: 'is_active must be boolean' }, { status: 400 });
  }

  await sql`UPDATE users SET is_active = ${body.is_active} WHERE id = ${id} AND role = 'employee'`;
  revalidateTag('leads');

  return NextResponse.json({ ok: true });
}
