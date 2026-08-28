'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Clock, ArrowUpDown } from 'lucide-react';
import { GAMES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const PRICE_RANGES = [
  { label: 'Semua Harga', min: undefined, max: undefined },
  { label: '< Rp 200rb', min: undefined, max: 200000 },
  { label: 'Rp 200rb - 400rb', min: 200000, max: 400000 },
  { label: 'Rp 400rb - 600rb', min: 400000, max: 600000 },
  { label: '> Rp 600rb', min: 600000, max: undefined },
];

const SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'termurah', label: 'Harga Termurah' },
  { value: 'termahal', label: 'Harga Termahal' },
  { value: 'populer', label: 'Paling Populer' },
];

export default function ProductFilters() {
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
          {GAMES.map((game) => (
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
          {PRICE_RANGES.map((range) => {
            const isActive =
              (range.min?.toString() ?? '') === activeMin && (range.max?.toString() ?? '') === activeMax;
            return (
              <button
                key={range.label}
                onClick={() =>
                  updateParams({ min: range.min?.toString(), max: range.max?.toString() })
                }
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  isActive
                    ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                    : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
                )}
              >
                {range.label}
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
