'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, MessageCircle, FileText, Lock, Clock, Headphones, Zap, ArrowRight, Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const HOW_IT_WORKS = [
  { step: '1', title: 'Ajukan Transaksi', desc: 'Isi formulir rekber dengan nominal harga dan detail akun yang ingin ditransaksikan.' },
  { step: '2', title: 'Buyer Transfer ke Escrow', desc: 'Pembeli transfer dana aman ke rekening resmi Rekber Paroy Store.' },
  { step: '3', title: 'Seller Serahkan Akun', desc: 'Penjual mengirimkan data login akun, email pertama, dan bukti unbind ke buyer.' },
  { step: '4', title: 'Verifikasi & Ganti Data', desc: 'Buyer memverifikasi dan mengamankan seluruh akses akun game.' },
  { step: '5', title: 'Dana Diteruskan ke Seller', desc: 'Setelah buyer konfirmasi aman 100%, dana langsung cair ke rekening penjual.' },
];

const REKBER_FEE = [
  { range: 'Rp 10.000 – Rp 250.000', fee: 'Rp 5.000' },
  { range: 'Rp 250.001 – Rp 1.000.000', fee: 'Rp 10.000' },
  { range: 'Rp 1.000.001 – Rp 3.000.000', fee: 'Rp 25.000' },
  { range: '> Rp 3.000.000', fee: '1% dari total transaksi' },
];

export default function RekberPage() {
  const router = useRouter();
  const [itemDesc, setItemDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateFee = (val: number) => {
    if (val <= 250000) return 5000;
    if (val <= 1000000) return 10000;
    if (val <= 3000000) return 25000;
    return val * 0.01;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !itemDesc) return;
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
      item_name: itemDesc,
      price: numericAmount,
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
      
      <main className="min-h-screen py-8 sm:py-12 pb-32 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto flex flex-col gap-10">
        
        {/* Page Hero Bento */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-[#0d121f] border border-emerald-500/25 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                ESCROW SERVICE RESMI
              </span>
            </div>
            
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
              Rekber Terpercaya <span className="text-gradient-cyan">100% Anti Tipu</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-text-muted leading-relaxed">
              Lindungi uangmu saat transaksi jual beli akun game antar player. Dana diamankan di sistem escrow Paroy Store sampai kamu mengonfirmasi bahwa data akun sudah 100% milikmu dan di-unbind penuh.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-text-muted">
              <span className="flex items-center gap-2 text-emerald-400"><Lock className="w-4 h-4" /> Dana Dijamin Aman 100%</span>
              <span className="flex items-center gap-2 text-brand-cyan"><Zap className="w-4 h-4" /> Proses 15 Menit Selesai</span>
              <span className="flex items-center gap-2 text-amber-400"><Headphones className="w-4 h-4" /> Admin Siaga 24 Jam</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          
          {/* Left Column: Flow & Benefits (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Flow Steps */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg space-y-6">
              <h2 className="font-heading font-black text-xl text-white">
                Tahapan Alur Rekber Escrow Paroy Store
              </h2>

              <div className="space-y-4">
                {HOW_IT_WORKS.map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-5 rounded-2xl bg-[#141a29] border border-white/6">
                    <span className="w-9 h-9 rounded-xl bg-linear-to-tr from-brand-cyan to-brand-purple text-black font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-sm sm:text-base text-white mb-1">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Table */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg space-y-4">
              <h2 className="font-heading font-black text-lg text-white">
                Tarif Biaya Jasa Rekber
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#141a29] text-text-muted uppercase tracking-wider font-bold">
                      <th className="p-4 rounded-l-xl">Nilai Transaksi</th>
                      <th className="p-4 rounded-r-xl">Biaya Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium text-white">
                    {REKBER_FEE.map((f) => (
                      <tr key={f.range}>
                        <td className="p-4">{f.range}</td>
                        <td className="p-4 font-bold text-primary-container font-mono">{f.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Submission Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8 sticky top-28">
            
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 shadow-xl space-y-6">
              <div>
                <h2 className="font-heading font-black text-xl text-white">
                  Ajukan Rekber Baru
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1">
                  Masukkan detail transaksi untuk memulai pembuatan grup rekber dengan admin.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                  <h3 className="font-bold text-lg text-white">Pengajuan Rekber Berhasil!</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Admin kami akan segera menghubungi kamu melalui WhatsApp untuk membuat grup transaksi 3 pihak yang aman.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-cyber text-xs mt-3 px-6 py-2.5"
                  >
                    Ajukan Transaksi Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-main mb-2">
                      Nama Akun / Item Game <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      placeholder="Contoh: Akun MLBB All Skin Collector"
                      className="input-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-main mb-2">
                      Nominal Harga Transaksi (Rp) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Contoh: 500000"
                      className="input-base font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-main mb-2">
                      Nomor WhatsApp Penjual (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={sellerContact}
                      onChange={(e) => setSellerContact(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="input-base"
                    />
                  </div>

                  {amount && Number(amount) > 0 && (
                    <div className="p-4 rounded-2xl bg-[#141a29] border border-white/6 space-y-2 text-xs">
                      <div className="flex justify-between text-text-muted">
                        <span>Biaya Jasa Rekber:</span>
                        <span className="font-bold text-white font-mono">{formatCurrency(calculateFee(Number(amount)))}</span>
                      </div>
                      <div className="flex justify-between font-bold text-white pt-2 border-t border-white/6">
                        <span>Total Ditransfer:</span>
                        <span className="text-primary-container text-base font-black font-mono">{formatCurrency(Number(amount) + calculateFee(Number(amount)))}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-cyber w-full py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <ShieldCheck className="w-4 h-4 fill-black" />
                        <span>Mulai Transaksi Rekber</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Direct WhatsApp Box */}
            <div className="p-6 rounded-3xl bg-[#0d121f] border border-emerald-500/25 flex items-center justify-between gap-4 shadow-md">
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Butuh bantuan rekber kilat?</p>
                <p className="text-xs text-emerald-400 mt-0.5 font-semibold">Chat Admin via WhatsApp resmi</p>
              </div>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shrink-0 shadow-sm"
              >
                Chat WA &rarr;
              </a>
            </div>

          </div>

        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
