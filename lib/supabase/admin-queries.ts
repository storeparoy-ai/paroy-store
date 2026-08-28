import { createClient } from '@/utils/supabase/server';
import { mapSupabaseProduct, type SupabaseProductRow } from '@/lib/supabase-helpers';
import type { Product } from '@/types';

export interface AdminOrder {
  id: string;
  kind: 'buy' | 'rental' | 'topup' | 'rekber';
  orderNumber: string;
  buyerName: string | null;
  buyerWhatsapp: string | null;
  itemLabel: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: Date;
}

/** All orders across the three order tables, newest first. Relies on RLS
 * (`role = 'admin'` policies) to actually return cross-user rows — if the
 * caller isn't an admin this silently comes back empty/own-rows-only rather
 * than throwing, so the page itself must still gate access. */
export async function getAllOrdersForAdmin(): Promise<AdminOrder[]> {
  const supabase = await createClient();

  const [buyRes, topupRes, rekberRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, buyer_name, buyer_whatsapp, amount, status, payment_method, mode, note, created_at, products(title)')
      .order('created_at', { ascending: false }),
    supabase
      .from('topup_orders')
      .select('id, order_number, buyer_whatsapp, game, game_user_id, item_label, amount, status, payment_method, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('rekber_orders')
      .select('id, order_number, buyer_name, buyer_whatsapp, item_description, amount, fee, status, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const buyOrders: AdminOrder[] = (buyRes.data ?? []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const isRental = row.mode === 'rental';
    const title = product?.title ?? 'Pembelian Akun';
    return {
      id: row.id,
      kind: isRental ? 'rental' : 'buy',
      orderNumber: row.order_number,
      buyerName: row.buyer_name,
      buyerWhatsapp: row.buyer_whatsapp,
      itemLabel: isRental && row.note ? `${title} — ${row.note}` : title,
      amount: Number(row.amount),
      status: row.status,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at),
    };
  });

  const topupOrders: AdminOrder[] = (topupRes.data ?? []).map((row) => ({
    id: row.id,
    kind: 'topup',
    orderNumber: row.order_number,
    buyerName: null,
    buyerWhatsapp: row.buyer_whatsapp,
    itemLabel: `${row.game} — ${row.item_label} (ID: ${row.game_user_id})`,
    amount: Number(row.amount),
    status: row.status,
    paymentMethod: row.payment_method,
    createdAt: new Date(row.created_at),
  }));

  const rekberOrders: AdminOrder[] = (rekberRes.data ?? []).map((row) => ({
    id: row.id,
    kind: 'rekber',
    orderNumber: row.order_number,
    buyerName: row.buyer_name,
    buyerWhatsapp: row.buyer_whatsapp,
    itemLabel: row.item_description,
    amount: Number(row.amount) + Number(row.fee ?? 0),
    status: row.status,
    paymentMethod: null,
    createdAt: new Date(row.created_at),
  }));

  return [...buyOrders, ...topupOrders, ...rekberOrders].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('[getAllProductsForAdmin] failed:', error);
    return [];
  }
  return (data as SupabaseProductRow[]).map(mapSupabaseProduct);
}

export interface AdminUser {
  id: string;
  fullName: string | null;
  username: string | null;
  whatsapp: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
}

export async function getAllUsersForAdmin(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, whatsapp, role, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[getAllUsersForAdmin] failed:', error);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    whatsapp: row.whatsapp,
    role: row.role === 'admin' ? 'admin' : 'user',
    createdAt: new Date(row.created_at),
  }));
}
