import { redirect } from 'next/navigation';
import { endSession } from '@/lib/admin/auth';

export default function LogoutPage(){ endSession(); redirect('/admin/login'); }
