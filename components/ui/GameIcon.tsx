import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Game } from '@/types';

/**
 * Satu-satunya tempat yang memutuskan cara menggambar ikon game: gambar dari
 * Admin → Kategori Game kalau ada, emoji kalau belum.
 *
 * Sebelum komponen ini hanya grid game di beranda yang membaca `iconUrl` —
 * lencana kartu produk, halaman detail, checkout, rental, wishlist, chip
 * filter katalog, dan pemilih game Top Up selalu mencetak emoji, jadi logo
 * yang diunggah admin tidak pernah muncul di sana.
 *
 * `alt` sengaja kosong: di setiap pemakaiannya nama game sudah tertulis di
 * sebelahnya, jadi pembaca layar tidak perlu membacanya dua kali.
 */
export default function GameIcon({
  game,
  size = 16,
  className,
}: {
  game: Pick<Game, 'icon' | 'iconUrl'>;
  size?: number;
  className?: string;
}) {
  if (game.iconUrl) {
    return (
      <Image
        src={game.iconUrl}
        alt=""
        width={size}
        height={size}
        className={cn('shrink-0 rounded-[22%] object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('shrink-0 leading-none', className)}
      style={{ fontSize: Math.round(size * 0.75) }}
    >
      {game.icon}
    </span>
  );
}
