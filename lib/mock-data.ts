import { Game, Product, FlashSale } from '@/types';

export const GAMES: Game[] = [
  { id: '1', slug: 'mlbb', name: 'Mobile Legends', icon: '⚡', color: '#3B82F6' },
  { id: '2', slug: 'ff', name: 'Free Fire', icon: '🔥', color: '#EF4444' },
  { id: '3', slug: 'pubg', name: 'PUBG Mobile', icon: '🎯', color: '#F59E0B' },
  { id: '4', slug: 'efootball', name: 'eFootball', icon: '⚽', color: '#22C55E' },
  { id: '5', slug: 'cod', name: 'COD Mobile', icon: '💥', color: '#6B7280' },
  { id: '6', slug: 'genshin', name: 'Genshin Impact', icon: '🌟', color: '#8B5CF6' },
];

const mlbb = GAMES[0];
const ff = GAMES[1];
const pubg = GAMES[2];
const efootball = GAMES[3];
const genshin = GAMES[5];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Akun MLBB Mythic Glory — 120 Hero 75 Skin',
    game: mlbb,
    price: 450000,
    originalPrice: 600000,
    rentalPriceHourly: 15000,
    rentalPriceDaily: 80000,
    status: 'active',
    isFeatured: true,
    canRental: true,
    images: [
      'https://placehold.co/640x800/1C1917/E8789F?text=MLBB+Mythic',
      'https://placehold.co/640x800/1C1917/3B82F6?text=120+Hero',
    ],
    specs: { rank: 'Mythic Glory', heroes: 120, skins: 75, emblems: 65, winrate: '58%' },
    platform: ['Android', 'iOS'],
    region: 'Indonesia',
    viewCount: 1248,
    createdAt: new Date('2026-08-20'),
  },
  {
    id: '2',
    title: 'Akun Free Fire Heroic — 50 Gun Skin Bundle Lengkap',
    game: ff,
    price: 280000,
    originalPrice: 350000,
    rentalPriceHourly: 10000,
    rentalPriceDaily: 55000,
    status: 'active',
    isFeatured: true,
    canRental: true,
    images: [
      'https://placehold.co/640x800/1C1917/EF4444?text=FF+Heroic',
    ],
    specs: { rank: 'Heroic', gunSkins: 50, characters: 30, pets: 15 },
    platform: ['Android', 'iOS'],
    region: 'Indonesia',
    viewCount: 987,
    createdAt: new Date('2026-08-21'),
  },
  {
    id: '3',
    title: 'Akun MLBB Legend — 85 Hero Full Emblem',
    game: mlbb,
    price: 200000,
    status: 'active',
    isFeatured: false,
    canRental: false,
    images: [
      'https://placehold.co/640x800/1C1917/E8789F?text=MLBB+Legend',
    ],
    specs: { rank: 'Legend', heroes: 85, skins: 42, emblems: 60 },
    platform: ['Android', 'iOS'],
    region: 'Indonesia',
    viewCount: 654,
    createdAt: new Date('2026-08-19'),
  },
  {
    id: '4',
    title: 'Akun PUBG Conqueror Season 30',
    game: pubg,
    price: 320000,
    originalPrice: 400000,
    status: 'active',
    isFeatured: true,
    canRental: false,
    images: [
      'https://placehold.co/640x800/1C1917/F59E0B?text=PUBG+Conqueror',
    ],
    specs: { rank: 'Conqueror', outfits: 60, guns: 45, tier: 'C1S30' },
    platform: ['Android', 'iOS'],
    region: 'Global',
    viewCount: 823,
    createdAt: new Date('2026-08-18'),
  },
  {
    id: '5',
    title: 'Akun eFootball 2500GP — Ronaldo + Messi Full Squad',
    game: efootball,
    price: 175000,
    status: 'active',
    isFeatured: false,
    canRental: false,
    images: [
      'https://placehold.co/640x800/1C1917/22C55E?text=eFootball+Squad',
    ],
    specs: { gp: 2500, rating: '4500+', players: 'Ronaldo Messi Mbappe' },
    platform: ['Android', 'iOS', 'PC'],
    region: 'Global',
    viewCount: 445,
    createdAt: new Date('2026-08-22'),
  },
  {
    id: '6',
    title: 'Akun Genshin Impact AR55 — Raiden + Hu Tao C2',
    game: genshin,
    price: 380000,
    originalPrice: 480000,
    status: 'active',
    isFeatured: true,
    canRental: false,
    images: [
      'https://placehold.co/640x800/1C1917/8B5CF6?text=Genshin+AR55',
    ],
    specs: { ar: 55, primogems: 10000, characters: 45, weapons: 30 },
    platform: ['Android', 'iOS', 'PC'],
    region: 'Global',
    viewCount: 712,
    createdAt: new Date('2026-08-17'),
  },
  {
    id: '7',
    title: 'Akun MLBB Mythic — 100 Hero 60 Skin Murah',
    game: mlbb,
    price: 150000,
    status: 'active',
    isFeatured: false,
    canRental: true,
    rentalPriceDaily: 40000,
    images: [
      'https://placehold.co/640x800/1C1917/E8789F?text=MLBB+Mythic',
    ],
    specs: { rank: 'Mythic', heroes: 100, skins: 60 },
    platform: ['Android'],
    region: 'Indonesia',
    viewCount: 331,
    createdAt: new Date('2026-08-22'),
  },
  {
    id: '8',
    title: 'Akun Free Fire Master — Bundle Rare OB Lama',
    game: ff,
    price: 120000,
    status: 'active',
    isFeatured: false,
    canRental: false,
    images: [
      'https://placehold.co/640x800/1C1917/EF4444?text=FF+Master',
    ],
    specs: { rank: 'Master', gunSkins: 30, bundles: 20 },
    platform: ['Android', 'iOS'],
    region: 'Indonesia',
    viewCount: 289,
    createdAt: new Date('2026-08-21'),
  },
];

