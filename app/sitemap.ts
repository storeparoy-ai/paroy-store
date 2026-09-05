import type { MetadataRoute } from 'next';
import { getActiveProducts } from '@/lib/supabase/queries';
import { absoluteUrl } from '@/lib/site';

/**
 * Peta situs untuk mesin pencari.
 *
 * Halaman statis ditulis manual dengan prioritas yang mencerminkan niat
 * pengunjung: katalog dan top up itu tujuan orang datang, halaman masuk dan
 * daftar cuma pintu.
 *
 * Produk diambil dari katalog aktif — getActiveProducts() memakai
 * `'use cache'`, jadi berkas ini tidak memukul database setiap kali ada
 * crawler lewat.
 *
 * Halaman admin, profil, checkout, dan studio sengaja tidak ada di sini; lihat
 * NOINDEX_PREFIXES di lib/site.ts untuk alasannya masing-masing. Daftar itu
 * dipakai bersama robots.txt supaya keduanya tidak pernah berselisih.
 */
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/topup', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/rental', priority: 0.8, changeFrequency: 'daily' },
  { path: '/rekber', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/community', priority: 0.6, changeFrequency: 'daily' },
  { path: '/leaderboard', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/cek-transaksi', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/login', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/register', priority: 0.2, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Katalog kosong atau database sedang bermasalah tidak boleh membuat seluruh
  // sitemap gagal — halaman statisnya tetap layak diberikan ke crawler.
  const products = (await getActiveProducts()) ?? [];

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.id}`),
    lastModified: product.createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
