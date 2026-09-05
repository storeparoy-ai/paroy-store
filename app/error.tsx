'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button, { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Batas penangkap error untuk seluruh halaman di bawah layout root.
 *
 * Sebelum ini, gagalnya sebuah halaman memunculkan layar error bawaan Next.js
 * — berbahasa Inggris, tanpa jalan kembali ke katalog, dan tanpa petunjuk apa
 * pun buat pembeli yang mungkin baru saja transfer uang.
 *
 * Catatan: propnya `retry`, bukan `reset`. Keduanya ada, tapi `reset` hanya
 * merender ulang tanpa mengambil datanya lagi — untuk error yang datang dari
 * database yang sedang tersendat, itu praktis selalu gagal lagi.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Ikut tercatat di log Vercel, berpasangan dengan digest yang tampil di
    // layar — supaya laporan pembeli ("kode-nya 8f2a...") bisa dilacak.
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-urgency-red/10 border border-urgency-red/25 text-urgency-red flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Ada Gangguan di Sisi Kami
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Halaman ini gagal dimuat — bukan karena kesalahanmu. Coba muat ulang; kalau masih sama,
            tunggu sebentar lalu buka lagi.
          </p>
        </div>

        {/* Pesanan yang sudah tersimpan tidak ikut hilang gara-gara layar ini,
            dan pembeli yang baru transfer perlu mendengarnya sekarang juga —
            bukan setelah dia panik dan memesan ulang. */}
        <div className="p-4 rounded-xl bg-bg-card-alt border border-border-subtle text-xs text-text-muted leading-relaxed text-left">
          Kalau kamu baru saja menyelesaikan pesanan,{' '}
          <strong className="text-text-main">pesananmu tetap tersimpan</strong>. Cek statusnya pakai
          nomor invoice di halaman{' '}
          <Link href="/cek-transaksi" className="text-brand-cyan hover:underline">
            Cek Transaksi
          </Link>{' '}
          — jangan transfer dua kali.
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Button variant="primary" onClick={() => retry()}>
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: 'secondary' }))}>
            <Home className="w-4 h-4" />
            Beranda
          </Link>
        </div>

        {error.digest && (
          <p className="text-[11px] text-text-dim">
            Kode kesalahan: <code className="font-mono text-text-muted">{error.digest}</code> —
            sebutkan ini kalau menghubungi admin.
          </p>
        )}
      </div>
    </Container>
  );
}
