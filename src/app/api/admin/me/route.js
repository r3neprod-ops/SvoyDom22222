import { getSessionUser } from '@/lib/admin/auth';

export async function GET() {
  const user = getSessionUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  return Response.json({ ok: true, user: { id: user.id, login: user.login, role: user.role } });
}
