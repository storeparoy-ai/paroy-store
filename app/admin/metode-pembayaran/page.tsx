import React from 'react';
import PaymentMethodsTable from '@/components/admin/PaymentMethodsTable';
import { getAllPaymentMethodsForAdmin } from '@/lib/supabase/admin-queries';

export default async function AdminPaymentMethodsPage() {
  const methods = await getAllPaymentMethodsForAdmin();
  return <PaymentMethodsTable methods={methods} />;
}
