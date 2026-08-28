'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, ShoppingBag, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/topup', label: 'Top Up', icon: Zap },
  { href: '/products', label: 'Katalog', icon: ShoppingBag },
  { href: '/rekber', label: 'Rekber', icon: Shield },
  { href: '/profile', label: 'Akun', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-deep border-t border-border-subtle pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors',
                active ? 'text-brand-cyan' : 'text-text-dim hover:text-text-muted'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]')} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
