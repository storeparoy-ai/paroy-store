import { createClient } from '@/utils/supabase/server';
import {
  mapSupabaseProduct,
  buildGameLookup,
  resolveGameNameFromSlug,
  type SupabaseProductRow,
  type GameLookup,
} from '@/lib/supabase-helpers';
import { GAMES as MOCK_GAMES } from '@/lib/mock-data';
import type { RekberFeeTier, PriceRange } from '@/lib/utils';
import type { FlashSale, Game, Product } from '@/types';

export interface ProductFilters {
  game?: string;
  min?: number;
  max?: number;
  rentalOnly?: boolean;
  sort?: 'terbaru' | 'termurah' | 'termahal' | 'populer';
}

/** Admin-managed game list (see migration 00000000000005). Falls back to
 * the hardcoded mock list if the table is empty/unreachable (e.g. that
 * migration hasn't been applied yet) so nothing ever renders blank. */
export async function getGames(): Promise<Game[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .select('id, slug, name, icon, icon_url, color')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return MOCK_GAMES;
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      icon: row.icon || '🎮',
      iconUrl: row.icon_url,
      color: row.color,
    }));
  } catch (err) {
    console.error('[getGames] falling back to mock data:', err);
    return MOCK_GAMES;
  }
}

async function getGameLookup(): Promise<GameLookup> {
  return buildGameLookup(await getGames());
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  mascotImageUrl: string | null;
  whatsappUrl: string | null;
  discordUrl: string | null;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Paroy Store',
  tagline: 'Marketplace gaming all-in-one',
  mascotImageUrl: null,
  whatsappUrl: null,
  discordUrl: null,
};

/** Admin-editable branding (site name, tagline, homepage mascot image,
 * community links) — see migration 00000000000005. Falls back to sane
 * defaults if the table/migration isn't there yet. */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('site_name, tagline, mascot_image_url, whatsapp_url, discord_url')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return DEFAULT_SITE_SETTINGS;
    return {
      siteName: data.site_name || DEFAULT_SITE_SETTINGS.siteName,
      tagline: data.tagline || DEFAULT_SITE_SETTINGS.tagline,
      mascotImageUrl: data.mascot_image_url,
      whatsappUrl: data.whatsapp_url,
      discordUrl: data.discord_url,
    };
  } catch (err) {
    console.error('[getSiteSettings] falling back to defaults:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export interface PaymentMethod {
  id: string;
  code: string;
  label: string;
  accountNumber: string;
  accountName: string;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bca', code: 'bca', label: 'Transfer BCA', accountNumber: '1234567890', accountName: 'Paroy Store' },
  { id: 'mandiri', code: 'mandiri', label: 'Transfer Mandiri', accountNumber: '0987654321', accountName: 'Paroy Store' },
  { id: 'gopay', code: 'gopay', label: 'GoPay', accountNumber: '0812-3456-7890', accountName: 'Paroy Store' },
  { id: 'dana', code: 'dana', label: 'DANA', accountNumber: '0812-3456-7890', accountName: 'Paroy Store' },
  { id: 'ovo', code: 'ovo', label: 'OVO', accountNumber: '0812-3456-7890', accountName: 'Paroy Store' },
];

/** Admin-editable payment methods (see migration 00000000000005). Falls
 * back to the previously-hardcoded list if the table is empty/unreachable. */
export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('payment_methods')
      .select('id, code, label, account_number, account_name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return MOCK_PAYMENT_METHODS;
    return data.map((row) => ({
      id: row.id,
      code: row.code,
      label: row.label,
      accountNumber: row.account_number,
      accountName: row.account_name,
    }));
  } catch (err) {
    console.error('[getActivePaymentMethods] falling back to mock data:', err);
    return MOCK_PAYMENT_METHODS;
  }
}

const MOCK_REKBER_FEE_TIERS: RekberFeeTier[] = [
  { id: 't1', maxAmount: 100_000, fee: 5_000 },
  { id: 't2', maxAmount: 500_000, fee: 10_000 },
  { id: 't3', maxAmount: 1_000_000, fee: 20_000 },
  { id: 't4', maxAmount: 5_000_000, fee: 35_000 },
  { id: 't5', maxAmount: null, fee: 50_000 },
];

/** Admin-editable rekber fee tiers (see migration 00000000000005). Falls
 * back to the previously-hardcoded tiers if the table is empty/unreachable.
 * The RekberFeeTier type and the pure calculateRekberFeeFromTiers() helper
 * live in lib/utils.ts, not here — this module imports the server-only
 * Supabase client, and a 'use client' component importing anything from it
 * (even a pure helper) would pull the whole module graph into the client
 * bundle and break the build. */
export async function getRekberFeeTiers(): Promise<RekberFeeTier[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rekber_fee_tiers')
      .select('id, max_amount, fee')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return MOCK_REKBER_FEE_TIERS;
    return data.map((row) => ({
      id: row.id,
      maxAmount: row.max_amount === null ? null : Number(row.max_amount),
      fee: Number(row.fee),
    }));
  } catch (err) {
    console.error('[getRekberFeeTiers] falling back to mock data:', err);
    return MOCK_REKBER_FEE_TIERS;
  }
}

