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
      
      <main className="min-h-screen py-10 sm:py-14 pb-36 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto flex flex-col gap-10">
        
        {/* Search Hero Bento Box */}
        <div className="p-8 sm:p-14 rounded-3xl bg-[#0d121f] border border-white/8 shadow-xl text-center max-w-4xl mx-auto w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 px-4 py-1.5 rounded-full border border-brand-cyan/25">
              SISTEM PELACAKAN TRANSAKSI OTOMATIS
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight">
              Lacak & Cek <span className="text-gradient-cyan">Status Pesanan</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
              Ketikkan nomor Invoice (contoh: <code className="text-brand-cyan font-bold font-mono">INV-A8F9B2C</code>) untuk melihat status pengiriman pesananmu secara real-time.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3.5 max-w-2xl mx-auto pt-4">
              <input
                type="text"
                value={invoiceInput}
                onChange={(e) => setInvoiceInput(e.target.value)}
                placeholder="Masukkan Nomor Invoice (INV-XXXXXXXX)..."
                className="input-base text-xs sm:text-sm h-14 flex-1 font-mono font-bold"
              />
              <button
                type="submit"
                className="btn-cyber text-xs sm:text-sm h-14 px-8 flex items-center justify-center gap-2 shrink-0 shadow-lg"
              >
                <Search className="w-4 h-4" />
                <span>Cek Pesanan</span>
              </button>
            </form>
          </div>
        </div>

        {/* Search Result (if searched) */}
        {searched && searchResult && (
          <div className="max-w-4xl mx-auto w-full p-8 rounded-3xl bg-[#0d121f] border border-brand-cyan/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <div>
                <span className="text-xs text-text-muted">Hasil Pelacakan Invoice</span>
                <p className="font-mono font-black text-xl text-brand-cyan">{searchResult.id}</p>
              </div>
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {searchResult.badge}
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Produk yang Dibeli</span>
                <span className="font-bold text-white">{searchResult.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Waktu Transaksi</span>
                <span className="text-text-dim">{searchResult.time}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/8">
                <span className="text-text-muted">Total Pembayaran</span>
                <span className="font-mono font-black text-lg text-primary-container">{searchResult.price}</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Recent Transactions Bento */}
        <div className="max-w-4xl mx-auto w-full p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <h2 className="font-heading font-black text-lg text-white">Transaksi Terakhir Masuk</h2>
            </div>
            <span className="text-xs text-text-dim">Update live 24 jam</span>
          </div>

          <div className="divide-y divide-white/5">
            {MOCK_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-4 hover:bg-white/5 px-3 rounded-2xl transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-cyan">{tx.id}</span>
                    <span className="text-[10px] text-text-dim">&middot; {tx.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white">{tx.item}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="font-mono font-black text-xs sm:text-sm text-primary-container block">{tx.price}</span>
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
                    tx.status === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  )}>
                    {tx.badge}
                  </span>
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