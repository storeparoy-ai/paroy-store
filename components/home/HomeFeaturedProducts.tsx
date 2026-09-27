import React from 'react';
import Link from 'next/link';
import { ArrowRight, PackageSearch, Zap } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';

export default function HomeFeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.slice(0, 8);

  // Pengunjung yang membaca ini, bukan admin — teks lamanya menyuruh
  // "Tambahkan produk lewat Admin > Produk". Arahkan ke yang tetap bisa
  // dibeli selagi stok akun kosong.
  if (featured.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center rounded-2xl border border-dashed border-border-subtle">
        <div className="w-12 h-12 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-dim">
          <PackageSearch className="w-5 h-5" />
        </div>
        <h2 className="font-heading font-bold text-sm text-text-main">Stok Akun Sedang Diisi Ulang</h2>
        <p className="text-xs text-text-muted max-w-xs">
          Belum ada akun yang dijual saat ini. Top up tetap bisa langsung dipesan.
        </p>
        <Link
          href="/topup"
          className="flex items-center gap-1.5 min-h-11 px-3 text-sm font-bold text-brand-cyan hover:text-cyan-300 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Top Up Sekarang
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand-cyan mb-2.5">
            Katalog Akun
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-[32px] text-text-main tracking-[-0.02em]">
            Akun Siap Dibeli
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 min-h-11 text-sm font-bold text-brand-cyan hover:text-cyan-300 transition-colors shrink-0"
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
