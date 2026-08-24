'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Clock, Sparkles } from 'lucide-react';
import { GAMES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru Ditambahkan' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'popular', label: 'Paling Populer' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [showRentalOnly, setShowRentalOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, profiles(full_name, username, role)')
        .eq('status', 'active');
      
      if (data) {
        setProducts(data.map(mapSupabaseProduct));
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedGame !== 'all') {
      list = list.filter((p) => p.game.slug === selectedGame);
    }
    if (showRentalOnly) {
      list = list.filter((p) => p.canRental);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.game.name.toLowerCase().includes(q) ||
          JSON.stringify(p.specs).toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'popular':    list.sort((a, b) => b.viewCount - a.viewCount); break;
      case 'oldest':     list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); break;
      default:           list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return list;
  }, [products, selectedGame, sortBy, search, showRentalOnly]);

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-10 sm:py-14 pb-36 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
              <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
                Katalog Akun <span className="text-gradient-cyan">Semua Game</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
              Temukan akun sultan bergaransi resmi anti hackback, akun joki, dan akun rental siap pakai 24 jam.
            </p>
          </div>

          <span className="text-xs sm:text-sm text-text-muted font-semibold bg-[#0d121f] border border-white/8 px-4 py-2 rounded-xl w-fit">
            Menampilkan <strong className="text-white font-bold">{filtered.length}</strong> produk akun aktif
          </span>
        </div>

        {/* Search, Sort, and Filter Controls Bar */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0d121f] border border-white/8 shadow-lg flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul akun, skin langka, rank, hero, atau spesifikasi..."
              className="input-base pl-11 h-12 text-xs sm:text-sm"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-base h-12 w-full md:w-56 text-xs font-bold cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#111728] text-white font-normal">{o.label}</option>
              ))}
            </select>

            {/* Rental Toggle */}
            <button
              onClick={() => setShowRentalOnly(!showRentalOnly)}
              className={cn(
                'h-12 px-5 sm:px-6 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer shrink-0',
                showRentalOnly
                  ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan shadow-sm'
                  : 'bg-[#141a29] text-text-muted border-white/8 hover:text-white hover:border-white/20'
              )}
            >
              <Clock className="w-4 h-4" />
              <span>Rental Saja</span>
            </button>
          </div>
        </div>

        {/* Game Category Horizontal Chips */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedGame('all')}
            className={cn(
              'px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer',
              selectedGame === 'all'
                ? 'bg-linear-to-r from-brand-cyan to-primary-container text-black font-black border-transparent shadow-[0_0_16px_rgba(0,240,255,0.3)] scale-102'
                : 'bg-[#0d121f] text-text-muted border-white/8 hover:text-white hover:border-white/20'
            )}
          >
            🔥 Semua Game
          </button>
          {GAMES.map((game) => {
            const isActive = selectedGame === game.slug;
            return (
              <button
                key={game.slug}
                onClick={() => setSelectedGame(game.slug)}
                className={cn(
                  'px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2',
                  isActive
                    ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/50 shadow-sm'
                    : 'bg-[#0d121f] text-text-muted border-white/8 hover:text-white hover:border-white/20'
                )}
              >
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </button>
            );
          })}
        </div>

        {/* Product Grid: 6 Columns on Ultrawide */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 rounded-3xl bg-[#0d121f] border border-white/8 flex flex-col items-center justify-center text-center p-6 gap-3 shadow-md">
            <span className="text-5xl">🔍</span>
            <h3 className="font-heading font-black text-xl text-white">Produk Tidak Ditemukan</h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-sm">
              Tidak ada akun yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedGame('all'); setShowRentalOnly(false); }}
              className="btn-cyber text-xs mt-3 px-6 py-2.5"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
