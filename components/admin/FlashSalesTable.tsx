'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import FlashSaleModal from '@/components/admin/FlashSaleModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deleteFlashSaleAction } from '@/lib/supabase/cms-actions';
import { formatCurrency } from '@/lib/utils';
import type { AdminFlashSale } from '@/lib/supabase/admin-queries';
import type { Product } from '@/types';

export default function FlashSalesTable({ sales, products }: { sales: AdminFlashSale[]; products: Product[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFlashSale | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminFlashSale | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Flash Sale ({sales.length})</h2>
        <Button
          variant="urgency"
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Buat Flash Sale
        </Button>
      </div>

      {sales.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">Belum ada flash sale.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                <th className="py-3 px-4 font-semibold">Produk</th>
                <th className="py-3 px-4 font-semibold">Harga</th>
                <th className="py-3 px-4 font-semibold">Stok</th>
                <th className="py-3 px-4 font-semibold">Periode</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const expired = sale.isExpired;
                return (
                  <tr key={sale.id} className="border-b border-border-subtle/60 last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-9 shrink-0 rounded-lg overflow-hidden bg-bg-card-alt">
                          <Image src={sale.productImage} alt={sale.productTitle} fill sizes="48px" className="object-cover" />
                        </div>
                        <span className="text-xs text-text-main line-clamp-2 max-w-55">{sale.productTitle}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      <span className="text-urgency-orange font-bold">{formatCurrency(sale.salePrice)}</span>
                      <span className="text-text-dim line-through ml-1.5">{formatCurrency(sale.originalPrice)}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-text-muted whitespace-nowrap">
                      {sale.sold} / {sale.stock}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-text-muted whitespace-nowrap">
                      {sale.startsAt.toLocaleDateString('id-ID')} &ndash; {sale.endsAt.toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={sale.isActive && !expired ? 'urgency' : 'neutral'} size="sm">
                        {expired ? 'Berakhir' : sale.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => {
                            setEditing(sale);
                            setModalOpen(true);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" aria-label="Hapus" onClick={() => setDeleting(sale)}>
                          <Trash2 className="w-3.5 h-3.5 text-urgency-red" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FlashSaleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        sale={editing}
        products={products}
        onSaved={() => router.refresh()}
      />

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Hapus flash sale "${deleting.productTitle}"?`}
          description="Produk aslinya tidak ikut terhapus, cuma flash sale-nya."
          onConfirm={async () => {
            const result = await deleteFlashSaleAction(deleting.id);
            if (result.success) router.refresh();
            return result;
          }}
        />
      )}
    </div>
  );
}
