import React from 'react';
import SalesDashboard from '@/components/admin/SalesDashboard';
import { getSalesDashboardData } from '@/lib/supabase/admin-queries';

export default async function AdminDashboardPage() {
  const data = await getSalesDashboardData();
  return <SalesDashboard data={data} />;
}
