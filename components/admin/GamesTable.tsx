'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import GameModal from '@/components/admin/GameModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deleteGameAction } from '@/lib/supabase/cms-actions';
import type { AdminGame } from '@/lib/supabase/admin-queries';

export default function GamesTable({ games }: { games: AdminGame[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGame | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminGame | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Kategori Game ({games.length})</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Game
        </Button>
      </div>

      {games.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Belum ada game — kalau ini mengejutkan, migration `00000000000005_cms_foundation.sql` mungkin belum dijalankan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                <th className="py-3 px-4 font-semibold">Ikon</th>
                <th className="py-3 px-4 font-semibold">Nama</th>
                <th className="py-3 px-4 font-semibold">Slug</th>
                <th className="py-3 px-4 font-semibold">Warna</th>
                <th className="py-3 px-4 font-semibold">Urutan</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="border-b border-border-subtle/60 last:border-0">
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-xl bg-bg-card-alt border border-border-subtle flex items-center justify-center text-xl overflow-hidden relative">
                      {game.iconUrl ? (
                        <Image src={game.iconUrl} alt={game.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        game.icon || '🎮'
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-text-main whitespace-nowrap">{game.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-text-muted whitespace-nowrap">{game.slug}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-border-subtle"
                        style={{ backgroundColor: game.color }}
                      />
                      <span className="font-mono text-[11px] text-text-muted">{game.color}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-text-muted">{game.sortOrder}</td>
                  <td className="py-3 px-4">
                    <Badge variant={game.isActive ? 'trust' : 'neutral'} size="sm">
                      {game.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Edit"
                        onClick={() => {
                          setEditing(game);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Hapus" onClick={() => setDeleting(game)}>
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

      <GameModal open={modalOpen} onOpenChange={setModalOpen} game={editing} onSaved={() => router.refresh()} />

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Hapus "${deleting.name}"?`}
          description="Produk yang masih pakai game ini tidak akan terhapus, tapi filter game-nya perlu diatur ulang manual."
          onConfirm={async () => {
            const result = await deleteGameAction(deleting.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      )}
    </div>
  );
}
