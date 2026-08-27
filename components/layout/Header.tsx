'use client';

import Link from 'next/link';
import { Search, Bell, User, Zap, ShieldCheck, Flame, MessageSquare, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const MAIN_NAV_LINKS = [
  { href: '/', label: 'Beranda', icon: Zap },
  { href: '/topup', label: 'Top Up Kilat', icon: Zap },
  { href: '/products', label: 'Beli Akun', icon: ShieldCheck },
  { href: '/flash-sales', label: 'Flash Sale', badge: 'HOT', icon: Flame },
  { href: '/rekber', label: 'Rekber Escrow', icon: ShieldCheck },
  { href: '/community', label: 'Komunitas', icon: MessageSquare },
];

export default function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080C14]/95 backdrop-blur-md border-b border-white/8 transition-all duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* 1. Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-brand-cyan to-primary-container p-0.5 shadow-[0_0_12px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all duration-300">
            <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-brand-cyan fill-brand-cyan/20 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg tracking-tight text-white flex items-center gap-1">
              PAROY<span className="text-gradient-cyan">STORE</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest text-text-dim -mt-1 uppercase">
              Gaming Marketplace
            </span>
          </div>
        </Link>

        {/* 2. Center: Centered Search Bar */}
        <div className="flex-1 max-w-md lg:max-w-xl mx-auto hidden md:block">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-text-dim" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari game, voucher, akun, skin..."
              className="w-full bg-[#0F1524] text-xs text-white placeholder:text-text-dim rounded-xl pl-10 pr-12 py-2.5 border border-white/10 focus:border-brand-cyan/60 focus:bg-[#141c30] focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="text-[9px] font-mono bg-white/10 text-text-muted px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* 3. Right: Nav Links & Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Navigation Links */}
          <nav className="hidden 2xl:flex items-center gap-1">
            {MAIN_NAV_LINKS.map(({ href, label, badge, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white font-black border border-white/15 shadow-xs'
                      : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-brand-cyan' : 'text-text-dim')} />
                  <span>{label}</span>
                  {badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider bg-red-500 text-white shadow-xs">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Notifications Button */}
          <Link
            href="/notifications"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0F1524] hover:bg-[#161f36] border border-white/10 hover:border-white/20 text-text-muted hover:text-white transition-all shrink-0 flex items-center justify-center shadow-xs"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
          </Link>

          {/* Profile Button */}
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F1524] hover:bg-[#161f36] border border-white/10 hover:border-white/20 transition-all shrink-0 shadow-xs"
          >
            <span className="text-xs font-bold text-white hidden sm:block">Akun Saya</span>
            <div className="w-6 h-6 rounded-lg bg-linear-to-tr from-brand-cyan to-brand-purple flex items-center justify-center text-black font-black text-xs shadow-xs">
              <User className="w-3.5 h-3.5 text-black fill-black" />
            </div>
          </Link>

          {/* Top Up Fast Button */}
          <Link
            href="/topup"
            className="btn-cyber text-xs py-2 px-3.5 sm:px-4 shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-1.5 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Top Up</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
