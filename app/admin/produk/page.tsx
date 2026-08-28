import React from 'react';
import ProductsTable from '@/components/admin/ProductsTable';
import { getAllProductsForAdmin } from '@/lib/supabase/admin-queries';
import { getGames } from '@/lib/supabase/queries';

export default async function AdminProductsPage() {
  const [products, games] = await Promise.all([getAllProductsForAdmin(), getGames()]);

  return <ProductsTable products={products} games={games} />;
}
