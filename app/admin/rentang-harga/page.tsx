import React from 'react';
import PriceRangesTable from '@/components/admin/PriceRangesTable';
import { getAllPriceRangesForAdmin } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminPriceRangesPage() {
  const ranges = await getAllPriceRangesForAdmin();
  return <PriceRangesTable ranges={ranges} />;
}
