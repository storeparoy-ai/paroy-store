import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Container from '@/components/ui/Container';
import { buttonVariants } from '@/components/ui/Button';
import CheckoutFlow from '@/components/checkout/CheckoutFlow';
import { getActivePaymentMethods, getProductById } from '@/lib/supabase/queries';
import { cn } from '@/lib/utils';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productId } = await searchParams;
  const product = productId ? await getProductById(productId) : undefined;

  if (!product) {
    return (
      <Container className="py-16 sm:py-24">
        <div className="max-w-sm mx-auto text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-dim">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-bold text-lg text-text-main">Belum Ada Akun Dipilih</h1>
          <p className="text-xs text-text-muted">
            Pilih akun dari katalog terlebih dahulu sebelum melanjutkan ke checkout.
          </p>
          <Link href="/products" className={cn(buttonVariants({ variant: 'primary' }), 'w-full')}>
            Lihat Katalog Akun
          </Link>
        </div>
      </Container>
    );
  }

  const paymentMethods = await getActivePaymentMethods();

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em] mb-8">
        Checkout
      </h1>
      <CheckoutFlow product={product} paymentMethods={paymentMethods} />
    </Container>
  );
}
