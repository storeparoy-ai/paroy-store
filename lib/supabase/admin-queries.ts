import { createClient } from '@/utils/supabase/server';
import { mapSupabaseProduct, buildGameLookup, type SupabaseProductRow } from '@/lib/supabase-helpers';
import { getGames } from '@/lib/supabase/queries';
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
  const [{ data, error }, games] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    getGames(),
  ]);
  if (error) {
    console.error('[getAllProductsForAdmin] failed:', error);
    return [];
  }
  const lookup = buildGameLookup(games);
  return (data as SupabaseProductRow[]).map((row) => mapSupabaseProduct(row, lookup));
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

export interface AdminGame {
  id: string;
  slug: string;
  name: string;
  icon: string;
  iconUrl: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export async function getAllGamesForAdmin(): Promise<AdminGame[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('id, slug, name, icon, icon_url, color, sort_order, is_active')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[getAllGamesForAdmin] failed (migration applied?):', error);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon || '',
    iconUrl: row.icon_url,
    color: row.color,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export interface AdminPaymentMethod {
  id: string;
  code: string;
  label: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  sortOrder: number;
}

export async function getAllPaymentMethodsForAdmin(): Promise<AdminPaymentMethod[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, code, label, account_number, account_name, is_active, sort_order')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[getAllPaymentMethodsForAdmin] failed (migration applied?):', error);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    code: row.code,
    label: row.label,
    accountNumber: row.account_number,
    accountName: row.account_name,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }));
}

export interface AdminFlashSale {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  sold: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  /** Computed once here (server-side, at fetch time) rather than in the
   * client table — comparing against `Date.now()` during a client render
   * is an impure call React flags, and deferring it to an effect just
   * trades that for a different lint error. This is plain fetched data
   * instead, no live re-computation needed for an admin listing. */
  isExpired: boolean;
}

export async function getAllFlashSalesForAdmin(): Promise<AdminFlashSale[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('flash_sales')
    .select('id, product_id, sale_price, stock, sold, starts_at, ends_at, is_active, products(title, price, images)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[getAllFlashSalesForAdmin] failed:', error);
    return [];
  }
  const now = Date.now();
  return data
    .filter((row) => row.products)
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      const endsAt = new Date(row.ends_at);
      return {
        id: row.id,
        productId: row.product_id,
        productTitle: product?.title ?? 'Produk tidak ditemukan',
        productImage: product?.images?.[0] ?? 'https://placehold.co/200x150/100e0d/2a2a2a?text=No+Image',
        originalPrice: Number(product?.price ?? 0),
        salePrice: Number(row.sale_price),
        stock: row.stock,
        sold: row.sold,
        startsAt: new Date(row.starts_at),
        endsAt,
        isActive: row.is_active,
        isExpired: endsAt.getTime() < now,
      };
    });
}

export interface AdminRekberFeeTier {
  id: string;
  maxAmount: number | null;
  fee: number;
  sortOrder: number;
}

export async function getAllRekberFeeTiersForAdmin(): Promise<AdminRekberFeeTier[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rekber_fee_tiers')
    .select('id, max_amount, fee, sort_order')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[getAllRekberFeeTiersForAdmin] failed (migration applied?):', error);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    maxAmount: row.max_amount === null ? null : Number(row.max_amount),
    fee: Number(row.fee),
    sortOrder: row.sort_order,
  }));
}
