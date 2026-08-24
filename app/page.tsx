import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
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
    .limit(12);

  const products: Product[] = (latestData || []).map(mapSupabaseProduct);

  return (
    <>
      <Header />
      <main className="flex-grow pt-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full pb-stack-lg flex flex-col gap-stack-lg min-h-screen">
        
        {/* Hero Banner */}
        <section className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden card-level-1 card-hover group cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9j-6_mlmAZMrw483co0DQX4gyw8sekcx0gLB7Qt6sMPD_jTguLnIBPGzCAnfHXia8DSLoenRC5PWacNFFfG_mcxXzL_lss9_ElB6-1EoghsFq1DA08oEQU8RanhWQDs8aBEK9XaltiwT688sf9lY1z-quZhXktinI4857QLo7DbcmIFWoOqgfvp7rt8-wUM9EtDqV7j2U-CCj8ccrN6XqIzZHD5SEnRnGJIhF7l-YrJEGJTu7oMg8')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-gutter w-full md:w-2/3">
            <span className="bg-primary-container text-on-primary text-label-md font-label-md px-3 py-1 rounded-full mb-2 inline-block">Promo</span>
            <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Mobile Legends Season Pass</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant mb-4">Get up to 30% off on all diamond top-ups this weekend only. Enhance your gaming experience.</p>
            <button className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:scale-102 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,200,150,0.4)] flex items-center gap-2">
              Top Up Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {/* Carousel Dots */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <div className="w-8 h-1 bg-primary-container rounded-full" />
            <div className="w-8 h-1 bg-surface-variant rounded-full" />
            <div className="w-8 h-1 bg-surface-variant rounded-full" />
          </div>
        </section>

        {/* Category Tabs */}
        <section className="flex flex-wrap gap-4 items-center justify-center">
          <button className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-2 rounded-full shadow-[0_0_10px_rgba(0,200,150,0.3)] transition-all">Game Mobile</button>
          <button className="card-level-1 text-on-surface-variant hover:text-on-surface font-label-md text-label-md px-6 py-2 rounded-full hover:border-primary-container/40 transition-all">Voucher</button>
          <button className="card-level-1 text-on-surface-variant hover:text-on-surface font-label-md text-label-md px-6 py-2 rounded-full hover:border-primary-container/40 transition-all">E-Wallet</button>
        </section>

        {/* Product Grid */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-headline-md font-headline-md text-on-surface">Trending Games</h2>
            <Link href="/products" className="text-primary-container font-label-md text-label-md hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
            {products.map((product) => (
              <Link 
                key={product.id}
                href={/products/ + product.id}
                className="card-level-1 rounded-lg overflow-hidden flex flex-col card-hover group transition-all duration-300"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img 
                    src={product.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-80" />
                </div>
                <div className="p-3 bg-surface-container-high flex-grow flex flex-col justify-end">
                  <h3 className="text-label-md font-label-md text-on-surface truncate">{product.title}</h3>
                  <p className="text-[12px] text-on-surface-variant truncate">{product.game.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
      <Footer />
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}

