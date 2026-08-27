'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, MessageCircle, FileText, Lock, Clock, Headphones, Zap, ArrowRight, Loader2, Info
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const HOW_IT_WORKS = [
  { 
    step: '1', 
    title: 'Ajukan Transaksi', 
    desc: 'Isi formulir rekber di samping dengan nominal harga dan rincian spesifikasi akun yang akan ditransaksikan.' 
  },
  { 
    step: '2', 
    title: 'Buyer Transfer ke Escrow Paroy', 
    desc: 'Pembeli mentransfer dana transaksi ke rekening escrow resmi Paroy Store. Dana aman dipegang sistem hingga serah terima selesai.' 
  },
  { 
    step: '3', 
    title: 'Seller Serahkan Akun ke Buyer', 
    desc: 'Setelah dana terverifikasi masuk ke rekening escrow, penjual menyerahkan seluruh data login, email pertama, dan bukti unbind.' 
  },
  { 
    step: '4', 
    title: 'Verifikasi & Ganti Keamanan Data', 
    desc: 'Pembeli mengecek kelengkapan akun game dan mengamankan seluruh akses keamanan (ganti password, nomor HP, dan 2FA).' 
  },
  { 
    step: '5', 
    title: 'Dana Diteruskan ke Seller', 
    desc: 'Setelah pembeli mengonfirmasi bahwa data akun 100% aman, admin langsung mencairkan dana ke rekening penjual dalam hitungan menit.' 
  },
];

const REKBER_FEE = [
  { range: 'Rp 10.000 – Rp 250.000', fee: 'Rp 5.000', note: 'Biaya Flat' },
  { range: 'Rp 250.001 – Rp 1.000.000', fee: 'Rp 10.000', note: 'Biaya Flat' },
  { range: 'Rp 1.000.001 – Rp 3.000.000', fee: 'Rp 25.000', note: 'Biaya Flat' },
  { range: 'Di atas Rp 3.000.000', fee: '1% Transaksi', note: 'Persentase' },
];

export default function RekberPage() {
  const router = useRouter();
  const [itemDesc, setItemDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateFee = (val: number) => {
    if (!val || val <= 0) return 0;
    if (val <= 250000) return 5000;
    if (val <= 1000000) return 10000;
    if (val <= 3000000) return 25000;
    return Math.round(val * 0.01);
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

  const numericAmount = Number(amount) || 0;
  const currentFee = calculateFee(numericAmount);
  const totalTransfer = numericAmount + currentFee;

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-10 sm:py-14 pb-36 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto flex flex-col gap-10">
        
        {/* 1. Page Hero Banner */}
        <div className="relative p-8 sm:p-12 md:p-14 rounded-3xl bg-[#0D121F] border border-emerald-500/25 shadow-2xl overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">
                LAYANAN REKBER ESCROW RESMI
              </span>
            </div>
            
            <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
              Rekber Terpercaya <span className="text-gradient-cyan">100% Anti Tipu</span>
            </h1>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Lindungi uangmu saat transaksi jual beli akun game antar player. Dana diamankan di sistem escrow resmi Paroy Store sampai kamu mengonfirmasi bahwa data akun sudah 100% milikmu dan di-unbind penuh.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-emerald-400">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Dana Dijamin Aman 100%</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-brand-cyan">
                <Zap className="w-4 h-4 text-brand-cyan" />
                <span>Proses Cepat 15 Menit</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-amber-400">
                <Headphones className="w-4 h-4 text-amber-400" />
                <span>Admin Siaga 24 Jam</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          
          {/* Left Column: Alur & Tabel Tarif (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Alur Tahapan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D121F] border border-white/8 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg sm:text-xl text-white">
                    Tahapan Alur Rekber Escrow
                  </h2>
                  <p className="text-xs text-text-muted">
                    5 langkah mudah transaksi aman tanpa resiko penipuan
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {HOW_IT_WORKS.map((item) => (
                  <div 
                    key={item.step} 
                    className="flex items-start gap-4 p-5 rounded-2xl bg-[#111728] border border-white/6 hover:border-brand-cyan/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabel Tarif Biaya */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D121F] border border-white/8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <h2 className="font-heading font-black text-lg sm:text-xl text-white">
                    Tarif Biaya Jasa Rekber
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Biaya admin resmi dan transparan tanpa biaya tersembunyi
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Termurah Se-Indonesia
                </span>
              </div>
              
              <div className="overflow-hidden rounded-2xl border border-white/8">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#141C30] text-text-muted font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-5">Nilai Transaksi</th>
                      <th className="py-3.5 px-5 text-right">Biaya Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#101626]">
                    {REKBER_FEE.map((f, idx) => (
                      <tr key={f.range} className={idx % 2 === 1 ? 'bg-white/[0.02]' : ''}>
                        <td className="py-3.5 px-5 text-white font-medium">
                          {f.range}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black font-mono bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                            {f.fee}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Formulir Pengajuan (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D121F] border border-white/8 shadow-xl space-y-6">
              <div className="border-b border-white/8 pb-4">
                <h2 className="font-heading font-black text-lg sm:text-xl text-white">
                  Ajukan Rekber Baru
                </h2>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Masukkan detail transaksi untuk memulai pembuatan grup rekber resmi dengan admin Paroy Store.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                  <h3 className="font-heading font-black text-lg text-white">Pengajuan Rekber Berhasil!</h3>
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
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white">
                      Nama Akun / Item Game <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      placeholder="Contoh: Akun MLBB All Skin Collector Mythic"
                      className="w-full h-11 px-4 rounded-xl bg-[#111728] border border-white/10 text-xs text-white placeholder:text-text-dim focus:border-brand-cyan/60 focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white">
                      Nominal Harga Transaksi (Rp) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Contoh: 500000"
                      className="w-full h-11 px-4 rounded-xl bg-[#111728] border border-white/10 text-xs text-white font-mono font-bold placeholder:text-text-dim focus:border-brand-cyan/60 focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white">
                      Nomor WhatsApp Penjual / Pembeli (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={sellerContact}
                      onChange={(e) => setSellerContact(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full h-11 px-4 rounded-xl bg-[#111728] border border-white/10 text-xs text-white placeholder:text-text-dim focus:border-brand-cyan/60 focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 transition-all"
                    />
                  </div>

                  {/* Summary Box */}
                  {numericAmount > 0 && (
                    <div className="p-4 rounded-2xl bg-[#141C30] border border-white/8 space-y-2 text-xs mt-2">
                      <div className="flex justify-between text-text-muted">
                        <span>Biaya Admin Rekber:</span>
                        <span className="font-bold text-white font-mono">{formatCurrency(currentFee)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-white pt-2 border-t border-white/8">
                        <span>Total Ditransfer Buyer:</span>
                        <span className="text-brand-cyan text-base font-black font-mono">
                          {formatCurrency(totalTransfer)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-cyber w-full py-3 text-xs font-black flex items-center justify-center gap-2 shadow-lg mt-3"
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

            {/* Direct WhatsApp Contact Card */}
            <div className="p-5 rounded-3xl bg-[#0D121F] border border-emerald-500/25 flex items-center justify-between gap-4 shadow-md">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Butuh bantuan rekber kilat?</p>
                <p className="text-xs text-emerald-400 font-semibold">Hubungi Admin via WhatsApp resmi</p>
              </div>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shrink-0 shadow-sm"
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
