import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';

export default function AdminsPage() {
  const user = getSessionUser();
  if (!user) redirect('/admin/login');
  const db = readDb();
  return <main className="mx-auto max-w-4xl p-6"><div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-semibold">Админы</h1><a href="/admin" className="rounded-lg border px-3 py-2">Назад</a></div><div className="grid gap-6 md:grid-cols-2"><div className="rounded-xl border bg-white p-4"><h2 className="mb-3 font-medium">Добавить админа</h2><form method="post" action="/api/admin/users" className="space-y-2"><input name="login" placeholder="Логин" required className="w-full rounded-lg border p-2"/><input name="password" type="password" placeholder="Пароль" required className="w-full rounded-lg border p-2"/><button className="rounded-lg bg-gray-900 px-4 py-2 text-white">Добавить</button></form></div><div className="rounded-xl border bg-white p-4"><h2 className="mb-3 font-medium">Список админов</h2><ul className="space-y-2">{db.users.map((u)=><li key={u.id} className="rounded-lg border p-2">#{u.id} {u.login} ({u.role})</li>)}</ul></div></div></main>;
}
