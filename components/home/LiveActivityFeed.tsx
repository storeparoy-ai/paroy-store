'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ShoppingBag, Zap, Clock3, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { timeAgo } from '@/lib/utils';
import type { RecentActivity } from '@/lib/supabase/queries';

const ICON_MAP: Record<string, typeof ShoppingBag> = {
  membeli: ShoppingBag,
  'top up': Zap,
  menyewa: Clock3,
  'mengajukan rekber': ShieldCheck,
};

/**
 * Kartu "Live" di beranda.
 *
 * Dulu memutar MOCK_ACTIVITIES — nama dan pembelian karangan di bawah label
 * yang secara harfiah menyatakan "sedang terjadi". Sekarang isinya pesanan
 * sungguhan yang sudah dibayar atau selesai (migrasi 17), dengan nama pembeli
 * yang sudah disamarkan di dalam database.
 *
 * Halaman induk tidak merender komponen ini kalau daftarnya kosong, jadi
 * selama belum ada transaksi tidak ada kartu kosong yang menganggur.
 */
export default function LiveActivityFeed({ activities }: { activities: RecentActivity[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Satu entri tidak perlu diputar — mengganti-ganti satu isi yang sama
    // hanya membuat halaman berkedip tanpa alasan.
    if (activities.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % activities.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [activities.length]);

  if (activities.length === 0) return null;

  const activity = activities[index % activities.length];
  const Icon = ICON_MAP[activity.action] ?? ShoppingBag;

  return (
    <Card variant="alt" className="px-4 sm:px-5 py-3 sm:py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-trust-emerald text-[11px] font-bold uppercase tracking-wider shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          Live
        </span>
        <div className="h-8 w-px bg-border-subtle shrink-0 hidden sm:block" />
        <div className="relative flex-1 h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activity.action}-${activity.createdAt.getTime()}`}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center gap-2 text-xs sm:text-sm text-text-muted"
            >
              <Icon className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
              <span className="truncate">
                <strong className="text-text-main font-semibold">
                  {activity.actor ?? 'Seseorang'}
                </strong>{' '}
                {activity.action} <span className="text-text-main">{activity.itemLabel}</span>
              </span>
              <span className="text-text-dim shrink-0 hidden sm:inline">
                &middot; {timeAgo(activity.createdAt)}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
