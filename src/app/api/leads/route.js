import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/admin/auth';
import { getSql, ensureSchema } from '@/lib/admin/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  await ensureSchema();
  const sql = getSql();

  const conditions = [];
  const params = [];

  if (user.role === 'employee') {
    params.push(user.id);
    conditions.push(`l.assigned_to = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`l.status = $${params.length}`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const leads = await sql.query(
    `SELECT l.id, l.name, l.phone, l.message, l.status, l.assigned_to, l.created_at,
            u.name AS assigned_to_name,
            COUNT(c.id)::int AS comment_count
     FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     LEFT JOIN comments c ON c.lead_id = l.id
     ${where}
     GROUP BY l.id, u.name
     ORDER BY l.created_at DESC`,
    params
  );

  const employees = user.role === 'admin'
    ? await sql`SELECT id, name FROM users WHERE role = 'employee'`
    : [];

  return NextResponse.json({ ok: true, leads, employees });
}
