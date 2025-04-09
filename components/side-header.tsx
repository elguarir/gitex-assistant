'use client';
import { Button } from '@heroui/button';
import Link from 'next/link';
import { GithubIcon, LinkedInIcon, Logo } from './icons';
import { ThemeSwitch } from './theme-switch';

export default function SiteHeader() {
  return (
    <header>
      <nav className="fixed z-20 w-full border-b border-dashed bg-white border-neutral-300 dark:border-neutral-700 backdrop-blur md:relative dark:bg-neutral-950/50 lg:dark:bg-transparent">
        <div className="m-auto max-w-5xl px-6">
          <div className="flex items-center justify-between py-3 lg:py-4">
            <Link
              href="/"
              aria-label="home"
              className="flex items-center space-x-2 focus-visible:ring-[1.5px] focus-visible:ring-focus outline-none"
            >
              <Logo className="size-7" />
            </Link>
            <div className="flex gap-3">
              <ThemeSwitch />
              <Button isIconOnly variant="light">
                <GithubIcon className="h-5 w-5" />
              </Button>
              <Button isIconOnly variant="light">
                <LinkedInIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
