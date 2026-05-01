import { readDb } from '@/lib/admin/store';

export default function AdminPage() {
  const user = getSessionUser();
  if (!user) redirect('/admin/login');

  const db = readDb();
  const leads = [...(db.leads || [])].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'Новый').length,
    working: leads.filter((l) => l.status === 'В работе').length,
    done: leads.filter((l) => l.status === 'Завершён' || l.status === 'Архив').length,
  };

  return <main className="mx-auto max-w-7xl p-6 md:p-10">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-semibold">Админ-панель</h1><p className="text-sm text-gray-500">Добро пожаловать, {user.login}</p></div>
      <div className="flex gap-2">
        <a href="/admin" className="rounded-lg border px-4 py-2">Обновить</a>
        <Link href="/admin/admins" className="rounded-lg border px-4 py-2">Админы</Link>
        <Link href="/admin/logout" className="rounded-lg bg-gray-900 px-4 py-2 text-white">Выйти</Link>
      </div>
    </header>

    <section className="mb-6 grid gap-3 md:grid-cols-4">
      {[['Всего лидов', stats.total], ['Новые', stats.new], ['В работе', stats.working], ['Завершённые / Архив', stats.done]].map(([k, v]) => (
        <div key={k} className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{k}</p><p className="mt-2 text-2xl font-semibold">{v}</p></div>
      ))}
    </section>

    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {leads.length === 0 ? <div className="p-10 text-center text-gray-600">Пока лидов нет. Отправьте тестовую заявку с сайта.</div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left"><th className="p-3">ID</th><th className="p-3">Дата и время</th><th className="p-3">Имя</th><th className="p-3">Телефон</th><th className="p-3">Данные формы</th><th className="p-3">Статус</th><th className="p-3">Ответственный</th><th className="p-3">Действия</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} className="border-t align-top"><td className="p-3">#{lead.id}</td><td className="p-3">{lead.created_at || '—'}</td><td className="p-3">{lead.name || '—'}</td><td className="p-3">{lead.phone || '—'}</td><td className="p-3 max-w-md"><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(lead.form_data_json || {}, null, 2)}</pre></td><td className="p-3"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">{lead.status || 'Новый'}</span></td><td className="p-3">{lead.assigned_user_id || '—'}</td><td className="p-3"><Link href={`/admin/leads/${lead.id}`} className="rounded-md border px-2 py-1">Открыть</Link></td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}

const thStyle = {
  border: '1px solid #ddd',
  textAlign: 'left',
  padding: '10px',
  background: '#f6f6f6',
};

const tdStyle = {
  border: '1px solid #ddd',
  textAlign: 'left',
  padding: '10px',
  verticalAlign: 'top',
};
