import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
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
    <Card variant="interactive" className="flex flex-col h-full rounded-[20px]">
      <Link href={href} className="block">
        <div className="relative aspect-video w-full bg-bg-card-alt overflow-hidden border-b border-border-subtle">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover"
          />
          {/* Subtle top-left highlight for depth — not a card surface, so this
              isn't the glassmorphism DESIGN.md forbids. */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,rgba(255,255,255,0.16),transparent_55%)]" />
          {/* Game top-left, rental ribbon bottom-left: in the two-column
              phone grid a card is ~165px wide, and side by side the two
              badges each wrapped onto two lines and overlapped. */}
          <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] px-2.5 py-1 rounded-full bg-bg-deep/70 text-[11px] font-extrabold text-text-main flex items-center gap-1 whitespace-nowrap">
            {product.game.icon} <span className="truncate">{product.game.name}</span>
          </span>
          {product.canRental && (
            <span className="absolute bottom-3 left-3 hex-clip px-3.5 py-1 bg-linear-to-r from-trust-emerald to-brand-cyan text-[11px] font-extrabold text-bg-deep flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              Bisa Sewa
            </span>
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

          <div className="flex flex-wrap items-baseline gap-x-2 pt-1">
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

      {/* Hitungan "dilihat" dulu tampil di sini — tidak ada kode yang pernah
          menaikkan view_count, jadi setiap akun selamanya menunjukkan 0. */}
      <CardFooter className="pt-4">
        <Link href={href} className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'w-full')}>
          {mode === 'rental' ? <Clock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {mode === 'rental' ? 'Sewa Sekarang' : 'Lihat Akun'}
        </Link>
      </CardFooter>
    </Card>
  );
}
