import React from 'react';
import WishlistGrid from '@/components/profile/WishlistGrid';
import { getUserWishlist } from '@/lib/supabase/queries';

export default async function ProfileWishlistPage() {
  const products = await getUserWishlist();
  return <WishlistGrid products={products} />;
}
