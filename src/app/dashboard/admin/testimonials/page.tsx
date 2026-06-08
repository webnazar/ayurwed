import { db } from '@/lib/db';
import TestimonialsClient from '@/components/admin/TestimonialsClient';

export const revalidate = 0;

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-green to-[#0f381b] rounded-3xl p-8 text-white">
        <h1 className="text-2xl font-extrabold">Testimonial Manager</h1>
        <p className="text-brand-green-light mt-1 text-sm">
          Manage the "What Our Wellness Circle Says" section on the homepage.
        </p>
      </div>
      <TestimonialsClient initialTestimonials={testimonials} />
    </div>
  );
}
