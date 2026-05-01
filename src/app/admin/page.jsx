import { getLeads } from '@/lib/admin/store';

export const dynamic = 'force-dynamic';

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
}

export default function AdminPage() {
  const leads = [...getLeads()].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const total = leads.length;
  const fresh = leads.filter((l) => (l.status || 'Новый') === 'Новый').length;
  const today = leads.filter((l) => isToday(l.created_at)).length;

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">Админ-панель</h1>
          <p className="mt-2 text-sm text-gray-500">Заявки с формы сайта</p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Всего лидов" value={total} />
          <StatCard title="Новые" value={fresh} />
          <StatCard title="Сегодня" value={today} />
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {leads.length === 0 ? (
            <div className="p-12 text-center text-gray-600">Пока лидов нет.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Дата</th>
                    <th className="px-4 py-3">Имя</th>
                    <th className="px-4 py-3">Телефон</th>
                    <th className="px-4 py-3">Данные формы</th>
                    <th className="px-4 py-3">Источник</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-medium">#{lead.id}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.created_at || '—'}</td>
                      <td className="px-4 py-3">{lead.name || '—'}</td>
                      <td className="px-4 py-3">{lead.phone || '—'}</td>
                      <td className="px-4 py-3 max-w-md"><pre className="whitespace-pre-wrap text-xs text-gray-700">{JSON.stringify(lead.form_data_json || {}, null, 2)}</pre></td>
                      <td className="px-4 py-3 text-gray-600">{lead.source_page || 'site-form'}</td>
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

function StatCard({ title, value }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{title}</p><p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p></div>;
}
