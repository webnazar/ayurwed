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

  return <TestimonialsClient initialTestimonials={formattedTestimonials as any} />;
}
