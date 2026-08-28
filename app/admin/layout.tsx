import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClipboardList, Package, Users, ShieldAlert } from 'lucide-react';
import Container from '@/components/ui/Container';
import { getCurrentUser } from '@/lib/supabase/queries';

const TABS = [
  { href: '/admin/pesanan', label: 'Pesanan', icon: ClipboardList },
  { href: '/admin/produk', label: 'Produk', icon: Package },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts already redirects non-admins away from /admin at the edge —
  // this is a defense-in-depth check so a direct render never leaks the
  // shell to a non-admin session (e.g. role revoked mid-session).
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/login?next=/admin');
  }

  return (
    <Container className="py-8 sm:py-10 space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-trust-emerald/10 border border-trust-emerald/25 text-trust-emerald flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-xs text-text-muted">Masuk sebagai {user.fullName || user.email}</p>
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
