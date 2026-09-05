import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { Suspense } from 'react';
import { Rajdhani, Orbitron, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav, { BottomNavFallback } from '@/components/layout/BottomNav';
import { getCurrentUserForDisplay, getSiteSettings } from '@/lib/supabase/queries';
import { siteUrl } from '@/lib/site';
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

/**
 * Metadata dasar seluruh situs.
 *
 * `generateMetadata` (bukan objek `metadata` statis) supaya nama toko dan
 * tagline ikut Pengaturan Situs di dashboard — kalau admin mengganti nama
 * toko, judul tab dan pratinjau link ikut berubah tanpa deploy ulang.
 *
 * `'use cache'` di dalamnya bukan optimasi belaka: dengan Cache Components,
 * generateMetadata yang mengambil data tanpa cache memaksa Next.js mengeluh
 * bahwa halaman yang seharusnya bisa di-prerender jadi menunggu request.
 *
 * `metadataBase` wajib: pratinjau di WhatsApp/Telegram butuh URL gambar yang
 * absolut — path relatif tidak bisa ditebak dari luar. Tanpa ini, setiap
 * gambar Open Graph relatif akan menggagalkan build.
 */
export async function generateMetadata(): Promise<Metadata> {
  'use cache';
  // Wajib disebutkan, jangan dibiarkan memakai profil bawaan. Ini metadata
  // layout ROOT, jadi umur cache-nya jadi batas terketat bagi SETIAP halaman
  // di situs — profil bawaan (15 menit) diam-diam memperpendek jendela
  // revalidasi semua rute dari sehari jadi seperempat jam. 'hours' menyamakan
  // umurnya dengan getSiteSettings() yang jadi sumber datanya.
  cacheLife('hours');
  const settings = await getSiteSettings();
  const description =
    'Jual beli akun game, top up diamond, sewa akun, dan rekber (rekening bersama) resmi. ' +
    'Setiap serah terima akun didampingi admin dengan proteksi anti-hackback.';

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${settings.siteName} — ${settings.tagline}`,
      // Halaman lain cukup menulis judulnya sendiri, nama toko menyusul.
      template: `%s · ${settings.siteName}`,
    },
    description,
    applicationName: settings.siteName,
    keywords: [
      'jual beli akun game',
      'top up murah',
      'sewa akun game',
      'rekber',
      'rekening bersama',
      'akun mobile legends',
      'akun free fire',
    ],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      siteName: settings.siteName,
      title: `${settings.siteName} — ${settings.tagline}`,
      description,
      url: siteUrl(),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${settings.siteName} — ${settings.tagline}`,
      description,
    },
  };
}

/** Isolates the one genuinely per-request bit of the whole layout (the
 * session cookie, read via getCurrentUserForDisplay()) inside its own
 * Suspense boundary. With Cache Components enabled, reading cookies()
 * anywhere outside a boundary like this forces the ENTIRE route tree to
 * skip prerendering/caching — since this ran unwrapped at the root layout,
 * it was doing that to literally every single page on the site (the root
 * cause of "every click re-queries the database from scratch" reported
 * 2026-08-29). Wrapping just this sliver lets everything else prerender or
 * cache normally, while the Header's login-state streams in around it. The
 * fallback renders Header with user=null — visually identical to the
 * logged-out state, so there's no layout shift while it resolves. */
async function HeaderWithSession() {
  const user = await getCurrentUserForDisplay();
  return <Header user={user} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${rajdhani.variable} ${orbitron.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-bg-base text-text-main flex flex-col">
        <Suspense fallback={<Header user={null} />}>
          <HeaderWithSession />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <Suspense fallback={<BottomNavFallback />}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
