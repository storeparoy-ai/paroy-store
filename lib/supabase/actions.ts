'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrderStatus } from '@/lib/supabase/queries';

type ActionResult = { success: true; orderNumber: string } | { success: false; error: string };

/**
 * All three actions below insert as a GUEST order (buyer_id / user_id /
 * requester_id left null) unless the caller happens to have an active
 * Supabase auth session, in which case it's attached automatically.
 *
 * These will fail with an RLS error until migration
 * `00000000000002_guest_checkout.sql` has been applied to the database —
 * callers should catch `success: false` and fall back to a local/simulated
 * flow rather than surfacing a hard error to the user.
 */

export async function createBuyOrder(input: {
  productId: string;
  amount: number;
  buyerName: string;
  buyerWhatsapp: string;
  paymentMethod: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: user?.id ?? null,
        buyer_name: input.buyerName,
        buyer_whatsapp: input.buyerWhatsapp,
        product_id: input.productId,
        amount: input.amount,
        mode: 'buy',
        status: 'pending',
        payment_method: input.paymentMethod,
      })
      .select('order_number')
      .single();

    if (error) throw error;
    return { success: true, orderNumber: data.order_number };
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('topup_orders')
      .insert({
        user_id: user?.id ?? null,
        buyer_whatsapp: input.buyerWhatsapp ?? null,
        game: input.game,
        game_user_id: input.gameUserId,
        item_label: input.itemLabel,
        amount: input.amount,
        payment_method: input.paymentMethod,
        status: 'pending',
      })
      .select('order_number')
      .single();

    if (error) throw error;
    return { success: true, orderNumber: data.order_number };
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

export async function createRekberOrder(input: {
  productId?: string;
  itemDescription: string;
  amount: number;
  fee: number;
  buyerName: string;
  buyerWhatsapp: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('rekber_orders')
      .insert({
        requester_id: user?.id ?? null,
        buyer_name: input.buyerName,
        buyer_whatsapp: input.buyerWhatsapp,
        product_id: input.productId ?? null,
        item_description: input.itemDescription,
        amount: input.amount,
        fee: input.fee,
        seller_contact: 'Paroy Store (Official)',
        status: 'pending',
      })
      .select('order_number')
      .single();

    if (error) throw error;
    return { success: true, orderNumber: data.order_number };
  } catch (err) {
    console.error('[createRekberOrder] failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menyimpan pengajuan' };
  }
}
