'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * Lebar kolom galeri sebenarnya di tiap breakpoint (Container px-5/8/10/14/16,
 * max 1440px; di lg kolom kanan 360px + jarak 40px).
 *
 * Dulu tertulis "(max-width: 1024px) 100vw, 640px": di desktop browser
 * mengira gambar selebar 640px lalu mengambil versi 640px, padahal kolomnya
 * 912px — gambarnya diregangkan ~1,4–1,8x dan tampak buram. Itu keluhan
 * "kualitas gambar menurun"; file aslinya di Storage tetap utuh.
 */
const MAIN_SIZES =
  '(min-width: 1440px) 912px, (min-width: 1280px) calc(100vw - 528px), (min-width: 1024px) calc(100vw - 512px), (min-width: 768px) calc(100vw - 80px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)';

// Harus ada di images.qualities (next.config.ts) — Next 16 hanya mengizinkan 75.
const PHOTO_QUALITY = 85;

function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return;
      const dx = e.changedTouches[0].clientX - start.current.x;
      const dy = e.changedTouches[0].clientY - start.current.y;
      start.current = null;
      // Hanya geser mendatar yang jelas; gulir vertikal halaman tidak terganggu.
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0) onPrev();
      else onNext();
    },
  };
}

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const count = images.length;
  const many = count > 1;

  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);
  const swipe = useSwipe(prev, next);

  const navButton =
    'absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-bg-deep/75 border border-white/10 text-text-main flex items-center justify-center hover:bg-bg-deep transition-colors';

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-video w-full rounded-[22px] overflow-hidden bg-bg-deep border border-border-subtle shadow-raised"
        {...(many ? swipe : {})}
      >
        {/* Latar pengisi: salinan kecil gambar yang sama, diburamkan, untuk
            mengisi sisa bingkai di sekitar gambar utuh. Bukan permukaan
            "kaca" yang dilarang DESIGN.md — ini gambar, bukan panel. */}
        <Image
          src={images[active]}
          alt=""
          aria-hidden="true"
          fill
          sizes="64px"
          className="object-cover scale-110 blur-2xl opacity-45"
        />
        {/* object-contain, bukan cover: screenshot HP rasionya ~20:9, dan
            bingkai 16:9 dulu memotong sisi kiri-kanannya — padahal di situ
            sering ada info akun yang ingin dilihat pembeli. */}
        <Image
          src={images[active]}
          alt={`${title} — gambar ${active + 1}`}
          fill
          sizes={MAIN_SIZES}
          quality={PHOTO_QUALITY}
          loading="eager"
          fetchPriority="high"
          className="object-contain"
        />

        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute inset-0 w-full h-full cursor-zoom-in"
          aria-label={`Perbesar gambar ${active + 1} dari ${count}`}
        >
          <span className="absolute right-3 bottom-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-deep/75 border border-white/10 text-[11px] font-semibold text-text-main">
            <Maximize2 className="w-3.5 h-3.5" />
            Perbesar
          </span>
        </button>

        {many && (
          <>
            <button type="button" onClick={prev} className={cn(navButton, 'left-3')} aria-label="Gambar sebelumnya">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={next} className={cn(navButton, 'right-3')} aria-label="Gambar berikutnya">
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="pointer-events-none absolute left-3 bottom-3 px-2 py-1 rounded-md bg-bg-deep/75 text-[11px] font-mono text-text-main">
              {active + 1}/{count}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Lihat gambar ${idx + 1}`}
              aria-current={idx === active ? 'true' : undefined}
              className={cn(
                'relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors bg-bg-deep',
                idx === active ? 'border-brand-cyan' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Penampil layar penuh: gambar resolusi tinggi, utuh, bisa digeser. */}
      <DialogPrimitive.Root open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-60 bg-black/92" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-60 outline-none"
            onKeyDown={(e) => {
              if (!many) return;
              if (e.key === 'ArrowLeft') prev();
              if (e.key === 'ArrowRight') next();
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              {title} — gambar {active + 1} dari {count}
            </DialogPrimitive.Title>

            <div className="absolute inset-0 sm:inset-6 sm:top-16" {...(many ? swipe : {})}>
              <Image
                src={images[active]}
                alt={`${title} — gambar ${active + 1}`}
                fill
                sizes="100vw"
                quality={PHOTO_QUALITY}
                className="object-contain"
              />
            </div>

            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3 sm:p-4">
              <span className="px-2.5 py-1 rounded-md bg-black/60 text-xs font-mono text-white">
                {active + 1}/{count}
              </span>
              <DialogPrimitive.Close
                className="w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </DialogPrimitive.Close>
            </div>

            {many && (
              <>
                <button type="button" onClick={prev} className={cn(navButton, 'left-3 sm:left-5 w-12 h-12')} aria-label="Gambar sebelumnya">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button type="button" onClick={next} className={cn(navButton, 'right-3 sm:right-5 w-12 h-12')} aria-label="Gambar berikutnya">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
