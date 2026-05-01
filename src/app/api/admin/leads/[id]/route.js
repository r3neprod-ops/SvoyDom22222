import { getSessionUser } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';

export async function GET(_req, { params }) {
  const user = getSessionUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const db = readDb();
  const lead = db.leads.find((l) => l.id === Number(params.id));
  if (!lead) return Response.json({ ok: false }, { status: 404 });
  return Response.json({ ok: true, lead });
}
