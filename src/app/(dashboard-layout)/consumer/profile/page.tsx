import { redirect } from 'next/navigation';

export default function ConsumerProfileRedirect() {
  redirect('/user/profile');
}
