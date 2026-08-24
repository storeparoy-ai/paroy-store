'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

const LEADERBOARD_DATA = {
  today: [
    { rank: 1, name: 'an***ra', amount: 'Rp 42.500.000', medal: 'gold' },
    { rank: 2, name: 'fa***an', amount: 'Rp 31.200.000', medal: 'silver' },
    { rank: 3, name: 'bo***ku', amount: 'Rp 28.900.000', medal: 'bronze' },
    { rank: 4, name: 'ri***to', amount: 'Rp 15.750.000', medal: null },
    { rank: 5, name: 'su***ti', amount: 'Rp 12.300.000', medal: null },
    { rank: 6, name: 'ha***di', amount: 'Rp 9.800.000', medal: null },
    { rank: 7, name: 'yu***ra', amount: 'Rp 7.650.000', medal: null },
    { rank: 8, name: 'wi***ta', amount: 'Rp 5.200.000', medal: null },
    { rank: 9, name: 'de***wi', amount: 'Rp 4.100.000', medal: null },
    { rank: 10, name: 'ag***ng', amount: 'Rp 2.750.000', medal: null },
  ],
  week: [
    { rank: 1, name: 'pa***an', amount: 'Rp 215.000.000', medal: 'gold' },
    { rank: 2, name: 'ni***ta', amount: 'Rp 178.500.000', medal: 'silver' },
    { rank: 3, name: 'ra***an', amount: 'Rp 145.200.000', medal: 'bronze' },
    { rank: 4, name: 'an***ra', amount: 'Rp 98.750.000', medal: null },
    { rank: 5, name: 'fa***an', amount: 'Rp 87.300.000', medal: null },
    { rank: 6, name: 'bo***ku', amount: 'Rp 74.800.000', medal: null },
    { rank: 7, name: 'ri***to', amount: 'Rp 52.650.000', medal: null },
    { rank: 8, name: 'su***ti', amount: 'Rp 41.200.000', medal: null },
    { rank: 9, name: 'ha***di', amount: 'Rp 35.100.000', medal: null },
    { rank: 10, name: 'yu***ra', amount: 'Rp 28.750.000', medal: null },
  ],
  month: [
    { rank: 1, name: 'ga***ra', amount: 'Rp 825.000.000', medal: 'gold' },
    { rank: 2, name: 'pa***an', amount: 'Rp 712.500.000', medal: 'silver' },
    { rank: 3, name: 'ni***ta', amount: 'Rp 654.200.000', medal: 'bronze' },
    { rank: 4, name: 'ra***an', amount: 'Rp 498.750.000', medal: null },
    { rank: 5, name: 'an***ra', amount: 'Rp 387.300.000', medal: null },
    { rank: 6, name: 'fa***an', amount: 'Rp 298.800.000', medal: null },
    { rank: 7, name: 'bo***ku', amount: 'Rp 245.650.000', medal: null },
    { rank: 8, name: 'ri***to', amount: 'Rp 198.200.000', medal: null },
    { rank: 9, name: 'su***ti', amount: 'Rp 156.100.000', medal: null },
    { rank: 10, name: 'ha***di', amount: 'Rp 124.750.000', medal: null },
  ],
};

type Period = 'today' | 'week' | 'month';

const medalColors: Record<string, string> = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

const medalGlows: Record<string, string> = {
  gold: 'from-[#FFD700]/10',
  silver: 'from-[#C0C0C0]/5',
  bronze: 'from-[#CD7F32]/5',
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('today');
  const data = LEADERBOARD_DATA[period];

  return (
    <>
      <Header />
      <main
        className="min-h-screen flex-grow px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full pb-stack-lg flex flex-col gap-stack-lg"
        style={{ paddingTop: '128px' }}
      >
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-stack-md">
          <div>
            <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Top 10 Buyers</h1>
            <p className="text-body-md font-body-md text-on-surface-variant">The elite ranks of PAROY STORE digital collectors.</p>
          </div>
          {/* Period Tabs */}
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-white/5">
            {(['today', 'week', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`font-label-md text-label-md px-4 py-2 rounded transition-colors ${period === p ? 'bg-[#00c896] text-black shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
              >
                {p === 'today' ? 'Hari Ini' : p === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex flex-col gap-3">
          {data.map(entry => {
            const isTop3 = entry.medal !== null;
            const medalColor = entry.medal ? medalColors[entry.medal] : null;
            const glowClass = entry.medal ? medalGlows[entry.medal] : '';

            return (
              <div
                key={entry.rank}
                className={`relative overflow-hidden rounded-xl p-4 flex items-center justify-between transition-all duration-300 border ${isTop3 ? 'bg-surface-container border-[#00c896]/20' : 'bg-surface-container-high border-white/10 hover:border-[#00c896]/40'}`}
                style={isTop3 ? { boxShadow: `0 0 15px rgba(0,200,150,0.1)` } : {}}
              >
                {/* Background gradient for top 3 */}
                {isTop3 && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${glowClass} to-transparent opacity-50 pointer-events-none`} />
                )}

                {/* Left: Rank + Name */}
                <div className="flex items-center gap-gutter relative z-10 w-1/2">
                  {isTop3 && medalColor ? (
                    <div
                      className={`w-12 h-12 flex items-center justify-center bg-surface rounded-full border`}
                      style={{ borderColor: `${medalColor}40`, boxShadow: `0 0 10px ${medalColor}33` }}
                    >
                      <span style={{ color: medalColor, fontSize: '28px' }}>★</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant font-headline-md text-headline-md">
                      {entry.rank}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-label-md font-label-md text-on-surface-variant">Rank {entry.rank}</span>
                    <span className={`font-bold text-on-surface ${isTop3 ? 'text-headline-md font-headline-md' : 'text-body-lg font-body-lg'}`}>
                      {entry.name}
                    </span>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right relative z-10">
                  <span className="text-body-md font-body-md text-on-surface-variant block">Total Spent</span>
                  <span className={`text-[#00c896] font-bold ${isTop3 ? 'text-headline-lg font-headline-lg' : 'text-headline-md font-headline-md'}`}>
                    {entry.amount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}