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
  // JPG tidak punya transparansi — hanya foto seperti itu yang perlu dipudarkan.
  const isPhoto = !!mascotImageUrl && /\.jpe?g(\?|$)/i.test(mascotImageUrl);
  // SVG disajikan apa adanya: pengoptimal tidak bisa memperbaiki vektor, dan
  // setiap sumber yang ia sentuh dihitung ke kuota optimasi gambar Vercel.
  const isVector = !!mascotImageUrl && /\.svg(\?|$)/i.test(mascotImageUrl);

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
            <span aria-hidden="true" className="text-border-subtle">&middot;</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-trust-emerald" />
              Dana aman lewat Rekber
            </span>
          </div>
        </div>

        {/* Fanned showcase cards */}
        <div className="relative hidden lg:block h-[380px]">
          {/* Ukuran elemen gambar mengikuti rasio aslinya (w/h auto dalam
              batas kotaknya), bukan `fill`, supaya efek apa pun mengenai tepi
              GAMBARNYA, bukan kotak kosong di sekitarnya.
              - Foto JPG (tanpa transparansi, mis. maskot lama berlatar putih):
                tepinya dipudarkan agar tidak tampak seperti foto tempelan.
              - Karakter berlatar transparan (Paroy Hoodie, SVG/PNG): TIDAK
                dipudarkan — pudar akan memotong kepala dan badannya — tapi
                diberi pendar di belakang dan melayang pelan.
              Maskot berdiri di depan kartu (z-35): dengan 2–3 produk kartu
              tengah memang tertutup sebagian, dan lapisan depan-belakang itu
              yang memberi kedalaman. */}
          {mascotImageUrl && (
            <div className="absolute -left-2 -bottom-12 z-35 w-75 h-80 flex items-end justify-center pointer-events-none">
              {!isPhoto && <div className="absolute inset-x-10 top-20 bottom-12 rounded-full bg-brand-violet/30 blur-3xl" />}
              <Image
                src={mascotImageUrl}
                alt="Maskot Paroy Store"
                width={300}
                height={320}
                unoptimized={isVector}
                className={cn('relative w-auto h-auto max-w-full max-h-full', isPhoto ? 'edge-fade' : 'mascot-float')}
              />
            </div>
          )}
          {showcase.map((product, idx) => {
            // Kipas ini dirancang untuk tiga kartu dengan kartu belakang
            // dipudarkan. Produk pertama (unggulan) selalu di posisi DEPAN;
            // dulu dengan satu produk ia jatuh ke slot belakang yang pudar
            // dan miring, jadi satu-satunya akun di hero tampak redup.
            const slot = CARD_POS.length - 1 - idx;
            return (
              <div
                key={product.id}
                className={cn(
                  'absolute w-62 rounded-[20px] bg-bg-card-alt border border-border-subtle shadow-raised p-4 transition-transform',
                  CARD_POS[slot],
                  CARD_ROTATE[slot]
                )}
              >
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3">
                  <Image src={product.images[0]} alt={product.title} fill sizes="248px" className="object-cover" />
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-transparent to-white/10" />
                </div>
                <h4 className="font-heading font-bold text-[13px] text-text-main truncate mb-1">{product.title}</h4>
                <span className="font-mono font-bold text-base text-brand-cyan">{formatCurrency(product.price)}</span>
              </div>
            );
          })}

          {/* Kanan-bawah, bukan kiri-bawah: kiri-bawah kini tempat maskot. */}
          {showcase.length > 0 && (
            <div className="absolute right-0 bottom-4 z-40 flex items-center gap-2.5 bg-bg-card-alt border border-trust-emerald/30 rounded-2xl px-4 py-3 shadow-elevated">
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
