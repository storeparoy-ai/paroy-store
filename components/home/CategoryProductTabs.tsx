'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, LayoutGrid, Zap, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { CoverflowCarousel, CoverflowSlide } from '@/components/ui/coverflow-carousel';
import { cn, formatCurrency } from '@/lib/utils';

interface CategoryProductTabsProps {
  initialProducts: Product[];
}

const CATEGORIES = [
  { id: 'all', label: '🔥 Semua Produk', slug: 'all' },
  { id: 'mlbb', label: '⚡ Mobile Legends', slug: 'mlbb' },
  { id: 'ff', label: '🔥 Free Fire', slug: 'ff' },
  { id: 'pubg', label: '🎯 PUBG Mobile', slug: 'pubg' },
  { id: 'genshin', label: '🌟 Genshin Impact', slug: 'genshin' },
  { id: 'efootball', label: '⚽ eFootball', slug: 'efootball' },
];

const MODES = [
  { id: 'all', label: 'Semua Tipe' },
  { id: 'buy', label: '🛒 Jual Akun' },
  { id: 'rental', label: '⏱ Rental Akun' },
];

export default function CategoryProductTabs({ initialProducts }: CategoryProductTabsProps) {
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');

  const filteredProducts = initialProducts.filter((p) => {
    const matchGame = selectedGame === 'all' || p.game.slug === selectedGame;
    const matchMode =
      selectedMode === 'all' ||
      (selectedMode === 'rental' && p.canRental) ||
      (selectedMode === 'buy' && !p.canRental);
    return matchGame && matchMode;
  });

  const slides: CoverflowSlide[] = filteredProducts.map((p) => ({
    src: p.images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    alt: p.title,
    title: p.title,
    subtitle: `${p.game.name} • ${p.specs?.rank || p.specs?.level || 'Verified'}`,
    badge: p.canRental ? '⏱ RENTAL READY' : '💎 AKUN SULTAN',
    price: formatCurrency(p.price),
    originalPrice: p.originalPrice ? formatCurrency(p.originalPrice) : undefined,
    href: `/products/${p.id}`,
    ctaText: p.canRental ? 'Sewa Akun Ini →' : 'Beli Akun Ini →',
  }));

  return (
    <section className="relative">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
            <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
              Katalog Akun <span className="text-gradient-cyan">& Marketplace</span>
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Akun sultan bergaransi resmi, siap main, dan ready rental
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dual View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-bg-card border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('3d')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                viewMode === '3d'
                  ? 'bg-brand-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-text-muted hover:text-white'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Showcase</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-brand-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-text-muted hover:text-white'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          <Link
            href="/products"
            className="group hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-cyan hover:underline"
          >
            <span>Semua Katalog</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Game Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedGame(cat.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border',
              selectedGame === cat.id
                ? 'bg-linear-to-r from-brand-cyan to-primary-container text-bg-deep border-transparent shadow-[0_0_16px_rgba(0,240,255,0.35)] scale-102 font-black'
                : 'bg-bg-card text-text-muted border-white/8 hover:text-white hover:border-white/20'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mode Sub-Filter (Buy vs Rental) */}
      <div className="flex items-center justify-between gap-3 mb-6 p-2 rounded-xl bg-bg-base border border-white/5">
        <div className="flex items-center gap-1.5">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                selectedMode === mode.id
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-text-dim hover:text-text-muted'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-text-dim font-medium hidden sm:block">
          Menampilkan <span className="text-white font-bold">{filteredProducts.length}</span> produk
        </span>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 rounded-3xl bg-bg-card/50 border border-white/5 flex flex-col items-center justify-center text-center p-6 gap-3">
          <span className="text-4xl">🎮</span>
          <h3 className="font-heading font-bold text-base text-white">Belum Ada Produk di Kategori Ini</h3>
          <p className="text-xs text-text-muted max-w-sm">Coba pilih kategori game lain atau hubungi admin untuk request akun impianmu.</p>
          <button
            onClick={() => { setSelectedGame('all'); setSelectedMode('all'); }}
            className="btn-secondary text-xs mt-2"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === '3d' ? (
        /* 3D Coverflow Mode */
        <div className="relative rounded-3xl bg-bg-card/40 border border-white/8 p-4 sm:p-6 overflow-hidden">
          <CoverflowCarousel
            slides={slides}
            cardWidth="clamp(250px, 28vw, 340px)"
            showNavigation={true}
            showPagination={true}
            showCaption={false}
            renderCustomCard={(slide, index, isSelected) => {
              const product = filteredProducts[index] || filteredProducts[0];
              const rankVal = product.specs?.rank || product.specs?.level || 'MYTHIC';
              const skinVal = product.specs?.skinCount || product.specs?.skins;

              return (
                <Link
                  href={`/products/${product.id}`}
                  className="relative w-full h-full flex flex-col justify-between p-6 sm:p-7 overflow-hidden group/card"
                >
                  {/* Background Artwork */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-bg-deep via-bg-deep/60 to-bg-deep/20" />

                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/75 text-brand-cyan border border-brand-cyan/40 backdrop-blur-md shadow-sm">
                      {product.canRental ? '⏱ RENTAL READY' : '🛡️ ANTI HACKBACK'}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs border border-white/15">
                      {product.game.name}
                    </span>
                  </div>

                  {/* Bottom Account Details */}
                  <div className="relative z-10 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                        {String(rankVal)}
                      </span>
                      {skinVal && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
                          {String(skinVal)} Skin
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-black text-base sm:text-lg text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md">
                      {product.title}
                    </h3>

                    {/* Price & Seller */}
                    <div className="flex items-baseline justify-between pt-2.5 border-t border-white/10 text-xs">
                      <div>
                        <span className="font-mono font-black text-lg sm:text-xl text-primary-container">
                          {formatCurrency(product.price)}
                        </span>
                        {product.canRental && product.rentalPriceDaily && (
                          <span className="text-[11px] text-text-muted block">
                            atau {formatCurrency(product.rentalPriceDaily)}/hari
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-text-dim">
                        Seller Terverifikasi
                      </span>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-1.5">
                      <div className="w-full py-2.5 rounded-xl bg-linear-to-r from-brand-cyan to-brand-purple text-black font-black text-xs text-center shadow-md group-hover/card:brightness-110 transition-all flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 fill-black" />
                        <span>{product.canRental ? 'Sewa Akun Sekarang →' : 'Beli Akun Sultan →'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }}
          />
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </section>
  );
}
