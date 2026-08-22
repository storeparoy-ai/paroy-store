'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Heart, ShoppingCart,
  Clock3, Eye, Shield, Zap, Share2, Info, Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { Product } from '@/types';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [buyMode, setBuyMode] = useState<'buy' | 'rental'>('buy');

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(full_name, username, role)')
        .eq('id', params.id)
        .single();
      
      if (data) {
        const p = mapSupabaseProduct(data);
        setProduct(p);
        
        // Fetch related
        const { data: relData } = await supabase
          .from('products')
          .select('*, profiles(full_name, username, role)')
          .eq('game', data.game)
          .neq('id', data.id)
          .limit(4);
          
        if (relData) {
          setRelated(relData.map(mapSupabaseProduct));
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-400)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat data produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-6xl">😵</span>
        <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Produk tidak ditemukan</p>
        <Link href="/products" className="btn-primary">Kembali ke Produk</Link>
      </div>
    );
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-[5.75rem] min-h-screen">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-[var(--primary-400)] transition-colors">Beranda</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-[var(--primary-400)] transition-colors">Produk</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{product.title}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            {/* === LEFT: Image Gallery === */}
            <div className="flex flex-col gap-2">
              {/* Main image */}
              <div
                className="relative rounded-xl overflow-hidden aspect-[4/5]"
                style={{ background: 'var(--surface-card)' }}
              >
                <Image
                  src={product.images[imgIdx]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Nav arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + product.images.length) % product.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(10,9,8,0.65)', backdropFilter: 'blur(8px)' }}
                      aria-label="Foto sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % product.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(10,9,8,0.65)', backdropFilter: 'blur(8px)' }}
                      aria-label="Foto berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {discount > 0 && <span className="badge badge-hot">-{discount}%</span>}
                  {product.canRental && <span className="badge badge-rental">⏱ Bisa Rental</span>}
                </div>

                {/* View count */}
                <div
                  className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                  style={{ background: 'rgba(10,9,8,0.6)', backdropFilter: 'blur(6px)', color: 'var(--text-muted)' }}
                >
                  <Eye className="w-3 h-3" />
                  {formatNumber(product.viewCount)} dilihat
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={cn(
                        'relative shrink-0 w-16 h-20 rounded-lg overflow-hidden transition-all',
                        i === imgIdx ? 'ring-2 ring-[var(--primary-400)]' : 'ring-1 ring-[var(--border-default)] opacity-60 hover:opacity-100'
                      )}
                      aria-label={`Foto ${i + 1}`}
                    >
                      <Image src={img} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* === RIGHT: Product Info === */}
            <div className="flex flex-col gap-4">
              {/* Game + title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${product.game.color}22`,
                      color: product.game.color,
                      border: `1px solid ${product.game.color}44`,
                    }}
                  >
                    {product.game.icon} {product.game.name}
                  </span>
                  <span
                    className={cn(
                      'badge',
                      product.status === 'active' ? 'badge-available' : 'badge-sold'
                    )}
                  >
                    {product.status === 'active' ? '● Tersedia' : '● Terjual'}
                  </span>
                </div>
                <h1 className="font-bold font-heading text-lg leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {product.title}
                </h1>
              </div>

              {/* Price */}
              <div
                className="glass-card p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Harga</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black font-heading" style={{ color: 'var(--primary-400)' }}>
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm line-through mb-0.5" style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.canRental && product.rentalPriceDaily && (
                    <p className="text-xs mt-1" style={{ color: 'var(--info)' }}>
                      <Clock3 className="w-3 h-3 inline mr-1" />
                      Rental: {formatCurrency(product.rentalPriceDaily)}/hari • {formatCurrency(product.rentalPriceHourly ?? 0)}/jam
                    </p>
                  )}
                </div>
                {discount > 0 && (
                  <div
                    className="text-center px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <p className="text-xl font-black" style={{ color: 'var(--error)' }}>-{discount}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--error)' }}>HEMAT</p>
                  </div>
                )}
              </div>

              {/* Specs */}
              <div className="glass-card p-4">
                <h2 className="section-label text-sm mb-3">
                  <Info className="w-4 h-4" style={{ color: 'var(--primary-400)' }} />
                  Spesifikasi Akun
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {String(val)}
                      </span>
                    </div>
                  ))}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Platform</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {product.platform.join(' / ')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Region</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{product.region}</span>
                  </div>
                </div>
              </div>

              {/* Safety note */}
              <div
                className="flex items-start gap-2 p-3 rounded-xl text-xs"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.18)',
                  color: 'var(--success)',
                }}
              >
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Transaksi aman & terjamin. Akun akan dikirim setelah pembayaran dikonfirmasi admin dalam 1×24 jam.</p>
              </div>

              {/* Buy/Rental mode toggle */}
              {product.canRental && (
                <div
                  className="flex rounded-xl p-1 gap-1"
                  style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
                >
                  {(['buy', 'rental'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setBuyMode(mode)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                        buyMode === mode ? 'text-white shadow-lg' : ''
                      )}
                      style={
                        buyMode === mode
                          ? { background: 'linear-gradient(135deg, var(--primary-400), var(--primary-500))' }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      {mode === 'buy' ? '🛒 Beli Permanen' : '⏱ Rental'}
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link
                  href={product.status === 'active' ? `/checkout?productId=${product.id}&mode=${buyMode}` : '#'}
                  className={cn(
                    'btn-primary flex-1 text-sm py-3',
                    product.status !== 'active' && 'opacity-50 pointer-events-none'
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {buyMode === 'rental' ? 'Rental Sekarang' : 'Beli Sekarang'}
                </Link>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  aria-label="Wishlist"
                  className="btn-secondary w-12 h-12 p-0 flex items-center justify-center shrink-0"
                  style={wishlisted ? { borderColor: 'rgba(232,120,159,0.5)', color: 'var(--primary-400)' } : {}}
                >
                  <Heart className={cn('w-4 h-4', wishlisted && 'fill-current')} />
                </button>
                <button
                  aria-label="Bagikan"
                  className="btn-secondary w-12 h-12 p-0 flex items-center justify-center shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* RekBer prompt */}
              <Link
                href="/rekber"
                className="flex items-center gap-2 p-3 rounded-xl text-xs transition-all hover:scale-[1.01]"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: 'var(--warning)',
                }}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span>Mau bayar via RekBer? Klik di sini untuk transaksi lebih aman</span>
              </Link>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-8">
              <div className="section-label mb-3">
                <span>Produk Serupa</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
