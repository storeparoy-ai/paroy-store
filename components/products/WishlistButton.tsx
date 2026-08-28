'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { toggleWishlistAction } from '@/lib/supabase/profile-actions';
import { cn } from '@/lib/utils';

export default function WishlistButton({
  productId,
  isLoggedIn,
  initialWishlisted,
}: {
  productId: string;
  isLoggedIn: boolean;
  initialWishlisted: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=/products/${productId}`}
        className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
      >
        <Heart className="w-4 h-4" />
        Masuk untuk Wishlist
      </Link>
    );
  }

  function handleClick() {
    setWishlisted((w) => !w);
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (!result.success) setWishlisted((w) => !w); // revert on failure
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        buttonVariants({ variant: wishlisted ? 'secondary' : 'outline', size: 'lg' }),
        'w-full'
      )}
    >
      <Heart className={cn('w-4 h-4', wishlisted && 'fill-urgency-red text-urgency-red')} />
      {wishlisted ? 'Di Wishlist' : 'Tambah ke Wishlist'}
    </button>
  );
}
