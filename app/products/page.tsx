import React, { Suspense } from 'react';
import { PackageSearch } from 'lucide-react';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { getActiveProducts, getGames, getPriceRanges } from '@/lib/supabase/queries';

type SearchParams = Promise<{
  game?: string;
  min?: string;
  max?: string;
  rental?: string;
  sort?: string;
  q?: string;
}>;

/** searchParams is only known at request time, so it — and everything
 * downstream of it — has to stay inside this Suspense boundary rather than
 * being awaited at the top of the page; that's what lets the page's shell
 * (title, filter chips) prerender/cache while just the results list streams
 * in per the actual query string. getActiveProducts() itself is cached too
 * (see queries.ts), keyed automatically off its filters argument, so
 * repeat visits with the same filters skip the database entirely. */
async function ProductResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const dbProducts = await getActiveProducts({
    game: params.game,
    min: params.min ? Number(params.min) : undefined,
    max: params.max ? Number(params.max) : undefined,
    rentalOnly: params.rental === '1',
    sort: (params.sort as 'terbaru' | 'termurah' | 'termahal' | 'populer' | undefined) ?? 'terbaru',
    q: params.q,
  });

  // dbProducts is null only on a real fetch error — a genuinely empty
  // catalog (no products entered yet, or none match the filter) is `[]`
  // and renders the empty state below honestly, no demo-data stand-in.
  const products = dbProducts ?? [];

  return (
    <>
      <p className="text-sm text-text-muted -mt-4 mb-6">
        {params.q ? (
          <>
            {products.length} hasil untuk{' '}
            <span className="text-text-main font-semibold">&ldquo;{params.q}&rdquo;</span>
          </>
        ) : (
          <>{products.length} akun terverifikasi siap pakai &middot; 100% anti hackback</>
        )}
      </p>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-dim">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-text-main">
            {params.q ? 'Pencarian Tidak Menemukan Apa Pun' : 'Belum Ada Akun yang Cocok'}
          </h3>
          <p className="text-xs text-text-muted max-w-xs">
            {params.q
              ? 'Coba kata kunci lain, atau hapus filter game dan rentang harga yang sedang aktif.'
              : 'Coba ubah filter game atau rentang harga untuk melihat pilihan akun lainnya.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-3/4 rounded-2xl bg-bg-card border border-border-subtle animate-pulse" />
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  // Cached (see getGames/getPriceRanges in queries.ts) — safe to await
  // directly at the top of the page, unlike searchParams below.
  const [games, priceRanges] = await Promise.all([getGames(), getPriceRanges()]);

  return (
    <Container className="py-8 sm:py-10 space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight">
          Katalog Jual Beli Akun
        </h1>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-bg-card border border-border-subtle">
        <Suspense fallback={<div className="h-24 animate-pulse bg-white/5 rounded-xl" />}>
          <ProductFilters games={games} priceRanges={priceRanges} />
        </Suspense>
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <ProductResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
