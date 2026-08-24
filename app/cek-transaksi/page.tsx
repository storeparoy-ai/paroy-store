'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { Search, RefreshCw, CheckCircle, Clock } from 'lucide-react';

const MOCK_TRANSACTIONS = [
  { id: 'INV-A8F9B2C', time: '24 Aug 2026, 14:32', item: 'Mobile Legends: 1000 Diamonds', price: 'Rp 250.000', status: 'success' },
  { id: 'INV-D4E5F6G', time: '24 Aug 2026, 14:15', item: 'Genshin Impact: Welkin Moon', price: 'Rp 75.000', status: 'pending' },
  { id: 'INV-H7I8J9K', time: '24 Aug 2026, 13:45', item: 'Valorant: 2050 VP', price: 'Rp 200.000', status: 'success' },
  { id: 'INV-L1M2N3O', time: '24 Aug 2026, 13:20', item: 'Free Fire: 1000 Diamonds', price: 'Rp 145.000', status: 'success' },
  { id: 'INV-P4Q5R6S', time: '24 Aug 2026, 12:58', item: 'PUBG Mobile: 660 UC', price: 'Rp 180.000', status: 'pending' },
  { id: 'INV-T7U8V9W', time: '24 Aug 2026, 12:30', item: 'Mobile Legends: 500 Diamonds', price: 'Rp 145.000', status: 'success' },
];

export default function CekTransaksiPage() {
  const [invoiceInput, setInvoiceInput] = useState('');

  return (
    <>
      <Header />
      <main
        className="min-h-screen flex-grow px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full pb-stack-lg flex flex-col gap-stack-lg"
        style={{ paddingTop: '96px' }}
      >
        <section className="w-full max-w-2xl mx-auto mt-stack-md">
          <div className="card-level-1 rounded-xl p-stack-md shadow-lg text-center">
            <h1 className="text-headline-md md:text-headline-lg font-headline-lg text-on-surface mb-stack-sm">
              Cek Transaksi
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mb-gutter">
              Lacak status pesanan Anda dengan memasukkan Nomor Invoice di bawah ini.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 w-full" onSubmit={e => e.preventDefault()}>
              <input
                type="text"
                value={invoiceInput}
                onChange={e => setInvoiceInput(e.target.value)}
                placeholder="INV-XXXXXXXXX"
                className="flex-grow bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface font-mono focus:border-[#00c896] focus:outline-none focus:ring-1 focus:ring-[#00c896] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#00c896] text-black font-bold text-label-md px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#3adfab] transition-colors whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Cari Invoice
              </button>
            </form>
          </div>
        </section>

        <section className="w-full">
          <div className="flex items-center justify-between mb-stack-sm">
            <h2 className="text-headline-md font-headline-md text-on-surface">Riwayat Transaksi Terbaru</h2>
            <button className="text-[#00c896] text-label-md hover:underline flex items-center gap-1">
              <RefreshCw className="w-4 h-4" /> Segarkan
            </button>
          </div>
          <div className="card-level-1 rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high text-on-surface-variant text-label-md font-label-md border-b border-white/10">
                    <th className="p-4 py-3 font-semibold uppercase tracking-wider">Waktu</th>
                    <th className="p-4 py-3 font-semibold uppercase tracking-wider">Invoice</th>
                    <th className="p-4 py-3 font-semibold uppercase tracking-wider">Item</th>
                    <th className="p-4 py-3 font-semibold uppercase tracking-wider text-right">Harga</th>
                    <th className="p-4 py-3 font-semibold uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-body-md font-body-md text-on-surface divide-y divide-white/5">
                  {MOCK_TRANSACTIONS.map((tx, i) => (
                    <tr
                      key={tx.id}
                      className={`hover:bg-surface-container-highest/50 transition-colors ${i % 2 === 1 ? 'bg-surface/30' : ''}`}
                    >
                      <td className="p-4 text-on-surface-variant whitespace-nowrap">{tx.time}</td>
                      <td className="p-4 font-mono text-[#3adfab]">{tx.id}</td>
                      <td className="p-4 font-semibold">{tx.item}</td>
                      <td className="p-4 text-right">{tx.price}</td>
                      <td className="p-4 text-center">
                        {tx.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#00c896]/10 text-[#00c896] border border-[#00c896]/20">
                            <CheckCircle className="w-3 h-3" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}