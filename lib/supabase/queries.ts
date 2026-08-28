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
