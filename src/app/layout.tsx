import type { Metadata, Viewport } from 'next';
import { MiniKitProvider } from '@/providers/MiniKitProvider';
import { SyncProvider } from '@/providers/SyncProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { I18nProvider } from '@/lib/i18n';
import './globals.css';
import '@/styles/casino-theme.css';

export const metadata: Metadata = {
  title: 'WorldVegas - Provably Fair Casino',
  description: 'The first provably fair gambling mini app for World App. Play slots, blackjack, and prediction markets with WLD and USDC.',
  keywords: ['casino', 'gambling', 'world app', 'minikit', 'slots', 'blackjack', 'prediction market'],
  authors: [{ name: 'WorldVegas' }],
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'WorldVegas',
    description: 'Provably fair gambling in World App',
    type: 'website',
    images: ['/logo.svg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
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
      <body className="antialiased bg-[#0A0A0A] text-white">
        <I18nProvider>
          <MiniKitProvider>
            <ToastProvider>
              <SyncProvider>
                <main className="min-h-screen min-h-[100dvh] flex flex-col safe-area-top">
                  {children}
                </main>
              </SyncProvider>
            </ToastProvider>
          </MiniKitProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
