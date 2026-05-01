import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/admin/auth';
import { readDb } from '@/lib/admin/store';

export default function UsersPage(){
 const user=getSessionUser(); if(!user) redirect('/admin/login'); if(user.role!=='admin') return <main><h1>Нет доступа</h1></main>;
 const db=readDb();
 return <main><a href='/admin'>← Назад</a><h1>Сотрудники</h1><ul>{db.users.map(u=><li key={u.id}>{u.login} ({u.role})</li>)}</ul></main>
}
