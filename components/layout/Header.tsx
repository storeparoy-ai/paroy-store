'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Zap, LogIn, LogOut, Menu, X, Gamepad2, UserCircle2, ShieldCheck } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { signOutAction } from '@/lib/supabase/auth-actions';
import { cn } from '@/lib/utils';
import type { CurrentUser } from '@/lib/supabase/queries';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/topup', label: 'Top Up Kilat' },
  { href: '/products', label: 'Katalog Akun' },
  { href: '/rental', label: 'Rental Akun' },
  { href: '/rekber', label: 'Rekber' },
  { href: '/cek-transaksi', label: 'Cek Transaksi' },
];

export default function Header({ user }: { user: CurrentUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-deep border-b border-border-subtle">
      <Container className="flex items-center justify-between gap-4 h-20 lg:h-23">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-[13px] bg-linear-to-br from-brand-magenta/15 to-brand-cyan/10 border border-brand-magenta/30 flex items-center justify-center text-brand-cyan shadow-[0_0_24px_-6px_rgba(255,46,154,0.45)] group-hover:shadow-[0_0_28px_-4px_rgba(255,46,154,0.6)] transition-shadow">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-text-main hidden sm:inline">
            PAROY
            <span className="bg-linear-to-r from-brand-magenta to-brand-cyan bg-clip-text text-transparent">
              STORE
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search + Actions */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <div className="w-44 lg:w-52 xl:w-64">
            <Input
              placeholder="Cari game / akun..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="h-9 bg-bg-card-alt"
            />
          </div>
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-border-subtle">
              {user.role === 'admin' && (
                <Link href="/admin" className="text-xs font-semibold text-trust-emerald hover:opacity-80 flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-1.5 text-xs font-semibold text-text-main hover:text-brand-cyan transition-colors whitespace-nowrap">
                <UserCircle2 className="w-4 h-4" />
                {user.fullName || 'Akun Saya'}
              </Link>
              <form action={signOutAction}>
                <Button variant="ghost" size="sm" type="submit" aria-label="Keluar">
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                <LogIn className="w-3.5 h-3.5" />
                Masuk
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-main hover:bg-white/5 transition-colors"
          aria-label="Buka menu navigasi"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </Container>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 border-t border-border-subtle bg-bg-deep',
          mobileOpen ? 'max-h-104' : 'max-h-0 border-t-0'
        )}
      >
        <Container className="py-4 space-y-4">
          <Input
            placeholder="Cari game / akun..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-text-muted hover:text-text-main hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                {link.href === '/topup' && <Zap className="w-4 h-4 text-brand-cyan" />}
                {link.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="space-y-2">
              <Link href="/profile" className="block" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" className="w-full">
                  <UserCircle2 className="w-4 h-4" />
                  {user.fullName || 'Akun Saya'}
                </Button>
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="block" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    <ShieldCheck className="w-4 h-4 text-trust-emerald" />
                    Dashboard Admin
                  </Button>
                </Link>
              )}
              <form action={signOutAction}>
                <Button variant="ghost" className="w-full" type="submit">
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="block" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" className="w-full">
                <LogIn className="w-4 h-4" />
                Masuk / Daftar
              </Button>
            </Link>
          )}
        </Container>
      </div>
    </header>
  );
}
