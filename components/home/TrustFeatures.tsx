import { Zap, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Proses Instan 1 Detik',
    desc: 'Sistem pengiriman otomatis 24 jam nonstop langsung masuk ke ID game.',
    color: 'from-[#00f0ff] to-[#00c896]',
    iconColor: 'text-[#00f0ff]',
    glow: 'rgba(0, 240, 255, 0.15)',
  },
  {
    icon: ShieldCheck,
    title: '100% Legal & Bergaransi',
    desc: 'Produk resmi anti minus dengan proteksi escrow rekber aman terpercaya.',
    color: 'from-[#10b981] to-[#34d399]',
    iconColor: 'text-[#10b981]',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  {
    icon: CreditCard,
    title: '50+ Metode Pembayaran',
    desc: 'Bebas bayar via QRIS, BCA, Mandiri, BRI, BNI, GoPay, DANA, OVO, Alfamart.',
    color: 'from-[#f59e0b] to-[#fbbf24]',
    iconColor: 'text-[#f59e0b]',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: Headphones,
    title: 'Customer Service 24/7',
    desc: 'Tim bantuan siap melayani kendala transaksi dengan cepat & ramah.',
    color: 'from-[#a855f7] to-[#ec4899]',
    iconColor: 'text-[#a855f7]',
    glow: 'rgba(168, 85, 247, 0.15)',
  },
];

export default function TrustFeatures() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {FEATURES.map((feat) => {
        const Icon = feat.icon;
        return (
          <div
            key={feat.title}
            className="group relative p-5 sm:p-6 rounded-3xl bg-bg-card border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-md"
          >
            {/* Ambient Background Gradient on Hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${feat.glow}, transparent 70%)`,
              }}
            />

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xs">
                <Icon className={`w-5 h-5 ${feat.iconColor}`} />
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="font-heading font-black text-sm sm:text-base text-white group-hover:text-brand-cyan transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
