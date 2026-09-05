import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageSearch, Home, FileSearch } from 'lucide-react';
import Container from '@/components/ui/Container';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Halaman 404.
 *
 * Menangani dua hal sekaligus: URL yang tidak cocok dengan rute apa pun, dan
 * notFound() yang dipanggil halaman produk saat akunnya tidak ada.
 *
 * Yang kedua itu kasus paling sering dan paling penting: tautan akun beredar
 * di grup WhatsApp, akunnya keburu terjual, lalu orang yang mengklik belakangan
 * mendarat di sini. Karena itu kalimatnya menyebut kemungkinan "sudah terjual"
 * dan mengarahkan ke katalog — bukan sekadar "halaman tidak ditemukan" yang
 * membuat orang menutup tab.
 */
export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
};

export default function NotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="space-y-3">
          <p className="font-mono font-extrabold text-6xl sm:text-7xl text-brand-cyan/25 tracking-[-0.04em]">
            404
          </p>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Akun yang kamu cari mungkin sudah terjual, atau tautannya keliru. Coba lihat akun lain
            yang masih tersedia di katalog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href="/products" className={cn(buttonVariants({ variant: 'primary' }))}>
            <PackageSearch className="w-4 h-4" />
            Lihat Katalog
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: 'secondary' }))}>
            <Home className="w-4 h-4" />
            Beranda
          </Link>
        </div>

        <p className="text-xs text-text-dim">
          Sudah pesan tapi tautannya hilang?{' '}
          <Link
            href="/cek-transaksi"
            className="inline-flex items-center gap-1 text-brand-cyan hover:underline"
          >
            <FileSearch className="w-3.5 h-3.5" />
            Lacak pakai nomor invoice
          </Link>
        </p>
      </div>
    </Container>
  );
}
