import { createClient } from '@/utils/supabase/server';
import { mapSupabaseProduct, buildGameLookup, type SupabaseProductRow } from '@/lib/supabase-helpers';
import { getGames } from '@/lib/supabase/queries';
import type { Product } from '@/types';
import type { PriceRange } from '@/lib/utils';

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
  feePercent: number;
  feeFlat: number;
}

export async function getAllPaymentMethodsForAdmin(): Promise<AdminPaymentMethod[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, code, label, account_number, account_name, is_active, sort_order, fee_percent, fee_flat')
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
    feePercent: Number(row.fee_percent ?? 0),
    feeFlat: Number(row.fee_flat ?? 0),
  }));
}

export interface AdminTopupItem {
  id: string;
  gameId: string;
  gameName: string;
  label: string;
  amount: number | null;
  price: number;
  isActive: boolean;
  sortOrder: number;
}

/** Semua item top up, termasuk yang nonaktif (migrasi 00000000000013). */
export async function getAllTopupItemsForAdmin(): Promise<AdminTopupItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('topup_items')
    .select('id, game_id, label, amount, price, is_active, sort_order, games(name)')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[getAllTopupItemsForAdmin] failed (migration applied?):', error);
    return [];
  }
  return (data as Array<Record<string, unknown>>).map((row) => {
    const game = (Array.isArray(row.games) ? row.games[0] : row.games) as { name: string } | null;
    return {
      id: row.id as string,
      gameId: row.game_id as string,
      gameName: game?.name ?? '—',
      label: row.label as string,
      amount: row.amount === null ? null : Number(row.amount),
      price: Number(row.price),
      isActive: Boolean(row.is_active),
      sortOrder: Number(row.sort_order ?? 0),
    };
  });
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

// ---------------------------------------------------------------------------
// Sales Dashboard
//
// Definitions (documented here since they drive every KPI below):
//   - "revenue-counted" order = status is 'paid' or 'completed' — money has
//     actually been received and confirmed by an admin (this is a manual-
//     transfer marketplace: pending -> paid -> completed, see OrdersTable).
//     'pending' hasn't been paid yet; 'rejected'/'cancelled' never will be.
//   - "resolved" order = status is 'paid', 'completed', 'rejected', or
//     'cancelled' — anything admin has actually acted on, i.e. NOT still
//     sitting in 'pending'. Used as the denominator for completion rate so
//     a pile of untouched pending orders doesn't dilute it.
//   - completionRate = completed / resolved (0 when resolved === 0).
// All figures are computed in-memory from getAllOrdersForAdmin() rather than
// with separate SQL aggregations — order volume here is small enough that
// re-using the already-working, already-RLS-safe fetch is simpler and less
// risky than hand-rolling new cross-table SQL.
// ---------------------------------------------------------------------------

const REVENUE_STATUSES = new Set(['paid', 'completed']);
const RESOLVED_STATUSES = new Set(['paid', 'completed', 'rejected', 'cancelled']);

const KIND_LABEL: Record<AdminOrder['kind'], string> = {
  buy: 'Jual Beli Akun',
  topup: 'Top Up Diamond',
  rekber: 'Rekber Escrow',
  rental: 'Rental Akun',
};

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function summarize(orders: AdminOrder[]) {
  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.has(o.status));
  const resolvedOrders = orders.filter((o) => RESOLVED_STATUSES.has(o.status));
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const revenue = revenueOrders.reduce((sum, o) => sum + o.amount, 0);
  return {
    revenue,
    orderCount: revenueOrders.length,
    aov: revenueOrders.length > 0 ? revenue / revenueOrders.length : 0,
    completionRate: resolvedOrders.length > 0 ? (completedCount / resolvedOrders.length) * 100 : 0,
  };
}

/** Percentage change from `prev` to `curr`, or null when `prev` is 0 (no
 * meaningful baseline to compare against — UI shows "—" in that case
 * instead of a nonsensical infinite/undefined percentage). */
function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

export interface SalesTrendPoint {
  date: string; // yyyy-mm-dd
  label: string; // dd/mm, for chart axis
  revenue: number;
  orderCount: number;
  completedCount: number;
  resolvedCount: number;
}

export interface SalesComposition {
  kind: AdminOrder['kind'];
  label: string;
  total: number;
  pct: number;
}

export interface SalesDashboardData {
  revenue: number;
  revenueDeltaPct: number | null;
  orderCount: number;
  orderCountDeltaPct: number | null;
  aov: number;
  aovDeltaPct: number | null;
  completionRate: number;
  completionRateDeltaPp: number | null; // percentage-point delta, not relative %
  trend: SalesTrendPoint[];
  composition: SalesComposition[];
  recentTransactions: AdminOrder[];
}

