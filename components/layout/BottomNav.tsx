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

/** Markup shared by the real nav and its prerender fallback — kept in one
 * place so the two never visually drift apart. `active` defaults to a no-op
 * (nothing highlighted) for the fallback's sake. */
function NavItems({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <div className="grid grid-cols-5 h-16">
      {ITEMS.map((item) => {
        const active = isActive(item.href);
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
  );
}

/** usePathname() is a client-side dynamic hook — under Cache Components it
 * bails out of static prerendering exactly like cookies()/searchParams do,
 * so BottomNav needs its own <Suspense> boundary at the call site (see
 * app/layout.tsx) rather than being rendered inline in the root layout.
 * This fallback renders the identical nav with nothing highlighted, which
 * is only visible for an instant before the real pathname streams in. */
export function BottomNavFallback() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-deep border-t border-border-subtle pb-[env(safe-area-inset-bottom)]">
      <NavItems isActive={() => false} />
    </nav>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-deep border-t border-border-subtle pb-[env(safe-area-inset-bottom)]">
      <NavItems isActive={(href) => (href === '/' ? pathname === '/' : pathname.startsWith(href))} />
    </nav>
  );
}
