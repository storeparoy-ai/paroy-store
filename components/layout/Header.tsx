'use client';

import Link from 'next/link';
import { Search, Zap, Heart, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/products', label: 'Produk' },
  { href: '/rental', label: 'Rental' },
  { href: '/flash-sales', label: 'Flash Sale' },
  { href: '/spin', label: 'Spin' },
  { href: '/community', label: 'Komunitas' },
  { href: '/help', label: 'Bantuan' },
];

export default function Header() {
  return (
    <header
      className="hidden lg:flex fixed top-0 inset-x-0 z-[100] h-14 items-center"
      style={{
        background: 'rgba(26,24,22,0.60)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(232,120,159,0.10)',
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm font-heading"
            style={{
              background: 'linear-gradient(135deg, var(--primary-400), var(--accent-purple))',
              boxShadow: '0 4px 12px rgba(232,120,159,0.35)',
            }}
          >
            P
          </div>
          <span
            className="text-sm font-bold font-heading"
            style={{ color: 'var(--text-primary)' }}
          >
            PAROY STORE
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                'hover:bg-[rgba(255,255,255,0.05)]'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          {[
            { href: '/search', icon: Search, label: 'Cari' },
            { href: '/flash-sales', icon: Zap, label: 'Flash Sale' },
            { href: '/wishlist', icon: Heart, label: 'Wishlist' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors flex items-center"
            >
              <Icon className="w-4 h-4" aria-hidden />
            </Link>
          ))}
          <button
            aria-label="Keranjang"
            className="relative p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          >
            <ShoppingCart className="w-4 h-4" aria-hidden />
          </button>
          <Link
            href="/profile"
            aria-label="Profil"
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors flex items-center"
          >
            <User className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
