import React from 'react';
import type { Metadata } from 'next';
import TopupFlow from '@/components/topup/TopupFlow';
import { getTopupCatalog, getActivePaymentMethods } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Top Up Game',
  description:
    'Top up diamond, UC, dan item game lainnya dengan harga tetap. Cukup masukkan ID game — tanpa perlu daftar atau masuk.',
  alternates: { canonical: '/topup' },
};

export default async function TopUpPage() {
  // Keduanya sudah di-cache (lihat queries.ts) dan sama untuk setiap
  // pengunjung, jadi aman di-await langsung di sini.
  const [catalog, paymentMethods] = await Promise.all([
    getTopupCatalog(),
    getActivePaymentMethods(),
  ]);

  return <TopupFlow catalog={catalog} paymentMethods={paymentMethods} />;
}
