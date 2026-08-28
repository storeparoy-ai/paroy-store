import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border-subtle bg-gradient-to-br from-bg-card via-bg-card to-cyan-950/30">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-urgency-orange/10 blur-3xl" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 flex flex-col gap-6 max-w-3xl">
        <Badge variant="trust" size="md" className="w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Anti Hackback &middot; Rekber Resmi
        </Badge>

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-main tracking-tight leading-[1.1]">
          Top Up Kilat, Jual Beli & Sewa Akun Game
          <span className="text-brand-cyan"> Tanpa Ribet</span>
        </h1>

        <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl">
          Satu platform untuk semua kebutuhan gaming-mu. Diamond masuk 1 detik, akun sultan
          terverifikasi, dan transaksi aman lewat Rekber Escrow resmi Paroy Store.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/topup" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
            <Zap className="w-4 h-4" />
            Top Up Sekarang
          </Link>
          <Link href="/products" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
            Lihat Katalog Akun
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 pt-2 text-xs text-text-muted">
          <div className="flex text-urgency-orange">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-urgency-orange" />
            ))}
          </div>
          <span className="font-semibold text-text-main">4.9/5</span>
          <span>dari 10.400+ transaksi sukses</span>
        </div>
      </div>
    </section>
  );
}
