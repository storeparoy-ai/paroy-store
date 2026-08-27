'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock3, ArrowRight, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

const RENTAL_HOW = [
  { icon: '🔍', title: 'Pilih Akun Impian', desc: 'Pilih akun game dengan rank & skin sultan yang kamu inginkan.' },
  { icon: '⏱️', title: 'Tentukan Durasi Sewa', desc: 'Sewa fleksibel harian, mingguan, atau per jam sesuai kebutuhan.' },
  { icon: '💳', title: 'Bayar Otomatis', desc: 'Bayar via QRIS atau Transfer Bank otomatis 24 jam nonstop.' },
  { icon: '🎮', title: 'Langsung Main!', desc: 'Data login dikirim otomatis via WhatsApp & dashboard akun.' },
];

export default function RentalPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS.filter(p => p.canRental));

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, profiles(full_name, username, role)')
        .eq('can_rental', true)
        .eq('status', 'active');
      
      if (data && data.length > 0) {
        setProducts(data.map(mapSupabaseProduct));
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-8 sm:py-12 pb-32 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto flex flex-col gap-10">
        
        {/* Hero Banner Bento */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-[#0d121f] border border-white/8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                <Clock3 className="w-5 h-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-brand-cyan">
                RENTAL AKUN GAME
              </span>
            </div>
            
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
              Sewa Akun Sultan <span className="text-gradient-cyan">Mulai 10 Ribu</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-text-muted leading-relaxed">
              Mau cobain skin Mythic, senjata langka, atau mabar bareng temen dengan rank tinggi? Rental akun game terpercaya dengan proses pengiriman instan 1 menit.
            </p>

            <div className="flex items-center gap-6 pt-2 text-xs sm:text-sm font-bold text-emerald-400">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> 100% Anti Hackback</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Kirim Akun Otomatis</span>
            </div>
          </div>
        </div>

        {/* How It Works Steps (4 cols) */}
        <div className="space-y-6">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white">Cara Sewa Akun di Paroy Store</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {RENTAL_HOW.map((step, idx) => (
              <div key={step.title} className="p-7 sm:p-8 rounded-3xl bg-[#0d121f] border border-white/8 flex flex-col gap-4 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="w-8 h-8 rounded-xl bg-[#141a29] border border-white/10 text-xs font-black text-brand-cyan flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-white">{step.title}</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rental Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white">Akun Siap Sewa</h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">Pilih akun favoritmu dan mulai bermain sekarang</p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-text-muted bg-[#0d121f] border border-white/8 px-4 py-2 rounded-xl">
              {products.length} Akun Tersedia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
