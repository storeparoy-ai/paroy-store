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
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-raised)]">
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
          <Heart className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </button>

        {/* View count */}
        <div
          className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] text-[var(--text-muted)]"
          style={{ background: 'rgba(10,9,8,0.55)',  }}
        >
          <Eye className="w-2.5 h-2.5" />
          {formatNumber(product.viewCount)}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        {/* Game badge */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px]">{product.game.icon}</span>
          <span className="text-[10px] font-medium" style={{ color: product.game.color }}>
            {product.game.name}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-xs font-semibold leading-snug mb-1.5 line-clamp-2 font-heading"
          style={{ color: 'var(--text-primary)' }}
        >
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-end gap-1.5">
          <span className="text-sm font-bold" style={{ color: 'var(--primary-400)' }}>
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] line-through" style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rental info */}
        {product.canRental && product.rentalPriceDaily && (
          <div className="flex items-center gap-1 mt-1">
            <Clock3 className="w-2.5 h-2.5" style={{ color: 'var(--info)' }} />
            <span className="text-[9px]" style={{ color: 'var(--info)' }}>
              Rental {formatCurrency(product.rentalPriceDaily)}/hari
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
