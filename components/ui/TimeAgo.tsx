import React from 'react';
import { timeAgo } from '@/lib/utils';

/**
 * Waktu relatif ("5 mnt lalu") untuk komponen yang juga dirender di browser.
 *
 * Teksnya dihitung dari jam mesin yang merender: server Vercel dan HP pembeli
 * hampir tak pernah persis sama, dan selisih satu menit saja membuat teksnya
 * berbeda saat hidrasi — React melempar error #418 lalu membuang HTML server
 * dan merender ulang seluruh bagian itu di browser. Ketemu lewat uji
 * otomatis di halaman Komunitas.
 *
 * suppressHydrationWarning mengizinkan beda teks di elemen ini saja.
 * `dateTime` berisi waktu pasti (ISO, sama di mana pun) untuk mesin/pembaca
 * layar. Tanpa `title` berisi tanggal lokal: server berjalan di UTC, jadi
 * teks itu akan menunjukkan jam yang salah bagi pembeli di WIB.
 */
export default function TimeAgo({ date, className }: { date: Date; className?: string }) {
  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning className={className}>
      {timeAgo(date)}
    </time>
  );
}
