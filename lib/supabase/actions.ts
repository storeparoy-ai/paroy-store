'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrderStatus } from '@/lib/supabase/queries';

type ActionResult = { success: true; orderNumber: string } | { success: false; error: string };

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
    return { success: true, orderNumber: data as string };
  } catch (err) {
    console.error('[createBuyOrder] failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyimpan pesanan' };
  }
}

export async function createTopupOrder(input: {
  game: string;
  gameUserId: string;
  itemLabel: string;
  amount: number;
  paymentMethod: string;
  buyerWhatsapp?: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('create_guest_topup', {
      p_game: input.game,
      p_game_user_id: input.gameUserId,
      p_item_label: input.itemLabel,
      p_amount: input.amount,
      p_payment_method: input.paymentMethod,
      p_buyer_whatsapp: input.buyerWhatsapp ?? null,
    });

    if (error) throw error;
    return { success: true, orderNumber: data as string };
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
    return { success: true, orderNumber: data as string };
  } catch (err) {
    console.error('[createRekberOrder] failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyimpan pengajuan' };
  }
}
