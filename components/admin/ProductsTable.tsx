'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProductModal from '@/components/admin/ProductModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deleteProductAction } from '@/lib/supabase/admin-actions';
import { formatCurrency } from '@/lib/utils';
import type { Game, Product } from '@/types';

export default function ProductsTable({ products, games }: { products: Product[]; games: Game[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Produk ({products.length})</h2>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" />
          Tambah Produk
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">Belum ada produk.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                <th className="py-3 px-4 font-semibold">Produk</th>
                <th className="py-3 px-4 font-semibold">Game</th>
                <th className="py-3 px-4 font-semibold">Harga</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Featured</th>
                <th className="py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border-subtle/60 last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-9 shrink-0 rounded-lg overflow-hidden bg-bg-card-alt">
                        <Image src={product.images[0]} alt={product.title} fill sizes="48px" className="object-cover" />
                      </div>
                      <span className="text-xs text-text-main line-clamp-2 max-w-55">{product.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-text-muted whitespace-nowrap">
                    {product.game.icon} {product.game.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-text-main whitespace-nowrap">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={product.status === 'active' ? 'trust' : 'neutral'} size="sm">
                      {product.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-text-muted">{product.isFeatured ? 'Ya' : '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(product)} aria-label="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleting(product)} aria-label="Hapus">
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

      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={editing}
        games={games}
        onSaved={() => router.refresh()}
      />

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Hapus "${deleting.title}"?`}
          description="Produk yang sudah dihapus tidak bisa dikembalikan. Pastikan tidak ada order aktif untuk produk ini."
          onConfirm={async () => {
            const result = await deleteProductAction(deleting.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      )}
    </div>
  );
}
