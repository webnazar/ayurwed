import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ayurwed Shop — Authentic Ayurvedic Products & Preparations',
  description: 'Browse and buy authentic Ayurvedic products, classical herbal preparations, extracts, powders, capsules, and wellness essentials on Ayurwed.',
  keywords: ['Ayurvedic Shop', 'Ayurveda Products', 'Herbal Medicines', 'AYURWED', 'Generic Extracts', 'Ancient Intelligence'],
  openGraph: {
    title: 'Ayurwed Shop — Authentic Ayurvedic Products & Preparations',
    description: 'Browse and buy authentic Ayurvedic products, classical herbal preparations, extracts, powders, capsules, and wellness essentials on Ayurwed.',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
