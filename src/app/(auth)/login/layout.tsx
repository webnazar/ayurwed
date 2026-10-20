import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | AYURWED — Ancient Intelligence',
  description: 'Log in to your Ayurwed account to access appointments, prescriptions, academy courses, and personalized Ayurveda remedies.',
  keywords: ['Ayurwed Login', 'Sign In', 'Ayurveda Portal Login', 'AYURWED'],
  openGraph: {
    title: 'Sign In | AYURWED — Ancient Intelligence',
    description: 'Log in to your Ayurwed account to access appointments, prescriptions, academy courses, and personalized Ayurveda remedies.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
