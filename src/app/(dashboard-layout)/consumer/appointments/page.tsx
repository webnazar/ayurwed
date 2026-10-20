import { redirect } from 'next/navigation';

export default function ConsumerAppointmentsRedirect() {
  redirect('/user/dashboard');
}
