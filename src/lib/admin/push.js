import webpush from 'web-push';
import { getSql, ensureSchema } from './db';

function initWebPush() {
  webpush.setVapidDetails(
    'mailto:r3neprod@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendPushToAll({ title, body }) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  initWebPush();

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT id, endpoint, subscription FROM push_subscriptions`;
  if (!rows.length) return;

  const results = await Promise.allSettled(
    rows.map((row) => webpush.sendNotification(row.subscription, JSON.stringify({ title, body })))
  );

  const expiredIds = [];
  results.forEach((result, i) => {
    if (result.status === 'rejected' && [404, 410].includes(result.reason?.statusCode)) {
      expiredIds.push(rows[i].id);
    }
  });

  if (expiredIds.length > 0) {
    await sql`DELETE FROM push_subscriptions WHERE id = ANY(${expiredIds})`;
  }
}
