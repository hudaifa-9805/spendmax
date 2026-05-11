import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { WalletProvider } from '@/components/WalletContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpendMax — Rewards Optimizer',
  description: 'Maximize your credit card rewards with intelligent multi-tier recommendations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-white min-h-screen`}>
        <WalletProvider>
          <NavBar />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
