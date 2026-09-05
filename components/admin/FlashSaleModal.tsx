'use client';

import React, { useState, useTransition } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { createFlashSaleAction, updateFlashSaleAction, type FlashSaleInput } from '@/lib/supabase/cms-actions';
import { formatCurrency } from '@/lib/utils';
import type { AdminFlashSale } from '@/lib/supabase/admin-queries';
import type { Product } from '@/types';

function toLocalDatetimeInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function FlashSaleFormFields({
  sale,
  products,
  onOpenChange,
  onSaved,
}: {
  sale?: AdminFlashSale;
  products: Product[];
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [productId, setProductId] = useState(sale?.productId ?? products[0]?.id ?? '');
  const [salePrice, setSalePrice] = useState(sale ? String(sale.salePrice) : '');
  const [stock, setStock] = useState(sale ? String(sale.stock) : '5');
  // Lazy initializers (the `() => ...` form) run exactly once, at this
  // component's first render — and this component itself only ever mounts
  // fresh while the dialog is open (see ProductModal.tsx for the same
  // pattern), so "now" here really is "the moment the admin opened this
  // form," not a value that needs to stay in sync afterwards. That's what
  // keeps this a one-time read instead of the kind of impure/repeated call
  // the purity rule is actually guarding against.
  const [startsAt, setStartsAt] = useState(() =>
    toLocalDatetimeInput(sale?.startsAt ?? new Date())
  );
  const [endsAt, setEndsAt] = useState(() =>
    toLocalDatetimeInput(sale?.endsAt ?? new Date(Date.now() + 3 * 60 * 60 * 1000))
  );
  const [isActive, setIsActive] = useState(sale?.isActive ?? true);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const selectedProduct = products.find((p) => p.id === productId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const price = Number(salePrice);
    if (!productId || !price || price <= 0) {
      setError('Pilih produk dan isi harga flash sale dengan benar.');
      return;
    }

    const input: FlashSaleInput = {
      productId,
      salePrice: price,
      stock: Number(stock) || 0,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      isActive,
    };

    startTransition(async () => {
      const result = sale ? await updateFlashSaleAction(sale.id, input) : await createFlashSaleAction(input);
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
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted">Produk</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full h-11 bg-bg-card border border-border-subtle rounded-xl text-xs sm:text-sm text-text-main px-4 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {formatCurrency(p.price)}
            </option>
          ))}
        </select>
        {selectedProduct && (
          <p className="text-[11px] text-text-dim">Harga normal: {formatCurrency(selectedProduct.price)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput label="Harga Flash Sale" required value={salePrice} onValueChange={setSalePrice} />
        <Input label="Stok" type="number" required value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Mulai" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <Input label="Berakhir" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
      </div>

      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-urgency-orange cursor-pointer"
        />
        Aktifkan flash sale ini
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
        <Button type="submit" variant="urgency" isLoading={isPending}>
          {sale ? 'Simpan Perubahan' : 'Buat Flash Sale'}
        </Button>
      </div>
    </form>
  );
}

export default function FlashSaleModal({
  open,
  onOpenChange,
  sale,
  products,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale?: AdminFlashSale;
  products: Product[];
  onSaved?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Flash Sale' : 'Buat Flash Sale Baru'}</DialogTitle>
          <DialogDescription>Muncul di homepage selama masih aktif dan belum berakhir.</DialogDescription>
        </DialogHeader>
        {open &&
          (products.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">
              Belum ada produk aktif — tambahkan produk dulu di tab Produk.
            </p>
          ) : (
            <FlashSaleFormFields sale={sale} products={products} onOpenChange={onOpenChange} onSaved={onSaved} />
          ))}
      </DialogContent>
    </Dialog>
  );
}
