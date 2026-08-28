import { createClient } from '@/utils/supabase/server';
import { mapSupabaseProduct, resolveGameNameFromSlug, type SupabaseProductRow } from '@/lib/supabase-helpers';
import type { FlashSale, Product } from '@/types';

export interface ProductFilters {
  game?: string;
  min?: number;
  max?: number;
  rentalOnly?: boolean;
  sort?: 'terbaru' | 'termurah' | 'termahal' | 'populer';
}

/**
 * Fetch active products from Supabase, applying the same filters the
 * katalog page exposes. Returns `null` (rather than throwing) on any
 * Supabase error so callers can fall back to mock data gracefully.
 */
export async function getActiveProducts(filters: ProductFilters = {}): Promise<Product[] | null> {
  try {
    const supabase = await createClient();
    let query = supabase.from('products').select('*').eq('status', 'active');

    if (filters.game) {
      const gameName = resolveGameNameFromSlug(filters.game);
      query = gameName ? query.eq('game', gameName) : query.ilike('game', `%${filters.game}%`);
    }
    if (filters.min !== undefined) query = query.gte('price', filters.min);
    if (filters.max !== undefined) query = query.lte('price', filters.max);
    if (filters.rentalOnly) query = query.eq('can_rental', true);

    switch (filters.sort) {
      case 'termurah':
        query = query.order('price', { ascending: true });
        break;
      case 'termahal':
        query = query.order('price', { ascending: false });
        break;
      case 'populer':
        query = query.order('view_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as SupabaseProductRow[]).map(mapSupabaseProduct);
  } catch (err) {
    console.error('[getActiveProducts] falling back to mock data:', err);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapSupabaseProduct(data as SupabaseProductRow);
  } catch (err) {
    console.error('[getProductById] lookup failed:', err);
    return null;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[] | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as SupabaseProductRow[]).map(mapSupabaseProduct);
  } catch (err) {
    console.error('[getFeaturedProducts] falling back to mock data:', err);
    return null;
  }
}

export async function getActiveFlashSales(): Promise<FlashSale[] | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*, products(*)')
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true });
    if (error) throw error;

    return (data as Array<Record<string, unknown>>)
      .filter((row) => row.products)
      .map((row) => ({
        id: row.id as string,
        product: mapSupabaseProduct(row.products as SupabaseProductRow),
        salePrice: Number(row.sale_price),
        stock: Number(row.stock),
        sold: Number(row.sold ?? 0),
        startsAt: new Date(row.starts_at as string),
        endsAt: new Date(row.ends_at as string),
      }));
  } catch (err) {
    console.error('[getActiveFlashSales] falling back to mock data:', err);
    return null;
  }
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  total: number;
}

/** Sums COMPLETED orders (buy/rental + topup + rekber) per logged-in user
 * within the period, across all three order tables. Guest orders
 * (buyer_id/user_id/requester_id IS NULL) are excluded — there's no
 * persistent identity to rank them under. */
