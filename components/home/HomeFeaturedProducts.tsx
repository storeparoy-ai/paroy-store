import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';

interface HomeFeaturedProductsProps {
  title: string;
  icon: string;
  products: Product[];
  viewAllHref: string;
}

export default function HomeFeaturedProducts({
  title,
  icon,
  products,
  viewAllHref,
}: HomeFeaturedProductsProps) {
  return (
    <div className="col-span-2 md-col-span-4 flex flex-col gap-2">
      {/* Section header */}
      <div className="glass flex items-center justify-between px-4 py-2.5">
        <div className="section-label">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-[var(--primary-400)]"
          style={{ color: 'var(--text-muted)' }}
        >
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
