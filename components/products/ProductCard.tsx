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

  return (
    <Link href={`/products/${product.id}`} className={cn('product-card block', className)}>
      {/* Image */}
      <div className="relative aspect-4/5 overflow-hidden bg-(--surface-raised)">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge badge-hot text-[9px]">-{discount}%</span>
          )}
          {product.canRental && (
            <span className="badge badge-rental text-[9px]">⏱ Rental</span>
          )}
        </div>

        {/* Status overlay */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="badge badge-sold text-xs">TERJUAL</span>
          </div>
        )}

        {/* Wishlist btn */}
        <button
          aria-label="Tambah ke wishlist"
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
          style={{ background: 'rgba(10,9,8,0.6)',  }}
        >
          <Heart className="w-3.5 h-3.5 text-(--text-muted)" />
        </button>

        {/* View count */}
        <div
          className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] text-(--text-muted)"
          style={{ background: 'rgba(10,9,8,0.55)',  }}
        >
          <Eye className="w-2.5 h-2.5" />
          {formatNumber(product.viewCount)}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-4.5 space-y-2">
        {/* Game badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{product.game.icon}</span>
          <span className="text-[11px] font-bold" style={{ color: product.game.color }}>
            {product.game.name}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 font-heading text-white group-hover:text-brand-cyan transition-colors"
        >
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-white/5">
          <span className="text-sm sm:text-base font-black text-primary-container">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] line-through text-text-dim">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rental info */}
        {product.canRental && product.rentalPriceDaily && (
          <div className="flex items-center gap-1 text-[10px] text-brand-cyan font-semibold">
            <Clock3 className="w-3 h-3" />
            <span>
              Rental {formatCurrency(product.rentalPriceDaily)}/hari
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
