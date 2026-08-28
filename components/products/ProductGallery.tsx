'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-bg-card-alt border border-border-subtle">
        <Image
          src={images[active]}
          alt={`${title} — screenshot ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setActive(idx)}
              className={cn(
                'relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors',
                idx === active ? 'border-brand-cyan' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
