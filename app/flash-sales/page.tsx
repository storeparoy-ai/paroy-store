'use client';

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { MOCK_FLASH_SALES } from '@/lib/mock-data';
import FlashSaleCard from '@/components/products/FlashSaleCard';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';

function useCountdown(targetDate: Date | null) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setT({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('flash_sales')
        .select('*, products(*, profiles(full_name, username, role))')
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true });

      if (data) {
        setFlashSales(data.map((fs) => ({
          id: fs.id,
          product: mapSupabaseProduct(fs.products),
          salePrice: Number(fs.sale_price),
          stock: fs.stock,
          sold: fs.sold,
          endsAt: new Date(fs.ends_at)
        })));
      }
      setLoading(false);
    };
    fetchFlashSales();
  }, []);

  const firstEnd = flashSales[0]?.endsAt ?? null;
  const { h, m, s } = useCountdown(firstEnd);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">

          {/* Hero banner */}
          <div
            className="glass-heavy relative overflow-hidden rounded-2xl p-6 mb-5 text-center"
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.15) 0%, transparent 70%)',
              }}
            />
            <Zap className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--warning)' }} />
            <h1 className="font-black font-heading text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
              ⚡ Flash Sale
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Harga spesial untuk waktu terbatas!
            </p>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Berakhir dalam</span>
              {[
                { val: pad(h), label: 'Jam' },
                { val: pad(m), label: 'Menit' },
                { val: pad(s), label: 'Detik' },
              ].map(({ val, label }, i) => (
                <span key={label} className="flex items-center gap-2">
                  <span className="flex flex-col items-center">
                    <span
                      className="countdown-digit font-black text-xl tabular-nums px-3 py-1.5 rounded-xl min-w-[52px] text-center"
                      style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.25)' }}
                    >
                      {val}
                    </span>
                    <span className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  </span>
                  {i < 2 && <span className="text-lg font-bold" style={{ color: 'var(--warning)' }}>:</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Flash sale grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="animate-spin text-2xl" style={{ color: 'var(--primary-400)' }}>⏳</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {flashSales.map((sale) => (
                <FlashSaleCard key={sale.id} sale={sale} />
              ))}
            </div>
          )}

          {!loading && flashSales.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-5xl">⚡</span>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Belum ada Flash Sale aktif</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pantau terus untuk penawaran terbaik!</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
