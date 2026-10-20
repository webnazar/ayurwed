import { redirect } from 'next/navigation';

export default function ConsumerDashboardProfileRedirect() {
  redirect('/user/profile');
}
