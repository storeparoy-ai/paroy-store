import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

/**
 * Pembatas laju untuk aksi pengunjung tamu (OPS-05).
 *
 * Menghitung per alamat IP, dalam jendela geser, lewat RPC `rate_limit_ok`
 * (migrasi 16). Alamat IP-nya sendiri tidak pernah disimpan — yang masuk
 * database cuma sidik jari SHA-256 bergaram, karena untuk menghitung "berapa
 * kali dalam sepuluh menit" nilai aslinya memang tidak dibutuhkan.
 *
 * Sejauh mana ini menolong, dan sejauh mana tidak:
 *
 *   Menolong: menghentikan orang yang menyetel formulir situs berulang kali,
 *   dan menahan pesanan beruntun yang tidak disengaja.
 *
 *   Tidak menolong: penyerang yang memanggil Supabase langsung dengan kunci
 *   anon melewati berkas ini sepenuhnya — kunci itu memang ada di dalam
 *   browser setiap pengunjung. Alamat IP hanya terlihat oleh server Next.js,
 *   bukan oleh Postgres, jadi pemeriksaan ini tidak bisa dipindahkan ke dalam
 *   RPC-nya. Yang benar-benar tidak bisa dilewati adalah penguncian produk
 *   (`for update` + status `reserved`) dan penjaga pesanan kembar di
 *   create_guest_topup.
 */

/** Garam supaya sidik jari di database tidak bisa dibalik dengan tabel
 * pelangi — ruang seluruh alamat IPv4 cukup kecil untuk dihitung habis. */
const HASH_SALT = 'paroy-store:rate-limit:v1';

export type RateLimitAction = 'order' | 'proof';

const LIMITS: Record<RateLimitAction, { limit: number; windowSeconds: number }> = {
  // Longgar dengan sengaja. Di Indonesia banyak pengunjung berbagi satu
  // alamat IP lewat CGNAT operator seluler dan wifi warnet, jadi angka yang
  // terlalu ketat memblokir pembeli sungguhan sebelum sempat memblokir siapa
  // pun yang niat jahat.
  order: { limit: 8, windowSeconds: 600 },
  proof: { limit: 15, windowSeconds: 600 },
};

async function clientKey(): Promise<string | null> {
  const h = await headers();
  // x-forwarded-for bisa berisi rantai "klien, proxy1, proxy2" — yang pertama
  // adalah klien aslinya.
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || h.get('x-real-ip')?.trim();
  if (!ip) return null;

  return createHash('sha256').update(`${HASH_SALT}:${ip}`).digest('hex');
}

/**
 * `true` kalau aksi ini boleh dilanjutkan.
 *
 * Gagal secara terbuka: kalau IP tidak terbaca atau RPC-nya bermasalah, aksi
 * tetap diizinkan. Menahan pembeli sungguhan karena tabel pembatas laju
 * sedang tidak bisa dihubungi jelas lebih merugikan daripada meloloskan
 * beberapa percobaan spam.
 */
export async function guestRateLimitOk(action: RateLimitAction): Promise<boolean> {
  try {
    const key = await clientKey();
    if (!key) return true;

    const { limit, windowSeconds } = LIMITS[action];
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('rate_limit_ok', {
      p_key: key,
      p_action: action,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) throw error;
    return data !== false;
  } catch (err) {
    console.error('[rateLimit] gagal memeriksa, aksi diteruskan:', err);
    return true;
  }
}

export const RATE_LIMIT_MESSAGE =
  'Terlalu banyak percobaan dari jaringan ini. Tunggu beberapa menit lalu coba lagi — pesanan yang sudah masuk tetap tersimpan.';
