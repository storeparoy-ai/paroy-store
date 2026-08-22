import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="id">
      <body className="antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
