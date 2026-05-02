import { sendPushToAll } from '@/lib/admin/push';

export async function POST(request) {
  const { title, body } = await request.json();
  await sendPushToAll({ title, body });
  return Response.json({ ok: true });
}
