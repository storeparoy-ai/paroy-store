'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingCart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { Product } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

const NOMINALS = [
  { label: '86 Diamonds', price: 'Rp 24.500' },
  { label: '172 Diamonds', price: 'Rp 48.000' },
  { label: '257 Diamonds', price: 'Rp 72.000' },
  { label: '344 Diamonds', price: 'Rp 96.000' },
  { label: '429 Diamonds', price: 'Rp 120.000' },
  { label: '514 Diamonds', price: 'Rp 144.000' },
];

const PAYMENT_METHODS = [
  { group: 'E-Wallet', items: [
    { id: 'dana', name: 'Dana', price: 'Rp 24.500' },
    { id: 'ovo', name: 'OVO', price: 'Rp 24.500' },
    { id: 'gopay', name: 'GoPay', price: 'Rp 24.500' },
  ]},
  { group: 'QRIS', items: [
    { id: 'qris', name: 'QRIS (All Payment)', price: 'Rp 24.800' },
  ]},
  { group: 'Virtual Account', items: [
    { id: 'bca', name: 'BCA Virtual Account', price: 'Rp 25.500' },
    { id: 'mandiri', name: 'Mandiri Virtual Account', price: 'Rp 25.500' },
  ]},
];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedNominal, setSelectedNominal] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('dana');

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, profiles(full_name, username, role)')
        .eq('id', params.id)
        .single();
      if (data) setProduct(mapSupabaseProduct(data));
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#00c896]" />
        <p className="text-sm text-on-surface-variant">Memuat data produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-6xl">&#128565;</span>
        <p className="font-bold text-lg text-on-surface">Produk tidak ditemukan</p>
        <Link href="/products" className="bg-[#00c896] text-black font-bold px-6 py-3 rounded-lg">Kembali ke Produk</Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main
        className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-stack-lg relative"
        style={{ paddingTop: '96px', paddingBottom: '120px' }}
      >
        {/* Background gradient accent */}
        <div className="absolute top-0 left-0 w-full h-[400px] -z-10 bg-gradient-to-b from-[#00c896]/10 to-transparent pointer-events-none" />

        {/* Game Header */}
        <header className="relative rounded-xl overflow-hidden card-level-1 p-6 md:p-10 flex flex-col md:flex-row items-center gap-gutter">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shrink-0 border-2 border-surface-container-highest">
            <img
              src={product.images[0] || 'https://placehold.co/400x400/232B2B/00c896?text=GAME'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left flex flex-col gap-stack-sm">
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">{product.title}</h1>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl">
              Top up resmi, instan, dan terpercaya. Masukkan data akun, pilih nominal, dan selesaikan pembayaran.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#00c896] text-label-md font-label-md">
              <span>&#10003;</span><span>Verified Official Reseller</span>
            </div>
          </div>
        </header>

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left col */}
          <div className="lg:col-span-2 flex flex-col gap-gutter">
            {/* Card 1: Account data */}
            <section className="card-level-1 rounded-xl p-6 flex flex-col gap-stack-md">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-full bg-[#00c896]/20 text-[#00c896] flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-headline-md font-headline-md text-on-surface">Masukkan Data Akun</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-label-md text-on-surface-variant">User ID</label>
                  <input
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    className="bg-surface-container border border-surface-container-highest rounded-lg px-4 py-3 text-on-surface font-mono focus:border-[#00c896] focus:outline-none transition-colors"
                    placeholder="Contoh: 12345678"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-label-md text-on-surface-variant">Zone ID</label>
                  <input
                    value={zoneId}
                    onChange={e => setZoneId(e.target.value)}
                    className="bg-surface-container border border-surface-container-highest rounded-lg px-4 py-3 text-on-surface font-mono focus:border-[#00c896] focus:outline-none transition-colors"
                    placeholder="1234"
                    type="text"
                  />
                </div>
              </div>
              <button className="text-[#00c896] text-label-md self-start hover:underline">? Di mana letak ID?</button>
            </section>

            {/* Card 2: Nominal selection */}
            <section className="card-level-1 rounded-xl p-6 flex flex-col gap-stack-md">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-full bg-[#00c896]/20 text-[#00c896] flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-headline-md font-headline-md text-on-surface">Pilih Nominal Top Up</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-stack-sm">
                {NOMINALS.map(item => (
                  <div
                    key={item.label}
                    onClick={() => setSelectedNominal(item.label)}
                    className={`relative bg-surface-container border rounded-lg p-4 cursor-pointer transition-all duration-200 text-center ${
                      selectedNominal === item.label
                        ? 'border-[#00c896] bg-[#00c896]/5'
                        : 'border-surface-container-highest hover:border-[#00c896]/40'
                    }`}
                  >
                    <div className="text-2xl mb-2">&#128142;</div>
                    <div className="text-label-md font-bold text-on-surface">{item.label}</div>
                    <div className="text-xs text-on-surface-variant">{item.price}</div>
                    {selectedNominal === item.label && (
                      <div className="absolute top-2 right-2 text-[#00c896] text-xs font-bold">&#10003;</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right col: Payment */}
          <div className="flex flex-col gap-gutter">
            <section className="card-level-1 rounded-xl p-6 flex flex-col gap-stack-md">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-full bg-[#00c896]/20 text-[#00c896] flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-headline-md font-headline-md text-on-surface">Pilih Pembayaran</h2>
              </div>
              <div className="flex flex-col gap-stack-sm">
                {PAYMENT_METHODS.map(group => (
                  <div key={group.group}>
                    <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{group.group}</h3>
                    {group.items.map(pm => (
                      <div
                        key={pm.id}
                        onClick={() => setSelectedPayment(pm.id)}
                        className={`bg-surface-container border rounded-lg p-3 flex justify-between items-center cursor-pointer transition-colors mb-2 ${
                          selectedPayment === pm.id
                            ? 'border-[#00c896] bg-[#00c896]/5'
                            : 'border-surface-container-highest hover:border-surface-variant'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white rounded flex items-center justify-center p-1 text-[10px] font-bold text-gray-800 shrink-0">
                            {pm.name.split(' ')[0].slice(0, 4)}
                          </div>
                          <div>
                            <div className="text-body-md font-semibold text-on-surface text-sm">{pm.name}</div>
                            <div className={`text-xs ${selectedPayment === pm.id ? 'text-[#00c896]' : 'text-on-surface-variant'}`}>{pm.price}</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPayment === pm.id ? 'border-[#00c896]' : 'border-on-surface-variant'}`}>
                          {selectedPayment === pm.id && <div className="w-2 h-2 rounded-full bg-[#00c896]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating bottom bar */}
      <div
        className="fixed bottom-0 left-0 w-full border-t border-white/10 z-40 p-4 md:p-6"
        style={{ background: 'rgba(15,20,20,0.97)', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}
      >
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-label-md text-on-surface-variant">Total Pembayaran</span>
            <span className="text-headline-md text-[#00c896] font-bold">
              {selectedNominal ? NOMINALS.find(n => n.label === selectedNominal)?.price ?? 'Rp 0' : 'Pilih Nominal'}
            </span>
          </div>
          <button
            onClick={() => router.push('/checkout')}
            className="bg-[#00c896] text-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-[#3adfab] transition-colors shadow-[0_0_15px_rgba(0,200,150,0.3)]"
          >
            <ShoppingCart className="w-5 h-5" /> Beli Sekarang
          </button>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </>
  );
}