import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ClipboardList,
  Package,
  Users,
  ShieldAlert,
  Gamepad2,
  Palette,
  Flame,
  Wallet,
  ShieldCheck,
  LayoutDashboard,
  Tags,
  Landmark,
  Zap,
  Bell,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import { getCurrentUser } from '@/lib/supabase/queries';
import { canOpenAdminPath, isOwner } from '@/lib/admin-permissions';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Dashboard Admin',
  robots: { index: false, follow: false },
};

const TABS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pesanan', label: 'Pesanan', icon: ClipboardList },
  { href: '/admin/produk', label: 'Produk', icon: Package },
  { href: '/admin/topup', label: 'Item Top Up', icon: Zap },
  { href: '/admin/kategori-game', label: 'Kategori Game', icon: Gamepad2 },
  { href: '/admin/rentang-harga', label: 'Rentang Harga', icon: Tags },
  { href: '/admin/flash-sale', label: 'Flash Sale', icon: Flame },
  { href: '/admin/metode-pembayaran', label: 'Metode Pembayaran', icon: Wallet },
  { href: '/admin/gateway-pembayaran', label: 'Gateway Pembayaran', icon: Landmark },
  { href: '/admin/tarif-rekber', label: 'Tarif Rekber', icon: ShieldCheck },
  { href: '/admin/notifikasi', label: 'Notifikasi', icon: Bell },
  { href: '/admin/pengaturan', label: 'Pengaturan Situs', icon: Palette },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts already redirects non-admins away from /admin at the edge —
  // this is a defense-in-depth check so a direct render never leaks the
  // shell to a non-admin session (e.g. role revoked mid-session).
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    redirect('/login?next=/admin');
  }

  // Tab yang tidak boleh ia buka tidak ditampilkan. Ini kerapian tampilan,
  // BUKAN pengaman — yang benar-benar menolak adalah RLS di migrasi 19, dan
  // proxy yang memantulkan URL-nya. Menyaring di sini supaya seorang admin
  // pesanan tidak melihat tujuh tab yang semuanya berujung pantulan.
  const tabs = TABS.filter((tab) => canOpenAdminPath(user, tab.href));
  const owner = isOwner(user);

  return (
    <Container className="py-8 sm:py-10 space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-trust-emerald/10 border border-trust-emerald/25 text-trust-emerald flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Dashboard Admin
          </h1>
          <p className="text-xs text-text-muted">
            Masuk sebagai {user.fullName || user.email} &middot;{' '}
            <span className={owner ? 'text-trust-emerald font-semibold' : 'text-text-dim'}>
              {owner ? 'Pemilik' : 'Admin'}
            </span>
          </p>
        </div>
      </div>

      {tabs.length === 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-card-alt p-6 text-center space-y-1">
          <p className="text-sm font-semibold text-text-main">Belum ada menu yang bisa kamu buka.</p>
          <p className="text-xs text-text-muted">
            Akunmu sudah terdaftar sebagai admin, tapi pemilik toko belum memberikan izin apa pun.
            Minta pemilik membuka Pengguna &rarr; Atur izin.
          </p>
        </div>
      )}

      <nav className="flex gap-2 border-b border-border-subtle pb-px overflow-x-auto">
        {tabs.map((tab) => {
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
