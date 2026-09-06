import { redirect } from 'next/navigation';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/**
 * Praktis tidak pernah dirender: proxy.ts sudah mengalihkan rute ini ke
 * /admin/dashboard lebih dulu, dengan 307 sungguhan sebelum proses render.
 *
 * Pengalihan itu memang HARUS di proxy. redirect() di sini berjalan dalam
 * konteks streaming (Cache Components), yang membuat Next menyisipkan meta tag
 * alih-alih membalas 307 — dan meta tag itu diabaikan saat navigasi sisi
 * klien, jadi tautan ke halaman ini cuma memutar spinner selamanya.
 *
 * Berkas ini dipertahankan sebagai jaring pengaman supaya rutenya tetap ada
 * kalau daftar pengalihan di proxy pernah meleset.
 */
export default function Page() {
  redirect('/admin/dashboard');
}
