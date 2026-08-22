'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import FlashSaleCard from '@/components/products/FlashSaleCard';
import { FlashSale } from '@/types';

interface HomeFlashSaleProps {
  sales: FlashSale[];
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

export default function HomeFlashSale({ sales }: HomeFlashSaleProps) {
  const { h, m, s } = useCountdown(sales[0]?.endsAt ?? new Date());
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="col-span-2 md-col-span-4 flex flex-col gap-2">
      {/* Header */}
      <div
        className="glass flex items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: 'var(--warning)' }} aria-hidden />
          <span className="font-bold font-heading" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            Flash Sale
          </span>
          {/* Countdown */}
          <div className="flex items-center gap-1 ml-2">
            {[pad(h), pad(m), pad(s)].map((val, i) => (
              <span key={i} className="flex items-center gap-1">
                <span
                  className="countdown-digit font-bold tabular-nums px-1.5 py-0.5 rounded text-xs"
                  style={{
                    background: 'rgba(245,158,11,0.15)',
                    color: 'var(--warning)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                >
                  {val}
                </span>
                {i < 2 && <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>:</span>}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/flash-sales"
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {sales.map((sale) => (
          <FlashSaleCard key={sale.id} sale={sale} />
        ))}
      </div>
    </div>
  );
}
