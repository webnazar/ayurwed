import { redirect } from 'next/navigation';

export default function ConsumerRedirect() {
  redirect('/user/dashboard');
}
