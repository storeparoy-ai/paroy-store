import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Pesan gagal untuk keempat alur pemesanan (checkout, sewa, rekber, top up).
 *
 * Sebelumnya keempatnya menyembunyikan kegagalan penyimpanan di balik nomor
 * invoice yang dikarang di browser, sehingga pembeli mengira pesanannya
 * berhasil lalu mentransfer uang untuk pesanan yang tidak pernah ada. Sejak
 * migrasi 00000000000010 database juga menolak pesanan yang tidak wajar
 * (produk sudah tidak aktif, durasi sewa di luar batas), jadi kegagalan
 * sekarang justru harus terlihat jelas — lengkap dengan alasannya.
 */
export default function SubmitError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 p-3 rounded-lg bg-urgency-red/10 border border-urgency-red/25 text-xs text-urgency-red"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>
        Pesanan gagal disimpan — <strong className="font-semibold">jangan transfer dulu</strong>.
        Coba ulangi sebentar lagi, atau hubungi admin lewat WhatsApp kalau tetap gagal.
        <span className="block mt-1 text-text-dim">Detail: {message}</span>
      </span>
    </div>
  );
}
