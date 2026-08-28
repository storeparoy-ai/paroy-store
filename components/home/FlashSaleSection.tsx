'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import type { FlashSale } from '@/types';

function useCountdown(endsAt: Date) {
  // Starts `null` (not Date.now()-derived) so the very first client render
  // matches the server-rendered markup exactly — computing this from
  // Date.now() in the initializer caused a hydration mismatch whenever the
  // SSR and hydration timestamps landed in different seconds.
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endsAt.getTime() - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (remaining === null) {
    return { label: '--:--:--', isOver: false };
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');

  return { label: `${h}:${m}:${s}`, isOver: remaining <= 0 };
}

function FlashSaleCard({ sale }: { sale: FlashSale }) {
  const { label } = useCountdown(sale.endsAt);
  const discount = Math.round((1 - sale.salePrice / sale.product.price) * 100);
  const stockLeft = sale.stock - sale.sold;

  return (
    <Card variant="interactive" className="rounded-[20px] border-urgency-orange/25 hover:border-urgency-orange shrink-0 w-64 sm:w-72">
      <Link href={`/products/${sale.product.id}`}>
        <div className="relative aspect-video w-full bg-bg-card-alt overflow-hidden border-b border-border-subtle">
          <Image
            src={sale.product.images[0]}
            alt={sale.product.title}
            fill
            sizes="288px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_85%_0%,rgba(249,115,22,0.22),transparent_62%)]" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-bg-deep/75 border border-urgency-orange/30 text-[10.5px] font-extrabold text-orange-300 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-orange-300" />
              DISKON {discount}%
            </span>
            <span className="px-2.5 py-1 rounded-full bg-bg-deep/75 border border-urgency-orange/30 font-mono text-[10.5px] font-extrabold text-text-main">
              {label}
            </span>
          </div>
        </div>
      </Link>

      <CardContent className="space-y-2 pt-4">
        <h3 className="font-heading font-bold text-sm text-text-main line-clamp-2">
          {sale.product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-bold text-lg text-urgency-orange">
            {formatCurrency(sale.salePrice)}
          </span>
          <span className="font-mono text-xs text-text-dim line-through">
            {formatCurrency(sale.product.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <span className="text-xs text-urgency-orange font-bold">
          {stockLeft > 0 ? `Tersisa ${stockLeft} Akun` : 'Habis'}
        </span>
        <Link href={`/products/${sale.product.id}`} className={cn(buttonVariants({ variant: 'urgency', size: 'sm' }))}>
          Ambil Sekarang
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function FlashSaleSection({ sales }: { sales: FlashSale[] }) {
  if (sales.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-urgency-orange mb-2.5">
            Waktu Terbatas
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-[32px] text-text-main tracking-[-0.02em] flex items-center gap-3">
            <Flame className="w-7 h-7 text-urgency-orange fill-urgency-orange" />
            Flash Sale Hari Ini
          </h2>
        </div>
        <Link
          href="/flash-sales"
          className="flex items-center gap-1 text-xs sm:text-sm font-bold text-urgency-orange hover:text-orange-400 transition-colors pb-1.5 shrink-0"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {sales.map((sale) => (
          <div key={sale.id} className="snap-start">
            <FlashSaleCard sale={sale} />
          </div>
        ))}
      </div>
    </section>
  );
}
