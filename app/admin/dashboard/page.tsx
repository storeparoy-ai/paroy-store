import React from 'react';
import SalesDashboard from '@/components/admin/SalesDashboard';
import { getSalesDashboardData } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminDashboardPage() {
  const data = await getSalesDashboardData();
  return <SalesDashboard data={data} />;
}
