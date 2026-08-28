import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';

export default function HomeFeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.slice(0, 8);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-main tracking-tight">
          Akun Pilihan Minggu Ini
        </h2>
        <Link
          href="/products"
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-cyan hover:text-cyan-300 transition-colors"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
