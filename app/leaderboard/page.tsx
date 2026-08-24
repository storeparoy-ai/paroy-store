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
      
      <main className="min-h-screen py-10 sm:py-14 pb-36 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto flex flex-col gap-10">
        
        {/* Page Header Banner Bento */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-[#0d121f] border border-amber-500/25 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  HALL OF FAME SULTAN
                </span>
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
                Top Spender <span className="text-gradient-cyan">Leaderboard</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
                Apresiasi khusus bagi para kolektor & gamers setia dengan total transaksi tertinggi di Paroy Store. Dapatkan reward voucher & merchandise eksklusif setiap periode!
              </p>
            </div>

            {/* Period Switcher */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#141a29] border border-white/10 shrink-0 shadow-inner">
              {(['today', 'week', 'month'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
                    period === p
                      ? 'bg-linear-to-r from-brand-cyan to-primary-container text-black font-black shadow-md'
                      : 'text-text-muted hover:text-white'
                  )}
                >
                  {p === 'today' ? 'Hari Ini' : p === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Podium Bento Cards */}
        {data.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-end">
            
            {/* Rank 2 (Silver) */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-slate-300/25 shadow-lg flex flex-col justify-between order-2 md:order-1 relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">🥈</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-300/15 text-slate-200 border border-slate-300/30">
                  {data[1].badge}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-xl text-white">{data[1].name}</h3>
                <p className="text-xs text-text-muted">{data[1].games}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/8">
                <span className="text-xs text-text-dim block">Total Transaksi</span>
                <span className="font-mono font-black text-xl text-white">{data[1].amount}</span>
              </div>
            </div>

            {/* Rank 1 (Gold - Champion) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#0d121f] border-2 border-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col justify-between order-1 md:order-2 relative overflow-hidden group md:-translate-y-4">
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl">👑</span>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/40 shadow-sm">
                  {data[0].badge}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-2xl text-white">{data[0].name}</h3>
                <p className="text-xs text-amber-400/80 font-bold">{data[0].games}</p>
              </div>
              <div className="mt-8 pt-5 border-t border-amber-400/20">
                <span className="text-xs text-amber-400 block font-bold">Total Transaksi Sultan</span>
                <span className="font-mono font-black text-2xl sm:text-3xl text-amber-400">{data[0].amount}</span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-amber-700/25 shadow-lg flex flex-col justify-between order-3 relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">🥉</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-700/15 text-amber-300 border border-amber-700/30">
                  {data[2].badge}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-xl text-white">{data[2].name}</h3>
                <p className="text-xs text-text-muted">{data[2].games}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/8">
                <span className="text-xs text-text-dim block">Total Transaksi</span>
                <span className="font-mono font-black text-xl text-white">{data[2].amount}</span>
              </div>
            </div>

          </div>
        )}

        {/* Full Table */}
        <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-xl space-y-4">
          <h2 className="font-heading font-black text-xl text-white">Daftar Lengkap Peringkat</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#141a29] text-text-muted uppercase tracking-wider font-bold">
                  <th className="p-4 rounded-l-2xl">Rank</th>
                  <th className="p-4">Player Username</th>
                  <th className="p-4">Game Favorit</th>
                  <th className="p-4">Tier Badge</th>
                  <th className="p-4 rounded-r-2xl text-right">Total Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-white">
                {data.map((row) => (
                  <tr key={row.rank} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-black text-brand-cyan">#{row.rank}</td>
                    <td className="p-4 font-bold">{row.name}</td>
                    <td className="p-4 text-text-muted">{row.games}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#141a29] border border-white/10 text-slate-200">
                        {row.badge}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-black text-primary-container text-right">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}