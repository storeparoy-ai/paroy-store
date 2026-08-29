import React from 'react';
import WishlistGrid from '@/components/profile/WishlistGrid';
import { getUserWishlist } from '@/lib/supabase/queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProfileWishlistPage() {
  const products = await getUserWishlist();
  return <WishlistGrid products={products} />;
}
