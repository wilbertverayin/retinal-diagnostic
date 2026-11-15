import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Retina Scan',
  description: 'AI-Powered Ophthalmic Analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <div role="note" className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950 dark:bg-amber-900 dark:text-amber-50">Demo only. Results are simulated and are not medical advice.</div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
