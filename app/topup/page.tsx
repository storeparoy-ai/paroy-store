import React from 'react';
import TopupFlow from '@/components/topup/TopupFlow';
import { getTopupCatalog, getActivePaymentMethods } from '@/lib/supabase/queries';

export default async function TopUpPage() {
  // Keduanya sudah di-cache (lihat queries.ts) dan sama untuk setiap
  // pengunjung, jadi aman di-await langsung di sini.
  const [catalog, paymentMethods] = await Promise.all([
    getTopupCatalog(),
    getActivePaymentMethods(),
  ]);

  return <TopupFlow catalog={catalog} paymentMethods={paymentMethods} />;
}
