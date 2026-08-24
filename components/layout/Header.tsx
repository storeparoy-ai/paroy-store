'use client';

import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/community', label: 'Leaderboard' },
  { href: '/search', label: 'Transactions' },
  { href: '/help', label: 'Support' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-surface/80 shadow-sm backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16">
        <div className="flex items-center gap-gutter">
          <Link href="/" className="text-headline-md font-headline-md font-black tracking-tight text-primary">
            PAROY STORE
          </Link>
          <div className="hidden md:flex gap-4">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'text-label-md font-label-md transition-colors duration-200 pb-1',
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search games..." 
              className="card-level-1 text-body-md font-body-md rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary-container transition-colors w-64 text-on-surface"
            />
          </div>
          <Link href="/notifications" className="text-on-surface-variant hover:text-primary transition-colors scale-102 active:scale-95 duration-200 p-2">
            <Bell className="w-5 h-5" />
          </Link>
          <Link href="/profile" className="text-on-surface-variant hover:text-primary transition-colors scale-102 active:scale-95 duration-200 p-2">
            <User className="w-5 h-5" />
          </Link>
          <Link 
            href="/login"
            className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:scale-102 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,200,150,0.2)]"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
