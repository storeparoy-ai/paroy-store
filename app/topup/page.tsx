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
      
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
              Top Up <span className="text-gradient-cyan">Game Otomatis 1 Detik</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Proses instan 1 detik langsung masuk ke akun game 24 jam nonstop dengan garansi anti minus
          </p>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Steps 1, 2, 3 (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Step 1: Pilih Game */}
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-full bg-brand-cyan/20 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/40">
                  1
                </span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-white">Pilih Game Favorit</h2>
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
                        'flex flex-col items-center justify-center p-4 rounded-2xl text-xs font-bold transition-all border cursor-pointer group',
                        isActive
                          ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan shadow-[0_0_16px_rgba(0,240,255,0.25)] scale-102'
                          : 'bg-bg-base text-text-muted border-white/5 hover:text-white hover:border-white/15'
                      )}
                    >
                      <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">{game.icon}</span>
                      <span className="text-center truncate w-full text-xs">{game.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Masukkan User ID */}
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-full bg-brand-cyan/20 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/40">
                  2
                </span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-white">
                  Masukkan User ID & Zone/Server ID
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-text-muted font-semibold mb-1.5">User ID Game</label>
                  <input
                    type="text"
                    value={gameUserId}
                    onChange={(e) => { setGameUserId(e.target.value); setCheckedName(''); }}
                    placeholder={`Masukkan User ID ${selectedGame.name}...`}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-semibold mb-1.5">Zone / Server ID</label>
                  <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="Contoh: (2041)"
                    className="input-base"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-text-dim">
                  *Untuk melihat User ID, silakan tap avatar profil di dalam game kamu.
                </p>
                <button
                  onClick={handleCheckId}
                  disabled={!gameUserId.trim() || isChecking}
                  className="btn-secondary text-xs py-2 px-5 shrink-0 disabled:opacity-40"
                >
                  {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verifikasi ID'}
                </button>
              </div>

              {checkedName && (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Username: {checkedName}</span>
                </div>
              )}
            </div>

            {/* Step 3: Pilih Nominal Top Up */}
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 rounded-full bg-brand-cyan/20 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/40">
                  3
                </span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-white">
                  Pilih Nominal Diamond / Voucher
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {topupData?.items.map((item) => {
                  const isActive = selectedDenom === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDenom(item.id)}
                      className={cn(
                        'p-4 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-2.5',
                        isActive
                          ? 'bg-brand-cyan/15 border-brand-cyan text-white shadow-[0_0_16px_rgba(0,240,255,0.2)]'
                          : 'bg-bg-base border-white/5 text-text-muted hover:border-white/20 hover:text-white'
                      )}
                    >
                      <span className="text-xs sm:text-sm font-bold text-white leading-snug">{item.label}</span>
                      <span className={cn('text-xs sm:text-sm font-black', isActive ? 'text-brand-cyan' : 'text-primary-container')}>
                        {formatCurrency(item.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Step 4 & Summary Sticky (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Step 4: Metode Pembayaran */}
            <div className="p-6 sm:p-7 rounded-3xl bg-bg-card border border-white/8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-full bg-brand-cyan/20 text-brand-cyan font-black text-xs flex items-center justify-center border border-brand-cyan/40">
                  4
                </span>
                <h2 className="font-heading font-bold text-base text-white">Metode Pembayaran</h2>
              </div>

              <div className="space-y-2">
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
                        'w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer',
                        isActive
                          ? 'bg-brand-cyan/10 border-brand-cyan text-white'
                          : 'bg-bg-base border-white/5 text-text-muted hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{pm.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{pm.label}</p>
                          <p className="text-[10px] text-text-dim">{pm.fee}</p>
                        </div>
                      </div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-brand-cyan" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Summary & Buy Button */}
            <div className="p-6 sm:p-7 rounded-3xl bg-bg-card border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <h3 className="font-heading font-bold text-sm text-white mb-4 pb-3 border-b border-white/8">
                Ringkasan Transaksi
              </h3>

              <div className="space-y-2.5 text-xs text-text-muted mb-6">
                <div className="flex justify-between">
                  <span>Game</span>
                  <span className="font-bold text-white">{selectedGame.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>User ID</span>
                  <span className="font-mono text-white">{gameUserId || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Item</span>
                  <span className="font-bold text-white">{selectedItem?.label || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode Bayar</span>
                  <span className="font-semibold text-brand-cyan uppercase">{selectedPayment}</span>
                </div>
                <div className="pt-3 border-t border-white/8 flex justify-between items-center text-sm font-black text-white">
                  <span>Total Bayar</span>
                  <span className="text-xl text-primary-container">{formatCurrency(selectedItem?.price || 0)}</span>
                </div>
              </div>

              <Link
                href={`/checkout?type=topup&game=${selectedGame.slug}&userId=${gameUserId || 'dummy'}&item=${selectedItem?.id || 't1'}`}
                className="btn-cyber w-full py-4 text-sm font-black flex items-center justify-center gap-2 text-center"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Beli & Bayar Sekarang</span>
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Garansi Resmi & Pengiriman Otomatis 1 Detik</span>
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
