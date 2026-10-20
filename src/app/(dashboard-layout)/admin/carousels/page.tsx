import { db } from '@/lib/db';
import CarouselsClient from '@/components/admin/CarouselsClient';

export const revalidate = 0;

export default async function CarouselsPage() {
  const carousels = await db.carousel.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return <CarouselsClient initialCarousels={carousels} />;
}
