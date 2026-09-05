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
import {
  createPriceRangeAction,
  updatePriceRangeAction,
  type PriceRangeInput,
} from '@/lib/supabase/cms-actions';
import { formatPriceRangeLabel, type PriceRange } from '@/lib/utils';

function FormFields({
  range,
  onOpenChange,
  onSaved,
}: {
  range?: PriceRange;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [noMin, setNoMin] = useState(range ? range.minAmount === null : true);
  const [minAmount, setMinAmount] = useState(range?.minAmount != null ? String(range.minAmount) : '');
  const [noMax, setNoMax] = useState(range ? range.maxAmount === null : false);
  const [maxAmount, setMaxAmount] = useState(range?.maxAmount != null ? String(range.maxAmount) : '');
  const [sortOrder, setSortOrder] = useState(String(range?.sortOrder ?? 0));
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const min = noMin ? null : Number(minAmount);
  const max = noMax ? null : Number(maxAmount);
  const preview = formatPriceRangeLabel(min, max);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (noMin && noMax) {
      setError('Isi minimal salah satu batas — nggak bisa dua-duanya "tanpa batas".');
      return;
    }
    if (!noMin && (!minAmount || Number(minAmount) < 0)) {
      setError('Isi batas bawah dengan benar, atau centang "tanpa batas bawah".');
      return;
    }
    if (!noMax && (!maxAmount || Number(maxAmount) <= 0)) {
      setError('Isi batas atas dengan benar, atau centang "tanpa batas atas".');
      return;
    }
    if (!noMin && !noMax && Number(minAmount) >= Number(maxAmount)) {
      setError('Batas bawah harus lebih kecil dari batas atas.');
      return;
    }

    const input: PriceRangeInput = { minAmount: min, maxAmount: max, sortOrder: Number(sortOrder) || 0 };

    startTransition(async () => {
      const result = range ? await updatePriceRangeAction(range.id, input) : await createPriceRangeAction(input);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          {!noMin && (
            <CurrencyInput
              label="Batas Bawah"
              required
              value={minAmount}
              onValueChange={setMinAmount}
              placeholder="200.000"
            />
          )}
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={noMin}
              onChange={(e) => setNoMin(e.target.checked)}
              className="w-3.5 h-3.5 accent-brand-cyan cursor-pointer"
            />
            Tanpa batas bawah
          </label>
        </div>
        <div className="space-y-2">
          {!noMax && (
            <CurrencyInput
              label="Batas Atas"
              required
              value={maxAmount}
              onValueChange={setMaxAmount}
              placeholder="400.000"
            />
          )}
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={noMax}
              onChange={(e) => setNoMax(e.target.checked)}
              className="w-3.5 h-3.5 accent-brand-cyan cursor-pointer"
            />
            Tanpa batas atas
          </label>
        </div>
      </div>

      <Input label="Urutan (kecil ke besar)" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />

      <div className="text-xs text-text-dim">
        Tampil sebagai: <span className="font-mono text-brand-cyan">{preview}</span>
      </div>

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
          {range ? 'Simpan Perubahan' : 'Tambah Rentang'}
        </Button>
      </div>
    </form>
  );
}

export default function PriceRangeModal({
  open,
  onOpenChange,
  range,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  range?: PriceRange;
  onSaved?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{range ? 'Edit Rentang Harga' : 'Tambah Rentang Harga'}</DialogTitle>
          <DialogDescription>Muncul sebagai chip filter di halaman Katalog Akun.</DialogDescription>
        </DialogHeader>
        {open && <FormFields range={range} onOpenChange={onOpenChange} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  );
}
