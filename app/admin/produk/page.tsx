import React from 'react';
import ProductsTable from '@/components/admin/ProductsTable';
import { getAllProductsForAdmin } from '@/lib/supabase/admin-queries';

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return <ProductsTable products={products} />;
}
