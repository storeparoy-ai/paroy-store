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
  createTopupItemAction,
  updateTopupItemAction,
  type TopupItemInput,
} from '@/lib/supabase/cms-actions';
import type { AdminTopupItem } from '@/lib/supabase/admin-queries';
import type { Game } from '@/types';

function FormFields({
  item,
  games,
  onOpenChange,
  onSaved,
}: {
  item?: AdminTopupItem;
  games: Game[];
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [gameId, setGameId] = useState(item?.gameId ?? games[0]?.id ?? '');
  const [label, setLabel] = useState(item?.label ?? '');
  const [amount, setAmount] = useState(item?.amount != null ? String(item.amount) : '');
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!gameId) {
      setError('Pilih game dulu — tambahkan lewat tab Kategori Game kalau belum ada.');
      return;
    }
    if (!label.trim()) {
      setError('Isi nama nominalnya, mis. "86 💎 Diamond".');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Isi harga jual dengan benar.');
      return;
    }

    const input: TopupItemInput = {
      gameId,
      label: label.trim(),
      amount: amount ? Number(amount) : null,
      price: Number(price),
      isActive,
      sortOrder: Number(sortOrder) || 0,
    };

    startTransition(async () => {
      const result = item ? await updateTopupItemAction(item.id, input) : await createTopupItemAction(input);
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
        <label className="text-xs font-semibold text-text-muted">Game</label>
        <select
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="w-full h-11 bg-bg-card border border-border-subtle rounded-xl text-xs sm:text-sm text-text-main px-4 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.icon} {g.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Nama Nominal"
        required
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="86 💎 Diamond"
      />

      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput label="Harga Jual" required value={price} onValueChange={setPrice} placeholder="20.000" />
        <Input
          label="Jumlah (opsional)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="86"
        />
      </div>

      <Input
        label="Urutan Tampil (kecil ke besar)"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      />

      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-brand-cyan cursor-pointer"
        />
        Tampilkan nominal ini di halaman Top Up
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
          {item ? 'Simpan Perubahan' : 'Tambah Nominal'}
        </Button>
      </div>
    </form>
  );
}

export default function TopupItemModal({
  open,
  onOpenChange,
  item,
  games,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: AdminTopupItem;
  games: Game[];
  onSaved?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Nominal Top Up' : 'Tambah Nominal Top Up'}</DialogTitle>
          <DialogDescription>
            Harga yang tersimpan di sini yang dipakai membuat invoice — bukan angka dari browser pembeli.
          </DialogDescription>
        </DialogHeader>
        {open &&
          (games.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">
              Belum ada game — tambahkan dulu di tab Kategori Game.
            </p>
          ) : (
            <FormFields item={item} games={games} onOpenChange={onOpenChange} onSaved={onSaved} />
          ))}
      </DialogContent>
    </Dialog>
  );
}
