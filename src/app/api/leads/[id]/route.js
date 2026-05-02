import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/admin/auth';
import { getDb } from '@/lib/admin/db';

export async function PATCH(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const db = getDb();
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!lead) return NextResponse.json({ ok: false, message: 'Лид не найден' }, { status: 404 });

  if (user.role === 'employee' && lead.assigned_to !== user.id) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await request.json();
  const updates = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.assigned_to !== undefined && user.role === 'admin') updates.assigned_to = body.assigned_to;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ ok: false, message: 'Нет данных для обновления' }, { status: 400 });
  }

  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE leads SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ ok: false }, { status: 403 });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  getDb().prepare('DELETE FROM leads WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
