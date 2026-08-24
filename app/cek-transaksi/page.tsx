'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { Search, RefreshCw, CheckCircle, Clock, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_TRANSACTIONS = [
  { id: 'INV-A8F9B2C', time: '24 Agu 2026, 14:32', item: 'Mobile Legends: 1000 Diamonds', price: 'Rp 250.000', status: 'success', badge: 'BERHASIL' },
  { id: 'INV-D4E5F6G', time: '24 Agu 2026, 14:15', item: 'Genshin Impact: Welkin Moon', price: 'Rp 75.000', status: 'pending', badge: 'MENUNGGU' },
  { id: 'INV-H7I8J9K', time: '24 Agu 2026, 13:45', item: 'Valorant: 2050 VP', price: 'Rp 200.000', status: 'success', badge: 'BERHASIL' },
  { id: 'INV-L1M2N3O', time: '24 Agu 2026, 13:20', item: 'Free Fire: 1000 Diamonds', price: 'Rp 145.000', status: 'success', badge: 'BERHASIL' },
  { id: 'INV-P4Q5R6S', time: '24 Agu 2026, 12:58', item: 'PUBG Mobile: 660 UC', price: 'Rp 180.000', status: 'pending', badge: 'PROSES' },
  { id: 'INV-T7U8V9W', time: '24 Agu 2026, 12:30', item: 'Mobile Legends: 500 Diamonds', price: 'Rp 145.000', status: 'success', badge: 'BERHASIL' },
];

export default function CekTransaksiPage() {
  const [invoiceInput, setInvoiceInput] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceInput.trim()) return;
    setSearched(true);
    const found = MOCK_TRANSACTIONS.find(t => t.id.toLowerCase() === invoiceInput.trim().toLowerCase());
    setSearchResult(found || {
      id: invoiceInput.toUpperCase(),
      time: 'Baru saja',
      item: 'Mobile Legends 706 Diamonds',
      price: 'Rp 148.000',
      status: 'success',
      badge: 'TERVERIFIKASI'
    });
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        
        {/* Search Hero Box */}
        <div className="p-8 sm:p-14 rounded-3xl bg-bg-card border border-white/8 shadow-md text-center max-w-4xl mx-auto mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20">
              SISTEM PELACAKAN OTOMATIS
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white mt-3 tracking-tight">
              Lacak & Cek <span className="text-gradient-cyan">Status Pesanan</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-text-muted mt-2 mb-8 max-w-xl mx-auto leading-relaxed">
              Ketikkan nomor Invoice (contoh: <code className="text-brand-cyan font-bold">INV-A8F9B2C</code>) atau Order ID transaksi untuk melihat status pengiriman pesananmu secara real-time.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={invoiceInput}
                onChange={(e) => setInvoiceInput(e.target.value)}
                placeholder="Masukkan Nomor Invoice (INV-XXXXXXXX)..."
                className="input-base text-xs sm:text-sm h-13 flex-1 font-mono"
              />
              <button
                type="submit"
                className="btn-cyber text-xs sm:text-sm h-13 px-8 flex items-center justify-center gap-2 shrink-0 shadow-[0_0_16px_rgba(0,240,255,0.3)]"
              >
                <Search className="w-4 h-4" />
                <span className="font-bold">Cek Pesanan</span>
              </button>
            </form>
          </div>
        </div>

        {/* Search Result (if searched) */}
        {searched && searchResult && (
          <div className="max-w-4xl mx-auto p-7 sm:p-8 rounded-3xl bg-bg-card border border-brand-cyan/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] mb-12 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-5">
              <div>
                <span className="text-xs text-text-muted">Hasil Pencarian Invoice</span>
                <p className="font-mono font-black text-lg text-brand-cyan">{searchResult.id}</p>
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {searchResult.badge}
              </span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Produk yang Dibeli</span>
                <span className="font-bold text-white">{searchResult.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Waktu Transaksi</span>
                <span className="text-white">{searchResult.time}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-text-muted font-bold">Total Pembayaran</span>
                <span className="font-black text-primary-container text-base sm:text-lg">{searchResult.price}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Live Transactions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
            <div>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-white">Aktivitas Transaksi Terbaru</h2>
              <p className="text-xs text-text-muted">Data pesanan real-time yang sedang dan telah berhasil diproses sistem</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Realtime 24/7</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:p-5 rounded-2xl bg-bg-base border border-white/5 flex items-center justify-between gap-4 hover:border-white/15 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-brand-cyan">{tx.id}</span>
                    <span className={cn(
                      'px-2 py-0.2 rounded text-[9px] font-black uppercase',
                      tx.status === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    )}>
                      {tx.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white truncate">{tx.item}</p>
                  <p className="text-[11px] text-text-dim mt-0.5">{tx.time}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs sm:text-sm font-black text-primary-container">{tx.price}</span>
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