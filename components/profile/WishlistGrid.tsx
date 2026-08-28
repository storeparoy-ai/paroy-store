'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { toggleWishlistAction } from '@/lib/supabase/profile-actions';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function WishlistGrid({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [isPending, startTransition] = useTransition();

  function handleRemove(productId: string) {
    setItems((prev) => prev.filter((p) => p.id !== productId));
    startTransition(() => {
      toggleWishlistAction(productId);
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted py-16 text-center">
        Wishlist kosong. Tandai akun favoritmu dari halaman detail produk.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {items.map((product) => (
        <Card key={product.id} variant="interactive" className="flex flex-col">
          <Link href={`/products/${product.id}`}>
            <div className="relative aspect-video w-full bg-bg-card-alt overflow-hidden border-b border-border-subtle">
              <Image src={product.images[0]} alt={product.title} fill sizes="240px" className="object-cover" />
              <div className="absolute top-3 left-3">
                <Badge variant="cyan" size="sm">{product.game.icon} {product.game.name}</Badge>
              </div>
            </div>
          </Link>
          <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
            <Link href={`/products/${product.id}`} className="flex-1">
              <p className="text-xs text-text-main line-clamp-2">{product.title}</p>
            </Link>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-brand-cyan">{formatCurrency(product.price)}</span>
              <button
                onClick={() => handleRemove(product.id)}
                disabled={isPending}
                className="text-urgency-red hover:text-urgency-red transition-colors"
                aria-label="Hapus dari wishlist"
              >
                <Heart className="w-4 h-4 fill-urgency-red" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
