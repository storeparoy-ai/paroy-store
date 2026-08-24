'use client';

import { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ShieldCheck } from 'lucide-react';
import { MOCK_FLASH_SALES } from '@/lib/mock-data';
import FlashSaleCard from '@/components/products/FlashSaleCard';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';

function useCountdown(targetDate: Date | null) {
  const [t, setT] = useState({ h: 2, m: 45, s: 18 });
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setT({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<any[]>(MOCK_FLASH_SALES);

  useEffect(() => {
    const fetchFlashSales = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('flash_sales')
        .select('*, products(*, profiles(full_name, username, role))')
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true });

      if (data && data.length > 0) {
        setFlashSales(data.map((fs) => ({
          id: fs.id,
          product: mapSupabaseProduct(fs.products),
          salePrice: Number(fs.sale_price),
          stock: fs.stock,
          sold: fs.sold,
          endsAt: new Date(fs.ends_at)
        })));
      }
    };
    fetchFlashSales();
  }, []);

  const firstEnd = flashSales[0]?.endsAt ?? null;
  const { h, m, s } = useCountdown(firstEnd);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <Header />
      
      <main className="min-h-screen py-10 sm:py-14 pb-36 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto flex flex-col gap-10">
        
        {/* Flash Sale Hero Banner Bento */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-[#0d121f] border border-orange-500/25 shadow-xl overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-linear-to-r from-red-500 to-orange-500 text-white shadow-md">
              <Flame className="w-4 h-4 fill-white animate-pulse" />
              DISKON SPESIAL HARI INI
            </span>

            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
              ⚡ Flash Sale <span className="text-gradient-fire">Kilat Terbatas</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-lg">
              Voucher & akun game diskon gila-gilaan hingga 50%! Kuota terbatas otomatis reset setiap hari, amankan sekarang sebelum kehabisan.
            </p>

            {/* Countdown Box Bento */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#141a29] border border-white/10 flex items-center gap-4 sm:gap-6 shadow-inner">
              <span className="text-xs sm:text-sm font-bold text-text-muted flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Berakhir Dalam:</span>
              </span>

              <div className="flex items-center gap-2.5">
                {[
                  { val: pad(h), label: 'JAM' },
                  { val: pad(m), label: 'MENIT' },
                  { val: pad(s), label: 'DETIK' },
                ].map(({ val, label }, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#090d16] border border-white/10 flex items-center justify-center font-mono font-black text-lg sm:text-2xl text-orange-400 shadow-md">
                        {val}
                      </div>
                      <span className="text-[9px] font-bold text-text-dim mt-1.5">{label}</span>
                    </div>
                    {i < 2 && <span className="font-black text-orange-400 text-lg mb-4">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-xl sm:text-2xl text-white">Semua Promo Flash Sale</h2>
            <span className="text-xs sm:text-sm font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-xl">
              {flashSales.length} Promo Berlangsung
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {flashSales.map((sale) => (
              <FlashSaleCard key={sale.id} sale={sale} />
            ))}
          </div>
        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
