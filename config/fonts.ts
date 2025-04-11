import { Fira_Code as FontMono, Geist as FontSans } from 'next/font/google';

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['system-ui', 'sans-serif'],
});

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});
