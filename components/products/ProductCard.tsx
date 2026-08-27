'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock3, Eye } from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const rankBadge = product.specs?.rank || product.specs?.level;

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn('product-card block group overflow-hidden bg-[#0D121F] border border-white/8 hover:border-brand-cyan/40 transition-all duration-300 hover:-translate-y-1 rounded-2xl shadow-lg', className)}
    >
      {/* 1. Isolated Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#141A29]">
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop'}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-108"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0D121F] via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.canRental ? (
            <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 backdrop-blur-xs">
              ⏱ Rental
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/60 text-white border border-white/15 backdrop-blur-xs">
              💎 Akun
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-red-500 text-white shadow-xs">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          aria-label="Wishlist"
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-400/40 backdrop-blur-xs transition-all z-10"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Status overlay */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-20">
            <span className="badge badge-sold text-xs">TERJUAL</span>
          </div>
        )}
      </div>

      {/* 2. Isolated Text Content Container */}
      <div className="p-5 pb-6 flex flex-col gap-3 flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Game & Rank Tag */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <span className="font-bold truncate text-white" style={{ color: product.game.color }}>
              {product.game.icon} {product.game.name}
            </span>
            {rankBadge && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-text-dim border border-white/5 shrink-0">
                {String(rankBadge)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold leading-snug line-clamp-2 font-heading text-white group-hover:text-brand-cyan transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Rental Tag */}
        <div className="pt-2.5 border-t border-white/6 flex items-baseline justify-between gap-1">
          <div>
            <span className="text-base sm:text-lg font-black text-primary-container font-mono block">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] line-through text-text-dim font-mono">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {product.canRental && product.rentalPriceDaily && (
            <span className="text-[11px] text-brand-cyan font-bold text-right">
              {formatCurrency(product.rentalPriceDaily)}/hr
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
