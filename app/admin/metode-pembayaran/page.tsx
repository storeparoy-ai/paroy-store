import React from 'react';
import PaymentMethodsTable from '@/components/admin/PaymentMethodsTable';
import { getAllPaymentMethodsForAdmin } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminPaymentMethodsPage() {
  const methods = await getAllPaymentMethodsForAdmin();
  return <PaymentMethodsTable methods={methods} />;
}
