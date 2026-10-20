import { redirect } from 'next/navigation';

export default function UserAppointmentsRedirect() {
  redirect('/user/dashboard');
}
