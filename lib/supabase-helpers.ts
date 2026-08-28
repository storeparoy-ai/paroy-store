import { Product, Game, ProductStatus } from '@/types';

const FALLBACK_GAME: Game = {
  id: 'unknown',
  slug: 'other',
  name: 'Lainnya',
  icon: '🎮',
  color: '#64748b',
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
  game_id?: string | null;
  images: string[] | null;
  specs: Record<string, string | number> | null;
  platform?: string[] | null;
  region?: string | null;
  is_featured?: boolean | null;
  view_count: number | null;
  created_at: string;
  profiles?: { full_name?: string; username?: string; role?: string } | null;
}

/** Built once per request from the real `games` table (see getGames() in
 * lib/supabase/queries.ts) and threaded through instead of a hardcoded
 * lookup, so admin-added/edited games take effect everywhere immediately. */
export interface GameLookup {
  byId: Map<string, Game>;
  byName: Map<string, Game>;
  bySlug: Map<string, Game>;
}

export function buildGameLookup(games: Game[]): GameLookup {
  return {
    byId: new Map(games.map((g) => [g.id, g])),
    byName: new Map(games.map((g) => [g.name, g])),
    bySlug: new Map(games.map((g) => [g.slug, g])),
  };
}

/** Resolve a frontend URL slug (e.g. "mlbb", "ff") to the exact display-name
 * text stored in the legacy `products.game` text column, for filtering old
 * rows that don't have `game_id` set yet. */
export function resolveGameNameFromSlug(slug: string, lookup: GameLookup): string | null {
  return lookup.bySlug.get(slug)?.name ?? null;
}

export function mapSupabaseProduct(row: SupabaseProductRow, lookup: GameLookup): Product {
  const game =
    (row.game_id && lookup.byId.get(row.game_id)) ||
    lookup.byName.get(row.game) ||
    { ...FALLBACK_GAME, name: row.game || FALLBACK_GAME.name };

  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    rentalPriceDaily: row.rental_price_daily ? Number(row.rental_price_daily) : undefined,
    rentalPriceHourly: row.rental_price_hourly ? Number(row.rental_price_hourly) : undefined,
    canRental: row.can_rental,
    status: row.status as ProductStatus,
    game,
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
