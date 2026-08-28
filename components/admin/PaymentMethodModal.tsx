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
  createPaymentMethodAction,
  updatePaymentMethodAction,
  type PaymentMethodInput,
} from '@/lib/supabase/cms-actions';
import type { AdminPaymentMethod } from '@/lib/supabase/admin-queries';

function FormFields({
  method,
  onOpenChange,
  onSaved,
}: {
  method?: AdminPaymentMethod;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [code, setCode] = useState(method?.code ?? '');
  const [label, setLabel] = useState(method?.label ?? '');
  const [accountNumber, setAccountNumber] = useState(method?.accountNumber ?? '');
  const [accountName, setAccountName] = useState(method?.accountName ?? 'Paroy Store');
  const [sortOrder, setSortOrder] = useState(String(method?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(method?.isActive ?? true);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!code.trim() || !label.trim() || !accountNumber.trim()) {
      setError('Kode, label, dan nomor rekening/akun wajib diisi.');
      return;
    }

    const input: PaymentMethodInput = {
      code: code.trim().toLowerCase(),
      label: label.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim() || 'Paroy Store',
      isActive,
      sortOrder: Number(sortOrder) || 0,
    };

    startTransition(async () => {
      const result = method
        ? await updatePaymentMethodAction(method.id, input)
        : await createPaymentMethodAction(input);
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="Kode (unik)" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="bca" />
        <Input label="Label Tampilan" required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Transfer BCA" />
      </div>
      <Input
        label="Nomor Rekening / Akun"
        required
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        placeholder="1234567890"
      />
      <Input label="Atas Nama" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
      <Input label="Urutan Tampil" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />

      <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-brand-cyan cursor-pointer"
        />
        Aktifkan metode ini di checkout
      </label>

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
          {method ? 'Simpan Perubahan' : 'Tambah Metode'}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentMethodModal({
  open,
  onOpenChange,
  method,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: AdminPaymentMethod;
  onSaved?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{method ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</DialogTitle>
          <DialogDescription>Muncul sebagai pilihan di halaman checkout.</DialogDescription>
        </DialogHeader>
        {open && <FormFields method={method} onOpenChange={onOpenChange} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  );
}
