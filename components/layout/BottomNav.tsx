'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, Grid3X3, Search, Bell, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/leaderboard', icon: Users, label: 'Leaderboard' },
  { href: '/cek-transaksi', icon: Search, label: 'Transactions' },
  { href: '/notifications', icon: Bell, label: 'Notifikasi' },
  { href: '/profile', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed z-[100] lg:hidden"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: '16px',
        right: '16px',
        background: 'var(--color-surface-container-high)',
        border: '1px solid var(--color-surface-variant)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        borderRadius: '32px',
        padding: '6px',
      }}
    >
      <div className="flex items-center justify-between">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 min-w-0 h-[60px]',
                'select-none transition-all duration-200 active:scale-90 touch-manipulation',
                isActive ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              <span className="relative z-10 flex h-9 w-9 items-center justify-center">
                {isActive && (
                  <span
                    className="absolute inset-0 z-0 rounded-[18px] bg-primary-container/20 border border-primary-container/30"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" aria-hidden />
                </span>
              </span>
              <span
                className={cn(
                  'relative z-10 truncate px-0.5 text-[9px] transition-all duration-200',
                  isActive ? 'font-semibold opacity-100' : 'font-medium opacity-50'
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
