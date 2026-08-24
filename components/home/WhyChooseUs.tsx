import Link from 'next/link';
import { ShieldCheck, Zap, Users, Star, ArrowRight } from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section className="relative my-6 sm:my-10 w-full">
      
      {/* Centered Section Header */}
      <div className="w-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-12">
        <span className="text-[11px] font-black uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 px-4 py-1.5 rounded-full border border-brand-cyan/25 shadow-xs mb-3">
          KENAPA HARUS PAROY STORE?
        </span>
        <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight text-center">
          Platform Top Up & Jual Beli Akun <span className="text-gradient-cyan">#1 Terpercaya</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-muted mt-3 max-w-xl text-center leading-relaxed">
          Nikmati pengalaman transaksi voucher & akun game paling aman, kilat 1 detik, dan bergaransi resmi di Indonesia.
        </p>
      </div>

      {/* 3 Spacious Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Card 1: Kecepatan & Otomatisasi */}
        <div className="relative p-7 sm:p-8 md:p-9 rounded-3xl bg-bg-card border border-white/10 hover:border-brand-cyan/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between min-h-72.5 overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-44 h-44 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="w-13 h-13 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 flex items-center justify-center text-brand-cyan mb-5 group-hover:scale-110 transition-transform shadow-xs">
              <Zap className="w-7 h-7 fill-brand-cyan/20" />
            </div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-white mb-2.5">
              Sistem Otomatis 1 Detik
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Didukung API server game tier-1 berkecepatan tinggi. Tanpa perlu konfirmasi manual admin, pesanan langsung masuk seketika 24 jam nonstop.
            </p>
          </div>

          <div className="mt-8 pt-5 pb-1 border-t border-white/8 flex items-center justify-between text-xs text-brand-cyan font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              <span>Uptime 99.9%</span>
            </span>
            <span className="bg-brand-cyan/10 px-3 py-1.5 rounded-xl border border-brand-cyan/20">
              24/7 Otomatis
            </span>
          </div>
        </div>

        {/* Card 2: Escrow Rekber & Garansi */}
        <div className="relative p-7 sm:p-8 md:p-9 rounded-3xl bg-bg-card border border-white/10 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between min-h-72.5 overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-7 h-7 fill-emerald-500/20" />
            </div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-white mb-2.5">
              Garansi Anti Hackback
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Jual beli akun aman 100% dengan proteksi Rekber Escrow Paroy Store. Uang pembeli aman sampai data akun berhasil diverifikasi penuh.
            </p>
          </div>

          <div className="mt-8 pt-5 pb-1 border-t border-white/8 flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span className="bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              Garansi 30 Hari
            </span>
            <Link href="/rekber" className="hover:underline flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Pelajari Rekber</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Komunitas & CS */}
        <div className="relative p-7 sm:p-8 md:p-9 rounded-3xl bg-bg-card border border-white/10 hover:border-brand-purple/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between min-h-72.5 overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-44 h-44 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="w-13 h-13 rounded-2xl bg-brand-purple/10 border border-brand-purple/25 flex items-center justify-center text-brand-purple mb-5 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-white mb-2.5">
              150.000+ Gamers Bergabung
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Bergabung bersama ribuan player di komunitas Discord & WhatsApp Paroy Store untuk info turnamen, mabar, dan giveaway mingguan.
            </p>
          </div>

          <div className="mt-8 pt-5 pb-1 border-t border-white/8 flex items-center justify-between text-xs text-brand-purple font-bold">
            <Link href="/community" className="hover:underline flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Gabung Komunitas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Rating 4.9/5</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
