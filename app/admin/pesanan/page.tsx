import React from 'react';
import OrdersTable from '@/components/admin/OrdersTable';
import { getAllOrdersForAdmin } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Pesanan Masuk</h2>
        <span className="text-xs text-text-muted">{orders.length} total</span>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
