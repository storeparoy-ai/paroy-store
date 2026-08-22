import { Product, GameSlug } from '@/types';

const GAME_INFO: Record<string, { id: string; name: string; icon: string; color: string; slug: GameSlug }> = {
  'MLBB': { id: 'mlbb', name: 'Mobile Legends', icon: '⚡', color: '#3b82f6', slug: 'mlbb' },
  'Free Fire': { id: 'ff', name: 'Free Fire', icon: '🔥', color: '#ef4444', slug: 'ff' },
  'PUBG': { id: 'pubg', name: 'PUBG Mobile', icon: '🎯', color: '#f59e0b', slug: 'pubg' },
  'Valorant': { id: 'valo', name: 'Valorant', icon: '🔫', color: '#ef4444', slug: 'valorant' },
  'Genshin': { id: 'genshin', name: 'Genshin Impact', icon: '✨', color: '#8b5cf6', slug: 'genshin' },
};

export function mapSupabaseProduct(row: any): Product {
  const gameInfo = GAME_INFO[row.game] || { id: row.game, name: row.game, icon: '🎮', color: 'var(--text-primary)', slug: (row.game?.toLowerCase() || 'other') as GameSlug };
  
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    rentalPriceDaily: row.rental_price_daily ? Number(row.rental_price_daily) : undefined,
    canRental: row.can_rental,
    status: row.status as 'active' | 'sold',
    game: gameInfo,
    images: row.images && row.images.length > 0 ? row.images : ['https://placehold.co/600x400/100e0d/2a2a2a?text=No+Image'],
    specs: row.specs || {},
    platform: row.platform || ['Android', 'iOS'],
    region: row.region || 'Global',
    seller: {
      name: row.profiles?.full_name || row.profiles?.username || 'Unknown Seller',
      isVerified: row.profiles?.role === 'admin',
    },
    viewCount: row.view_count || 0,
    createdAt: new Date(row.created_at),
    isFeatured: row.view_count > 1000, // simple heuristic for featured
  };
}
