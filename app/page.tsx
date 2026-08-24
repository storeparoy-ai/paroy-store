import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import HomeHero from '@/components/home/HomeHero';
import HomeSearch from '@/components/home/HomeSearch';
import HomeQuickMenu from '@/components/home/HomeQuickMenu';
import HomeFeaturedProducts from '@/components/home/HomeFeaturedProducts';
import HomeFlashSale from '@/components/home/HomeFlashSale';
import { MOCK_FLASH_SALES } from '@/lib/mock-data';
import { createClient } from '@/utils/supabase/server';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { Product } from '@/types';

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch latest products
  const { data: latestData } = await supabase
    .from('products')
    .select('*, profiles(full_name, username, role)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch featured products (most viewed)
  const { data: featuredData } = await supabase
    .from('products')
    .select('*, profiles(full_name, username, role)')
    .eq('status', 'active')
    .order('view_count', { ascending: false })
    .limit(6);

  const latestProducts: Product[] = (latestData || []).map(mapSupabaseProduct);
  const featuredProducts: Product[] = (featuredData || []).map(mapSupabaseProduct);

  return (
    <>
      <Header />
      <div className="pt-24">
        <main className="bento-grid-full pb-4 lg:pb-8">
          {/* Hero */}
          <HomeHero />

          {/* Search */}
          <HomeSearch />

          {/* Quick Menu */}
          <HomeQuickMenu />

          {/* Flash Sale */}
          {MOCK_FLASH_SALES.length > 0 && (
            <HomeFlashSale sales={MOCK_FLASH_SALES} />
          )}

          {/* Produk Terbaru */}
          <HomeFeaturedProducts
            title="Produk Terbaru"
            icon="🆕"
            products={latestProducts}
            viewAllHref="/products"
          />

          {/* Produk Unggulan */}
          <HomeFeaturedProducts
            title="Produk Unggulan"
            icon="⭐"
            products={featuredProducts}
            viewAllHref="/products?featured=true"
          />
        </main>
        <Footer />
      </div>

      {/* Bottom nav mobile */}
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
