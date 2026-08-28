'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Zap, LogIn, Menu, X, Gamepad2 } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/topup', label: 'Top Up Kilat' },
  { href: '/products', label: 'Katalog Akun' },
  { href: '/rental', label: 'Rental Akun' },
  { href: '/rekber', label: 'Rekber' },
  { href: '/cek-transaksi', label: 'Cek Transaksi' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-deep border-b border-border-subtle">
      <Container className="flex items-center justify-between gap-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan/20 transition-colors">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-lg tracking-tight text-text-main hidden sm:inline">
            PAROY<span className="text-brand-cyan">STORE</span>
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
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="w-52 xl:w-64">
            <Input
              placeholder="Cari game / akun..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="h-9 bg-bg-card-alt"
            />
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </Button>
          </Link>
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
          mobileOpen ? 'max-h-[26rem]' : 'max-h-0 border-t-0'
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
          <Link href="/login" className="block" onClick={() => setMobileOpen(false)}>
            <Button variant="primary" className="w-full">
              <LogIn className="w-4 h-4" />
              Masuk / Daftar
            </Button>
          </Link>
        </Container>
      </div>
    </header>
  );
}
