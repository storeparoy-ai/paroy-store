'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Zap, LayoutGrid, Sparkles } from 'lucide-react';
import { CoverflowCarousel, CoverflowSlide } from '@/components/ui/coverflow-carousel';
import { cn } from '@/lib/utils';

const POPULAR_GAMES = [
  {
    id: 'mlbb',
    name: 'Mobile Legends: Bang Bang',
    publisher: 'Moonton Official',
    badge: '🔥 PALING POPULER',
    icon: '⚡',
    gradient: 'from-[#3b82f6] to-[#1d4ed8]',
    bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=mlbb',
    price: 'Mulai Rp 1.400',
    speed: '⚡ 1 Detik Otomatis',
  },
  {
    id: 'ff',
    name: 'Free Fire MAX',
    publisher: 'Garena Official',
    badge: '⚡ AUTO SERVER',
    icon: '🔥',
    gradient: 'from-[#ef4444] to-[#b91c1c]',
    bgImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=ff',
    price: 'Mulai Rp 1.000',
    speed: '⚡ 1 Detik Otomatis',
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile UC',
    publisher: 'Tencent Games',
    badge: '🏆 DISKON 15%',
    icon: '🎯',
    gradient: 'from-[#f59e0b] to-[#b45309]',
    bgImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=pubg',
    price: 'Mulai Rp 14.000',
    speed: '⚡ 1 Detik Otomatis',
  },
  {
    id: 'genshin',
    name: 'Genshin Impact (Genesis)',
    publisher: 'HoYoverse',
    badge: '🛡️ 100% LEGAL UID',
    icon: '🌟',
    gradient: 'from-[#8b5cf6] to-[#6d28d9]',
    bgImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=genshin',
    price: 'Mulai Rp 16.000',
    speed: '⚡ 1 Detik Otomatis',
  },
  {
    id: 'efootball',
    name: 'eFootball 2026 Coins',
    publisher: 'Konami',
    badge: '⚽ RESMI KONAMI',
    icon: '⚽',
    gradient: 'from-[#10b981] to-[#047857]',
    bgImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=efootball',
    price: 'Mulai Rp 19.000',
    speed: '⚡ 1 Detik Otomatis',
  },
  {
    id: 'cod',
    name: 'Call of Duty: Mobile CP',
    publisher: 'Activision',
    badge: '💥 KILAT 24 JAM',
    icon: '💥',
    gradient: 'from-[#64748b] to-[#334155]',
    bgImage: 'https://images.unsplash.com/photo-1552824722-ddab1374e622?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=cod',
    price: 'Mulai Rp 10.000',
    speed: '⚡ 1 Detik Otomatis',
  },
  {
    id: 'valorant',
    name: 'Valorant Points (VP)',
    publisher: 'Riot Games',
    badge: '💎 INSTANT CODE',
    icon: '🗡️',
    gradient: 'from-[#f43f5e] to-[#be123c]',
    bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=valorant',
    price: 'Mulai Rp 25.000',
    speed: '⚡ 1 Detik Otomatis',
  },
  {
    id: 'hok',
    name: 'Honor of Kings Tokens',
    publisher: 'Level Infinite',
    badge: '✨ PROMO SPESIAL',
    icon: '👑',
    gradient: 'from-[#eab308] to-[#ca8a04]',
    bgImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    href: '/topup?game=hok',
    price: 'Mulai Rp 12.000',
    speed: '⚡ 1 Detik Otomatis',
  },
];

export default function GameQuickSelect() {
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');

  const slides: CoverflowSlide[] = POPULAR_GAMES.map((g) => ({
    src: g.bgImage,
    alt: g.name,
    title: g.name,
    subtitle: g.publisher,
    badge: g.badge,
    price: g.price,
    href: g.href,
    ctaText: 'Top Up Game Ini →',
  }));

  return (
    <section className="relative">
      
      {/* Header with Title & Dual View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
              Top Up <span className="text-gradient-cyan">Game Populer</span>
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Pilih game favoritmu dan top up diamond/koin otomatis 1 detik
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Dual View Toggle */}
          <div className="flex items-center p-1.5 rounded-2xl bg-[#0D121F] border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-brand-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                  : 'text-text-muted hover:text-white'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                viewMode === '3d'
                  ? 'bg-brand-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black'
                  : 'text-text-muted hover:text-white'
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>3D Showcase</span>
            </button>
          </div>

          <Link
            href="/topup"
            className="group hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-cyan hover:underline"
          >
            <span>Semua Game</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 3D Coverflow Showcase Mode */}
      {viewMode === '3d' ? (
        <div className="relative rounded-3xl bg-bg-card/40 border border-white/8 p-4 sm:p-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none" />
          
          <CoverflowCarousel
            slides={slides}
            cardWidth="clamp(250px, 28vw, 340px)"
            showNavigation={true}
            showPagination={true}
            showCaption={false}
            renderCustomCard={(slide, index, isSelected) => {
              const game = POPULAR_GAMES[index] || POPULAR_GAMES[0];
              return (
                <Link
                  href={game.href}
                  className="relative w-full h-full flex flex-col justify-between p-6 sm:p-7 overflow-hidden group/card"
                >
                  {/* Background Artwork */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={game.bgImage}
                    alt={game.name}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-bg-deep via-bg-deep/55 to-bg-deep/20" />

                  {/* Top Badge & Icon */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-black/75 text-brand-cyan border border-brand-cyan/40 backdrop-blur-md shadow-sm">
                      {game.badge}
                    </span>
                    <span className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-sm border border-white/15">
                      {game.icon}
                    </span>
                  </div>

                  {/* Bottom Game Details */}
                  <div className="relative z-10 space-y-2.5">
                    <p className="text-[11px] font-bold text-brand-cyan tracking-wider uppercase">
                      {game.publisher}
                    </p>
                    <h3 className="font-heading font-black text-base sm:text-lg text-white tracking-tight leading-snug drop-shadow-md">
                      {game.name}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                      <span className="font-mono font-black text-primary-container text-xs sm:text-sm">
                        {game.price}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                        {game.speed}
                      </span>
                    </div>

                    <div className="pt-1.5">
                      <div className="w-full py-2.5 rounded-xl bg-linear-to-r from-brand-cyan to-brand-purple text-black font-black text-xs text-center shadow-md group-hover/card:brightness-110 transition-all flex items-center justify-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-black" />
                        <span>Top Up Sekarang &rarr;</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }}
          />
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5 sm:gap-6">
          {POPULAR_GAMES.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="group relative rounded-2xl bg-[#0D121F] border border-white/8 hover:border-brand-cyan/50 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(0,240,255,0.15)] flex flex-col"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-[#141A29]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.bgImage}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0D121F] via-transparent to-transparent" />
                <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md bg-black/60 text-brand-cyan border border-brand-cyan/30 backdrop-blur-xs">
                  {game.badge}
                </span>
                <span className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-lg bg-[#06080D]/80 backdrop-blur-xs flex items-center justify-center text-sm border border-white/10">
                  {game.icon}
                </span>
              </div>

              <div className="p-4 sm:p-4.5 pb-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-heading font-black text-sm text-white group-hover:text-brand-cyan transition-colors truncate">
                    {game.name}
                  </h3>
                  <p className="text-xs text-text-dim mt-0.5 truncate">{game.publisher}</p>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-white/6 text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Kilat
                  </span>
                  <span className="text-brand-cyan font-semibold group-hover:translate-x-0.5 transition-transform">
                    Top Up &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </section>
  );
}
