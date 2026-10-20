import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import AuthProvider from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { CartProvider } from '@/components/shop/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ayurwed.com'),
  title: {
    default: 'AYURWED — Ancient Intelligence | Authentic Ayurvedic Healthcare & Marketplace',
    template: '%s | AYURWED',
  },
  description: 'Ayurwed brings you Ancient Intelligence. Discover certified Ayurvedic doctors, book clinical consultations, and order authentic classical formulations & natural remedies across India.',
  keywords: [
    'Ayurwed',
    'Ayurveda',
    'Ancient Intelligence',
    'Ayurvedic doctors',
    'Ayurvedic consultation',
    'natural remedies',
    'wellness guidance',
    'classical formulations',
    'Ayurvedic products online',
  ],
  authors: [{ name: 'AYURWED Healthcare' }],
  creator: 'AYURWED',
  publisher: 'AYURWED Healthcare Pvt Ltd',
  alternates: {
    canonical: 'https://www.ayurwed.com',
  },
  openGraph: {
    title: 'AYURWED — Ancient Intelligence | Authentic Ayurvedic Healthcare',
    description: 'Ayurwed brings you Ancient Intelligence. Discover pure Ayurveda remedies, certified doctors, clinical consultations, and authentic natural wellness.',
    url: 'https://www.ayurwed.com',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.ayurwed.com/icon.png',
        width: 512,
        height: 512,
        alt: 'AYURWED — Ancient Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AYURWED — Ancient Intelligence | Authentic Ayurvedic Healthcare',
    description: 'Ayurwed brings you Ancient Intelligence. Discover pure Ayurveda remedies, certified doctors, and natural wellness.',
    images: ['https://www.ayurwed.com/icon.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const initialTheme = themeCookie === 'dark' ? 'dark' : 'light';

  return (
    <html lang="en" className={initialTheme === 'dark' ? 'dark' : ''} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme={initialTheme}
            enableSystem={false}
            storageKey="theme"
            disableTransitionOnChange
          >
            <CartProvider>
              {children}
              <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
