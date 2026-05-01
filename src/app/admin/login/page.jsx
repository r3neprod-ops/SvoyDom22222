import { redirect } from 'next/navigation';
import { getSessionUser, hasAnyAdmin } from '@/lib/admin/auth';

export default function LoginPage({ searchParams }) {
  const user = getSessionUser();
  if (user) redirect('/admin');
  if (!hasAnyAdmin()) redirect('/admin/setup');
  const error = searchParams?.error;

  return <main className="mx-auto flex min-h-screen max-w-md items-center p-6"><div className="w-full rounded-xl border bg-white p-6 shadow-sm"><h1 className="mb-4 text-2xl font-semibold">Вход в админку</h1><form method="post" action="/api/admin/login" className="space-y-3"><input name="login" placeholder="Логин" className="w-full rounded-lg border p-2" required /><input name="password" type="password" placeholder="Пароль" className="w-full rounded-lg border p-2" required /><button className="w-full rounded-lg bg-gray-900 p-2 text-white">Войти</button></form>{error && <p className="mt-3 text-sm text-red-600">Ошибка входа</p>}</div></main>;
}
