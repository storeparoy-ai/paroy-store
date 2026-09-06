import React from 'react';
import CekTransaksiForm from '@/components/cek-transaksi/CekTransaksiForm';
import { getActivePaymentMethods } from '@/lib/supabase/queries';

/** Halaman ini komponen server hanya untuk satu hal: mengambil daftar metode
 * pembayaran, supaya formulir di dalamnya bisa menunjukkan rekening tujuan
 * pada pesanan yang masih menunggu pembayaran. Lihat migrasi 22. */
export default async function CekTransaksiPage() {
  const paymentMethods = await getActivePaymentMethods();
  return <CekTransaksiForm paymentMethods={paymentMethods} />;
}
