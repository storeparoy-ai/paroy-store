import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Container from '@/components/ui/Container';
import RekberForm from '@/components/rekber/RekberForm';
import { getActiveProducts, getProductById, getRekberFeeTiers } from '@/lib/supabase/queries';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

export default async function RekberPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productId } = await searchParams;

  const [dbProducts, feeTiers, initialProductFromDb] = await Promise.all([
    getActiveProducts(),
    getRekberFeeTiers(),
    productId ? getProductById(productId) : Promise.resolve(null),
  ]);

  const products = dbProducts && dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;
  const initialProduct =
    initialProductFromDb ?? (productId ? MOCK_PRODUCTS.find((p) => p.id === productId) : undefined);

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-trust-emerald/10 border border-trust-emerald/25 text-trust-emerald flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Ajukan Rekber Escrow
          </h1>
          <p className="text-xs text-text-muted">
            Dana ditahan aman sampai akun terverifikasi 100% oleh pembeli
          </p>
        </div>
      </div>

      <RekberForm initialProduct={initialProduct} products={products} feeTiers={feeTiers} />
    </Container>
  );
}
