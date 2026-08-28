import React, { Suspense } from 'react';
import { PackageSearch } from 'lucide-react';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/types';

function filterAndSortProducts(params: {
  game?: string;
  min?: string;
  max?: string;
  rental?: string;
  sort?: string;
}): Product[] {
  let items = MOCK_PRODUCTS.filter((p) => p.status === 'active');

  if (params.game) {
    items = items.filter((p) => p.game.slug === params.game);
  }
  if (params.min) {
    items = items.filter((p) => p.price >= Number(params.min));
  }
  if (params.max) {
    items = items.filter((p) => p.price <= Number(params.max));
  }
  if (params.rental === '1') {
    items = items.filter((p) => p.canRental);
  }

  switch (params.sort) {
    case 'termurah':
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case 'termahal':
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case 'populer':
      items = [...items].sort((a, b) => b.viewCount - a.viewCount);
      break;
    default:
      items = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return items;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; min?: string; max?: string; rental?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const products = filterAndSortProducts(params);

  return (
    <Container className="py-8 sm:py-10 space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight">
          Katalog Jual Beli Akun
        </h1>
        <p className="text-sm text-text-muted">
          {products.length} akun terverifikasi siap pakai &middot; 100% anti hackback
        </p>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-bg-card border border-border-subtle">
        <Suspense fallback={<div className="h-24 animate-pulse bg-white/5 rounded-xl" />}>
          <ProductFilters />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-dim">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-text-main">Belum Ada Akun yang Cocok</h3>
          <p className="text-xs text-text-muted max-w-xs">
            Coba ubah filter game atau rentang harga untuk melihat pilihan akun lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}
