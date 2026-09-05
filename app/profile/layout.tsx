import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { History, Heart, Settings, UserCircle2 } from 'lucide-react';
import Container from '@/components/ui/Container';
import { getCurrentUser } from '@/lib/supabase/queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Halaman pribadi — sudah dijaga proxy.ts dan pemeriksaan di bawah, tapi
 * mesin pencari tetap perlu diberi tahu supaya tidak menyimpan cuplikannya. */
export const metadata: Metadata = {
  title: 'Profil',
  robots: { index: false, follow: false },
};

const TABS = [
  { href: '/profile/riwayat', label: 'Riwayat Pesanan', icon: History },
  { href: '/profile/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/profile/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts already protects /profile at the edge — this is a
  // defense-in-depth check for a direct render.
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/profile');
  }

  return (
    <Container className="py-8 sm:py-10 space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
          <UserCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            {user.fullName || 'Akun Saya'}
          </h1>
          <p className="text-xs text-text-muted">{user.email}</p>
        </div>
      </div>

      <nav className="flex gap-2 border-b border-border-subtle pb-px overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-text-main border-b-2 border-transparent hover:border-brand-cyan/40 transition-colors whitespace-nowrap"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </Container>
  );
}
