import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/admin/auth';

export default function LoginPage({ searchParams }) {
  const user = getSessionUser();
  if (user) redirect('/admin');
  const error = searchParams?.error;
  return <main><h1>Admin Login</h1><form method='post' action='/admin/login/submit'><input name='login' placeholder='Login' /><input name='password' type='password' placeholder='Password' /><button type='submit'>Войти</button></form>{error && <p>Ошибка входа</p>}<p>Default: admin / admin123</p></main>;
}
