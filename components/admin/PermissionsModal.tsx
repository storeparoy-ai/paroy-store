'use client';

import React, { useState, useTransition } from 'react';
import { KeyRound, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { ADMIN_PERMISSIONS, PERMISSION_LABELS, type AdminPermission } from '@/lib/admin-permissions';

/**
 * Kotak centang izin untuk satu admin.
 *
 * Tiap izin ditulis dari sisi orang yang akan memakainya ("Melihat &
 * memproses pesanan"), bukan dari sisi nama tabel — pemilik toko sedang
 * memutuskan seberapa jauh ia mempercayai seseorang, dan itu tidak bisa
 * dijawab oleh daftar istilah teknis.
 */
export default function PermissionsModal({
  open,
  onOpenChange,
  name,
  current,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  current: AdminPermission[];
  onSave: (permissions: AdminPermission[]) => Promise<{ success: boolean; error?: string }>;
}) {
  // Komponen ini hanya dipasang saat dialognya terbuka (lihat UsersTable),
  // jadi nilai awal ini otomatis segar tiap kali dibuka — centangan yang
  // sempat diubah lalu ditinggalkan tanpa disimpan tidak ikut kembali.
  // Menyamakannya lewat useEffect akan memicu render berantai.
  const [selected, setSelected] = useState<AdminPermission[]>(current);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggle(permission: AdminPermission) {
    setSelected((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  }

  function handleSave() {
    setError('');
    startTransition(async () => {
      const result = await onSave(selected);
      if (!result.success) {
        setError(result.error ?? 'Gagal menyimpan izin.');
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center mb-1">
            <KeyRound className="w-5 h-5" />
          </div>
          <DialogTitle>Izin untuk {name}</DialogTitle>
          <DialogDescription>
            Centang bagian yang boleh ia buka. Yang tidak dicentang tidak akan muncul di menunya,
            dan tetap ditolak database walau URL-nya diketik langsung.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {ADMIN_PERMISSIONS.map((permission) => {
            const { label, hint } = PERMISSION_LABELS[permission];
            const checked = selected.includes(permission);
            return (
              <label
                key={permission}
                className="flex gap-3 p-3 rounded-xl border border-border-subtle bg-bg-card-alt cursor-pointer hover:border-brand-cyan/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(permission)}
                  className="w-4 h-4 mt-0.5 accent-brand-cyan cursor-pointer shrink-0"
                />
                <span className="space-y-0.5">
                  <span className="block text-xs font-semibold text-text-main">{label}</span>
                  <span className="block text-[11px] text-text-muted leading-relaxed">{hint}</span>
                </span>
              </label>
            );
          })}
        </div>

        <p className="text-[11px] text-text-dim leading-relaxed">
          Nomor rekening tujuan, kunci Tripay, token bot, pengaturan situs, dan halaman Pengguna
          tidak ada di daftar ini — semuanya selamanya hanya untuk pemilik.
        </p>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-urgency-red/10 border border-urgency-red/25 text-xs text-urgency-red">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} isLoading={isPending}>
            Simpan Izin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
