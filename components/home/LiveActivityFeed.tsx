'use client';

import { useState, useEffect } from 'react';

const RECENT_TRANSACTIONS = [
  { id: 1, text: 'Top Up 706 💎 MLBB berhasil dikirim ke ID 84920***', user: 'fa***an', time: '1 menit lalu', amount: 'Rp 148.000' },
  { id: 2, text: 'Akun MLBB Mythic Glory sukses dibeli via Rekber', user: 'ri***to', time: '2 menit lalu', amount: 'Rp 450.000' },
  { id: 3, text: 'Top Up 1450 💎 Free Fire berhasil masuk', user: 'al***99', time: '4 menit lalu', amount: 'Rp 289.000' },
  { id: 4, text: 'Sewa Akun Genshin AR55 aktif selama 3 hari', user: 'de***wi', time: '6 menit lalu', amount: 'Rp 240.000' },
  { id: 5, text: 'Top Up 660 UC PUBG Mobile otomatis selesai', user: 'wi***ta', time: '8 menit lalu', amount: 'Rp 148.000' },
];

export default function LiveActivityFeed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % RECENT_TRANSACTIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const tx = RECENT_TRANSACTIONS[index];

  return (
    <div className="rounded-2xl bg-bg-card/90 border border-white/8 p-3 sm:px-5 sm:py-2.5 flex items-center justify-between gap-4 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Transaksi</span>
        </div>
        <div className="text-xs text-white truncate transition-all duration-300">
          <span className="font-semibold text-brand-cyan">{tx.user}</span> &middot; {tx.text}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs font-bold text-primary-container">{tx.amount}</span>
        <span className="text-[10px] text-text-dim">{tx.time}</span>
      </div>
    </div>
  );
}
