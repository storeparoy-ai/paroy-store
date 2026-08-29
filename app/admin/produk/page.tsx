import React from 'react';
import ProductsTable from '@/components/admin/ProductsTable';
import { getAllProductsForAdmin } from '@/lib/supabase/admin-queries';
import { getGames } from '@/lib/supabase/queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminProductsPage() {
  const [products, games] = await Promise.all([getAllProductsForAdmin(), getGames()]);

  return <ProductsTable products={products} games={games} />;
}
