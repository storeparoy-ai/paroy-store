import React from 'react';
import { PackageSearch, ShieldCheck } from 'lucide-react';
import Container from '@/components/ui/Container';
import RekberForm from '@/components/rekber/RekberForm';
import RekberFeeTable from '@/components/rekber/RekberFeeTable';
import { getActiveProducts, getProductById, getRekberFeeTiers } from '@/lib/supabase/queries';

export default async function RekberPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productId } = await searchParams;

  const [dbProducts, feeTiers, initialProduct] = await Promise.all([
    getActiveProducts(),
    getRekberFeeTiers(),
    productId ? getProductById(productId) : Promise.resolve(null),
  ]);

  const products = dbProducts ?? [];

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

      <RekberFeeTable tiers={feeTiers} />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-dim">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-text-main">Belum Ada Akun untuk Direkber</h3>
          <p className="text-xs text-text-muted max-w-xs">
            Belum ada produk aktif di katalog — admin perlu menambahkan produk dulu lewat dashboard.
          </p>
        </div>
      ) : (
        <RekberForm initialProduct={initialProduct ?? undefined} products={products} feeTiers={feeTiers} />
      )}
    </Container>
  );
}
