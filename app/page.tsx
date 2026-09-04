import Container from '@/components/ui/Container';
import HeroBanner from '@/components/home/HeroBanner';
import HomeQuickMenu from '@/components/home/HomeQuickMenu';
import LiveActivityFeed from '@/components/home/LiveActivityFeed';
import GameQuickSelect from '@/components/home/GameQuickSelect';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import HomeFeaturedProducts from '@/components/home/HomeFeaturedProducts';
import TrustFeatures from '@/components/home/TrustFeatures';
import { getActiveFlashSales, getFeaturedProducts, getGames, getSiteSettings } from '@/lib/supabase/queries';

export default async function HomePage() {
  // Real Supabase data only — every section below already renders a
  // sensible empty state (or hides itself entirely) when its array is
  // empty, so there's no need to paper over a fresh/emptied catalog with
  // demo placeholders (see the 2026-08-30 removal of the mock-data
  // fallback across the site, requested so admin-entered test data is
  // always exactly what shows).
  const [dbFeatured, dbFlashSales, games, siteSettings] = await Promise.all([
    getFeaturedProducts(8),
    getActiveFlashSales(),
    getGames(),
    getSiteSettings(),
  ]);
  // getFeaturedProducts/getActiveFlashSales return null only on a real
  // fetch error (e.g. Supabase unreachable) — an empty result set is `[]`,
  // not null. Coalescing here is just satisfying the `T[] | null` return
  // type, not a demo-data fallback.
  const featuredProducts = dbFeatured ?? [];
  const flashSales = dbFlashSales ?? [];

  return (
    <div className="pb-8 sm:pb-12">
      <Container className="py-6 sm:py-10 space-y-10 sm:space-y-14">
        <HeroBanner products={featuredProducts} mascotImageUrl={siteSettings.mascotImageUrl} />
        <HomeQuickMenu />
        <LiveActivityFeed />
        <GameQuickSelect games={games} />
        <FlashSaleSection sales={flashSales} />
        <HomeFeaturedProducts products={featuredProducts} />
        <TrustFeatures />
      </Container>
    </div>
  );
}
