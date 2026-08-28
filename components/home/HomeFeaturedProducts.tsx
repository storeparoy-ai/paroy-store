import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';

export default function HomeFeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.slice(0, 8);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand-cyan mb-2.5">
            Katalog Pilihan
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-[32px] text-text-main tracking-[-0.02em]">
            Akun Pilihan Minggu Ini
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-cyan hover:text-cyan-300 transition-colors pb-1.5 shrink-0"
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
