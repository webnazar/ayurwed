import { db } from '@/lib/db';
import CarouselsClient from '@/components/admin/CarouselsClient';

export const revalidate = 0;

export default async function CarouselsPage() {
  const carousels = await db.carousel.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Carousel Master</h1>
        <p className="dashboard-header-subtitle">
          Manage the full-width banners on the homepage (maximum 5).
        </p>
      </div>
      <CarouselsClient initialCarousels={carousels} />
    </div>
  );
}
