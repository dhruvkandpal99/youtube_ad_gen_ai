import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { AppStateProvider } from '@/components/providers/AppStateProvider';
import YouTubeHeader from '@/components/layout/YouTubeHeader';
import StepIndicator from '@/components/layout/StepIndicator';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'YouTube Advertising - Generative AI Ad Studio',
  description: 'AI-powered ad brief discovery and image generation platform for YouTube advertisers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans bg-ytBackground text-white antialiased`}>
        <AppStateProvider>
          <div className="min-h-screen flex flex-col">
            <YouTubeHeader />
            <div className="pt-[56px] flex-1 flex flex-col">
              <StepIndicator />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
            </div>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
