'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import RekberFeeTierModal from '@/components/admin/RekberFeeTierModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deleteRekberFeeTierAction } from '@/lib/supabase/cms-actions';
import { formatCurrency } from '@/lib/utils';
import type { AdminRekberFeeTier } from '@/lib/supabase/admin-queries';

export default function RekberFeeTiersTable({ tiers }: { tiers: AdminRekberFeeTier[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRekberFeeTier | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminRekberFeeTier | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Tarif Jasa Rekber ({tiers.length})</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Tier
        </Button>
      </div>

      {tiers.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Belum ada tier tarif — kalau ini mengejutkan, migration `00000000000005` mungkin belum dijalankan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                <th className="py-3 px-4 font-semibold">Rentang Nominal Transaksi</th>
                <th className="py-3 px-4 font-semibold">Biaya Jasa</th>
                <th className="py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-border-subtle/60 last:border-0">
                  <td className="py-3 px-4 text-xs text-text-main whitespace-nowrap">
                    {tier.maxAmount === null ? 'Di atas tier sebelumnya' : `Hingga ${formatCurrency(tier.maxAmount)}`}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-bold text-brand-cyan whitespace-nowrap">
                    {formatCurrency(tier.fee)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Edit"
                        onClick={() => {
                          setEditing(tier);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Hapus" onClick={() => setDeleting(tier)}>
                        <Trash2 className="w-3.5 h-3.5 text-urgency-red" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RekberFeeTierModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tier={editing}
        onSaved={() => router.refresh()}
      />

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title="Hapus tier tarif ini?"
          description="Pastikan masih ada tier lain yang menutupi seluruh rentang nominal transaksi."
          onConfirm={async () => {
            const result = await deleteRekberFeeTierAction(deleting.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      )}
    </div>
  );
}
