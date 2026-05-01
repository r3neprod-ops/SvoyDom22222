import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';

export default function LeadDetailsPage({ params }) {
  const user = getSessionUser();
  if (!user) redirect('/admin/login');
  const db = readDb();
  const id = Number(params.id);
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) return <main className="p-6"><Link href="/admin">← Назад</Link><h1 className="mt-4 text-2xl">Лид не найден</h1></main>;

  return <main className="mx-auto max-w-4xl p-6"><Link href="/admin" className="rounded-md border px-3 py-2">← К списку</Link><h1 className="mt-4 text-2xl font-semibold">Лид #{lead.id}</h1><div className="mt-4 grid gap-3 rounded-xl border bg-white p-4"><p><b>Дата:</b> {lead.created_at}</p><p><b>Имя:</b> {lead.name || '—'}</p><p><b>Телефон:</b> {lead.phone || '—'}</p><p><b>Статус:</b> {lead.status || 'Новый'}</p><p><b>Ответственный:</b> {lead.assigned_user_id || '—'}</p><p><b>Комментарий:</b> {lead.admin_comment || '—'}</p><p><b>Источник:</b> {lead.source_page || 'site-form'}</p><div><b>Ответы формы:</b><pre className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs">{JSON.stringify(lead.form_data_json || {}, null, 2)}</pre></div></div></main>;
}
