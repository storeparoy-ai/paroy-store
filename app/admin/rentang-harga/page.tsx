import React from 'react';
import PriceRangesTable from '@/components/admin/PriceRangesTable';
import { getAllPriceRangesForAdmin } from '@/lib/supabase/admin-queries';

export default async function AdminPriceRangesPage() {
  const ranges = await getAllPriceRangesForAdmin();
  return <PriceRangesTable ranges={ranges} />;
}