export async function getLeaderboard(period: 'daily' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const since = new Date();
  if (period === 'daily') since.setHours(0, 0, 0, 0);
  else if (period === 'weekly') since.setDate(since.getDate() - 7);
  else since.setDate(since.getDate() - 30);

  const [buyRes, topupRes, rekberRes] = await Promise.all([
    supabase.from('orders').select('buyer_id, amount').eq('status', 'completed').gte('created_at', since.toISOString()),
    supabase.from('topup_orders').select('user_id, amount').eq('status', 'completed').gte('created_at', since.toISOString()),
    supabase.from('rekber_orders').select('requester_id, amount, fee').eq('status', 'completed').gte('created_at', since.toISOString()),
  ]);

  const totals = new Map<string, number>();
  const add = (id: string | null, amount: number) => {
    if (!id) return;
    totals.set(id, (totals.get(id) ?? 0) + amount);
  };
  (buyRes.data ?? []).forEach((r) => add(r.buyer_id, Number(r.amount)));
  (topupRes.data ?? []).forEach((r) => add(r.user_id, Number(r.amount)));
  (rekberRes.data ?? []).forEach((r) => add(r.requester_id, Number(r.amount) + Number(r.fee ?? 0)));

  if (totals.size === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .in('id', Array.from(totals.keys()));

  return Array.from(totals.entries())
    .map(([userId, total]) => {
      const profile = profiles?.find((p) => p.id === userId);
      return {
        userId,
        name: profile?.full_name || profile?.username || 'Gamer Anonim',
        avatarUrl: profile?.avatar_url ?? null,
        total,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  game: string | null;
  likes: number;
  comments: number;
  createdAt: Date;
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_posts')
    .select('id, content, game, likes, comments, created_at, profiles(full_name, username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[getCommunityPosts] failed:', error);
    return [];
  }

  return data.map((row) => {
    const author = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      authorName: author?.full_name || author?.username || 'Gamer Anonim',
      authorAvatar: author?.avatar_url ?? null,
      content: row.content,
      game: row.game,
      likes: row.likes ?? 0,
      comments: row.comments ?? 0,
      createdAt: new Date(row.created_at),
    };
  });
}

export interface UserOrder {
  id: string;
  kind: 'buy' | 'rental' | 'topup' | 'rekber';
  orderNumber: string;
  itemLabel: string;
  amount: number;
  status: string;
  createdAt: Date;
}

/** A logged-in user's own order history across all three tables. Relies on
 * the existing "auth.uid() = buyer_id/user_id/requester_id" SELECT
 * policies — only returns rows belonging to the current session. */
export async function getUserOrderHistory(): Promise<UserOrder[]> {
  const supabase = await createClient();

  const [buyRes, topupRes, rekberRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, amount, status, mode, note, created_at, products(title)')
      .order('created_at', { ascending: false }),
    supabase
      .from('topup_orders')
      .select('id, order_number, game, item_label, amount, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('rekber_orders')
      .select('id, order_number, item_description, amount, fee, status, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const buyOrders: UserOrder[] = (buyRes.data ?? []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const isRental = row.mode === 'rental';
    return {
      id: row.id,
      kind: isRental ? 'rental' : 'buy',
      orderNumber: row.order_number,
      itemLabel: product?.title ?? row.note ?? 'Pembelian Akun',
      amount: Number(row.amount),
      status: row.status,
      createdAt: new Date(row.created_at),
    };
  });

  const topupOrders: UserOrder[] = (topupRes.data ?? []).map((row) => ({
    id: row.id,
    kind: 'topup',
    orderNumber: row.order_number,
    itemLabel: `${row.game} — ${row.item_label}`,
    amount: Number(row.amount),
    status: row.status,
    createdAt: new Date(row.created_at),
  }));

  const rekberOrders: UserOrder[] = (rekberRes.data ?? []).map((row) => ({
    id: row.id,
    kind: 'rekber',
    orderNumber: row.order_number,
    itemLabel: row.item_description,
    amount: Number(row.amount) + Number(row.fee ?? 0),
    status: row.status,
    createdAt: new Date(row.created_at),
  }));

  return [...buyOrders, ...topupOrders, ...rekberOrders].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/** Whether the current session (if logged in) has this product wishlisted.
 * Always false for guests — no error thrown either way. */
export async function isProductWishlisted(productId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function getUserWishlist(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wishlists')
    .select('products(*)')
    .order('created_at', { ascending: false });

  if (error) {
    // Table may not exist yet if migration 00000000000004 hasn't been applied.
    console.error('[getUserWishlist] failed (migration applied?):', error);
    return [];
  }

  return data
    .map((row) => (Array.isArray(row.products) ? row.products[0] : row.products))
    .filter((p): p is SupabaseProductRow => !!p)
    .map(mapSupabaseProduct);
}

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string | null;
  whatsapp: string | null;
  role: 'user' | 'admin';
}

/** Current auth session + profile, for the Header/nav to render logged-in
 * state. Returns `null` when signed out — never throws. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, whatsapp, role')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? null,
      fullName: profile?.full_name ?? null,
      whatsapp: profile?.whatsapp ?? null,
      role: profile?.role === 'admin' ? 'admin' : 'user',
    };
  } catch (err) {
    console.error('[getCurrentUser] failed:', err);
    return null;
  }
}

/**
 * Public order status lookup, backed by the `get_order_status` SECURITY
 * DEFINER RPC function (see migration 00000000000002). Works for guests —
 * no auth required — and only ever returns the single matching order.
 * Returns `null` if the order isn't found OR if the RPC doesn't exist yet
 * (i.e. the guest-checkout migration hasn't been applied).
 */
export async function getOrderStatus(orderNumber: string): Promise<{
  orderNumber: string;
  kind: 'buy' | 'topup' | 'rekber';
  status: string;
  amount: number;
  itemLabel: string;
  createdAt: Date;
} | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_order_status', { p_order_number: orderNumber });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      orderNumber: row.order_number,
      kind: row.kind,
      status: row.status,
      amount: Number(row.amount),
      itemLabel: row.item_label,
      createdAt: new Date(row.created_at),
    };
  } catch (err) {
    console.error('[getOrderStatus] lookup failed (migration applied?):', err);
    return null;
  }
}
