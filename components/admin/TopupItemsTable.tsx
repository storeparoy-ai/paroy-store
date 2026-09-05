'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import TopupItemModal from '@/components/admin/TopupItemModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deleteTopupItemAction } from '@/lib/supabase/cms-actions';
import { formatCurrency } from '@/lib/utils';
import type { AdminTopupItem } from '@/lib/supabase/admin-queries';
import type { Game } from '@/types';

export default function TopupItemsTable({
  items,
  games,
}: {
  items: AdminTopupItem[];
  games: Game[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTopupItem | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminTopupItem | null>(null);

  // Dikelompokkan per game supaya daftarnya terbaca seperti tampilan
  // halaman Top Up-nya sendiri, bukan satu tabel panjang campur aduk.
  const byGame = new Map<string, AdminTopupItem[]>();
  for (const item of items) {
    const list = byGame.get(item.gameName) ?? [];
    list.push(item);
    byGame.set(item.gameName, list);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Item Top Up ({items.length})</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Nominal
        </Button>
      </div>

      <p className="text-xs text-text-muted">
        Nominal yang tampil di halaman <code className="text-text-dim">/topup</code> diambil dari daftar
        ini. Harga di sini juga yang dipakai membuat invoice — nominal dari browser pembeli tidak
        dipercaya sama sekali.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Belum ada item top up — kalau ini mengejutkan, migrasi{' '}
          <code className="text-text-dim">00000000000013</code> mungkin belum dijalankan.
        </p>
      ) : (
        <div className="space-y-6">
          {Array.from(byGame.entries()).map(([gameName, gameItems]) => (
            <div key={gameName} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">
                {gameName} ({gameItems.length})
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-border-subtle">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                      <th className="py-3 px-4 font-semibold">Urutan</th>
                      <th className="py-3 px-4 font-semibold">Nominal</th>
                      <th className="py-3 px-4 font-semibold">Harga</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameItems.map((item) => (
                      <tr key={item.id} className="border-b border-border-subtle/60 last:border-0">
                        <td className="py-3 px-4 font-mono text-xs text-text-dim">{item.sortOrder}</td>
                        <td className="py-3 px-4 text-xs font-semibold text-text-main">{item.label}</td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-brand-cyan whitespace-nowrap">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={item.isActive ? 'trust' : 'neutral'} size="sm">
                            {item.isActive ? 'tampil' : 'disembunyikan'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label="Edit"
                              onClick={() => {
                                setEditing(item);
                                setModalOpen(true);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label="Hapus"
                              onClick={() => setDeleting(item)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-urgency-red" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <TopupItemModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editing}
        games={games}
        onSaved={() => router.refresh()}
      />

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Hapus "${deleting.label}"?`}
          description="Nominal ini langsung hilang dari halaman Top Up. Kalau cuma ingin menyembunyikannya sementara, lebih baik matikan centang 'Tampilkan' lewat Edit."
          onConfirm={async () => {
            const result = await deleteTopupItemAction(deleting.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      )}
    </div>
  );
}
