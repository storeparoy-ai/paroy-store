import React from 'react';
import type { Metadata } from 'next';

/** Halamannya sendiri komponen klien (form pencarian yang berdiri sendiri),
 * dan komponen klien tidak boleh mengekspor `metadata` — jadi metadatanya
 * dititipkan di layout ini. */
export const metadata: Metadata = {
  title: 'Cek Status Transaksi',
  description:
    'Lacak pesananmu di Paroy Store pakai nomor invoice, dan kirim bukti transfer — tanpa perlu masuk.',
  alternates: { canonical: '/cek-transaksi' },
};

export default function CekTransaksiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
