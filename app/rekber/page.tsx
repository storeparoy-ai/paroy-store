'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield, ChevronRight, CheckCircle2, AlertTriangle, FileText, MessageCircle,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { cn, formatCurrency } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

const HOW_IT_WORKS = [
  { step: '1', title: 'Pilih Produk', desc: 'Temukan produk yang ingin kamu beli melalui PAROY STORE.' },
  { step: '2', title: 'Hubungi Admin', desc: 'Chat admin via WhatsApp untuk memulai proses RekBer.' },
  { step: '3', title: 'Transfer ke Admin', desc: 'Buyer transfer dana ke rekening admin sebagai pihak ketiga.' },
  { step: '4', title: 'Serah Terima', desc: 'Seller kirim akun/item ke buyer. Admin memverifikasi.' },
  { step: '5', title: 'Dana Diteruskan', desc: 'Setelah buyer konfirmasi, admin teruskan dana ke seller.' },
];

const REKBER_FEE = [
  { range: 'Rp 1 – Rp 100.000', fee: 'Rp 5.000' },
  { range: 'Rp 100.001 – Rp 500.000', fee: 'Rp 10.000' },
  { range: 'Rp 500.001 – Rp 1.000.000', fee: 'Rp 15.000' },
  { range: '> Rp 1.000.000', fee: '1,5% dari nilai transaksi' },
];

export default function RekberPage() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const product = MOCK_PRODUCTS.find((p) => p.id === selectedProduct);

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-[5.75rem] min-h-screen">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">

          {/* Hero */}
          <div className="glass-heavy relative overflow-hidden rounded-2xl p-6 mb-5 text-center">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%)' }}
            />
            <Shield className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--success)' }} />
            <h1 className="font-black font-heading text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
              🤝 Rekening Bersama
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Transaksi aman dengan pihak ketiga terpercaya PAROY STORE
            </p>
          </div>

          {/* Why use rekber */}
          <div className="glass-card p-4 mb-3">
            <h2 className="section-label text-sm mb-3">Kenapa Pakai RekBer?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: '🔒', title: 'Transaksi Aman', desc: 'Dana dijaga admin sampai serah terima selesai' },
                { icon: '✅', title: 'Terverifikasi', desc: 'Produk dicek sebelum dana diteruskan' },
                { icon: '⚡', title: 'Proses Cepat', desc: 'Selesai dalam 1×24 jam kerja' },
                { icon: '📞', title: 'Support 24/7', desc: 'Admin siap membantu kapanpun' },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}
                >
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="glass-card p-4 mb-3">
            <h2 className="section-label text-sm mb-3">Cara Kerja RekBer</h2>
            <div className="space-y-3">
              {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--primary-400), var(--accent-purple))' }}
                    >
                      {step}
                    </div>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="w-0.5 flex-1 mt-1.5" style={{ background: 'var(--border-default)', minHeight: '16px' }} />
                    )}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee table */}
          <div className="glass-card p-4 mb-3">
            <h2 className="section-label text-sm mb-3">Biaya RekBer</h2>
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--surface-raised)' }}>
                    <th className="p-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Nilai Transaksi</th>
                    <th className="p-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>Biaya Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {REKBER_FEE.map(({ range, fee }, i) => (
                    <tr
                      key={range}
                      style={{
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{range}</td>
                      <td className="p-3 text-right font-bold" style={{ color: 'var(--primary-400)' }}>{fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Request form */}
          <div className="glass-card p-4 mb-3">
            <h2 className="section-label text-sm mb-3">Ajukan RekBer</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Produk yang ingin dibeli
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="input-base"
                  aria-label="Pilih produk"
                >
                  <option value="">-- Pilih produk --</option>
                  {MOCK_PRODUCTS.filter((p) => p.status === 'active').map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {product && (
                <div
                  className="flex gap-3 p-3 rounded-xl animate-slide-up"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)' }}
                >
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{product.title}</p>
                    <p className="text-sm font-black mt-1" style={{ color: 'var(--primary-400)' }}>
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Nama kamu</label>
                <input type="text" className="input-base" placeholder="Nama lengkap" aria-label="Nama" />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>WhatsApp aktif</label>
                <input type="tel" className="input-base" placeholder="0812-xxxx-xxxx" aria-label="WhatsApp" />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Catatan (opsional)</label>
                <textarea rows={3} className="input-base resize-none" placeholder="Catatan tambahan..." aria-label="Catatan" />
              </div>

              <a
                href="https://wa.me/6281234567890?text=Halo+admin+PAROY+STORE,+saya+ingin+mengajukan+RekBer"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Admin via WhatsApp
              </a>
            </div>
          </div>

          {/* Warning */}
          <div
            className="flex gap-2 p-3 rounded-xl text-xs"
            style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>PAROY STORE <strong>tidak bertanggung jawab</strong> atas transaksi yang dilakukan di luar platform ini. Pastikan selalu transaksi melalui admin resmi.</p>
          </div>
        </div>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