export async function getSalesDashboardData(): Promise<SalesDashboardData> {
  const orders = await getAllOrdersForAdmin();

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const thisMonthOrders = orders.filter((o) => o.createdAt >= thisMonthStart);
  const lastMonthOrders = orders.filter((o) => o.createdAt >= lastMonthStart && o.createdAt < thisMonthStart);

  const curr = summarize(thisMonthOrders);
  const prev = summarize(lastMonthOrders);

  // 15-day trend, oldest first, local calendar days.
  const todayStart = startOfDay(now);
  const trendStart = addDays(todayStart, -14);
  const trend: SalesTrendPoint[] = Array.from({ length: 15 }, (_, i) => {
    const dayStart = addDays(trendStart, i);
    const dayEnd = addDays(dayStart, 1);
    const dayAllOrders = orders.filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd);
    const dayRevenueOrders = dayAllOrders.filter((o) => REVENUE_STATUSES.has(o.status));
    const dayResolvedOrders = dayAllOrders.filter((o) => RESOLVED_STATUSES.has(o.status));
    return {
      date: dayStart.toISOString().slice(0, 10),
      label: `${String(dayStart.getDate()).padStart(2, '0')}/${String(dayStart.getMonth() + 1).padStart(2, '0')}`,
      revenue: dayRevenueOrders.reduce((sum, o) => sum + o.amount, 0),
      orderCount: dayRevenueOrders.length,
      completedCount: dayAllOrders.filter((o) => o.status === 'completed').length,
      resolvedCount: dayResolvedOrders.length,
    };
  });

  // Composition by order kind, this month, revenue-counted orders only.
  const revenueOrdersThisMonth = thisMonthOrders.filter((o) => REVENUE_STATUSES.has(o.status));
  const totalForComposition = revenueOrdersThisMonth.reduce((sum, o) => sum + o.amount, 0);
  const composition: SalesComposition[] = (['buy', 'topup', 'rekber', 'rental'] as const)
    .map((kind) => {
      const total = revenueOrdersThisMonth.filter((o) => o.kind === kind).reduce((sum, o) => sum + o.amount, 0);
      return {
        kind,
        label: KIND_LABEL[kind],
        total,
        pct: totalForComposition > 0 ? (total / totalForComposition) * 100 : 0,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    revenue: curr.revenue,
    revenueDeltaPct: pctChange(curr.revenue, prev.revenue),
    orderCount: curr.orderCount,
    orderCountDeltaPct: pctChange(curr.orderCount, prev.orderCount),
    aov: curr.aov,
    aovDeltaPct: pctChange(curr.aov, prev.aov),
    completionRate: curr.completionRate,
    completionRateDeltaPp: prev.completionRate === 0 && curr.completionRate === 0 ? null : curr.completionRate - prev.completionRate,
    trend,
    composition,
    recentTransactions: orders.slice(0, 8),
  };
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

export async function getAllPriceRangesForAdmin(): Promise<PriceRange[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_price_ranges')
    .select('id, min_amount, max_amount, sort_order')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[getAllPriceRangesForAdmin] failed (migration applied?):', error);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    minAmount: row.min_amount === null ? null : Number(row.min_amount),
    maxAmount: row.max_amount === null ? null : Number(row.max_amount),
    sortOrder: row.sort_order,
  }));
}

export interface AdminPaymentGatewaySettings {
  provider: string;
  merchantCode: string;
  apiKey: string;
  /** Never rendered back into a plain text input as-is by the form — see
   * PaymentGatewaySettingsForm.tsx, which masks it and only sends a new
   * value to the update action when the admin actually types one. */
  privateKey: string;
  mode: 'sandbox' | 'production';
  isEnabled: boolean;
}

/** Admin-only — RLS on payment_gateway_settings has no public SELECT policy
 * at all (unlike every other CMS table), since this holds a private signing
 * key. Only ever called from an admin-gated page. */
export async function getPaymentGatewaySettings(): Promise<AdminPaymentGatewaySettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payment_gateway_settings')
    .select('provider, merchant_code, api_key, private_key, mode, is_enabled')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) {
    console.error('[getPaymentGatewaySettings] failed (migration applied? are you admin?):', error);
    return { provider: 'tripay', merchantCode: '', apiKey: '', privateKey: '', mode: 'sandbox', isEnabled: false };
  }
  return {
    provider: data.provider,
    merchantCode: data.merchant_code ?? '',
    apiKey: data.api_key ?? '',
    privateKey: data.private_key ?? '',
    mode: data.mode === 'production' ? 'production' : 'sandbox',
    isEnabled: data.is_enabled,
  };
}
