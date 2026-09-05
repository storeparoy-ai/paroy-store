import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

const CARD_ROTATE = ['rotate-[6deg] opacity-60 saturate-[.85]', '-rotate-4 opacity-95', 'rotate-[2.5deg]'];
const CARD_POS = [
  'top-0 right-2 z-10 translate-y-24',
  'top-0 right-40 z-20 translate-y-10',
  'top-0 right-0 z-30',
];

export default function HeroBanner({
  products,
  mascotImageUrl,
}: {
  products: Product[];
  /** Admin-uploaded mascot image (Admin > Pengaturan Situs). Purely
   * decorative — hero renders identically when this is null. */
  mascotImageUrl?: string | null;
}) {
  const showcase = products.slice(0, 3);

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border-subtle bg-bg-card bg-grain">
      {/* Ambient glow blobs — subtle, behind the solid surface */}
      <div className="pointer-events-none absolute -top-32 -right-20 w-[520px] h-[520px] rounded-full bg-brand-magenta/[0.14] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-brand-cyan/[0.12] blur-[100px]" />
      {/* Synthwave floor grid — signature Paroy Nexus move, see DESIGN.md */}
      <div className="grid-floor -left-[10%] -right-[10%] -bottom-10 h-56" />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <div>
          <Badge variant="trust" size="md" className="w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Anti Hackback &middot; Rekber Resmi
          </Badge>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] text-text-main tracking-[-0.03em] leading-[1.08] mt-6 mb-6 text-balance">
            Top Up Kilat, Jual Beli &amp; Sewa Akun Game{' '}
            <span className="bg-gradient-to-r from-brand-magenta to-brand-cyan bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(255,46,154,0.25)]">
              Tanpa Ribet
            </span>
          </h1>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-lg mb-8">
            Satu platform untuk semua kebutuhan gaming-mu. Top up harga jelas, akun sultan
            terverifikasi, dan transaksi aman lewat Rekber Escrow resmi Paroy Store.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mb-9">
            <Link href="/topup" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
              <Zap className="w-4 h-4" />
              Top Up Sekarang
            </Link>
            <Link href="/products" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              Lihat Katalog Akun
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Dulu di sini ada bintang lima, "4.9/5", dan "10.400+ transaksi
              sukses" — tiga angka karangan untuk toko yang belum punya satu
              pun transaksi selesai. Diganti dengan hal yang memang berlaku
              sejak hari pertama dan tidak perlu menunggu jumlah pelanggan. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-trust-emerald" />
              Serah terima didampingi admin
            </span>
            <span className="text-border-subtle">&middot;</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-trust-emerald" />
              Dana aman lewat Rekber
            </span>
          </div>
        </div>

        {/* Fanned showcase cards */}
        <div className="relative hidden lg:block h-[380px]">
          {mascotImageUrl && (
            <div className="absolute -left-6 -bottom-10 z-0 w-[220px] h-[320px] pointer-events-none drop-shadow-2xl">
              <Image src={mascotImageUrl} alt="Maskot Paroy Store" fill sizes="220px" className="object-contain object-bottom" />
            </div>
          )}
          {showcase.map((product, idx) => (
            <div
              key={product.id}
              className={cn(
                'absolute w-[248px] rounded-[20px] bg-bg-card-alt border border-border-subtle shadow-raised p-4 transition-transform',
                CARD_POS[idx],
                CARD_ROTATE[idx]
              )}
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3">
                <Image src={product.images[0]} alt={product.title} fill sizes="248px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10" />
              </div>
              <h4 className="font-heading font-bold text-[13px] text-text-main truncate mb-1">{product.title}</h4>
              <span className="font-mono font-bold text-base text-brand-cyan">{formatCurrency(product.price)}</span>
            </div>
          ))}

          {showcase.length > 0 && (
            <div className="absolute left-0 bottom-6 z-40 flex items-center gap-2.5 bg-bg-card-alt border border-trust-emerald/30 rounded-2xl px-4 py-3 shadow-elevated">
              <div className="w-8 h-8 rounded-[10px] bg-trust-emerald/15 text-trust-emerald flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-main leading-tight">Akun Terverifikasi</p>
                <p className="text-[11px] text-text-muted leading-tight">Diperiksa admin sebelum tayang</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
