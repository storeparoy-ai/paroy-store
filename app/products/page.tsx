'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'popular', label: 'Terpopuler' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [showRentalOnly, setShowRentalOnly] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

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
  }, [selectedGame, sortBy, search, showRentalOnly]);

  const activeFilters = (selectedGame !== 'all' ? 1 : 0) + (showRentalOnly ? 1 : 0);

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-24 min-h-screen flex flex-col">
        <div className="max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 flex-1 flex flex-col">

          {/* Page title */}
          <div className="mb-4">
            <h1 className="font-bold font-heading text-xl" style={{ color: 'var(--text-primary)' }}>
              🎮 Semua Produk
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} produk tersedia
            </p>
          </div>

          {/* Search + filter bar */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="input-base pl-9 h-10"
                aria-label="Cari produk"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-base h-10 w-auto pr-8 cursor-pointer text-xs"
              style={{ minWidth: '120px' }}
              aria-label="Urutkan"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              aria-label="Filter"
              className={cn(
                'relative h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                showFilter
                  ? 'bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.4)]'
                  : 'border border-[var(--border-default)] bg-[var(--surface-card)]'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" style={{ color: showFilter ? 'var(--primary-400)' : 'var(--text-muted)' }} />
              {activeFilters > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ background: 'var(--primary-400)' }}
                >
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Expandable filters */}
          {showFilter && (
            <div
              className="glass p-3 mb-3 flex flex-wrap gap-2 animate-slide-up"
            >
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showRentalOnly}
                  onChange={(e) => setShowRentalOnly(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: 'var(--primary-400)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>⏱ Rental only</span>
              </label>
              {activeFilters > 0 && (
                <button
                  onClick={() => { setSelectedGame('all'); setShowRentalOnly(false); }}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <X className="w-3 h-3" /> Reset filter
                </button>
              )}
            </div>
          )}

          {/* Game tabs (horizontal scroll) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
            <button
              onClick={() => setSelectedGame('all')}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedGame === 'all'
                  ? 'text-white'
                  : 'border border-[var(--border-default)]'
              )}
              style={
                selectedGame === 'all'
                  ? { background: 'linear-gradient(135deg, var(--primary-400), var(--accent-purple))', color: 'white' }
                  : { color: 'var(--text-muted)', background: 'var(--surface-card)' }
              }
            >
              🎮 Semua
            </button>
            {GAMES.map((game) => {
              const isActive = selectedGame === game.slug;
              return (
                <button
                  key={game.slug}
                  onClick={() => setSelectedGame(game.slug)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  style={{
                    background: isActive ? `${game.color}22` : 'var(--surface-card)',
                    borderColor: isActive ? `${game.color}66` : 'var(--border-default)',
                    color: isActive ? game.color : 'var(--text-muted)',
                  }}
                >
                  {game.icon} {game.name}
                </button>
              );
            })}
          </div>

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {filtered.map((product, i) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
              <span className="text-6xl">🎮</span>
              <div className="text-center">
                <p className="font-semibold font-heading" style={{ color: 'var(--text-primary)' }}>
                  Produk tidak ditemukan
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
              <button
                onClick={() => { setSearch(''); setSelectedGame('all'); setShowRentalOnly(false); }}
                className="btn-secondary text-sm"
              >
                Reset Semua
              </button>
            </div>
          )}
        </div>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
