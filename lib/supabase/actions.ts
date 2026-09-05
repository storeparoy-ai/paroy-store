'use server';

import { after } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getOrderStatus, searchProductSuggestions } from '@/lib/supabase/queries';
import { notifyNewOrder, notifyProofUploaded, type OrderKind } from '@/lib/notify';

type ActionResult = { success: true; orderNumber: string } | { success: false; error: string };

/**
 * Kirim notifikasi pesanan baru SETELAH respons dikirim ke pembeli.
 *
 * `after()` (next/server) memakai waitUntil-nya Vercel, jadi pembeli melihat
 * nomor invoice-nya tanpa menunggu perjalanan ke server Telegram. Nominal dan
 * nama item sengaja dibaca ulang dari database, bukan dari input browser —
 * harga memang dihitung server sejak migrasi 10/13, jadi angka yang sampai ke
 * HP admin adalah angka yang benar-benar tersimpan, bukan angka yang dikirim
 * pemesan.
 */
function scheduleOrderNotification(
  orderNumber: string,
  kind: OrderKind,
  buyer: { name?: string | null; whatsapp?: string | null; paymentMethod?: string | null; note?: string | null }
) {
  after(async () => {
    const order = await getOrderStatus(orderNumber);
    await notifyNewOrder({
      kind,
      orderNumber,
      itemLabel: order?.itemLabel ?? 'Pesanan Paroy Store',
      amount: order?.amount ?? 0,
      buyerName: buyer.name,
      buyerWhatsapp: buyer.whatsapp,
      paymentMethod: buyer.paymentMethod,
      note: buyer.note,
    });
  });
}

/**
 * All three actions below create a GUEST order (buyer_id / user_id /
 * requester_id left null) unless the caller happens to have an active
 * Supabase auth session, in which case it's attached automatically.
 *
 * They go through a SECURITY DEFINER RPC (create_guest_order /
 * create_guest_topup / create_guest_rekber, migration
 * `00000000000007_guest_order_rpc.sql`) rather than a plain `.insert()`.
 * Reason: `.insert().select()` asks Postgres to read the new row back
 * (RETURNING), which requires a matching SELECT policy — and the existing
 * "view your own order" SELECT policies never match a guest row (owner_id
 * IS NULL, auth.uid() IS NULL, NULL = NULL is NULL, not true). Broadening
 * those SELECT policies to also allow owner_id IS NULL would let any
 * anonymous visitor list every guest order's buyer name/WhatsApp/amount, not
 * just look up one they already know the invoice number for — so instead
 * the RPC runs with elevated rights internally and returns ONLY the new
 * order_number, the same narrow-exposure pattern get_order_status() already
 * uses for the public "Cek Transaksi" lookup.
 *
 * These will fail (caught below, falling back to a local/simulated flow)
 * until migration `00000000000007_guest_order_rpc.sql` has been applied.
 */

/**
 * Note the absence of an `amount` parameter, here and in createRekberOrder:
 * that is the point. The RPC looks the price up from `products` itself (see
 * migration 00000000000010) — previously the browser sent the amount and
 * Postgres stored it verbatim, so anyone could issue a real invoice for a
 * Rp5.000.000 account reading Rp1.000, without even opening the site.
 */
export async function createBuyOrder(input: {
  productId: string;
  buyerName: string;
  buyerWhatsapp: string;
  paymentMethod: string;
  /** 'rental' for the Rental Akun flow — same `orders` table, distinguished
   * by this column so Admin Pesanan and future reporting can tell them apart. */
  mode?: 'buy' | 'rental';
  /** Free-text detail with no dedicated column yet, e.g. rental duration
   * ("Sewa 3 jam") — shown to admin in the Pesanan list. */
  note?: string;
  /** Rental only — the RPC multiplies the product's own stored rate by this,
   * rather than trusting a total computed in the browser. */
  rentalUnit?: 'hourly' | 'daily';
  rentalQty?: number;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('create_guest_order', {
      p_buyer_name: input.buyerName,
      p_buyer_whatsapp: input.buyerWhatsapp,
      p_product_id: input.productId,
      p_payment_method: input.paymentMethod,
      p_mode: input.mode ?? 'buy',
      p_note: input.note ?? null,
      p_rental_unit: input.rentalUnit ?? null,
      p_rental_qty: input.rentalQty ?? null,
    });

    if (error) throw error;
    const orderNumber = data as string;
    scheduleOrderNotification(orderNumber, input.mode === 'rental' ? 'rental' : 'buy', {
      name: input.buyerName,
      whatsapp: input.buyerWhatsapp,
      paymentMethod: input.paymentMethod,
      note: input.note,
    });
    return { success: true, orderNumber };
  } catch (err) {
    console.error('[createBuyOrder] failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyimpan pesanan' };
  }
}

