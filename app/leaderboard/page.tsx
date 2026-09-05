import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Crown, Medal } from 'lucide-react';
import Container from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { getLeaderboard } from '@/lib/supabase/queries';
import { cn, formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Peringkat pembeli paling aktif di Paroy Store — harian, mingguan, dan bulanan.',
  alternates: { canonical: '/leaderboard' },
};

const PERIODS = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
] as const;

const RANK_STYLE = [
  { icon: Crown, color: 'text-urgency-orange', bg: 'bg-urgency-orange/10 border-urgency-orange/30' },
  { icon: Medal, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10 border-brand-cyan/25' },
  { icon: Medal, color: 'text-[#d99a5c]', bg: 'bg-[#d99a5c]/10 border-[#d99a5c]/30' },
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const activePeriod = (['daily', 'weekly', 'monthly'] as const).includes(period as 'daily') ? period! : 'weekly';
  const entries = await getLeaderboard(activePeriod as 'daily' | 'weekly' | 'monthly');

  return (
    <Container className="py-8 sm:py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-urgency-orange/10 border border-urgency-orange/25 text-urgency-orange flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Leaderboard Top Spender
          </h1>
          <p className="text-xs text-text-muted">
            Peringkat berdasarkan total transaksi selesai. Masuk dulu biar transaksimu ikut terhitung.
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/leaderboard?period=${p.value}`}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                activePeriod === p.value
                  ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30'
                  : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-text-muted py-16 text-center">
            Belum ada transaksi selesai di periode ini.
          </p>
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry, idx) => {
              const rankStyle = RANK_STYLE[idx];
              const Icon = rankStyle?.icon;
              return (
                <Card key={entry.userId} variant={idx < 3 ? 'raised' : 'alt'} className={idx < 3 ? rankStyle.bg : undefined}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        'w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-mono font-bold text-sm border',
                        idx < 3 ? cn(rankStyle.bg, rankStyle.color) : 'bg-white/5 text-text-muted border-border-subtle'
                      )}
                    >
                      {Icon ? <Icon className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-text-main truncate">{entry.name}</span>
                    <span className="font-mono font-bold text-sm text-brand-cyan whitespace-nowrap">
                      {formatCurrency(entry.total)}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
