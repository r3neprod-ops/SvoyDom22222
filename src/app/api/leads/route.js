import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/admin/auth';
import { getDb } from '@/lib/admin/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const db = getDb();
  const conditions = [];
  const params = [];

  if (user.role === 'employee') {
    conditions.push('l.assigned_to = ?');
    params.push(user.id);
  }
  if (status) {
    conditions.push('l.status = ?');
    params.push(status);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const leads = db.prepare(`
    SELECT l.id, l.name, l.phone, l.message, l.status, l.assigned_to, l.created_at,
           u.name AS assigned_to_name
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    ${where}
    ORDER BY l.created_at DESC
  `).all(...params);

  const employees = user.role === 'admin'
    ? db.prepare("SELECT id, name FROM users WHERE role = 'employee'").all()
    : [];

  return NextResponse.json({ ok: true, leads, employees });
}
