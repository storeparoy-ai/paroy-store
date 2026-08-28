'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import PriceRangeModal from '@/components/admin/PriceRangeModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deletePriceRangeAction } from '@/lib/supabase/cms-actions';
import { formatPriceRangeLabel, type PriceRange } from '@/lib/utils';

export default function PriceRangesTable({ ranges }: { ranges: PriceRange[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PriceRange | undefined>(undefined);
  const [deleting, setDeleting] = useState<PriceRange | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Rentang Harga ({ranges.length})</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Rentang
        </Button>
      </div>

      <p className="text-xs text-text-muted">
        Chip filter &ldquo;Rentang Harga&rdquo; di halaman Katalog Akun (<code className="text-text-dim">/products</code>) diambil dari daftar ini, diurutkan dari terkecil.
      </p>

      {ranges.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Belum ada rentang harga — kalau ini mengejutkan, migration `00000000000006` mungkin belum dijalankan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                <th className="py-3 px-4 font-semibold">Urutan</th>
                <th className="py-3 px-4 font-semibold">Tampil Sebagai</th>
                <th className="py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ranges.map((range) => (
                <tr key={range.id} className="border-b border-border-subtle/60 last:border-0">
                  <td className="py-3 px-4 font-mono text-xs text-text-dim">{range.sortOrder}</td>
                  <td className="py-3 px-4 font-mono text-xs font-bold text-brand-cyan whitespace-nowrap">
                    {formatPriceRangeLabel(range.minAmount, range.maxAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Edit"
                        onClick={() => {
                          setEditing(range);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Hapus" onClick={() => setDeleting(range)}>
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

      <PriceRangeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        range={editing}
        onSaved={() => router.refresh()}
      />

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Hapus rentang "${formatPriceRangeLabel(deleting.minAmount, deleting.maxAmount)}"?`}
          description="Chip filter ini akan langsung hilang dari halaman Katalog Akun."
          onConfirm={async () => {
            const result = await deletePriceRangeAction(deleting.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      )}
    </div>
  );
}
