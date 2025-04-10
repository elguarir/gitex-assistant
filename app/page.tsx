import SiteHeader from '@/components/site-header';
import { Metadata } from 'next';
import { GitexChat } from './gitex-chat';

export const metadata: Metadata = {
  title: 'Gitex Africa - AI Assistant',
  description:
    'AI-powered assistant for Gitex Africa, providing information about the largest tech and startup event in Africa. Get answers about exhibitors, schedules, venues, and more.',
  keywords: [
    'Gitex Africa',
    'AI Assistant',
    'tech event',
    'virtual guide',
    'Africa',
    'technology conference',
    'chatbot',
  ],
  authors: [{ name: 'Gitex Africa' }],
  creator: 'Gitex Africa',
  publisher: 'Gitex Africa',
  metadataBase: new URL('https://gitex.elguarir.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Gitex Africa - AI Assistant',
    description:
      "AI-powered assistant for Gitex Africa. Get instant answers about exhibitors, schedules, venues, and more for Africa's largest tech event.",
    url: 'https://gitex.elguarir.dev',
    siteName: 'Gitex Africa AI Assistant',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Gitex Africa AI Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gitex Africa - AI Assistant',
    description:
      "AI-powered assistant for Gitex Africa. Get instant answers about exhibitors, schedules, venues, and more for Africa's largest tech event.",
    images: ['/og.png'],
    creator: '@gitexafrica',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <div className="relative font-sans flex flex-col h-full">
      <SiteHeader />
      <main className="flex-1 bg-white dark:bg-transparent">
        <div className="mx-auto h-full pt-16 md:pt-4">
          <GitexChat />
        </div>
      </main>
    </div>
  );
}
