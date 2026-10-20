import { redirect } from 'next/navigation';

export default function UserFulfillmentRedirect() {
  redirect('/user/myorders');
}
