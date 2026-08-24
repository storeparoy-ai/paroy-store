import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import FloatingActionHub from '@/components/layout/FloatingActionHub';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PAROY STORE — Jual, Beli & Rental Akun Game Premium',
  description: 'Pusat jual beli dan rental akun game premium terpercaya. MLBB, Free Fire, PUBG, dan game lainnya. Aman, cepat, harga terbaik.',
  keywords: ['jual beli akun game', 'top up diamond', 'rental akun game', 'MLBB', 'Free Fire', 'PUBG', 'paroy store'],
  openGraph: {
    title: 'PAROY STORE — Akun Game Premium',
    description: 'Pusat jual beli dan rental akun game premium terpercaya.',
    type: 'website',
    url: 'https://paroy-store.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${outfit.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen overflow-x-hidden bg-bg-deep text-text-main selection:bg-brand-cyan/30 selection:text-brand-cyan">
        {children}
        <FloatingActionHub />
      </body>
    </html>
  );
}
