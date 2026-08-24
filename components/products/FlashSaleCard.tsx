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
  const progress = (sale.sold / sale.stock) * 100;
  const discount = Math.round((1 - sale.salePrice / sale.product.price) * 100);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Link
      href={`/products/${sale.product.id}`}
      className={cn('product-card block group', className)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-raised)]">
        <Image
          src={sale.product.images[0]}
          alt={sale.product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2">
          <span className="badge badge-hot text-[9px]">-{discount}%</span>
        </div>
        {/* Countdown overlay */}
        <div
          className="absolute bottom-0 inset-x-0 px-2 py-1.5 flex items-center justify-center gap-0.5"
          style={{ background: 'rgba(10,9,8,0.75)',  }}
        >
          <Zap className="w-3 h-3 text-[var(--warning)] shrink-0" />
          <span className="countdown-digit text-[11px] font-bold text-[var(--warning)] tabular-nums">
            {pad(h)}:{pad(m)}:{pad(s)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px]">{sale.product.game.icon}</span>
          <span className="text-[10px] font-medium" style={{ color: sale.product.game.color }}>
            {sale.product.game.name}
          </span>
        </div>
        <h3
          className="text-xs font-semibold leading-snug mb-2 line-clamp-2 font-heading"
          style={{ color: 'var(--text-primary)' }}
        >
          {sale.product.title}
        </h3>

        {/* Price */}
        <div className="flex items-end gap-1.5 mb-2">
          <span className="text-sm font-bold" style={{ color: 'var(--warning)' }}>
            {formatCurrency(sale.salePrice)}
          </span>
          <span className="text-[10px] line-through" style={{ color: 'var(--text-muted)' }}>
            {formatCurrency(sale.product.price)}
          </span>
        </div>

        {/* Stock progress */}
        <div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: 'var(--surface-raised)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress > 70
                  ? 'linear-gradient(90deg, #EF4444, #F59E0B)'
                  : 'linear-gradient(90deg, var(--primary-400), var(--accent-purple))',
              }}
            />
          </div>
          <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Tersisa {sale.stock - sale.sold} dari {sale.stock}
          </p>
        </div>
      </div>
    </Link>
  );
}
