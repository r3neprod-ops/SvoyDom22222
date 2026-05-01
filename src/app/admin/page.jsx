import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';

export default function AdminPage() {
  const user = getSessionUser();
  if (!user) redirect('/admin/login');
  const db = readDb();
  const leads = user.role === 'admin' ? db.leads : db.leads.filter((l) => l.assigned_user_id === user.id);
  return <main><h1>Лиды</h1><Link href='/admin/logout'>Выйти</Link>{user.role==='admin' && <Link href='/admin/users'>Сотрудники</Link>}<table><thead><tr><th>ID</th><th>Дата</th><th>Имя</th><th>Телефон</th><th>Статус</th><th>Ответственный</th><th/></tr></thead><tbody>{leads.map((l)=>{const ass=db.users.find(u=>u.id===l.assigned_user_id);return <tr key={l.id}><td>{l.id}</td><td>{l.created_at}</td><td>{l.name||'—'}</td><td>{l.phone||'—'}</td><td>{l.status}</td><td>{ass?.name||'Не назначен'}</td><td><Link href={`/admin/lead?id=${l.id}`}>Открыть</Link></td></tr>})}</tbody></table></main>
}
