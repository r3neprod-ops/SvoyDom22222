import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/admin/auth';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');
  return <DashboardClient user={user} />;
}
