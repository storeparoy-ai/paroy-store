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
import {
  createRekberFeeTierAction,
  updateRekberFeeTierAction,
  type RekberFeeTierInput,
} from '@/lib/supabase/cms-actions';
import type { AdminRekberFeeTier } from '@/lib/supabase/admin-queries';

function FormFields({
  tier,
  onOpenChange,
  onSaved,
}: {
  tier?: AdminRekberFeeTier;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [maxAmount, setMaxAmount] = useState(tier?.maxAmount != null ? String(tier.maxAmount) : '');
  const [isUnlimited, setIsUnlimited] = useState(tier ? tier.maxAmount === null : false);
  const [fee, setFee] = useState(tier ? String(tier.fee) : '');
  const [sortOrder, setSortOrder] = useState(String(tier?.sortOrder ?? 0));
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const feeNum = Number(fee);
    if (!feeNum || feeNum <= 0) {
      setError('Isi biaya jasa dengan benar.');
      return;
    }
    if (!isUnlimited && (!maxAmount || Number(maxAmount) <= 0)) {
      setError('Isi batas nominal, atau centang "tanpa batas atas".');
      return;
    }

    const input: RekberFeeTierInput = {
      maxAmount: isUnlimited ? null : Number(maxAmount),
      fee: feeNum,
      sortOrder: Number(sortOrder) || 0,
    };

    startTransition(async () => {
      const result = tier ? await updateRekberFeeTierAction(tier.id, input) : await createRekberFeeTierAction(input);
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
      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isUnlimited}
          onChange={(e) => setIsUnlimited(e.target.checked)}
          className="w-4 h-4 accent-brand-cyan cursor-pointer"
        />
        Tier terakhir (tanpa batas atas — &ldquo;dan seterusnya&rdquo;)
      </label>

      {!isUnlimited && (
        <Input
          label="Untuk transaksi hingga (Rp)"
          type="number"
          required
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          placeholder="500000"
        />
      )}
      <Input label="Biaya Jasa Rekber (Rp)" type="number" required value={fee} onChange={(e) => setFee(e.target.value)} placeholder="10000" />
      <Input label="Urutan (kecil ke besar)" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>
          {tier ? 'Simpan Perubahan' : 'Tambah Tier'}
        </Button>
      </div>
    </form>
  );
}

export default function RekberFeeTierModal({
  open,
  onOpenChange,
  tier,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: AdminRekberFeeTier;
  onSaved?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tier ? 'Edit Tier Tarif' : 'Tambah Tier Tarif'}</DialogTitle>
          <DialogDescription>
            Biaya jasa rekber dihitung otomatis berdasarkan nominal transaksi.
          </DialogDescription>
        </DialogHeader>
        {open && <FormFields tier={tier} onOpenChange={onOpenChange} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  );
}
