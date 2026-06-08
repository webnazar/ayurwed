import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const role = (session.user as any).role || 'CONSUMER';

  switch (role) {
    case 'ADMIN':
      redirect('/dashboard/admin');
    case 'CONSULTANT':
      redirect('/dashboard/consultant');
    case 'MANUFACTURER':
      redirect('/dashboard/manufacturer');
    default:
      redirect('/dashboard/consumer');
  }
}
