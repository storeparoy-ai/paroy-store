'use client';

import Link from 'next/link';
import { Search, Bell, User, Zap, ShieldCheck, Flame } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const MAIN_NAV_LINKS = [
  { href: '/', label: 'Beranda', icon: Zap },
  { href: '/topup', label: 'Top Up Kilat', icon: Zap },
  { href: '/products', label: 'Beli Akun', icon: ShieldCheck },
  { href: '/flash-sales', label: 'Flash Sale', badge: 'HOT', icon: Flame },
  { href: '/rekber', label: 'Rekber Escrow', icon: ShieldCheck },
];

export default function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 lg:px-12 py-3 bg-bg-deep/90 backdrop-blur-xl border-b border-white/8 transition-all duration-300">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-4 lg:gap-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-brand-cyan to-primary-container p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-all duration-300">
            <div className="w-full h-full bg-bg-base rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-cyan fill-brand-cyan/20 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
              PAROY<span className="text-gradient-cyan">STORE</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest text-text-muted -mt-1 uppercase">
              Gaming Marketplace #1
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
          {MAIN_NAV_LINKS.map(({ href, label, badge, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                  isActive
                    ? 'text-brand-cyan bg-brand-cyan/10 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-bold border border-brand-cyan/20'
                    : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-brand-cyan' : 'text-text-dim')} />
                <span>{label}</span>
                {badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-red-500 text-white shadow-xs">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Search */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Interactive Search Bar */}
          <div className="relative hidden md:block w-44 lg:w-56 xl:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari game, voucher..."
              className="bg-bg-card text-xs text-white placeholder:text-text-dim rounded-xl pl-9 pr-10 py-2 border border-white/10 focus:border-brand-cyan/60 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40 transition-all w-full shadow-inner"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono bg-white/10 text-text-muted px-1.5 py-0.5 rounded border border-white/10 pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-white transition-all shrink-0 flex items-center justify-center"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
          </Link>

          {/* Profile Button */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all shrink-0"
          >
            <span className="text-xs font-semibold text-text-main hidden sm:inline">Akun Saya</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-linear-to-tr from-brand-cyan to-brand-purple flex items-center justify-center text-black font-black text-xs shadow-sm">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900" />
            </div>
          </Link>

          {/* CTA Top Up */}
          <Link
            href="/topup"
            className="btn-cyber text-xs py-2 px-3.5 sm:px-4.5 flex items-center gap-1.5 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span className="font-black">Top Up</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
