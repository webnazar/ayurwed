import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ayurwed Shop — Authentic Ayurvedic Products',
  description: 'Browse and buy authentic Ayurvedic products, herbal preparations, and wellness essentials from certified manufacturers.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
