'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock3, ArrowRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { Product } from '@/types';

const RENTAL_HOW = [
  { icon: '🔍', title: 'Pilih akun', desc: 'Cari akun rental sesuai kebutuhanmu' },
  { icon: '⏱️', title: 'Tentukan durasi', desc: 'Per jam atau per hari, fleksibel' },
  { icon: '💳', title: 'Bayar', desc: 'Transfer dan kirim bukti ke admin' },
  { icon: '🎮', title: 'Main!', desc: 'Akun dikirim via WhatsApp, langsung gas' },
];

export default function RentalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, profiles(full_name, username, role)')
        .eq('can_rental', true)
        .eq('status', 'active');
      
      if (data) {
        setProducts(data.map(mapSupabaseProduct));
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-[5.75rem] min-h-screen">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">

          {/* Hero */}
          <div
            className="glass-heavy relative overflow-hidden rounded-2xl p-6 mb-5"
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div
                  className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--info)', border: '1px solid rgba(59,130,246,0.25)' }}
                >
                  <Clock3 className="w-3 h-3" /> RENTAL AKUN
                </div>
                <h1 className="font-black font-heading text-2xl leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                  Sewa Akun Game<br />
                  <span style={{ color: 'var(--info)' }}>Harga Per Jam / Hari</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Coba dulu sebelum beli, atau mainkan akun rank tinggi tanpa beli permanen!
                </p>
              </div>
              <span className="text-6xl hidden sm:block shrink-0">⏱️</span>
            </div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {RENTAL_HOW.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="glass-card p-3 text-center flex flex-col gap-1.5 items-center"
              >
                <span className="text-2xl">{icon}</span>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Rental rules */}
          <div
            className="glass-card p-4 mb-5"
          >
            <h2 className="section-label text-sm mb-3">Peraturan Rental</h2>
            <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {[
                '✅ Akun hanya boleh digunakan untuk bermain, tidak boleh diganti password/email',
                '✅ Dilarang melakukan transaksi apapun menggunakan akun rental',
                '✅ Jika akun bermasalah karena kesalahan penyewa, dikenakan biaya tambahan',
                '✅ Durasi rental dihitung dari akun dikirimkan oleh admin',
                '✅ Perpanjangan rental bisa dilakukan sebelum waktu habis',
              ].map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Available rentals */}
          <div>
            <div className="section-label mb-3">
              <Clock3 className="w-4 h-4" style={{ color: 'var(--info)' }} />
              <span>Akun Tersedia untuk Rental</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-400)' }} />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-5xl">⏱️</span>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Belum ada akun rental tersedia</p>
                <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Pantau terus halaman ini atau hubungi admin untuk ketersediaan terbaru
                </p>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm"
                >
                  Hubungi Admin
                </a>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
