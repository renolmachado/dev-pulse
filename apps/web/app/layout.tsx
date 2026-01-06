import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/theme';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'News Pulse - Your Daily News Feed',
  description: 'Stay updated with the latest news, curated and summarized for you.',
  openGraph: {
    title: 'News Pulse - Your Daily News Feed',
    description: 'Stay updated with the latest news, curated and summarized for you.',
    url: 'https://dev-pulse-web-gules.vercel.app/',
    siteName: 'News Pulse',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'News Pulse - Your Daily News Feed',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News Pulse - Your Daily News Feed',
    description: 'Stay updated with the latest news, curated and summarized for you.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
