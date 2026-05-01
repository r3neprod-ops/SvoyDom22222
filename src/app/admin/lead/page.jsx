import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';

export default function LeadPage({ searchParams }) {
  const user = getSessionUser();
  if (!user) redirect('/admin/login');
  const id = Number(searchParams?.id || 0);
  const db = readDb();
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) return <main><h1>Лид не найден</h1></main>;
  if (user.role !== 'admin' && lead.assigned_user_id !== user.id) return <main><h1>Нет доступа</h1></main>;
  const comments = db.lead_comments.filter((c) => c.lead_id === id);
  return <main><a href='/admin'>← Назад</a><h1>Лид #{lead.id}</h1><p>Статус: {lead.status}</p><p>Клиент: {lead.name||'—'} / {lead.phone||'—'}</p><pre>{JSON.stringify(lead.form_data_json, null, 2)}</pre><h2>Комментарии</h2>{comments.map(c=><p key={c.id}>{c.comment}</p>)}</main>;
}
