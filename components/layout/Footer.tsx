'use client';

import Link from 'next/link';
import { Zap, ShieldCheck } from 'lucide-react';

const PAYMENT_PARTNERS = [
  'QRIS', 'BCA', 'Mandiri', 'BRI', 'BNI', 'GoPay', 'DANA', 'OVO', 'ShopeePay', 'Alfamart', 'Indomaret'
];

export default function Footer() {
  return (
    <footer className="w-full bg-bg-deep border-t border-white/8 pt-14 pb-16 text-text-muted">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-brand-cyan to-primary-container p-0.5 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                <div className="w-full h-full bg-bg-base rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-cyan" />
                </div>
              </div>
              <span className="font-heading font-black text-xl text-white tracking-tight">
                PAROY<span className="text-gradient-cyan">STORE</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-text-dim">
              Platform top up game otomatis 1 detik dan marketplace jual-beli & rental akun game bergaransi resmi terpercaya nomor 1 di Indonesia.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Rekber Escrow Terverifikasi
              </span>
            </div>
          </div>

          {/* Col 2: Navigasi */}
          <div>
            <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wider mb-4">
              Layanan & Produk
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/topup" className="hover:text-brand-cyan transition-colors">Top Up Game Kilat 1 Detik</Link></li>
              <li><Link href="/products" className="hover:text-brand-cyan transition-colors">Jual Beli Akun Sultan</Link></li>
              <li><Link href="/rental" className="hover:text-brand-cyan transition-colors">Sewa & Rental Akun Game</Link></li>
              <li><Link href="/flash-sales" className="hover:text-brand-cyan transition-colors">Promo Flash Sale Harian</Link></li>
              <li><Link href="/rekber" className="hover:text-brand-cyan transition-colors">Rekber Escrow Resmi</Link></li>
            </ul>
          </div>

          {/* Col 3: Dukungan & Bantuan */}
          <div>
            <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wider mb-4">
              Bantuan & Panduan
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/cek-transaksi" className="hover:text-brand-cyan transition-colors">Lacak Status Pesanan</Link></li>
              <li><Link href="/leaderboard" className="hover:text-brand-cyan transition-colors">Top Spender Leaderboard</Link></li>
              <li><Link href="/community" className="hover:text-brand-cyan transition-colors">Komunitas Discord & WA</Link></li>
              <li><Link href="/help" className="hover:text-brand-cyan transition-colors">Pusat Bantuan & FAQ</Link></li>
            </ul>
          </div>

          {/* Col 4: Pembayaran Aman */}
          <div>
            <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wider mb-4">
              Metode Pembayaran
            </h3>
            <p className="text-xs text-text-dim mb-4">Mendukung pembayaran instan & otomatis 24 jam nonstop:</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_PARTNERS.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-lg bg-bg-card text-[11px] font-mono font-bold text-slate-200 border border-white/5 shadow-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-dim">
          <p>&copy; {new Date().getFullYear()} PAROY STORE. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <span>&middot;</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}