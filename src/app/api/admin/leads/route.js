import { getSessionUser } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';

export async function GET() {
  const user = getSessionUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const db = readDb();
  return Response.json({ ok: true, leads: db.leads });
}
