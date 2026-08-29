import React from 'react';
import { Clock } from 'lucide-react';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/products/ProductCard';
import RentalFlow from '@/components/rental/RentalFlow';
import { getActiveProducts, getProductById } from '@/lib/supabase/queries';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

export default async function RentalPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productId } = await searchParams;

  const header = (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
        <Clock className="w-5 h-5" />
      </div>
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
          Rental Akun
        </h1>
        <p className="text-xs text-text-muted">Sewa akun sultan per jam atau per hari, tanpa beli putus</p>
      </div>
    </div>
  );

  if (productId) {
    const product = (await getProductById(productId)) ?? MOCK_PRODUCTS.find((p) => p.id === productId);
    if (product) {
      return (
        <Container className="py-8 sm:py-10">
          {header}
          <RentalFlow product={product} />
        </Container>
      );
    }
  }

  // No product selected (or not found) — show a catalog of rentable accounts.
  const dbProducts = await getActiveProducts({ rentalOnly: true });
  const products =
    dbProducts && dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS.filter((p) => p.canRental);

  return (
    <Container className="py-8 sm:py-10">
      {header}
      {products.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Belum ada akun yang tersedia untuk disewa saat ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} mode="rental" />
          ))}
        </div>
      )}
    </Container>
  );
}
