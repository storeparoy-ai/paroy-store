'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Beranda' },
  { href: '/topup', icon: Zap, label: 'Top Up' },
  { href: '/flash-sales', icon: Flame, label: 'Promo' },
  { href: '/cek-transaksi', icon: Search, label: 'Pesanan' },
  { href: '/profile', icon: User, label: 'Akun' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 inset-x-4 z-100 lg:hidden">
      <div className="max-w-md mx-auto rounded-2xl bg-bg-base/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl p-1.5 flex items-center justify-around">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-95',
                isActive ? 'text-brand-cyan' : 'text-text-dim hover:text-text-muted'
              )}
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <div className="absolute -inset-1 rounded-xl bg-brand-cyan/15 shadow-[0_0_12px_rgba(0,240,255,0.25)] border border-brand-cyan/30" />
                )}
                <Icon className={cn('w-5 h-5 relative z-10', isActive && 'text-brand-cyan')} />
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1 font-bold tracking-tight relative z-10',
                  isActive ? 'text-brand-cyan' : 'text-text-dim'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