const MOCK_PRICE_RANGES: PriceRange[] = [
  { id: 'r1', minAmount: null, maxAmount: 200_000, sortOrder: 1 },
  { id: 'r2', minAmount: 200_000, maxAmount: 400_000, sortOrder: 2 },
  { id: 'r3', minAmount: 400_000, maxAmount: 600_000, sortOrder: 3 },
  { id: 'r4', minAmount: 600_000, maxAmount: null, sortOrder: 4 },
];

/** Admin-editable price-range filter chips on /products (see migration
 * 00000000000006). Falls back to the previously-hardcoded ranges if the
 * table is empty/unreachable. Labels are NOT stored — both this and the
 * admin table derive them from min/max via formatPriceRangeLabel() in
 * lib/utils.ts, so they can never drift out of sync. */
export async function getPriceRanges(): Promise<PriceRange[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_price_ranges')
      .select('id, min_amount, max_amount, sort_order')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return MOCK_PRICE_RANGES;
    return data.map((row) => ({
      id: row.id,
      minAmount: row.min_amount === null ? null : Number(row.min_amount),
      maxAmount: row.max_amount === null ? null : Number(row.max_amount),
      sortOrder: row.sort_order,
    }));
  } catch (err) {
    console.error('[getPriceRanges] falling back to mock data:', err);
    return MOCK_PRICE_RANGES;
  }
}

/**
 * Fetch active products from Supabase, applying the same filters the
 * katalog page exposes. Returns `null` (rather than throwing) on any
 * Supabase error so callers can fall back to mock data gracefully.
 */
export async function getActiveProducts(filters: ProductFilters = {}): Promise<Product[] | null> {
  try {
    const supabase = await createClient();
    const lookup = await getGameLookup();
    let query = supabase.from('products').select('*').eq('status', 'active');

    if (filters.game) {
      const gameName = resolveGameNameFromSlug(filters.game, lookup);
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
    return (data as SupabaseProductRow[]).map((row) => mapSupabaseProduct(row, lookup));
  } catch (err) {
    console.error('[getActiveProducts] falling back to mock data:', err);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const [{ data, error }, lookup] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).maybeSingle(),
      getGameLookup(),
    ]);
    if (error) throw error;
    if (!data) return null;
    return mapSupabaseProduct(data as SupabaseProductRow, lookup);
  } catch (err) {
    console.error('[getProductById] lookup failed:', err);
    return null;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[] | null> {
  try {
    const supabase = await createClient();
    const [{ data, error }, lookup] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit),
      getGameLookup(),
    ]);
    if (error) throw error;
    return (data as SupabaseProductRow[]).map((row) => mapSupabaseProduct(row, lookup));
  } catch (err) {
    console.error('[getFeaturedProducts] falling back to mock data:', err);
    return null;
  }
}

export async function getActiveFlashSales(): Promise<FlashSale[] | null> {
  try {
    const supabase = await createClient();
    const [{ data, error }, lookup] = await Promise.all([
      supabase
        .from('flash_sales')
        .select('*, products(*)')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true }),
      getGameLookup(),
    ]);
    if (error) throw error;

    return (data as Array<Record<string, unknown>>)
      .filter((row) => row.products)
      .map((row) => ({
        id: row.id as string,
        product: mapSupabaseProduct(row.products as SupabaseProductRow, lookup),
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
  const [{ data, error }, lookup] = await Promise.all([
    supabase.from('wishlists').select('products(*)').order('created_at', { ascending: false }),
    getGameLookup(),
  ]);

  if (error) {
    // Table may not exist yet if migration 00000000000004 hasn't been applied.
    console.error('[getUserWishlist] failed (migration applied?):', error);
    return [];
  }

  return data
    .map((row) => (Array.isArray(row.products) ? row.products[0] : row.products))
    .filter((p): p is SupabaseProductRow => !!p)
    .map((row) => mapSupabaseProduct(row, lookup));
}

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string | null;
  whatsapp: string | null;
  role: 'user' | 'admin';
}

/** Current auth session + profile — the SECURE variant: `auth.getUser()`
 * revalidates over the network against Supabase Auth on every call (catches
 * a revoked/banned session even if the local cookie still looks valid).
 * Use this specifically where that guarantee matters — admin/profile layout
 * gating (defense-in-depth alongside proxy.ts's own check), anywhere a
 * result feeds an authorization decision. For display-only "is someone
 * logged in" UI (the Header, a wishlist heart's initial state, ...), use
 * getCurrentUserForDisplay() instead — the network round-trip this makes on
 * every call is real cost you don't want to pay on every single page view
 * just to decide whether to show a "Masuk" button. Returns `null` when
 * signed out — never throws. */
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

/** Fast variant for display-only UI (the root layout's Header, wishlist
 * heart initial state, ...) — reads the session from the local cookie via
 * `getSession()` instead of `getUser()`, so it's a local JWT check with NO
 * network round-trip to Supabase. Trade-off: doesn't detect a
 * revoked/deleted/banned account until the user's next action that goes
 * through a real auth check (proxy.ts middleware for /admin & /profile,
 * requireAdmin() for admin mutations, RLS for everything else) — entirely
 * fine for "should the header show Login or a profile menu", never used
 * for an actual authorization decision. This runs on every single page via
 * the root layout, so avoiding the getUser() network cost here is the
 * highest-leverage place to do it. */
export async function getCurrentUserForDisplay(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
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
    console.error('[getCurrentUserForDisplay] failed:', err);
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
