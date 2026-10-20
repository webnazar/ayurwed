import { redirect } from 'next/navigation';

export default function ConsumerFulfillmentRedirect() {
  redirect('/user/myorders');
}
