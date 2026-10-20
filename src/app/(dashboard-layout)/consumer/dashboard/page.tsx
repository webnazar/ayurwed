import { redirect } from 'next/navigation';

export default function ConsumerDashboardRedirect() {
  redirect('/user/dashboard');
}
