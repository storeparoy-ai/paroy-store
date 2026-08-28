'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Clock, ArrowUpDown } from 'lucide-react';
import { cn, formatPriceRangeLabel, type PriceRange } from '@/lib/utils';
import type { Game } from '@/types';

const SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'termurah', label: 'Harga Termurah' },
  { value: 'termahal', label: 'Harga Termahal' },
  { value: 'populer', label: 'Paling Populer' },
];

export default function ProductFilters({ games, priceRanges }: { games: Game[]; priceRanges: PriceRange[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeGame = searchParams.get('game') ?? '';
  const activeMin = searchParams.get('min') ?? '';
  const activeMax = searchParams.get('max') ?? '';
  const activeRental = searchParams.get('rental') === '1';
  const activeSort = searchParams.get('sort') ?? 'terbaru';

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-5">
      {/* Game chips */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-text-dim">Game</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ game: undefined })}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              activeGame === ''
                ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
            )}
          >
            Semua Game
          </button>
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => updateParams({ game: activeGame === game.slug ? undefined : game.slug })}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                activeGame === game.slug
                  ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                  : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
              )}
            >
              {game.icon} {game.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price ranges */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-text-dim">Rentang Harga</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ min: undefined, max: undefined })}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              activeMin === '' && activeMax === ''
                ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
            )}
          >
            Semua Harga
          </button>
          {priceRanges.map((range) => {
            const min = range.minAmount?.toString() ?? '';
            const max = range.maxAmount?.toString() ?? '';
            const isActive = min === activeMin && max === activeMax;
            return (
              <button
                key={range.id}
                onClick={() => updateParams({ min: min || undefined, max: max || undefined })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  isActive
                    ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                    : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
                )}
              >
                {formatPriceRangeLabel(range.minAmount, range.maxAmount)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rental toggle + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          onClick={() => updateParams({ rental: activeRental ? undefined : '1' })}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
            activeRental
              ? 'bg-trust-emerald/15 text-trust-emerald border-trust-emerald/30'
              : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Bisa Disewa Saja
        </button>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-dim" />
          <select
            value={activeSort}
            onChange={(e) => updateParams({ sort: e.target.value === 'terbaru' ? undefined : e.target.value })}
            className="bg-bg-card border border-border-subtle rounded-lg text-xs font-semibold text-text-main px-3 py-1.5 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
