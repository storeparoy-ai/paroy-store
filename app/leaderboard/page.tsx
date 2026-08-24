'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { Trophy, Crown, Flame, Award, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEADERBOARD_DATA = {
  today: [
    { rank: 1, name: 'an***ra', amount: 'Rp 42.500.000', badge: 'VIP SULTAN', games: 'MLBB, FF' },
    { rank: 2, name: 'fa***an', amount: 'Rp 31.200.000', badge: 'TOP SPENDER', games: 'Genshin, HSR' },
    { rank: 3, name: 'bo***ku', amount: 'Rp 28.900.000', badge: 'HIGH ROLLER', games: 'PUBG Mobile' },
    { rank: 4, name: 'ri***to', amount: 'Rp 15.750.000', badge: 'MEMBER PRO', games: 'Valorant' },
    { rank: 5, name: 'su***ti', amount: 'Rp 12.300.000', badge: 'MEMBER PRO', games: 'Mobile Legends' },
    { rank: 6, name: 'ha***di', amount: 'Rp 9.800.000', badge: 'MEMBER', games: 'Free Fire' },
    { rank: 7, name: 'yu***ra', amount: 'Rp 7.650.000', badge: 'MEMBER', games: 'eFootball' },
    { rank: 8, name: 'wi***ta', amount: 'Rp 5.200.000', badge: 'MEMBER', games: 'CODM' },
  ],
  week: [
    { rank: 1, name: 'pa***an', amount: 'Rp 215.000.000', badge: 'LEGEND SULTAN', games: 'All Games' },
    { rank: 2, name: 'ni***ta', amount: 'Rp 178.500.000', badge: 'VIP SULTAN', games: 'Genshin Impact' },
    { rank: 3, name: 'ra***an', amount: 'Rp 145.200.000', badge: 'VIP SULTAN', games: 'Mobile Legends' },
    { rank: 4, name: 'an***ra', amount: 'Rp 98.750.000', badge: 'TOP SPENDER', games: 'Free Fire' },
    { rank: 5, name: 'fa***an', amount: 'Rp 87.300.000', badge: 'TOP SPENDER', games: 'PUBG Mobile' },
    { rank: 6, name: 'bo***ku', amount: 'Rp 74.800.000', badge: 'HIGH ROLLER', games: 'Valorant' },
  ],
  month: [
    { rank: 1, name: 'ga***ra', amount: 'Rp 825.000.000', badge: 'MYTHIC KING', games: 'All Games' },
    { rank: 2, name: 'pa***an', amount: 'Rp 712.500.000', badge: 'LEGEND SULTAN', games: 'Mobile Legends' },
    { rank: 3, name: 'ni***ta', amount: 'Rp 654.200.000', badge: 'VIP SULTAN', games: 'Genshin Impact' },
    { rank: 4, name: 'ra***an', amount: 'Rp 498.750.000', badge: 'VIP SULTAN', games: 'Free Fire' },
  ],
};

type Period = 'today' | 'week' | 'month';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('today');
  const data = LEADERBOARD_DATA[period];

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        
        {/* Page Header Banner */}
        <div className="relative p-8 sm:p-10 rounded-3xl bg-bg-card border border-white/8 shadow-sm overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Hall of Fame
                </span>
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
                Top Spender <span className="text-gradient-cyan">Leaderboard</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl">
                Apresiasi khusus bagi para kolektor & gamers setia dengan total transaksi tertinggi di Paroy Store. Dapatkan reward cashback eksklusif setiap periode!
              </p>
            </div>

            {/* Period Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-bg-base border border-white/8 shrink-0">
              {(['today', 'week', 'month'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    period === p
                      ? 'bg-linear-to-r from-brand-cyan to-primary-container text-bg-deep font-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'text-text-muted hover:text-white'
                  )}
                >
                  {p === 'today' ? 'Hari Ini' : p === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Podium (Desktop Grid) */}
        {data.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Rank 2 (Silver) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-slate-300/20 shadow-sm flex flex-col justify-between order-2 md:order-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-300/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between mb-4">
                <span className="w-12 h-12 rounded-2xl bg-slate-300/15 border border-slate-300/30 text-slate-200 font-black text-lg flex items-center justify-center shadow-sm">
                  🥈 #2
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {data[1].badge}
                </span>
              </div>
              <div>
                <h3 className="font-heading font-black text-2xl text-white mb-1">{data[1].name}</h3>
                <p className="text-xs text-text-muted mb-4">{data[1].games}</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-text-dim uppercase font-bold">Total Belanja</span>
                  <span className="font-mono text-lg font-black text-slate-200">{data[1].amount}</span>
                </div>
              </div>
            </div>

            {/* Rank 1 (Gold - King) */}
            <div className="p-7 sm:p-9 rounded-3xl bg-bg-card border border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.15)] flex flex-col justify-between order-1 md:order-2 relative overflow-hidden group scale-105 z-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between mb-4">
                <span className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                  👑 #1
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-3.5 py-1 rounded-full border border-amber-400/30">
                  {data[0].badge}
                </span>
              </div>
              <div>
                <h3 className="font-heading font-black text-3xl text-white mb-1">{data[0].name}</h3>
                <p className="text-xs text-text-muted mb-4">{data[0].games}</p>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-amber-400 uppercase font-bold">Total Belanja</span>
                  <span className="font-mono text-xl font-black text-amber-300">{data[0].amount}</span>
                </div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-amber-700/30 shadow-sm flex flex-col justify-between order-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-700/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between mb-4">
                <span className="w-12 h-12 rounded-2xl bg-amber-700/20 border border-amber-700/40 text-amber-500 font-black text-lg flex items-center justify-center shadow-sm">
                  🥉 #3
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {data[2].badge}
                </span>
              </div>
              <div>
                <h3 className="font-heading font-black text-2xl text-white mb-1">{data[2].name}</h3>
                <p className="text-xs text-text-muted mb-4">{data[2].games}</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-text-dim uppercase font-bold">Total Belanja</span>
                  <span className="font-mono text-lg font-black text-amber-500">{data[2].amount}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Rest of Leaderboard Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/8 overflow-hidden">
          <h2 className="font-heading font-bold text-lg text-white mb-4">Peringkat 4 - 10</h2>
          
          <div className="space-y-2.5">
            {data.slice(3).map((item) => (
              <div
                key={item.rank}
                className="p-4 sm:p-5 rounded-2xl bg-bg-base border border-white/5 hover:border-brand-cyan/30 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm text-text-muted">
                    #{item.rank}
                  </span>
                  <div>
                    <p className="font-bold text-sm sm:text-base text-white">{item.name}</p>
                    <p className="text-xs text-text-dim">{item.games}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-black text-primary-container block">{item.amount}</span>
                  <span className="text-xs text-text-dim">{item.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}