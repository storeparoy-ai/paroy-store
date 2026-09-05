import React from 'react';
import type { Metadata } from 'next';

/** Halaman pembayaran tidak ada artinya tanpa produk yang sedang dibeli, dan
 * tidak boleh nyangkut di hasil pencarian. robots.txt sudah melarang
 * perayapannya; tag ini lapisan kedua, untuk URL yang terlanjur dibagikan
 * lewat tautan langsung. */
export const metadata: Metadata = {
  title: 'Pembayaran',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
