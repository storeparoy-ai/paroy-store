'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, CheckCircle2, Loader2, Zap, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { GAMES, TOPUP_ITEMS, PAYMENT_METHODS } from '@/lib/mock-data';
import { cn, formatCurrency } from '@/lib/utils';
import { Game } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

export default function TopUpPage() {
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
  const [gameUserId, setGameUserId] = useState('');
  const [serverId, setServerId] = useState('');
  const [checkedName, setCheckedName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [selectedDenom, setSelectedDenom] = useState<string>('t3');
  const [selectedPayment, setSelectedPayment] = useState<string>('qris');

  const topupData = TOPUP_ITEMS.find((t) => t.game.slug === selectedGame.slug) || TOPUP_ITEMS[0];

  const handleCheckId = async () => {
    if (!gameUserId.trim()) return;
    setIsChecking(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCheckedName(`Player_${gameUserId.slice(-4)} (ID Valid ✓)`);
    setIsChecking(false);
  };

  const selectedItem = topupData?.items.find((i) => i.id === selectedDenom) || topupData?.items[0];

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-8 sm:py-12 pb-32 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto flex flex-col gap-10">
        
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
              Top Up <span className="text-gradient-cyan">Game Otomatis 1 Detik</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
            Proses instan 1 detik langsung masuk ke akun game 24 jam nonstop dengan garansi anti minus dan proteksi legal 100%.
          </p>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          
          {/* LEFT COLUMN: Steps 1, 2, 3 (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Step 1: Pilih Game */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-brand-cyan/15 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/30">
                  1
                </span>
                <h2 className="font-heading font-black text-lg text-white">Pilih Game Favorit</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                {GAMES.map((game) => {
                  const isActive = selectedGame.slug === game.slug;
                  return (
                    <button
                      key={game.slug}
                      onClick={() => {
                        setSelectedGame(game);
                        setCheckedName('');
                      }}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 py-5 rounded-2xl text-xs font-bold transition-all border cursor-pointer group',
                        isActive
                          ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.25)] scale-102'
                          : 'bg-[#141a29] text-text-muted border-white/8 hover:text-white hover:border-white/20'
                      )}
                    >
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</span>
                      <span className="text-center truncate w-full text-xs font-bold">{game.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Masukkan User ID */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-brand-cyan/15 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/30">
                  2
                </span>
                <h2 className="font-heading font-black text-lg text-white">
                  Masukkan User ID & Zone/Server ID
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-text-main font-bold mb-2">User ID Game <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={gameUserId}
                    onChange={(e) => { setGameUserId(e.target.value); setCheckedName(''); }}
                    placeholder={`Masukkan User ID ${selectedGame.name}...`}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-main font-bold mb-2">Zone / Server ID</label>
                  <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="Contoh: (2041)"
                    className="input-base"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <p className="text-xs text-text-dim">
                  *Untuk melihat User ID, silakan tap avatar profil di dalam game kamu.
                </p>
                <button
                  onClick={handleCheckId}
                  disabled={!gameUserId.trim() || isChecking}
                  className="btn-secondary text-xs py-2.5 px-5 shrink-0 disabled:opacity-40"
                >
                  {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verifikasi ID'}
                </button>
              </div>

              {checkedName && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Username: {checkedName}</span>
                </div>
              )}
            </div>

            {/* Step 3: Pilih Nominal Top Up */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-brand-cyan/15 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/30">
                  3
                </span>
                <h2 className="font-heading font-black text-lg text-white">
                  Pilih Nominal Diamond / Voucher
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {topupData?.items.map((item) => {
                  const isActive = selectedDenom === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDenom(item.id)}
                      className={cn(
                        'p-4 sm:p-5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-3',
                        isActive
                          ? 'bg-brand-cyan/15 border-brand-cyan text-white shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                          : 'bg-[#141a29] border-white/8 text-text-muted hover:border-white/20 hover:text-white'
                      )}
                    >
                      <span className="text-xs sm:text-sm font-bold text-white leading-snug">{item.label}</span>
                      <span className={cn('text-xs sm:text-sm font-black font-mono', isActive ? 'text-brand-cyan' : 'text-primary-container')}>
                        {formatCurrency(item.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Step 4 & Summary Sticky (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8 sticky top-28">
            
            {/* Step 4: Metode Pembayaran */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-brand-cyan/15 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/30">
                  4
                </span>
                <h2 className="font-heading font-black text-lg text-white">Metode Pembayaran</h2>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'qris', label: 'QRIS All Payment', fee: 'Bebas Biaya Admin', icon: '📱' },
                  { id: 'bca', label: 'BCA Virtual Account', fee: 'Proses Otomatis', icon: '🏦' },
                  { id: 'mandiri', label: 'Mandiri / BRI / BNI', fee: 'Proses Otomatis', icon: '💳' },
                  { id: 'ewallet', label: 'GoPay / DANA / OVO', fee: 'Instan 1 Detik', icon: '⚡' },
                ].map((pm) => {
                  const isActive = selectedPayment === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      className={cn(
                        'w-full p-4 px-4.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer',
                        isActive
                          ? 'bg-brand-cyan/12 border-brand-cyan text-white shadow-xs'
                          : 'bg-[#141a29] border-white/8 text-text-muted hover:text-white hover:border-white/18'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pm.icon}</span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">{pm.label}</p>
                          <p className="text-[11px] text-text-dim mt-0.5">{pm.fee}</p>
                        </div>
                      </div>
                      {isActive && <CheckCircle2 className="w-5 h-5 text-brand-cyan shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Summary & Buy Button */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-xl space-y-6">
              <h3 className="font-heading font-black text-base text-white pb-3 border-b border-white/8">
                Ringkasan Transaksi
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-text-muted">
                <div className="flex justify-between">
                  <span>Game</span>
                  <span className="font-bold text-white">{selectedGame.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>User ID</span>
                  <span className="font-mono font-bold text-white">{gameUserId || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Item</span>
                  <span className="font-bold text-white">{selectedItem?.label || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode Bayar</span>
                  <span className="font-bold text-brand-cyan uppercase">{selectedPayment}</span>
                </div>
                <div className="pt-4 border-t border-white/8 flex justify-between items-center text-sm font-black text-white">
                  <span>Total Bayar</span>
                  <span className="text-xl sm:text-2xl text-primary-container font-mono">{formatCurrency(selectedItem?.price || 0)}</span>
                </div>
              </div>

              <Link
                href={`/checkout?type=topup&game=${selectedGame.slug}&userId=${gameUserId || 'dummy'}&item=${selectedItem?.id || 't1'}`}
                className="btn-cyber w-full py-3.5 text-sm font-black flex items-center justify-center gap-2 text-center shadow-lg"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Beli & Bayar Sekarang</span>
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Garansi Resmi & Otomatis 1 Detik</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
