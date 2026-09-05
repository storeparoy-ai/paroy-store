/**
 * Alamat kanonik situs.
 *
 * Dipakai metadata (Open Graph butuh URL absolut — pratinjau link di WhatsApp
 * tidak bisa menebak host dari path relatif), sitemap, robots.txt, dan tautan
 * ke dashboard di dalam notifikasi Telegram.
 *
 * Urutannya:
 *   1. NEXT_PUBLIC_SITE_URL — kalau nanti pakai domain sendiri.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — disediakan Vercel, dan sengaja yang
 *      "production": deployment pratinjau pun harus menunjuk ke alamat asli,
 *      supaya URL pratinjau tidak pernah bocor ke sitemap atau ke Google.
 *   3. Alamat produksi saat ini, sebagai jaring pengaman. metadataBase butuh
 *      nilai pada saat build; tanpa itu setiap path relatif jadi error build.
 */
const FALLBACK_SITE_URL = 'https://paroy-store.vercel.app';

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return FALLBACK_SITE_URL;
}

/** URL absolut dari sebuah path di situs ini. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Halaman yang tidak boleh masuk hasil pencarian, dan alasannya masing-masing:
 * halaman admin dan profil bersifat pribadi, alur pembayaran tidak ada artinya
 * tanpa konteks pesanan, dan /studio cuma etalase komponen desain internal.
 *
 * Dipakai bersama oleh robots.txt dan sitemap supaya keduanya tidak pernah
 * berselisih — sitemap yang mengiklankan halaman yang dilarang robots.txt itu
 * sinyal buruk buat mesin pencari.
 */
export const NOINDEX_PREFIXES = ['/admin', '/profile', '/checkout', '/studio', '/api'] as const;
