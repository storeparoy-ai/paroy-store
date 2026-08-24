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

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function RekberPage() {
  const router = useRouter();
  const [itemDesc, setItemDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateFee = (val: number) => {
    if (val <= 100000) return 5000;
    if (val <= 500000) return 10000;
    if (val <= 1000000) return 15000;
    return val * 0.015;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const numericAmount = Number(amount);
    const fee = calculateFee(numericAmount);

    const { error } = await supabase.from('rekber_orders').insert({
      requester_id: user.id,
      item_description: itemDesc,
      amount: numericAmount,
      fee: fee,
      seller_contact: sellerContact,
      status: 'pending'
    });

    if (error) {
      alert('Terjadi kesalahan saat mengajukan RekBer.');
      console.error(error);
    } else {
      setSubmitted(true);
      setItemDesc('');
      setAmount('');
      setSellerContact('');
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="pt-24 min-h-screen flex flex-col">
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
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--success)' }} />
                <h3 className="font-bold text-lg mb-1">Pengajuan Berhasil</h3>
                <p className="text-sm text-gray-400">Admin akan segera menghubungi Anda dan penjual via WhatsApp.</p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary mt-4 w-full">Ajukan Lagi</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Deskripsi Barang / Akun
                  </label>
                  <input
                    type="text"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="input-base"
                    placeholder="Contoh: Akun MLBB Mythic Sultan..."
                    aria-label="Deskripsi barang"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Harga Kesepakatan (Rp)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-base"
                    placeholder="Contoh: 500000"
                    aria-label="Harga"
                  />
                  {amount && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Perkiraan Biaya Admin: <strong style={{ color: 'var(--primary-400)' }}>{formatCurrency(calculateFee(Number(amount)))}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Nomor WhatsApp Penjual
                  </label>
                  <input
                    type="tel"
                    value={sellerContact}
                    onChange={(e) => setSellerContact(e.target.value)}
                    className="input-base"
                    placeholder="Contoh: 081234567890"
                    aria-label="WhatsApp Penjual"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !itemDesc || !amount || !sellerContact}
                  className="btn-primary w-full text-sm"
                >
                  {loading ? 'Memproses...' : 'Ajukan RekBer Sekarang'}
                </button>
              </div>
            )}
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
