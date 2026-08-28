import React from 'react';
import Link from 'next/link';
import { Zap, ShoppingBag, Clock, ShieldCheck, FileSearch } from 'lucide-react';

const MENU_ITEMS = [
  { href: '/topup', label: 'Top Up Kilat', icon: Zap, color: '#22d3ee' },
  { href: '/products', label: 'Katalog Akun', icon: ShoppingBag, color: '#22d3ee' },
  { href: '/rental', label: 'Rental Akun', icon: Clock, color: '#34d399' },
  { href: '/rekber', label: 'Rekber', icon: ShieldCheck, color: '#34d399' },
  { href: '/cek-transaksi', label: 'Cek Transaksi', icon: FileSearch, color: '#f97316' },
];

/**
 * Prominent body-level entry points to the core services — separate from
 * the header nav, which reads as small/easy-to-miss text links. This is
 * usually the first thing a user scans a marketplace homepage for.
 */
export default function HomeQuickMenu() {
  return (
    <section className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-[18px] bg-bg-card border border-border-subtle shadow-elevated hover:border-brand-cyan/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{
                background: `linear-gradient(155deg, ${item.color}30, ${item.color}08)`,
                boxShadow: `inset 0 0 0 1px ${item.color}45`,
                color: item.color,
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-text-muted group-hover:text-text-main text-center leading-tight transition-colors">
              {item.label}
            </span>
          </Link>
        );
      })}
    </section>
  );
}
