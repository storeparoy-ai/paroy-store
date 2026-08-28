'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { MOCK_FLASH_SALES } from '@/lib/mock-data';

function useCountdown(endsAt: Date) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endsAt.getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, endsAt.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const totalSeconds = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');

  return { label: `${h}:${m}:${s}`, isOver: remaining <= 0 };
}

function FlashSaleCard({ sale }: { sale: (typeof MOCK_FLASH_SALES)[number] }) {
  const { label } = useCountdown(sale.endsAt);
  const discount = Math.round((1 - sale.salePrice / sale.product.price) * 100);
  const stockLeft = sale.stock - sale.sold;

  return (
    <Card variant="interactive" className="border-urgency-orange/25 hover:border-urgency-orange shrink-0 w-64 sm:w-72">
      <Link href={`/products/${sale.product.id}`}>
        <div className="relative aspect-video w-full bg-bg-card-alt overflow-hidden border-b border-border-subtle">
          <Image
            src={sale.product.images[0]}
            alt={sale.product.title}
            fill
            sizes="288px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="urgency" size="sm">
              <Flame className="w-3 h-3 fill-urgency-orange" />
              DISKON {discount}%
            </Badge>
          </div>
          <div className="absolute top-3 right-3 font-mono">
            <Badge variant="urgency" size="sm">{label}</Badge>
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

export default function FlashSaleSection() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-urgency-orange fill-urgency-orange" />
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main tracking-tight">
            Flash Sale Hari Ini
          </h2>
        </div>
        <Link
          href="/flash-sales"
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-urgency-orange hover:text-orange-400 transition-colors"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {MOCK_FLASH_SALES.map((sale) => (
          <div key={sale.id} className="snap-start">
            <FlashSaleCard sale={sale} />
          </div>
        ))}
      </div>
    </section>
  );
}
