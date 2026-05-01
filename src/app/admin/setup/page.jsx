import { redirect } from 'next/navigation';
import { hasAnyAdmin } from '@/lib/admin/auth';

export default function SetupPage({ searchParams }) {
  if (hasAnyAdmin()) redirect('/admin/login');
  const error = searchParams?.error;
  return <main className="mx-auto flex min-h-screen max-w-md items-center p-6"><div className="w-full rounded-xl border bg-white p-6 shadow-sm"><h1 className="mb-2 text-2xl font-semibold">Создание первого админа</h1><p className="mb-4 text-sm text-gray-500">Эта форма доступна только один раз.</p><form method="post" action="/api/admin/setup" className="space-y-3"><input name="login" placeholder="Логин" required className="w-full rounded-lg border p-2"/><input name="password" type="password" placeholder="Пароль" required className="w-full rounded-lg border p-2"/><button className="w-full rounded-lg bg-gray-900 p-2 text-white">Создать</button></form>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</div></main>;
}
