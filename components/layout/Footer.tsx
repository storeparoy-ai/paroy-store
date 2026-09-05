import React from 'react';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { Gamepad2, ShieldCheck, MessageCircle, Globe } from 'lucide-react';
import Container from '@/components/ui/Container';

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
  const year = await getCurrentYear();

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
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
                aria-label="Website Resmi"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
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

        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-text-dim">
            &copy; {year} Paroy Store. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-[11px] text-text-dim">
            Dibuat dengan Paroy Nexus &middot; Next.js
          </p>
        </div>
      </Container>
    </footer>
  );
}
