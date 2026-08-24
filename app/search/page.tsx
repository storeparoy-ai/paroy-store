'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import ProductCard from '@/components/products/ProductCard';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

function SearchContent() {
  const params = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.status === 'active' &&
        (p.title.toLowerCase().includes(q) ||
          p.game.name.toLowerCase().includes(q) ||
          JSON.stringify(p.specs).toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="font-bold font-heading text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
        🔍 Pencarian
      </h1>

      {/* Search input */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--text-muted)' }}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari akun game, rank, atau fitur..."
          className="input-base pl-9 pr-10 h-12 text-sm"
          autoFocus
          aria-label="Cari produk"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {/* Results */}
      {query.trim() ? (
        results.length > 0 ? (
          <>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              {results.length} hasil untuk &ldquo;<strong style={{ color: 'var(--text-secondary)' }}>{query}</strong>&rdquo;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">😕</span>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Coba kata kunci lain</p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-5xl">🔍</span>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ketik untuk mencari produk</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-24 min-h-screen flex flex-col">
        <Suspense>
          <SearchContent />
        </Suspense>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
