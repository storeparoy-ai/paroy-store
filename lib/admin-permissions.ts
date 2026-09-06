/**
 * Peta izin dashboard admin — satu sumber kebenaran untuk proxy, menu, dan
 * halaman Pengguna.
 *
 * PENTING: berkas ini TIDAK mengamankan apa pun. Menyembunyikan tab dan
 * memantulkan URL cuma kerapian tampilan; yang benar-benar menolak adalah
 * kebijakan RLS di migrasi 19, yang berlaku juga saat seseorang memanggil
 * Supabase langsung dengan kunci publik tanpa lewat situs sama sekali.
 * Kalau daftar di sini dan kebijakan di sana berbeda, YANG BERLAKU ADALAH
 * DATABASE — jadi keduanya harus diubah bersamaan.
 */

export const ADMIN_PERMISSIONS = ['pesanan', 'produk', 'katalog', 'komunitas'] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

/** Label dan penjelasan untuk kotak centang di halaman Pengguna. Ditulis dari
 * sisi orang yang akan diberi izin, bukan dari sisi nama tabel. */
export const PERMISSION_LABELS: Record<AdminPermission, { label: string; hint: string }> = {
  pesanan: {
    label: 'Pesanan',
    hint: 'Melihat & memproses pesanan, membuka bukti transfer, melihat ringkasan penjualan. Termasuk nama & nomor WhatsApp pembeli.',
  },
  produk: {
    label: 'Produk',
    hint: 'Menambah, mengubah, dan menghapus akun yang dijual.',
  },
  katalog: {
    label: 'Katalog & Harga',
    hint: 'Item Top Up, Kategori Game, Rentang Harga, Flash Sale, dan Tarif Rekber.',
  },
  komunitas: {
    label: 'Moderasi Komunitas',
    hint: 'Menghapus postingan dan komentar yang melanggar.',
  },
};

/**
 * Izin yang dibutuhkan tiap rute admin. Rute yang TIDAK ada di sini hanya
 * untuk pemilik — daftar ini sengaja memakai pola "yang tidak disebut berarti
 * dilarang", bukan sebaliknya: menambah halaman admin baru dan lupa
 * mendaftarkannya berakhir sebagai halaman yang terlalu ketat (owner saja),
 * bukan halaman yang bocor ke semua admin.
 */
const ROUTE_PERMISSIONS: Record<string, AdminPermission> = {
  '/admin/dashboard': 'pesanan',
  '/admin/pesanan': 'pesanan',
  '/admin/produk': 'produk',
  '/admin/topup': 'katalog',
  '/admin/kategori-game': 'katalog',
  '/admin/rentang-harga': 'katalog',
  '/admin/flash-sale': 'katalog',
  '/admin/tarif-rekber': 'katalog',
};

export type AdminRole = 'user' | 'admin' | 'owner';

export interface AdminAccess {
  role: AdminRole;
  permissions: string[];
}

export function isOwner(access: AdminAccess | null | undefined): boolean {
  return access?.role === 'owner';
}

/** Owner selalu boleh; admin hanya kalau izinnya diberikan. */
export function can(access: AdminAccess | null | undefined, permission: AdminPermission): boolean {
  if (!access) return false;
  if (access.role === 'owner') return true;
  return access.role === 'admin' && access.permissions.includes(permission);
}

/** Boleh membuka path admin ini? Path di luar daftar = pemilik saja. */
export function canOpenAdminPath(access: AdminAccess | null | undefined, pathname: string): boolean {
  if (!access || (access.role !== 'admin' && access.role !== 'owner')) return false;
  if (access.role === 'owner') return true;

  const required = ROUTE_PERMISSIONS[pathname];
  return required ? can(access, required) : false;
}

/**
 * Halaman pertama yang boleh dibuka orang ini — tujuan pengalihan dari
 * `/admin`, dan tempat mendarat saat sebuah tab ditolak.
 *
 * Mengembalikan null untuk admin yang belum diberi izin apa pun. Itu keadaan
 * yang wajar (baru diangkat, kotak centangnya belum diisi) dan harus terlihat
 * jelas, bukan berakhir sebagai pantulan tanpa ujung antar-halaman admin.
 */
export function firstAllowedAdminPath(access: AdminAccess | null | undefined): string | null {
  if (isOwner(access)) return '/admin/dashboard';
  if (access?.role !== 'admin') return null;

  for (const [path, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (can(access, permission)) return path;
  }
  return null;
}
