import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import TrustFeatures from '@/components/home/TrustFeatures';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import GameQuickSelect from '@/components/home/GameQuickSelect';
import CategoryProductTabs from '@/components/home/CategoryProductTabs';
import LiveActivityFeed from '@/components/home/LiveActivityFeed';
import WhyChooseUs from '@/components/home/WhyChooseUs';

import { createClient } from '@/utils/supabase/server';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { MOCK_PRODUCTS, MOCK_FLASH_SALES } from '@/lib/mock-data';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products: Product[] = [];
  
  try {
    const supabase = await createClient();
    const { data: latestData } = await supabase
      .from('products')
      .select('*, profiles(full_name, username, role)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(24);

    if (latestData && latestData.length > 0) {
      products = latestData.map(mapSupabaseProduct);
    } else {
      products = MOCK_PRODUCTS;
    }
  } catch (err) {
    products = MOCK_PRODUCTS;
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-8 sm:py-10 pb-20 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto flex flex-col gap-10 sm:gap-14">
        
        {/* 1. Cinematic Widescreen Hero Banner */}
        <HeroBanner />

        {/* 2. Real-Time Transaction Activity Feed */}
        <LiveActivityFeed />

        {/* 3. 4 Pillar Trust Metrics */}
        <TrustFeatures />

        {/* 4. Flash Sale Section with Countdown */}
        <FlashSaleSection flashSales={MOCK_FLASH_SALES} />

        {/* 5. Fast Game Top-Up Selector */}
        <GameQuickSelect />

        {/* 6. Dynamic Marketplace & Account Catalog */}
        <CategoryProductTabs initialProducts={products} />

        {/* 7. Why Choose Paroy Store (Bento Grid) */}
        <WhyChooseUs />

      </main>

      <Footer />
      <BottomNav />
      <div className="h-20 lg:hidden" />
    </>
  );
}
