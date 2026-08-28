import Container from '@/components/ui/Container';
import HeroBanner from '@/components/home/HeroBanner';
import HomeQuickMenu from '@/components/home/HomeQuickMenu';
import LiveActivityFeed from '@/components/home/LiveActivityFeed';
import GameQuickSelect from '@/components/home/GameQuickSelect';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import HomeFeaturedProducts from '@/components/home/HomeFeaturedProducts';
import TrustFeatures from '@/components/home/TrustFeatures';
import { getActiveFlashSales, getFeaturedProducts } from '@/lib/supabase/queries';
import { MOCK_PRODUCTS, MOCK_FLASH_SALES } from '@/lib/mock-data';

export default async function HomePage() {
  // Real data from Supabase when available; gracefully fall back to demo
  // data (e.g. database is empty, or the guest-checkout migration hasn't
  // been applied yet) so the homepage never breaks.
  const [dbFeatured, dbFlashSales] = await Promise.all([getFeaturedProducts(8), getActiveFlashSales()]);

  const featuredProducts =
    dbFeatured && dbFeatured.length > 0 ? dbFeatured : MOCK_PRODUCTS.filter((p) => p.isFeatured);
  const flashSales = dbFlashSales && dbFlashSales.length > 0 ? dbFlashSales : MOCK_FLASH_SALES;

  return (
    <div className="pb-8 sm:pb-12">
      <Container className="py-6 sm:py-10 space-y-10 sm:space-y-14">
        <HeroBanner products={featuredProducts} />
        <HomeQuickMenu />
        <LiveActivityFeed />
        <GameQuickSelect />
        <FlashSaleSection sales={flashSales} />
        <HomeFeaturedProducts products={featuredProducts} />
        <TrustFeatures />
      </Container>
    </div>
  );
}
