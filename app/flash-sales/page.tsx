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
      
      <main className="min-h-screen py-8 sm:py-10 pb-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1720px] mx-auto">
        
        {/* Flash Sale Hero Banner */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-bg-card border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden mb-10 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-linear-to-r from-[#ef4444] to-[#f97316] text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-3">
              <Flame className="w-3.5 h-3.5 fill-white" />
              DISKON SPESIAL TERBATAS
            </span>

            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight mb-2">
              ⚡ Flash Sale <span className="text-gradient-cyan">Hari Ini</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mb-6">
              Voucher & akun game diskon gila-gilaan hingga 50%! Kuota terbatas, checkout sebelum kehabisan.
            </p>

            {/* Countdown Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-bg-base/90 border border-white/10 flex items-center gap-3 sm:gap-4 backdrop-blur-md">
              <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Berakhir Dalam:</span>
              </span>

              <div className="flex items-center gap-2">
                {[
                  { val: pad(h), label: 'JAM' },
                  { val: pad(m), label: 'MENIT' },
                  { val: pad(s), label: 'DETIK' },
                ].map(({ val, label }, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-black text-lg sm:text-2xl text-white px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 shadow-inner min-w-12 text-center">
                        {val}
                      </span>
                      <span className="text-[9px] font-bold text-text-dim mt-1">{label}</span>
                    </div>
                    {i < 2 && <span className="font-black text-red-400 text-lg mb-4">:</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Flash Sale Grid: 6 cols on widescreen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {flashSales.map((sale) => (
            <FlashSaleCard key={sale.id} sale={sale} />
          ))}
        </div>

      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
