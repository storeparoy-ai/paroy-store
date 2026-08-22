export type GameSlug = 'mlbb' | 'ff' | 'pubg' | 'efootball' | 'cod' | 'genshin' | 'valorant' | 'other';
export type ProductStatus = 'pending' | 'active' | 'reserved' | 'sold' | 'inactive';
export type OrderStatus = 'pending' | 'paid' | 'approved' | 'completed' | 'rejected' | 'cancelled';
export type UserRole = 'user' | 'admin';

export interface Game {
  id: string;
  slug: GameSlug;
  name: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  title: string;
  game: Game;
  price: number;
  originalPrice?: number;
  rentalPriceHourly?: number;
  rentalPriceDaily?: number;
  status: ProductStatus;
  isFeatured: boolean;
  canRental: boolean;
  images: string[];
  seller?: { name: string; isVerified: boolean; avatar?: string };
  specs: Record<string, string | number>;
  platform: string[];
  region: string;
  viewCount: number;
  createdAt: Date;
}

export interface FlashSale {
  id: string;
  product: Product;
  salePrice: number;
  stock: number;
  sold: number;
  startsAt: Date;
  endsAt: Date;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  whatsapp?: string;
  role: UserRole;
}
