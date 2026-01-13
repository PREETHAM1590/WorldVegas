import type { Metadata, Viewport } from 'next';
import { MiniKitProvider } from '@/providers/MiniKitProvider';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'WorldVegas - Provably Fair Casino',
  description: 'The first provably fair gambling mini app for World App. Play slots, blackjack, and prediction markets with WLD and USDC.',
  keywords: ['casino', 'gambling', 'world app', 'minikit', 'slots', 'blackjack', 'prediction market'],
  authors: [{ name: 'WorldVegas' }],
  openGraph: {
    title: 'WorldVegas',
    description: 'Provably fair gambling in World App',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0118',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-casino-darker text-white">
        <MiniKitProvider>
          <ToastProvider>
            <main className="min-h-screen min-h-[100dvh] flex flex-col safe-area-top">
              {children}
            </main>
          </ToastProvider>
        </MiniKitProvider>
      </body>
    </html>
  );
}
