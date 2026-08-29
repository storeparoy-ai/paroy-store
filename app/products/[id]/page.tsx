import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Clock,
  Eye,
  Smartphone,
  Globe2,
  CheckCircle2,
  Star,
  MessageCircleWarning,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import ProductGallery from '@/components/products/ProductGallery';
import WishlistButton from '@/components/products/WishlistButton';
import { getProductById, getCurrentUserForDisplay, isProductWishlisted } from '@/lib/supabase/queries';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

// Kept dynamic on purpose: the product `id` param is needed before *any*
// content can be produced (there's no bounded list of ids to prerender
// ahead of time, unlike `/` or `/products`), so wrapping just the id-driven
// parts in Suspense wouldn't leave a meaningful static shell behind it —
// see https://nextjs.org/docs/messages/blocking-prerender-dynamic. The
// WishlistSection split below still stands: it's the one piece of this
// page that's dynamic for a *different* reason (the viewer's session), so
// it's ready to go the day this route gains generateStaticParams for its
// top products and becomes worth converting for real.
export const instant = false;

/** The only genuinely per-request bit of this whole page — whether the
 * viewer is logged in, and whether they already wishlisted this product.
 * Isolated in its own Suspense boundary (same pattern as app/layout.tsx's
 * HeaderWithSession) so the rest of the page — the product data itself,
 * already cached via getProductById() — can prerender/cache instead of
 * forcing the entire route dynamic. Fallback matches the logged-out state,
 * so there's no layout shift while it resolves. */
async function WishlistSection({ productId }: { productId: string }) {
  const [user, wishlisted] = await Promise.all([getCurrentUserForDisplay(), isProductWishlisted(productId)]);
  return <WishlistButton productId={productId} isLoggedIn={!!user} initialWishlisted={wishlisted} />;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Try the real database first, fall back to demo data by the same id
  // (covers both a fresh/empty database and the mock-data-only dev state).
  const product = (await getProductById(id)) ?? MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const specEntries = Object.entries(product.specs);

  return (
    <Container className="py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10 items-start">
        {/* Left: gallery + specs */}
        <div className="space-y-6 min-w-0">
          <ProductGallery images={product.images} title={product.title} />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan" size="md">{product.game.icon} {product.game.name}</Badge>
            {product.canRental && (
              <Badge variant="trust" size="md">
                <Clock className="w-3.5 h-3.5" />
                Bisa Disewa
              </Badge>
            )}
            <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
              <Eye className="w-3.5 h-3.5" />
              {formatNumber(product.viewCount)} dilihat
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-[34px] text-text-main tracking-[-0.02em] leading-[1.18]">
            {product.title}
          </h1>

          {/* Specs */}
          <Card variant="alt" className="rounded-[20px]">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-heading font-bold text-[15px] text-text-main tracking-[-0.01em]">
                Spesifikasi Akun
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-text-dim">
                      {key}
                    </span>
                    <p className="text-sm font-bold text-text-main">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 pt-3 border-t border-border-subtle text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  {product.platform.join(' / ')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" />
                  Region {product.region}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Anti-hackback SOP */}
          <Card variant="alt" className="rounded-[20px] border-trust-emerald/25">
            <CardContent className="p-6 space-y-3.5">
              <h2 className="font-heading font-bold text-[15px] text-text-main tracking-[-0.01em] flex items-center gap-2">
                <ShieldCheck className="w-4.25 h-4.25 text-trust-emerald" />
                Proteksi Anti Hackback
              </h2>
              <ul className="space-y-2 text-xs text-text-muted leading-relaxed">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-trust-emerald shrink-0 mt-0.5" />
                  Admin Paroy Store mendampingi langsung saat serah terima akun.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-trust-emerald shrink-0 mt-0.5" />
                  Email &amp; password akun wajib diganti di depan admin sebelum transaksi selesai.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-trust-emerald shrink-0 mt-0.5" />
                  Dana pembeli ditahan aman lewat Rekber hingga akun terbukti aman 100%.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: sticky purchase box */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Card variant="raised" className="rounded-[22px]">
            <CardContent className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-1.5 text-urgency-orange text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-urgency-orange" />
                ))}
                <span className="text-text-muted">4.9 &middot; Dijual resmi Paroy Store</span>
              </div>

              <div>
                <span className="text-xs text-text-dim block mb-1">Harga Akun</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-extrabold text-3xl sm:text-4xl text-brand-cyan tracking-[-0.01em]">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="font-mono text-sm text-text-dim line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  href={`/checkout?product=${product.id}`}
                  className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
                >
                  Beli Langsung
                </Link>
                <Link
                  href={`/rekber?product=${product.id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Ajukan Rekber
                </Link>
                <Suspense fallback={<WishlistButton productId={product.id} isLoggedIn={false} initialWishlisted={false} />}>
                  <WishlistSection productId={product.id} />
                </Suspense>
              </div>

              {product.canRental && (product.rentalPriceHourly || product.rentalPriceDaily) && (
                <div className="pt-4 border-t border-border-subtle space-y-2.5">
                  <span className="text-xs font-bold text-text-main">Atau Sewa Saja</span>
                  <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                    {product.rentalPriceHourly && (
                      <span className="px-2.5 py-1 rounded-lg bg-white/5">
                        {formatCurrency(product.rentalPriceHourly)}/jam
                      </span>
                    )}
                    {product.rentalPriceDaily && (
                      <span className="px-2.5 py-1 rounded-lg bg-white/5">
                        {formatCurrency(product.rentalPriceDaily)}/hari
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/rental?product=${product.id}`}
                    className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'w-full')}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Sewa Akun Ini
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl bg-bg-card border border-border-subtle text-[11px] text-text-muted leading-relaxed">
            <MessageCircleWarning className="w-4 h-4 text-text-dim shrink-0 mt-0.5" />
            <span>
              Jangan pernah bertransaksi di luar Paroy Store. Semua akun dijual resmi oleh toko —
              laporkan penjual di luar platform ke admin.
            </span>
          </div>
        </div>
      </div>
    </Container>
  );
}
