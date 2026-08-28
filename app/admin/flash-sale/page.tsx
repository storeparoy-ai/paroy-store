import React from 'react';
import FlashSalesTable from '@/components/admin/FlashSalesTable';
import { getAllFlashSalesForAdmin, getAllProductsForAdmin } from '@/lib/supabase/admin-queries';

export default async function AdminFlashSalePage() {
  const [sales, products] = await Promise.all([getAllFlashSalesForAdmin(), getAllProductsForAdmin()]);
  const activeProducts = products.filter((p) => p.status === 'active');

  return <FlashSalesTable sales={sales} products={activeProducts} />;
}
