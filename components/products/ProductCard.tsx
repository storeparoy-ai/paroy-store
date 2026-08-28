import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Clock, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductCard({
  product,
  mode = 'buy',
}: {
  product: Product;
  /** 'rental' links to the rental flow with a "Sewa Sekarang" CTA instead
   * of the product detail page — used by the /rental catalog listing. */
  mode?: 'buy' | 'rental';
}) {
  const specEntries = Object.entries(product.specs).slice(0, 3);
  const href = mode === 'rental' ? `/rental?product=${product.id}` : `/products/${product.id}`;

  return (
    <Card variant="interactive" className="flex flex-col h-full">
      <Link href={href} className="block">
        <div className="relative aspect-video w-full bg-bg-card-alt overflow-hidden border-b border-border-subtle">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="cyan" size="sm">{product.game.icon} {product.game.name}</Badge>
          </div>
          {product.canRental && (
            <div className="absolute top-3 right-3">
              <Badge variant="trust" size="sm">
                <Clock className="w-3 h-3" />
                Bisa Sewa
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <Link href={href} className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-sm sm:text-base">{product.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {specEntries.map(([key, value]) => (
              <span
                key={key}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-muted capitalize"
              >
                {key}: {value}
              </span>
            ))}
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-mono font-bold text-base sm:text-lg text-brand-cyan">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-xs text-text-dim line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter>
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <Eye className="w-3.5 h-3.5" />
          <span>{formatNumber(product.viewCount)}</span>
        </div>
        <Link href={href} className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}>
          {mode === 'rental' ? <Clock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {mode === 'rental' ? 'Sewa Sekarang' : 'Lihat Akun'}
        </Link>
      </CardFooter>
    </Card>
  );
}
