import React from 'react';
import FlashSalesTable from '@/components/admin/FlashSalesTable';
import { getAllFlashSalesForAdmin, getAllProductsForAdmin } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminFlashSalePage() {
  const [sales, products] = await Promise.all([getAllFlashSalesForAdmin(), getAllProductsForAdmin()]);
  const activeProducts = products.filter((p) => p.status === 'active');

  return <FlashSalesTable sales={sales} products={activeProducts} />;
}
