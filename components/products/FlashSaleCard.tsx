'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { FlashSale } from '@/types';

interface FlashSaleCardProps {
  sale: FlashSale;
  className?: string;
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export default function FlashSaleCard({ sale, className }: FlashSaleCardProps) {
  const { h, m, s } = useCountdown(sale.endsAt);
  const progress = Math.min(100, Math.round((sale.sold / (sale.stock || 1)) * 100));
  const discount = Math.round((1 - sale.salePrice / (sale.product.originalPrice || sale.product.price)) * 100);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Link
      href={`/products/${sale.product.id}`}
      className={cn('product-card block group overflow-hidden bg-[#0D121F] border border-white/8 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 rounded-2xl shadow-lg', className)}
    >
      {/* 1. Isolated Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#141A29]">
        <Image
          src={sale.product.images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop'}
          alt={sale.product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-108"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0D121F] via-transparent to-transparent opacity-80" />

        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-red-500 text-white shadow-xs">
            -{discount}%
          </span>
        </div>

        {/* Live Timer Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-xs flex items-center justify-center gap-1.5 border border-white/10 z-10">
          <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0 fill-orange-400" />
          <span className="font-mono text-xs font-black text-orange-400 tracking-wider">
            {pad(h)}:{pad(m)}:{pad(s)}
          </span>
        </div>
      </div>

      {/* 2. Isolated Text Content Container */}
      <div className="p-5 pb-6 flex flex-col gap-3 flex-1 justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{sale.product.game.icon}</span>
            <span className="text-xs font-bold text-text-dim truncate">
              {sale.product.game.name}
            </span>
          </div>

          <h3 className="text-sm font-bold leading-snug line-clamp-2 font-heading text-white group-hover:text-orange-400 transition-colors">
            {sale.product.title}
          </h3>
        </div>

        {/* Price & Stock */}
        <div className="space-y-3 pt-2 border-t border-white/6">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-mono font-black text-orange-400">
              {formatCurrency(sale.salePrice)}
            </span>
            <span className="text-xs font-mono line-through text-text-dim">
              {formatCurrency(sale.product.originalPrice || sale.product.price)}
            </span>
          </div>

          {/* Stock Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-dim font-medium">
              <span>Terjual {sale.sold}</span>
              <span className="text-orange-400 font-bold">Sisa {sale.stock - sale.sold}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
