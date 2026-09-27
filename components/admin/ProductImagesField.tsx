'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, X, AlertCircle } from 'lucide-react';
import { uploadPublicImage, PUBLIC_IMAGE_MAX_MB } from '@/lib/supabase/storage';
import { cn } from '@/lib/utils';

// Beberapa berkas sekaligus, tapi tidak semuanya bersamaan — cukup untuk
// terasa cepat tanpa membanjiri koneksi HP admin.
const PARALLEL_UPLOADS = 3;

type Slot = { id: string; name: string; done: boolean };

/**
 * Pengelola gambar produk: unggah banyak sekaligus (pilih atau seret), lihat
 * pratinjaunya, atur urutan, hapus. Gambar pertama adalah sampul — itu yang
 * tampil di kartu katalog.
 *
 * Menggantikan kotak teks "satu link per baris": unggahan hanya bisa satu per
 * satu, dan hasilnya berupa URL panjang yang tidak bisa dilihat gambarnya.
 */
export default function ProductImagesField({
  images,
  setImages,
  onBusyChange,
}: {
  images: string[];
  /** Selalu dipanggil dengan fungsi pembaru: unggahan berjalan beberapa
   * detik, dan admin boleh menghapus/menggeser gambar lain selama itu. */
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  /** Supaya form bisa menahan tombol Simpan selama unggahan berjalan —
   * gambar yang belum selesai tidak ikut tersimpan. */
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const uploading = slots.length > 0;

  async function uploadFiles(list: FileList | File[]) {
    const files = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setErrors([]);

    const batch: Slot[] = files.map((f) => ({ id: crypto.randomUUID(), name: f.name, done: false }));
    setSlots(batch);
    onBusyChange?.(true);

    const results: Awaited<ReturnType<typeof uploadPublicImage>>[] = new Array(files.length);
    let cursor = 0;
    async function worker() {
      while (cursor < files.length) {
        const i = cursor++;
        results[i] = await uploadPublicImage(files[i], 'products');
        setSlots((s) => s.map((slot) => (slot.id === batch[i].id ? { ...slot, done: true } : slot)));
      }
    }
    await Promise.all(Array.from({ length: Math.min(PARALLEL_UPLOADS, files.length) }, worker));

    // Ditambahkan sekaligus dan urut sesuai pilihan, bukan urutan selesai
    // unggah — supaya susunan yang dipilih admin tidak teracak.
    const urls: string[] = [];
    const failed: string[] = [];
    results.forEach((r, i) => ('error' in r ? failed.push(`${files[i].name}: ${r.error}`) : urls.push(r.url)));
    setImages((prev) => [...prev, ...urls]);
    setErrors(failed);
    setSlots([]);
    onBusyChange?.(false);
  }

  function move(from: number, to: number) {
    setImages((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  const doneCount = slots.filter((s) => s.done).length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted">Gambar Produk</span>
        {images.length > 0 && (
          <span className="text-[11px] text-text-dim">{images.length} gambar &middot; yang pertama jadi sampul</span>
        )}
      </div>

      {(images.length > 0 || uploading) && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {images.map((url, idx) => (
            <li
              key={url + idx}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden border bg-bg-deep',
                idx === 0 ? 'border-brand-cyan/60' : 'border-border-subtle'
              )}
            >
              {/* unoptimized: produk lama bisa saja menyimpan link dari situs
                  lain, dan pratinjau admin tidak boleh ikut gagal karenanya. */}
              <Image src={url} alt={`Gambar ${idx + 1}`} fill unoptimized className="object-contain" />

              {idx === 0 ? (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-brand-cyan text-[10px] font-bold text-bg-deep">
                  Sampul
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => move(idx, 0)}
                  title="Jadikan sampul"
                  aria-label={`Jadikan gambar ${idx + 1} sampul`}
                  className="absolute top-1.5 left-1.5 w-7 h-7 rounded-md bg-bg-deep/80 text-text-main flex items-center justify-center hover:text-brand-cyan"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                title="Hapus gambar"
                aria-label={`Hapus gambar ${idx + 1}`}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-md bg-bg-deep/80 text-text-main flex items-center justify-center hover:text-urgency-red"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {images.length > 1 && (
                <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    aria-label={`Geser gambar ${idx + 1} ke kiri`}
                    className="w-7 h-7 rounded-md bg-bg-deep/80 text-text-main flex items-center justify-center hover:text-brand-cyan disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === images.length - 1}
                    aria-label={`Geser gambar ${idx + 1} ke kanan`}
                    className="w-7 h-7 rounded-md bg-bg-deep/80 text-text-main flex items-center justify-center hover:text-brand-cyan disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          ))}

          {slots.map((slot) => (
            <li
              key={slot.id}
              className="relative aspect-video rounded-lg border border-dashed border-border-subtle bg-bg-card flex flex-col items-center justify-center gap-1.5 px-2"
            >
              {slot.done ? (
                <span className="text-[11px] font-semibold text-trust-emerald">Selesai</span>
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
              )}
              <span className="text-[10px] text-text-dim truncate max-w-full">{slot.name}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!uploading) uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          'w-full flex flex-col items-center justify-center gap-1 py-5 rounded-xl border border-dashed transition-colors disabled:opacity-60',
          dragOver ? 'border-brand-cyan bg-brand-cyan/10' : 'border-border-subtle bg-bg-card hover:border-brand-cyan/40'
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-brand-cyan" />
            <span className="text-xs font-semibold text-text-main">
              Mengunggah {doneCount}/{slots.length}&hellip;
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="w-5 h-5 text-brand-cyan" />
            <span className="text-xs font-semibold text-text-main">Pilih gambar — boleh beberapa sekaligus</span>
            <span className="text-[11px] text-text-dim">
              atau seret ke sini &middot; maks {PUBLIC_IMAGE_MAX_MB}MB per gambar, disimpan tanpa dikompres
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) uploadFiles(Array.from(files));
          e.target.value = '';
        }}
      />

      {errors.length > 0 && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-urgency-red/10 border border-urgency-red/25 text-xs text-urgency-red">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{errors.length} gambar gagal diunggah:</p>
            <ul className="mt-1 space-y-0.5">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
