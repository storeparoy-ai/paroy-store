import { Product, GameSlug, ProductStatus } from '@/types';

export const GAME_INFO: Record<string, { id: string; name: string; icon: string; color: string; slug: GameSlug }> = {
  'MLBB': { id: 'mlbb', name: 'Mobile Legends', icon: '⚡', color: '#3b82f6', slug: 'mlbb' },
  'Free Fire': { id: 'ff', name: 'Free Fire', icon: '🔥', color: '#ef4444', slug: 'ff' },
  'PUBG': { id: 'pubg', name: 'PUBG Mobile', icon: '🎯', color: '#f59e0b', slug: 'pubg' },
  'Valorant': { id: 'valo', name: 'Valorant', icon: '🔫', color: '#ef4444', slug: 'valorant' },
  'Genshin': { id: 'genshin', name: 'Genshin Impact', icon: '✨', color: '#8b5cf6', slug: 'genshin' },
  'eFootball': { id: 'efootball', name: 'eFootball', icon: '⚽', color: '#22c55e', slug: 'efootball' },
  'COD': { id: 'cod', name: 'COD Mobile', icon: '💥', color: '#6b7280', slug: 'cod' },
};

/** Row shape returned by `select('*')` on public.products (plus an optional joined `profiles`). */
export interface SupabaseProductRow {
  id: string;
  title: string;
  price: number | string;
  original_price?: number | string | null;
  rental_price_daily?: number | string | null;
  rental_price_hourly?: number | string | null;
  can_rental: boolean;
  status: string;
  game: string;
  images: string[] | null;
  specs: Record<string, string | number> | null;
  platform?: string[] | null;
  region?: string | null;
  is_featured?: boolean | null;
  view_count: number | null;
  created_at: string;
  profiles?: { full_name?: string; username?: string; role?: string } | null;
}

/** Resolve a frontend URL slug (e.g. "mlbb", "ff") to the exact display-name
 * text stored in `products.game` (e.g. "MLBB", "Free Fire"), so katalog
 * filters actually match rows instead of silently returning nothing. */
export function resolveGameNameFromSlug(slug: string): string | null {
  const entry = Object.entries(GAME_INFO).find(([, info]) => info.slug === slug);
  return entry ? entry[0] : null;
}

export function mapSupabaseProduct(row: SupabaseProductRow): Product {
  const gameInfo = GAME_INFO[row.game] || {
    id: row.game,
    name: row.game,
    icon: '🎮',
    color: '#64748b',
    slug: (row.game?.toLowerCase() || 'other') as GameSlug,
  };

  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    rentalPriceDaily: row.rental_price_daily ? Number(row.rental_price_daily) : undefined,
    rentalPriceHourly: row.rental_price_hourly ? Number(row.rental_price_hourly) : undefined,
    canRental: row.can_rental,
    status: row.status as ProductStatus,
    game: gameInfo,
    images: row.images && row.images.length > 0 ? row.images : ['https://placehold.co/600x400/100e0d/2a2a2a?text=No+Image'],
    specs: row.specs || {},
    platform: row.platform && row.platform.length > 0 ? row.platform : ['Android', 'iOS'],
    region: row.region || 'Indonesia',
    seller: {
      name: 'Paroy Store',
      isVerified: true,
    },
    viewCount: row.view_count || 0,
    createdAt: new Date(row.created_at),
    isFeatured: row.is_featured ?? (row.view_count ?? 0) > 1000,
  };
}
