'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Flame, ShieldCheck, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerSlide {
  id: string;
  badge: string;
  badgeType: 'promo' | 'hot' | 'event';
  title: string;
  subtitle: string;
  description: string;
  discount: string;
  image: string;
  link: string;
  ctaText: string;
  tagline: string;
  highlightStats: { label: string; value: string }[];
}

const SLIDES: BannerSlide[] = [
  {
    id: '1',
    badge: 'PROMO SPESIAL',
    badgeType: 'hot',
    title: 'Mobile Legends: Bang Bang',
    subtitle: 'Season Pass & Mega Diamond 1 Detik',
    description: 'Dapatkan diskon hingga 35% untuk semua paket diamond MLBB. Proses pengiriman instan 1 detik otomatis langsung ke akun kamu!',
    discount: 'DISKON 35%',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop',
    link: '/topup?game=mlbb',
    ctaText: 'Top Up Sekarang',
    tagline: '⚡ Terkirim Otomatis 1 Detik',
    highlightStats: [
      { label: 'Waktu Proses', value: '0.8 Detik' },
      { label: 'Rating Kepuasan', value: '4.99/5' },
      { label: 'Status Server', value: 'Online 24/7' },
    ],
  },
  {
    id: '2',
    badge: 'FLASH SALE AKUN',
    badgeType: 'promo',
    title: 'Akun Sultan & Mythic Glory',
    subtitle: 'Garansi Seumur Hidup 100% Anti Hackback',
    description: 'Koleksi ratusan akun game verified dengan full skin langka, all unbind, clean bind, dan harga paling terjangkau se-Indonesia.',
    discount: 'CASHBACK 20RB',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1920&auto=format&fit=crop',
    link: '/products',
    ctaText: 'Jelajahi Akun Sultan',
    tagline: '🛡️ 100% Rekber Resmi',
    highlightStats: [
      { label: 'Garansi Akun', value: 'Anti Hackback' },
      { label: 'Metode Transaksi', value: 'Rekber Escrow' },
      { label: 'Stok Terverifikasi', value: '500+ Akun' },
    ],
  },
  {
    id: '3',
    badge: 'EVENT TERBATAS',
    badgeType: 'event',
    title: 'Genshin Impact & Honkai: Star Rail',
    subtitle: 'Blessing, Welkin & Genesis Crystal Murah',
    description: 'Persiapkan gacha karakter favoritmu dengan harga distributor termurah. 100% Legal & aman via UID loginless.',
    discount: 'BONUS CRYSTAL',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1920&auto=format&fit=crop',
    link: '/topup?game=genshin',
    ctaText: 'Beli Genesis Crystal',
    tagline: '🌟 100% Legal & Invoice Resmi',
    highlightStats: [
      { label: 'Metode Pengisian', value: 'UID Loginless' },
      { label: 'Status Invoice', value: 'Invoice Resmi' },
      { label: 'Resiko Minus', value: '0% Anti Minus' },
    ],
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[current];

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.7)] bg-[#090d16]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Cinematic Vignette & Ambient Glow */}
      <div className="relative min-h-115 sm:min-h-125 md:min-h-135 lg:min-h-140 flex items-center">
        {SLIDES.map((s, index) => (
          <div
            key={s.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              index === current ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-7000 ease-out"
              style={{ backgroundImage: `url('${s.image}')` }}
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-linear-to-r from-bg-deep via-bg-deep/90 lg:via-bg-deep/75 to-transparent z-10" />
            <div className="absolute inset-0 bg-linear-to-t from-bg-deep via-transparent to-bg-deep/50 z-10" />
            {/* Accent Ambient Glow */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none z-10" />
          </div>
        ))}

        {/* 2-Column Responsive Content Box */}
        <div className="relative z-20 w-full px-6 sm:px-10 md:px-14 lg:px-16 py-12 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          
          {/* Left Column: Heading, Badges, CTA */}
          <div className="max-w-2xl flex flex-col justify-center">
            
            {/* Badge Row */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-linear-to-r from-[#ef4444] to-[#f97316] text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <Flame className="w-3.5 h-3.5 fill-white" />
                {slide.badge}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black text-brand-cyan bg-brand-cyan/15 border border-brand-cyan/40 backdrop-blur-md shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                <Sparkles className="w-3.5 h-3.5" />
                {slide.discount}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-2 drop-shadow-md">
              {slide.title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl font-bold text-brand-cyan mb-3">
              {slide.subtitle}
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-text-muted leading-relaxed mb-8 max-w-xl">
              {slide.description}
            </p>

            {/* CTA & Trust Tagline */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={slide.link}
                className="btn-cyber text-sm sm:text-base py-3.5 px-8 rounded-xl flex items-center gap-2 group shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <span className="font-black">{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                {slide.tagline}
              </span>
            </div>

          </div>

          {/* Right Column: Floating Cyber Stats Pill (Wide Screens) */}
          <div className="hidden lg:flex flex-col gap-4 w-80 shrink-0">
            <div className="p-6 rounded-3xl bg-bg-card/85 border border-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Jaminan Layanan
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Verified
                </span>
              </div>

              <div className="space-y-3">
                {slide.highlightStats.map((st) => (
                  <div key={st.label} className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">{st.label}</span>
                    <span className="font-mono font-black text-brand-cyan">{st.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-text-dim">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  150k+ Transaksi
                </span>
                <span className="text-emerald-400 font-bold">Resmi & Legal</span>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div className="absolute right-6 sm:right-10 bottom-6 sm:bottom-8 z-30 flex items-center gap-3">
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
            className="w-10 h-10 rounded-xl bg-bg-card/85 border border-white/10 hover:border-brand-cyan/50 text-white hover:text-brand-cyan flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 cursor-pointer',
                  i === current
                    ? 'w-8 bg-brand-cyan shadow-[0_0_10px_#00f0ff]'
                    : 'w-2.5 bg-white/20 hover:bg-white/40'
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
            className="w-10 h-10 rounded-xl bg-bg-card/85 border border-white/10 hover:border-brand-cyan/50 text-white hover:text-brand-cyan flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
