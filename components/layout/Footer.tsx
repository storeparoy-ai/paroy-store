import React from 'react';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { Gamepad2, ShieldCheck, MessageCircle, Globe } from 'lucide-react';
import Container from '@/components/ui/Container';
import { getActivePaymentMethods, getSiteSettings } from '@/lib/supabase/queries';

/** `new Date()` during prerendering is a Cache Components build error (an
 * uncached value that can change between renders) — cache it instead of
 * reading it live; a copyright year is fine going stale for up to a day. */
async function getCurrentYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

const FOOTER_LINKS = [
  {
    title: 'Layanan',
    links: [
      { href: '/topup', label: 'Top Up Kilat' },
      { href: '/products', label: 'Jual Beli Akun' },
      { href: '/rental', label: 'Rental Akun' },
      { href: '/rekber', label: 'Rekber Escrow' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { href: '/cek-transaksi', label: 'Cek Transaksi' },
      { href: '/community', label: 'Komunitas' },
      { href: '/leaderboard', label: 'Leaderboard' },
      { href: '/rekber', label: 'Cara Kerja Rekber' },
    ],
  },
];

export default async function Footer() {
  const [year, settings, paymentMethods] = await Promise.all([
    getCurrentYear(),
    getSiteSettings(),
    // Footer ada di setiap halaman: kalau bacaan ini gagal, cukup barisnya
    // yang hilang — jangan sampai seluruh situs ikut jatuh.
    getActivePaymentMethods().catch(() => []),
  ]);

  return (
    <footer className="bg-bg-deep border-t border-border-subtle pb-20 lg:pb-0">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-text-main">
                PAROY<span className="text-brand-cyan">STORE</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-sm">
              Marketplace gaming all-in-one: top up harga jelas, jual beli akun terverifikasi,
              rental akun, dan rekber escrow resmi. Aman dan transparan.
            </p>
            <div className="flex items-center gap-2 text-trust-emerald text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Anti Hackback &middot; Rekber Resmi</span>
            </div>
            {/* Dulu dua-duanya href="#" — pembeli yang butuh bantuan menekan
                ikon WhatsApp dan tidak terjadi apa-apa, padahal tautannya sudah
                ada di Pengaturan Situs sejak lama. Ikon yang belum diisi
                disembunyikan saja: tombol mati lebih buruk daripada tidak ada
                tombol, karena ia terlihat seperti bantuan yang tersedia. */}
            {(settings.whatsappUrl || settings.discordUrl) && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {/* Berlabel, bukan ikon gelembung tanpa teks — pembeli yang
                    butuh bantuan harus langsung tahu tombol ini untuk apa. */}
                {settings.whatsappUrl && (
                  <a
                    href={settings.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-bg-card border border-border-subtle text-xs font-semibold text-text-main hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Hubungi Admin
                  </a>
                )}
                {settings.discordUrl && (
                  <a
                    href={settings.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-bg-card border border-border-subtle text-xs font-semibold text-text-main hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Discord
                  </a>
                )}
              </div>
            )}
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-text-muted hover:text-text-main transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Dulu di sini tertulis "Dibuat dengan Paroy Nexus · Next.js" — nama
            sistem desain internal dan framework, tidak berarti apa-apa bagi
            pembeli. Diganti dua hal yang memang berguna: cara bayar yang
            diterima (dari tabel payment_methods, jadi ikut berubah bersama
            admin), dan pernyataan merek dagang — situs ini memajang logo
            resmi game milik penerbit lain. */}
        <div className="mt-12 pt-6 border-t border-border-subtle space-y-4">
          {paymentMethods.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-dim mr-1">
                Pembayaran
              </span>
              {paymentMethods.map((m) => (
                <span
                  key={m.id}
                  className="px-2.5 py-1 rounded-md bg-bg-card border border-border-subtle text-[11px] font-semibold text-text-muted"
                >
                  {m.label.replace(/^transfer\s+/i, '')}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-8">
            <p className="text-[11px] text-text-dim shrink-0">
              &copy; {year} Paroy Store. Seluruh hak cipta dilindungi.
            </p>
            <p className="text-[11px] text-text-dim leading-relaxed sm:text-right max-w-xl">
              Nama dan logo game adalah merek dagang milik penerbitnya masing-masing. Paroy Store
              adalah toko independen dan tidak berafiliasi dengan penerbit game mana pun.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
