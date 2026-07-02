import { db } from '@/lib/db';
import TestimonialsClient from '@/components/admin/TestimonialsClient';

export const revalidate = 0;

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  const formattedTestimonials = testimonials.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-header-card">
        <h1 className="dashboard-header-title">Testimonial Manager</h1>
        <p className="dashboard-header-subtitle">
          Manage the "What Our Wellness Circle Says" section on the homepage.
        </p>
      </div>
      <TestimonialsClient initialTestimonials={formattedTestimonials as any} />
    </div>
  );
}
