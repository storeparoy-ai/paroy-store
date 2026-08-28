import type { Metadata } from 'next';
import { Rajdhani, Orbitron, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { getCurrentUser } from '@/lib/supabase/queries';
import './globals.css';

// Paroy Nexus type system (see DESIGN.md): Rajdhani for body — a technical
// condensed grotesque with real gaming-UI pedigree — paired with Orbitron
// for display/headings (geometric sci-fi) and JetBrains Mono for data.
// JetBrains Mono (not the mockup's Share Tech Mono) is a deliberate
// substitution: money figures need real legibility, and JetBrains Mono
// reads just as "digital" while staying far more legible at small sizes.
const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
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
  title: 'PAROY STORE — Marketplace Gaming & Top Up',
  description: 'Marketplace jual beli akun game, top up kilat, dan rekber escrow resmi terpercaya.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="id" className={`${rajdhani.variable} ${orbitron.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-bg-base text-text-main flex flex-col">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
