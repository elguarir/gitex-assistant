import SiteHeader from '@/components/side-header';
import { Metadata } from 'next';
import { GitexChat } from './gitex-chat';

export const metadata: Metadata = {
  title: 'GitexAfrica - Guide',
  description:
    'Gitex Africa is the largest tech and startup event in Africa, bringing together innovators, entrepreneurs, and industry leaders to showcase the latest advancements in technology and business.',
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
