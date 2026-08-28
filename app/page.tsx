import Container from '@/components/ui/Container';
import HeroBanner from '@/components/home/HeroBanner';
import LiveActivityFeed from '@/components/home/LiveActivityFeed';
import GameQuickSelect from '@/components/home/GameQuickSelect';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import HomeFeaturedProducts from '@/components/home/HomeFeaturedProducts';
import TrustFeatures from '@/components/home/TrustFeatures';

export default function HomePage() {
  return (
    <div className="pb-8 sm:pb-12">
      <Container className="py-6 sm:py-10 space-y-10 sm:space-y-14">
        <HeroBanner />
        <LiveActivityFeed />
        <GameQuickSelect />
        <FlashSaleSection />
        <HomeFeaturedProducts />
        <TrustFeatures />
      </Container>
    </div>
  );
}
