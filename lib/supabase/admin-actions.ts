'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions';
import { requireOwner, requirePermission } from '@/lib/supabase/admin-guard';

type ActionResult = { success: true } | { success: false; error: string };

const ORDER_TABLE: Record<'buy' | 'rental' | 'topup' | 'rekber', string> = {
  buy: 'orders',
  rental: 'orders',
  topup: 'topup_orders',
  rekber: 'rekber_orders',
};


/** Status yang boleh dipakai. Sebelumnya kolom ini menerima teks apa pun,
 * sehingga satu salah ketik cukup untuk membuat sebuah pesanan menghilang
 * dari seluruh hitungan dashboard — perhitungan omzet dan tingkat penyelesaian
 * mencocokkan nilai-nilai ini persis. Daftar ini juga yang menentukan kapan
 * akun dilepas atau ditandai terjual di bawah. */
const ALLOWED_STATUSES = ['pending', 'paid', 'completed', 'rejected', 'cancelled'] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

export async function updateOrderStatusAction(
  kind: 'buy' | 'rental' | 'topup' | 'rekber',
  id: string,
  status: string
): Promise<ActionResult> {
  const guard = await requirePermission('pesanan');
  if (!guard.ok) return { success: false, error: guard.error };

  if (!ALLOWED_STATUSES.includes(status as OrderStatus)) {
    return { success: false, error: `Status "${status}" tidak dikenali.` };
  }

  const { error } = await guard.supabase.from(ORDER_TABLE[kind]).update({ status }).eq('id', id);
  if (error) return { success: false, error: error.message };

  await syncProductAvailability(guard.supabase, kind, id, status as OrderStatus);

  revalidatePath('/admin/pesanan');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

/**
 * Lepaskan atau kunci permanen akun yang terkait sebuah pesanan.
 *
 * Akun dikunci ('reserved') otomatis saat pesanan dibuat — lihat migrasi
 * 00000000000011, yang menutup celah satu akun dipesan dua orang. Yang
 * melepasnya kembali adalah keputusan admin di sini:
 *
 *   ditolak / dibatalkan -> 'active'  (akun kembali dijual)
 *   selesai, beli/rekber -> 'sold'    (akun sudah berpindah tangan)
 *   selesai, sewa        -> 'active'  (masa sewa habis, akun kembali)
 *
 * Top up tidak menyentuh produk sama sekali (tidak ada akun yang terkait).
 * Kegagalan di sini sengaja tidak membatalkan perubahan status pesanan yang
 * sudah tersimpan: admin tetap bisa merapikan status produk dari tab Produk,
 * dan menggagalkan seluruh aksi hanya karena langkah susulan ini akan lebih
 * membingungkan daripada membantu.
 */
async function syncProductAvailability(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kind: 'buy' | 'rental' | 'topup' | 'rekber',
  orderId: string,
  status: OrderStatus
) {
  if (kind === 'topup') return;

  let nextProductStatus: 'active' | 'sold' | null = null;
  if (status === 'rejected' || status === 'cancelled') {
    nextProductStatus = 'active';
  } else if (status === 'completed') {
    nextProductStatus = kind === 'rental' ? 'active' : 'sold';
  }
  if (!nextProductStatus) return;

  const { data: order } = await supabase
    .from(ORDER_TABLE[kind])
    .select('product_id')
    .eq('id', orderId)
    .maybeSingle();

  if (!order?.product_id) return;

  const { error } = await supabase
    .from('products')
    .update({ status: nextProductStatus })
    .eq('id', order.product_id);

  if (error) console.error('[syncProductAvailability] gagal memperbarui status produk:', error);
}

export interface ProductInput {
  title: string;
  /** FK into public.games. */
  gameId: string;
  /** Denormalized game name, kept in sync into the legacy `game` text
   * column so old code paths that still read it as text keep working. */
  gameName: string;
  price: number;
  originalPrice?: number;
  canRental: boolean;
  rentalPriceDaily?: number;
  rentalPriceHourly?: number;
  status: string;
  region: string;
  platform: string[];
  images: string[];
  specs: Record<string, string>;
  isFeatured: boolean;
}

function toRow(input: ProductInput) {
  return {
    title: input.title,
    game_id: input.gameId,
    game: input.gameName,
    price: input.price,
    original_price: input.originalPrice ?? null,
    can_rental: input.canRental,
    rental_price_daily: input.canRental ? (input.rentalPriceDaily ?? null) : null,
    rental_price_hourly: input.canRental ? (input.rentalPriceHourly ?? null) : null,
    status: input.status,
    region: input.region,
    platform: input.platform,
    images: input.images,
    specs: input.specs,
    is_featured: input.isFeatured,
  };
}

export async function createProductAction(input: ProductInput): Promise<ActionResult> {
  const guard = await requirePermission('produk');
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('products').insert(toRow(input));
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/produk');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function updateProductAction(id: string, input: ProductInput): Promise<ActionResult> {
  const guard = await requirePermission('produk');
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('products').update(toRow(input)).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/produk');
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/');
  return { success: true };
}

/**
 * Menghapus produk, dengan satu pengecualian penting.
 *
 * Produk yang pernah dipesan tidak bisa dihapus: Postgres menolaknya demi
 * menjaga riwayat pesanan tetap utuh (foreign key `orders.product_id`), dan
 * sebelumnya penolakan itu muncul apa adanya di layar admin sebagai pesan
 * teknis berbahasa Inggris tanpa penjelasan — produknya tidak terhapus dan
 * tidak jelas kenapa. Sekarang kasus itu ditangani: produknya dinonaktifkan,
 * hilang dari katalog, riwayatnya selamat, dan adminnya diberi tahu apa yang
 * sebenarnya terjadi.
 */
export async function deleteProductAction(
  id: string
): Promise<{ success: true; deactivated?: boolean } | { success: false; error: string }> {
  const guard = await requirePermission('produk');
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('products').delete().eq('id', id);

  // 23503 = foreign key violation: produk ini masih dirujuk sebuah pesanan.
  if (error?.code === '23503') {
    const { error: deactivateError } = await guard.supabase
      .from('products')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (deactivateError) return { success: false, error: deactivateError.message };

    revalidatePath('/admin/produk');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, deactivated: true };
  }

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/produk');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

/**
 * Angkat seseorang jadi admin, atau cabut kembali.
 *
 * Perhatikan `permissions` ikut ditulis di kedua arah, dan itu disengaja:
 *
 *   - Saat diangkat, izinnya dimulai dari NOL. Admin baru belum bisa membuka
 *     apa-apa sampai pemilik mencentang izinnya satu per satu. Kalau nilai
 *     bawaannya "semua", satu klik ceroboh sudah cukup untuk menyerahkan
 *     seluruh dashboard — persis keadaan yang migrasi 19 ingin akhiri.
 *   - Saat dicabut, izinnya dikosongkan. Tanpa ini, izin lama menempel diam
 *     di baris itu dan hidup lagi begitu orangnya diangkat kembali, tanpa
 *     pemilik pernah mencentang apa pun.
 *
 * Role 'owner' sengaja tidak bisa dipilih dari sini — database menolaknya
 * lewat trigger, apa pun yang dikirim aplikasi.
 */
export async function updateUserRoleAction(userId: string, role: 'user' | 'admin'): Promise<ActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from('profiles')
    .update({ role, permissions: [] })
    .eq('id', userId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/pengguna');
  return { success: true };
}

/**
 * Atur izin seorang admin.
 *
 * Nilai yang masuk disaring terhadap daftar yang dikenal sebelum dikirim.
 * Ini Server Action — argumennya datang dari browser dan bisa dipalsukan,
 * jadi memperlakukannya sebagai daftar yang sudah benar berarti mempercayai
 * kiriman klien. Database juga menolaknya lewat CHECK constraint, tapi
 * penolakan di sana muncul sebagai pesan Postgres yang tidak bisa dibaca
 * pemilik toko.
 */
export async function updateUserPermissionsAction(
  userId: string,
  permissions: string[]
): Promise<ActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const clean = ADMIN_PERMISSIONS.filter((p) => permissions.includes(p));

  const { data: target, error: readError } = await guard.supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (readError) return { success: false, error: readError.message };
  if (!target) return { success: false, error: 'Pengguna tidak ditemukan.' };
  if (target.role !== 'admin') {
    return { success: false, error: 'Izin hanya berlaku untuk akun admin. Jadikan admin dulu.' };
  }

  const { error } = await guard.supabase
    .from('profiles')
    .update({ permissions: clean })
    .eq('id', userId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/pengguna');
  return { success: true };
}

/**
 * Hapus akun pengguna sepenuhnya.
 *
 * Seluruh logikanya ada di RPC `admin_delete_user` (migrasi 18), bukan di
 * sini, karena satu-satunya hal yang bisa menghapus baris `auth.users` tanpa
 * service role key adalah fungsi SECURITY DEFINER di dalam database. RPC itu
 * juga yang memutus tautan pesanan dan menolak permintaan yang berbahaya
 * (menghapus diri sendiri, atau menghapus admin lain sebelum status adminnya
 * dicabut) — pemeriksaan di bawah ini hanya lapis pertama demi pesan error
 * yang enak dibaca.
 */
export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const guard = await requireOwner();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.rpc('admin_delete_user', { p_user_id: userId });
  if (error) {
    // Pesan dari RAISE EXCEPTION di dalam fungsi sudah berbahasa Indonesia dan
    // ditujukan untuk admin, jadi diteruskan apa adanya.
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/pesanan');
  revalidatePath('/community');
  return { success: true };
}