/** Seperti createBuyOrder: tidak ada parameter `amount`. Sejak migrasi
 * 00000000000013 harga item dan biaya layanan metode pembayaran dua-duanya
 * diambil server dari database — ini penutup terakhir celah harga yang
 * ditemukan pada audit. */
export async function createTopupOrder(input: {
  topupItemId: string;
  gameUserId: string;
  paymentCode: string;
  buyerWhatsapp?: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('create_guest_topup', {
      p_topup_item_id: input.topupItemId,
      p_game_user_id: input.gameUserId,
      p_payment_code: input.paymentCode,
      p_buyer_whatsapp: input.buyerWhatsapp ?? null,
    });

    if (error) throw error;
    const orderNumber = data as string;
    scheduleOrderNotification(orderNumber, 'topup', {
      whatsapp: input.buyerWhatsapp,
      paymentMethod: input.paymentCode,
      note: `ID game: ${input.gameUserId}`,
    });
    return { success: true, orderNumber };
  } catch (err) {
    console.error('[createTopupOrder] failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyimpan pesanan' };
  }
}

/** Client-callable wrapper around the read-only `getOrderStatus` query, so
 * the "Cek Transaksi" client component can invoke it as a Server Action. */
export async function lookupOrderStatusAction(orderNumber: string) {
  return getOrderStatus(orderNumber);
}

/** Dipanggil kotak pencarian di header sambil mengetik. Perlu jadi Server
 * Action karena komponen klien tidak bisa mengimpor queries.ts secara
 * langsung — modul itu menarik klien Supabase sisi server (next/headers). */
export async function searchProductsAction(q: string) {
  return searchProductSuggestions(q);
}

/** `productId` is required now (it used to be optional): the RPC derives both
 * the amount and the rekber fee from it — the fee from the admin-managed tier
 * table — so leaving it out was itself a way around the price check. */
export async function createRekberOrder(input: {
  productId: string;
  itemDescription: string;
  buyerName: string;
  buyerWhatsapp: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('create_guest_rekber', {
      p_buyer_name: input.buyerName,
      p_buyer_whatsapp: input.buyerWhatsapp,
      p_product_id: input.productId,
      p_item_description: input.itemDescription,
    });

    if (error) throw error;
    const orderNumber = data as string;
    scheduleOrderNotification(orderNumber, 'rekber', {
      name: input.buyerName,
      whatsapp: input.buyerWhatsapp,
      note: input.itemDescription,
    });
    return { success: true, orderNumber };
  } catch (err) {
    console.error('[createRekberOrder] failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyimpan pengajuan' };
  }
}

/**
 * Kaitkan berkas bukti transfer yang sudah diunggah ke sebuah pesanan.
 *
 * Berkasnya sendiri diunggah langsung dari browser ke Supabase Storage
 * (lihat `uploadPaymentProof` di lib/supabase/storage.ts), bukan lewat Server
 * Action ini — Server Action punya batas ukuran body sekitar 1MB, sementara
 * foto dari kamera HP rutin 3-5MB, jadi mengirimkannya lewat sini akan gagal
 * persis untuk berkas yang paling sering dipakai orang.
 *
 * Yang menjaga keamanannya bukan action ini, melainkan kebijakan RLS di
 * Storage dan RPC `attach_payment_proof` (migrasi 14): keduanya menolak nomor
 * invoice yang tidak ada atau yang sudah tidak berstatus pending. Anggapannya
 * memang siapa pun bisa memanggil Supabase langsung dengan kunci anon dari
 * browser tanpa melewati situs ini sama sekali.
 */
export async function attachPaymentProofAction(
  orderNumber: string,
  path: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('attach_payment_proof', {
      p_order_number: orderNumber,
      p_path: path,
    });

    if (error) throw error;
    if (data !== true) {
      return {
        success: false,
        error: 'Pesanan tidak ditemukan atau sudah diverifikasi admin, jadi bukti ini tidak dilampirkan.',
      };
    }

    after(() => notifyProofUploaded(orderNumber));
    return { success: true };
  } catch (err) {
    console.error('[attachPaymentProofAction] failed:', err);
    return { success: false, error: 'Bukti gagal dilampirkan. Coba lagi atau hubungi admin lewat WhatsApp.' };
  }
}
