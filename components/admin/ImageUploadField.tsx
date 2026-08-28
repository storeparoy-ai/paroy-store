'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageOff } from 'lucide-react';
import { uploadPublicImage } from '@/lib/supabase/storage';
import { cn } from '@/lib/utils';

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  shape = 'square',
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** Storage sub-folder, e.g. "games", "mascot" */
  folder: string;
  shape?: 'square' | 'wide';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setIsUploading(true);
    const result = await uploadPublicImage(file, folder);
    setIsUploading(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    onChange(result.url);
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-text-muted">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'relative shrink-0 rounded-xl overflow-hidden bg-bg-card-alt border border-border-subtle flex items-center justify-center',
            shape === 'square' ? 'w-16 h-16' : 'w-28 h-16'
          )}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-text-dim" />
          ) : value ? (
            <Image src={value} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <ImageOff className="w-5 h-5 text-text-dim" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs font-semibold text-text-main hover:border-brand-cyan/40 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {value ? 'Ganti Gambar' : 'Upload Gambar'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-text-dim hover:text-urgency-red transition-colors"
            >
              <X className="w-3 h-3" />
              Hapus
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-[11px] text-urgency-red">{error}</p>}
    </div>
  );
}
