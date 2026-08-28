import React from 'react';
import RekberFeeTiersTable from '@/components/admin/RekberFeeTiersTable';
import { getAllRekberFeeTiersForAdmin } from '@/lib/supabase/admin-queries';

export default async function AdminRekberFeeTiersPage() {
  const tiers = await getAllRekberFeeTiersForAdmin();
  return <RekberFeeTiersTable tiers={tiers} />;
}
