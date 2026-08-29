import React from 'react';
import RekberFeeTiersTable from '@/components/admin/RekberFeeTiersTable';
import { getAllRekberFeeTiersForAdmin } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminRekberFeeTiersPage() {
  const tiers = await getAllRekberFeeTiersForAdmin();
  return <RekberFeeTiersTable tiers={tiers} />;
}
