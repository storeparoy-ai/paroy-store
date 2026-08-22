'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { GAMES, TOPUP_ITEMS } from '@/lib/mock-data';
import { cn, formatCurrency } from '@/lib/utils';
import { Game } from '@/types';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function TopUpPage() {
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
  const [gameUserId, setGameUserId] = useState('');
  const [checkedName, setCheckedName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [selectedDenom, setSelectedDenom] = useState<string>('');

  const topupData = TOPUP_ITEMS.find((t) => t.game.slug === selectedGame.slug);

  const handleCheckId = async () => {
    if (!gameUserId.trim()) return;
    setIsChecking(true);
    // Simulasi check ID
    await new Promise((r) => setTimeout(r, 1200));
    setCheckedName('Paroy Gaming ✓');
    setIsChecking(false);
  };

  const selectedItem = topupData?.items.find((i) => i.id === selectedDenom);

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-[5.75rem] min-h-screen">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">

          {/* Header */}
          <div className="mb-4">
            <h1 className="font-bold font-heading text-xl" style={{ color: 'var(--text-primary)' }}>
              💎 Top Up Game
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Harga terbaik & proses instan
            </p>
          </div>

          {/* Step 1 – Pilih Game */}
          <div className="glass-card p-4 mb-3">
            <p className="section-label text-sm mb-3">
              <span>1</span>
              <span>Pilih Game</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {GAMES.filter((g) => TOPUP_ITEMS.some((t) => t.game.slug === g.slug)).map((game) => {
                const isActive = selectedGame.slug === game.slug;
                return (
                  <button
                    key={game.slug}
                    onClick={() => { setSelectedGame(game); setSelectedDenom(''); setCheckedName(''); }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all border',
                      'hover:scale-[1.02] active:scale-95'
                    )}
                    style={{
                      background: isActive ? `${game.color}22` : 'var(--surface-raised)',
                      borderColor: isActive ? `${game.color}66` : 'var(--border-default)',
                      color: isActive ? game.color : 'var(--text-muted)',
                    }}
                  >
                    <span className="text-2xl">{game.icon}</span>
                    <span className="text-center leading-tight">{game.name}</span>
                    {isActive && (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: game.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 – Masukkan ID Game */}
          <div className="glass-card p-4 mb-3">
            <p className="section-label text-sm mb-3">
              <span>2</span>
              <span>Masukkan ID {selectedGame.name}</span>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={gameUserId}
                onChange={(e) => { setGameUserId(e.target.value); setCheckedName(''); }}
                placeholder={`ID ${selectedGame.name} kamu...`}
                className="input-base flex-1"
                aria-label="ID Game"
              />
              <button
                onClick={handleCheckId}
                disabled={!gameUserId.trim() || isChecking}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                style={{
                  background: 'linear-gradient(135deg, var(--primary-400), var(--primary-500))',
                  color: 'white',
                }}
              >
                {isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Cek ID'
                )}
              </button>
            </div>
            {checkedName && (
              <div
                className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs animate-slide-up"
                style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Nama akun: <strong>{checkedName}</strong></span>
              </div>
            )}
          </div>

          {/* Step 3 – Pilih Nominal */}
          {topupData && (
            <div className="glass-card p-4 mb-3">
              <p className="section-label text-sm mb-3">
                <span>3</span>
                <span>Pilih Nominal</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {topupData.items.map((item) => {
                  const isActive = selectedDenom === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDenom(item.id)}
                      className={cn(
                        'flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all border',
                        'hover:scale-[1.01] active:scale-95'
                      )}
                      style={{
                        background: isActive ? 'rgba(232,120,159,0.12)' : 'var(--surface-raised)',
                        borderColor: isActive ? 'rgba(232,120,159,0.5)' : 'var(--border-default)',
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: isActive ? 'var(--primary-400)' : 'var(--text-primary)' }}>
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)' }}>
                        {formatCurrency(item.price)}
                      </span>
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 self-end" style={{ color: 'var(--primary-400)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary + CTA */}
          {selectedItem && checkedName && (
            <div className="glass-card p-4 animate-slide-up">
              <p className="section-label text-sm mb-3">
                <span>4</span>
                <span>Ringkasan</span>
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Game', value: `${selectedGame.icon} ${selectedGame.name}` },
                  { label: 'ID Akun', value: gameUserId },
                  { label: 'Nama', value: checkedName },
                  { label: 'Item', value: selectedItem.label },
                  { label: 'Total', value: formatCurrency(selectedItem.price), highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span
                      className={cn('text-sm font-semibold', highlight && 'text-base font-black')}
                      style={{ color: highlight ? 'var(--primary-400)' : 'var(--text-primary)' }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={`/checkout?type=topup&game=${selectedGame.slug}&userId=${gameUserId}&item=${selectedItem.id}`}
                className="btn-primary w-full"
              >
                Lanjut ke Pembayaran
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!checkedName && !selectedDenom && (
            <div
              className="text-center py-6 text-sm rounded-xl"
              style={{ color: 'var(--text-muted)', background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
            >
              Isi ID game dan pilih nominal untuk melanjutkan
            </div>
          )}
        </div>
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
