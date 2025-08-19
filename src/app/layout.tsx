import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppLayout from '@/components/layout/AppLayout';
import { PredictionProvider } from '@/contexts/PredictionContext';
import SessionProvider from '@/components/providers/SessionProvider';
import SimpleAuthWrapper from '@/components/auth/SimpleAuthWrapper';
import NotificationSystem from '@/components/ui/NotificationSystem';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Premier League Predictions',
  description: 'Predict Premier League match scores and compete with friends',
  keywords: 'Premier League, predictions, football, soccer, scores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <SessionProvider>
            <SimpleAuthWrapper>
              <PredictionProvider>
                <AppLayout>
                  {children}
                </AppLayout>
                <NotificationSystem />
              </PredictionProvider>
            </SimpleAuthWrapper>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}