export const MOCK_FLASH_SALES: FlashSale[] = [
  {
    id: 'fs1',
    product: MOCK_PRODUCTS[0],
    salePrice: 299000,
    stock: 3,
    sold: 1,
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 jam lagi
  },
  {
    id: 'fs2',
    product: MOCK_PRODUCTS[3],
    salePrice: 199000,
    stock: 5,
    sold: 2,
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
  },
  {
    id: 'fs3',
    product: MOCK_PRODUCTS[5],
    salePrice: 249000,
    stock: 2,
    sold: 1,
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
  },
];

export const PAYMENT_METHODS = [
  { id: 'bca', label: 'Transfer BCA', number: '1234567890', name: 'Paroy Store' },
  { id: 'mandiri', label: 'Transfer Mandiri', number: '0987654321', name: 'Paroy Store' },
  { id: 'gopay', label: 'GoPay', number: '0812-3456-7890', name: 'Paroy Store' },
  { id: 'dana', label: 'DANA', number: '0812-3456-7890', name: 'Paroy Store' },
  { id: 'ovo', label: 'OVO', number: '0812-3456-7890', name: 'Paroy Store' },
];

export const MOCK_ACTIVITIES = [
  { id: 'a1', name: 'Rizky A.', action: 'membeli', item: 'Akun MLBB Mythic Glory', time: '1 mnt lalu' },
  { id: 'a2', name: 'Dinda P.', action: 'top up', item: '514 Diamond Mobile Legends', time: '2 mnt lalu' },
  { id: 'a3', name: 'Fajar S.', action: 'menyewa', item: 'Akun Genshin AR55', time: '3 mnt lalu' },
  { id: 'a4', name: 'Wulan K.', action: 'membeli', item: 'Akun Free Fire Heroic', time: '5 mnt lalu' },
  { id: 'a5', name: 'Bagas T.', action: 'mengajukan rekber', item: 'Akun PUBG Conqueror', time: '6 mnt lalu' },
  { id: 'a6', name: 'Sarah M.', action: 'top up', item: '1412 Diamond Mobile Legends', time: '8 mnt lalu' },
];

export const TOPUP_ITEMS = [
  {
    game: mlbb,
    items: [
      { id: 't1', label: '86 💎 Diamond', amount: 86, price: 20000 },
      { id: 't2', label: '172 💎 Diamond', amount: 172, price: 39000 },
      { id: 't3', label: '257 💎 Diamond', amount: 257, price: 55000 },
      { id: 't4', label: '344 💎 Diamond', amount: 344, price: 73000 },
      { id: 't5', label: '514 💎 Diamond', amount: 514, price: 108000 },
      { id: 't6', label: '706 💎 Diamond', amount: 706, price: 148000 },
      { id: 't7', label: '1412 💎 Diamond', amount: 1412, price: 289000 },
      { id: 't8', label: '2195 💎 Diamond', amount: 2195, price: 449000 },
    ],
  },
  {
    game: ff,
    items: [
      { id: 'f1', label: '70 💎 Diamond', amount: 70, price: 15000 },
      { id: 'f2', label: '140 💎 Diamond', amount: 140, price: 29000 },
      { id: 'f3', label: '355 💎 Diamond', amount: 355, price: 73000 },
      { id: 'f4', label: '720 💎 Diamond', amount: 720, price: 148000 },
      { id: 'f5', label: '1450 💎 Diamond', amount: 1450, price: 289000 },
      { id: 'f6', label: '3625 💎 Diamond', amount: 3625, price: 710000 },
    ],
  },
  {
    game: pubg,
    items: [
      { id: 'p1', label: '60 UC', amount: 60, price: 15000 },
      { id: 'p2', label: '325 UC', amount: 325, price: 73000 },
      { id: 'p3', label: '660 UC', amount: 660, price: 148000 },
      { id: 'p4', label: '1800 UC', amount: 1800, price: 389000 },
      { id: 'p5', label: '3850 UC', amount: 3850, price: 789000 },
    ],
  },
];
