'use client';

import React, { useState } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Zap, LogIn, LogOut, Menu, X, Gamepad2, UserCircle2, ShieldCheck, Loader2 } from 'lucide-react';
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

/**
 * Penanda "sedang membuka" untuk tautan menuju halaman yang dirender penuh di
 * server (Admin dan Profil). Keduanya harus memverifikasi sesi login ke
 * Supabase lebih dulu, jadi pada jaringan seluler yang lambat bisa ada jeda
 * beberapa detik sebelum halaman berganti — dan tanpa penanda apa pun, jeda
 * itu terbaca sebagai "tombolnya rusak". Persis kasus yang disebut dokumentasi
 * Next.js: prefetch belum selesai saat tautan diklik, sehingga kerangka
 * loading.tsx pun belum sempat tampil.
 *
 * Ukurannya tetap dan elemennya selalu ada — hanya opasitasnya yang berubah —
 * supaya tata letak tidak bergeser saat muncul.
 */
function LinkPending() {
  const { pending } = useLinkStatus();
  return (
    <Loader2
      aria-hidden="true"
      className={cn(
        'w-3.5 h-3.5 shrink-0 transition-opacity motion-safe:animate-spin',
        pending ? 'opacity-100' : 'opacity-0'
      )}
    />
  );
}

export default function Header({ user }: { user: CurrentUser | null }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  /** Kotak pencarian ini sebelumnya hanya menyimpan ketikan dan tidak
   * terhubung ke apa pun — diketik lalu Enter, tidak terjadi apa-apa. */
  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const term = searchValue.trim();
    if (!term) return;
    setMobileOpen(false);
    router.push(`/products?q=${encodeURIComponent(term)}`);
  }

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
          <form onSubmit={handleSearch} role="search" className="w-44 lg:w-52 xl:w-64">
            <Input
              name="q"
              type="search"
              aria-label="Cari game atau akun"
              placeholder="Cari game / akun..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="h-9 bg-bg-card-alt"
            />
          </form>
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-border-subtle">
              {user.role === 'admin' && (
                /* Langsung ke /admin/dashboard, bukan /admin: halaman /admin
                   isinya cuma redirect ke sini, dan lewat navigasi sisi klien
                   redirect itu berarti seluruh rantai pemeriksaan admin
                   (middleware + layout, masing-masing memanggil Supabase Auth)
                   dijalankan DUA KALI sebelum apa pun tampil. */
                <Link href="/admin/dashboard" className="text-xs font-semibold text-trust-emerald hover:opacity-80 flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                  <LinkPending />
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-1.5 text-xs font-semibold text-text-main hover:text-brand-cyan transition-colors whitespace-nowrap">
                <UserCircle2 className="w-4 h-4" />
                {user.fullName || 'Akun Saya'}
                <LinkPending />
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
          <form onSubmit={handleSearch} role="search">
            <Input
              name="q"
              type="search"
              aria-label="Cari game atau akun"
              placeholder="Cari game / akun..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </form>
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
                <Link href="/admin/dashboard" className="block" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    <ShieldCheck className="w-4 h-4 text-trust-emerald" />
                    Dashboard Admin
                    <LinkPending />
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
