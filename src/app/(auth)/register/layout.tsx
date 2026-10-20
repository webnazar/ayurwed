import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | AYURWED — Ancient Intelligence',
  description: 'Register for an Ayurwed account as a consumer, consultant, or student to access personalized Ayurveda care and CAI programs.',
  keywords: ['Ayurwed Register', 'Sign Up', 'Ayurveda Account', 'AYURWED'],
  openGraph: {
    title: 'Create Account | AYURWED — Ancient Intelligence',
    description: 'Register for an Ayurwed account as a consumer, consultant, or student to access personalized Ayurveda care and CAI programs.',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
