import { redirect } from 'next/navigation';

export default function ConsumerMyOrdersRedirect() {
  redirect('/user/myorders');
}
