'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ChevronRight, Sparkles, LayoutGrid, Zap } from 'lucide-react';
import FlashSaleCard from '@/components/products/FlashSaleCard';
import { FlashSale } from '@/types';
import { CoverflowCarousel, CoverflowSlide } from '@/components/ui/coverflow-carousel';
import { cn, formatCurrency } from '@/lib/utils';

interface FlashSaleSectionProps {
  flashSales: FlashSale[];
}

export default function FlashSaleSection({ flashSales }: FlashSaleSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | '3d'>('grid');
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (!flashSales || flashSales.length === 0) return null;

  const slides: CoverflowSlide[] = flashSales.map((sale) => {
    const origPrice = sale.product.originalPrice || sale.product.price;
    const discountPct = origPrice > sale.salePrice ? Math.round(((origPrice - sale.salePrice) / origPrice) * 100) : 20;

    return {
      src: sale.product.images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
      alt: sale.product.title,
      title: sale.product.title,
      subtitle: sale.product.game.name,
      badge: `🔥 HEMAT ${discountPct}%`,
      price: formatCurrency(sale.salePrice),
      originalPrice: formatCurrency(origPrice),
      href: `/products/${sale.product.id}`,
      ctaText: 'Beli Flash Sale Sekarang →',
    };
  });

  return (
    <section className="relative rounded-3xl bg-linear-to-b from-[#14120e] via-[#0D121F] to-[#0D121F] border border-orange-500/25 p-6 sm:p-8 md:p-10 shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-orange-500 to-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.5)]">
              <Flame className="w-6 h-6 text-white fill-white animate-bounce" />
            </div>
            <div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
                FLASH <span className="text-gradient-fire">SALE HARI INI</span>
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Diskon kilat kuota terbatas, reset otomatis setiap hari
              </p>
            </div>
          </div>

          {/* Countdown Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/60 border border-orange-500/30 backdrop-blur-md shadow-inner">
            <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
              BERAKHIR DALAM:
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-sm text-white">
              <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-lg border border-orange-500/30">{pad(timeLeft.hours)}</span>
              <span className="text-orange-500 font-bold">:</span>
              <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-lg border border-orange-500/30">{pad(timeLeft.minutes)}</span>
              <span className="text-orange-500 font-bold">:</span>
              <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-lg border border-orange-500/30">{pad(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Dual View Toggle */}
          <div className="flex items-center p-1.5 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)] font-black'
                  : 'text-text-muted hover:text-white'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                viewMode === '3d'
                  ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)] font-black'
                  : 'text-text-muted hover:text-white'
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>3D Showcase</span>
            </button>
          </div>

          <Link
            href="/flash-sales"
            className="group hidden sm:flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
          >
            <span>Lihat Semua Promo</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Grid Mode or 3D Mode */}
      {viewMode === 'grid' ? (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {flashSales.map((sale) => (
            <FlashSaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      ) : (
        /* 3D Coverflow Mode */
        <div className="relative rounded-3xl bg-black/40 border border-orange-500/20 p-4 sm:p-6 overflow-hidden">
          <CoverflowCarousel
            slides={slides}
            cardWidth="clamp(260px, 30vw, 360px)"
            showNavigation={true}
            showPagination={true}
            showCaption={false}
            renderCustomCard={(slide, index) => {
              const sale = flashSales[index] || flashSales[0];
              const origPrice = sale.product.originalPrice || sale.product.price;
              const pct = origPrice > sale.salePrice ? Math.round(((origPrice - sale.salePrice) / origPrice) * 100) : 20;
              const progressPct = sale.stock > 0 ? Math.round((sale.sold / sale.stock) * 100) : 60;

              return (
                <Link
                  href={`/products/${sale.product.id}`}
                  className="relative w-full h-full flex flex-col justify-between p-6 sm:p-7 overflow-hidden group/card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sale.product.images[0]}
                    alt={sale.product.title}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/25" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white shadow-md border border-red-400">
                      HEMAT {pct}%
                    </span>
                    <span className="text-[10px] font-bold text-white bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs border border-white/10">
                      {sale.product.game.name}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2.5">
                    <h3 className="font-heading font-black text-base sm:text-lg text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md">
                      {sale.product.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-black text-lg sm:text-xl text-orange-400">
                        {formatCurrency(sale.salePrice)}
                      </span>
                      <span className="font-mono text-xs text-text-dim line-through">
                        {formatCurrency(origPrice)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Terjual {sale.sold}/{sale.stock}</span>
                        <span className="text-orange-400 font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-orange-500 to-red-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-1.5">
                      <div className="w-full py-2.5 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white font-black text-xs text-center shadow-md group-hover/card:brightness-110 transition-all flex items-center justify-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Klaim Promo Flash Sale &rarr;</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }}
          />
        </div>
      )}
    </section>
  );
}
