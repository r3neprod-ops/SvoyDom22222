import { getLeads } from '@/lib/admin/store';

export const dynamic = 'force-dynamic';

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
}

export default function AdminPage() {
  const leads = getLeads();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  const todayCount = leads.filter((lead) => new Date(lead.createdAt || 0).getTime() >= todayStart).length;
  const weekCount = leads.filter((lead) => new Date(lead.createdAt || 0).getTime() >= weekStart).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Админ-панель</h1>
          <p className="mt-1 text-slate-600">Лиды с формы сайта</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ['Всего лидов', leads.length],
            ['Сегодня', todayCount],
            ['За последние 7 дней', weekCount],
          ].map(([title, value]) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {leads.length === 0 ? (
            <div className="px-6 py-14 text-center text-slate-600">Пока лидов нет. Отправьте тестовую заявку с сайта.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-3">ID</th><th className="p-3">Дата и время</th><th className="p-3">Имя</th><th className="p-3">Телефон</th><th className="p-3">Данные формы</th><th className="p-3">Источник</th><th className="p-3">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-200 align-top">
                      <td className="p-3 font-medium">{lead.id}</td>
                      <td className="p-3 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                      <td className="p-3">{lead.name || '—'}</td>
                      <td className="p-3">{lead.phone || '—'}</td>
                      <td className="max-w-md p-3"><pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-2 text-xs">{JSON.stringify(lead.formData || {}, null, 2)}</pre></td>
                      <td className="p-3">{lead.source || 'site-form'}</td>
                      <td className="p-3"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">{lead.status || 'Новый'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
