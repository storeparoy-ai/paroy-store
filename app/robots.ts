import type { MetadataRoute } from 'next';
import { absoluteUrl, NOINDEX_PREFIXES } from '@/lib/site';

/**
 * robots.txt.
 *
 * Daftar larangannya diambil dari NOINDEX_PREFIXES yang sama dengan yang
 * dipakai sitemap, jadi tidak mungkin ada halaman yang dilarang di sini tapi
 * diiklankan di sana — perselisihan seperti itu sinyal buruk buat mesin
 * pencari, dan mudah terjadi kalau dua daftarnya ditulis terpisah.
 *
 * Catatan: robots.txt hanya mengatur perayapan, bukan kerahasiaan. Halaman
 * admin tetap dijaga proxy.ts, layout admin, dan RLS — baris di bawah cuma
 * mencegahnya muncul di hasil pencarian.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: NOINDEX_PREFIXES.map((prefix) => `${prefix}/`),
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
