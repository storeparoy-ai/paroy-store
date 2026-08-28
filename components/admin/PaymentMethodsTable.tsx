'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PaymentMethodModal from '@/components/admin/PaymentMethodModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deletePaymentMethodAction } from '@/lib/supabase/cms-actions';
import type { AdminPaymentMethod } from '@/lib/supabase/admin-queries';

export default function PaymentMethodsTable({ methods }: { methods: AdminPaymentMethod[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPaymentMethod | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminPaymentMethod | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Metode Pembayaran ({methods.length})</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Metode
        </Button>
      </div>

      {methods.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Belum ada metode pembayaran — kalau ini mengejutkan, migration `00000000000005` mungkin belum dijalankan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                <th className="py-3 px-4 font-semibold">Label</th>
                <th className="py-3 px-4 font-semibold">Nomor</th>
                <th className="py-3 px-4 font-semibold">Atas Nama</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => (
                <tr key={method.id} className="border-b border-border-subtle/60 last:border-0">
                  <td className="py-3 px-4 text-xs font-semibold text-text-main whitespace-nowrap">{method.label}</td>
                  <td className="py-3 px-4 font-mono text-xs text-text-muted whitespace-nowrap">{method.accountNumber}</td>
                  <td className="py-3 px-4 text-xs text-text-muted whitespace-nowrap">{method.accountName}</td>
                  <td className="py-3 px-4">
                    <Badge variant={method.isActive ? 'trust' : 'neutral'} size="sm">
                      {method.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Edit"
                        onClick={() => {
                          setEditing(method);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Hapus" onClick={() => setDeleting(method)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentMethodModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        method={editing}
        onSaved={() => router.refresh()}
      />

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Hapus "${deleting.label}"?`}
          description="Pastikan tidak ada order yang masih menunggu pembayaran lewat metode ini."
          onConfirm={async () => {
            const result = await deletePaymentMethodAction(deleting.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      )}
    </div>
  );
}
