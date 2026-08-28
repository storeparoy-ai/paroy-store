'use client';

import React, { useRef, useState, useTransition } from 'react';
import { AlertCircle, Upload, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createProductAction, updateProductAction, type ProductInput } from '@/lib/supabase/admin-actions';
import { uploadPublicImage } from '@/lib/supabase/storage';
import type { Game, Product } from '@/types';

const STATUS_OPTIONS = ['active', 'inactive', 'pending', 'reserved', 'sold'];
const PLATFORM_OPTIONS = ['Android', 'iOS', 'PC'];

function toFormState(product?: Product, games?: Game[]) {
  return {
    title: product?.title ?? '',
    gameId: product?.game.id ?? games?.[0]?.id ?? '',
    price: product ? String(product.price) : '',
    originalPrice: product?.originalPrice ? String(product.originalPrice) : '',
    canRental: product?.canRental ?? false,
    rentalPriceDaily: product?.rentalPriceDaily ? String(product.rentalPriceDaily) : '',
    rentalPriceHourly: product?.rentalPriceHourly ? String(product.rentalPriceHourly) : '',
    status: product?.status ?? 'active',
    region: product?.region ?? 'Indonesia',
    platform: product?.platform ?? ['Android', 'iOS'],
    images: product?.images.join('\n') ?? '',
    specs: product ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
    isFeatured: product?.isFeatured ?? false,
  };
}

/**
 * Owns all form state. Rendered fresh each time the dialog opens (see
 * ProductModal below), so its useState initializer naturally picks up the
 * right `product` snapshot without needing an effect to reset state.
 */
function ProductFormFields({
  product,
  games,
  onOpenChange,
  onSaved,
}: {
  product?: Product;
  games: Game[];
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState(() => toFormState(product, games));
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platform: f.platform.includes(p) ? f.platform.filter((x) => x !== p) : [...f.platform, p],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const price = Number(form.price);
    if (!form.title.trim() || !price || price <= 0) {
      setError('Judul dan harga wajib diisi dengan benar.');
      return;
    }
    const selectedGame = games.find((g) => g.id === form.gameId);
    if (!selectedGame) {
      setError('Pilih game dulu ya.');
      return;
    }

    const specs: Record<string, string> = {};
    for (const line of form.specs.split('\n')) {
      const [key, ...rest] = line.split(':');
      if (key && rest.length > 0) specs[key.trim()] = rest.join(':').trim();
    }

    const input: ProductInput = {
      title: form.title.trim(),
      gameId: selectedGame.id,
      gameName: selectedGame.name,
      price,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      canRental: form.canRental,
      rentalPriceDaily: form.rentalPriceDaily ? Number(form.rentalPriceDaily) : undefined,
      rentalPriceHourly: form.rentalPriceHourly ? Number(form.rentalPriceHourly) : undefined,
      status: form.status,
      region: form.region.trim() || 'Indonesia',
      platform: form.platform.length > 0 ? form.platform : ['Android', 'iOS'],
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      specs,
      isFeatured: form.isFeatured,
    };

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, input)
        : await createProductAction(input);

      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      onSaved?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Judul Produk"
        required
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="Contoh: Akun MLBB Mythic Glory 120 Hero"
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">Game</label>
          <select
            value={form.gameId}
            onChange={(e) => setForm((f) => ({ ...f, gameId: e.target.value }))}
            className="w-full h-11 bg-bg-card border border-border-subtle rounded-xl text-xs sm:text-sm text-text-main px-4 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
          >
            {games.length === 0 && <option value="">Belum ada kategori game</option>}
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}
            className="w-full h-11 bg-bg-card border border-border-subtle rounded-xl text-xs sm:text-sm text-text-main px-4 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Harga (Rp)"
          type="number"
          required
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="450000"
        />
        <Input
          label="Harga Coret (opsional)"
          type="number"
          value={form.originalPrice}
          onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
          placeholder="600000"
        />
      </div>

      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={form.canRental}
          onChange={(e) => setForm((f) => ({ ...f, canRental: e.target.checked }))}
          className="w-4 h-4 accent-brand-cyan cursor-pointer"
        />
        Bisa disewa
      </label>

      {form.canRental && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Harga Sewa / Jam"
            type="number"
            value={form.rentalPriceHourly}
            onChange={(e) => setForm((f) => ({ ...f, rentalPriceHourly: e.target.value }))}
            placeholder="15000"
          />
          <Input
            label="Harga Sewa / Hari"
            type="number"
            value={form.rentalPriceDaily}
            onChange={(e) => setForm((f) => ({ ...f, rentalPriceDaily: e.target.value }))}
            placeholder="80000"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted">Platform</label>
        <div className="flex gap-4">
          {PLATFORM_OPTIONS.map((p) => (
            <label key={p} className="flex items-center gap-1.5 text-xs text-text-main cursor-pointer">
              <input
                type="checkbox"
                checked={form.platform.includes(p)}
                onChange={() => togglePlatform(p)}
                className="w-3.5 h-3.5 accent-brand-cyan cursor-pointer"
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Region"
        value={form.region}
        onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-muted">
            Gambar Produk (satu link per baris)
          </label>
          <button
            type="button"
            disabled={isUploadingImage}
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-cyan hover:text-cyan-300 transition-colors disabled:opacity-50"
          >
            {isUploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            Upload Gambar
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setIsUploadingImage(true);
              const result = await uploadPublicImage(file, 'products');
              setIsUploadingImage(false);
              if ('error' in result) {
                setError(result.error);
                return;
              }
              setForm((f) => ({ ...f, images: f.images ? `${f.images}\n${result.url}` : result.url }));
            }}
          />
        </div>
        <textarea
          value={form.images}
          onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
          rows={3}
          placeholder={'https://.../gambar1.jpg\nhttps://.../gambar2.jpg'}
          className="w-full bg-bg-card border border-border-subtle rounded-xl text-xs text-text-main p-3 focus:outline-none focus:border-brand-cyan/50 font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted">
          Spesifikasi (format &ldquo;label: nilai&rdquo;, satu per baris)
        </label>
        <textarea
          value={form.specs}
          onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
          rows={3}
          placeholder={'Rank: Mythic Glory\nHero: 120\nSkin: 75'}
          className="w-full bg-bg-card border border-border-subtle rounded-xl text-xs text-text-main p-3 focus:outline-none focus:border-brand-cyan/50 font-mono"
        />
      </div>

      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
          className="w-4 h-4 accent-brand-cyan cursor-pointer"
        />
        Tampilkan di &ldquo;Akun Pilihan&rdquo; homepage
      </label>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-urgency-red/10 border border-urgency-red/25 text-xs text-urgency-red">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>
          {product ? 'Simpan Perubahan' : 'Tambah Produk'}
        </Button>
      </div>
    </form>
  );
}

export default function ProductModal({
  open,
  onOpenChange,
  product,
  games,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** undefined = create mode, defined = edit mode */
  product?: Product;
  games: Game[];
  onSaved?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
          <DialogDescription>
            Isi detail akun yang akan ditampilkan di katalog Paroy Store.
          </DialogDescription>
        </DialogHeader>

        {/* Only mounted while open, so its internal state starts fresh
            each time instead of needing an effect to reset it. */}
        {open && (
          <ProductFormFields product={product} games={games} onOpenChange={onOpenChange} onSaved={onSaved} />
        )}
      </DialogContent>
    </Dialog>
  );
}
