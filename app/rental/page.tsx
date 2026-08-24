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
  { icon: '🔍', title: 'Pilih Akun', desc: 'Pilih akun game dengan rank & skin sultan yang kamu inginkan.' },
  { icon: '⏱️', title: 'Pilih Durasi', desc: 'Sewa fleksibel harian, mingguan, atau per jam sesuai kebutuhan.' },
  { icon: '💳', title: 'Bayar Instan', desc: 'Bayar via QRIS atau Transfer Bank otomatis 24 jam.' },
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
      
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        
        {/* Hero Banner */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-bg-card border border-white/8 shadow-md overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
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
            <p className="text-xs sm:text-sm md:text-base text-text-muted mt-2 mb-6 leading-relaxed">
              Mau cobain skin Mythic, senjata langka, atau main bareng temen dengan rank tinggi? Rental akun game terpercaya dengan proses pengiriman instan 1 menit.
            </p>

            <div className="flex items-center gap-5 text-xs sm:text-sm font-semibold text-emerald-400">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> 100% Anti Hackback</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Kirim Akun Otomatis</span>
            </div>
          </div>
        </div>

        {/* How It Works Steps (4 cols) */}
        <div className="mb-12">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white mb-6">Cara Sewa Akun di Paroy Store</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RENTAL_HOW.map((step, idx) => (
              <div key={step.title} className="p-6 rounded-2xl bg-bg-card border border-white/8 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-text-muted flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-white">{step.title}</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rental Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white">Akun Siap Sewa</h2>
              <p className="text-xs sm:text-sm text-text-muted">Pilih akun favoritmu dan mulai bermain sekarang</p>
            </div>
            <span className="text-xs sm:text-sm text-text-muted">
              {products.length} akun tersedia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
