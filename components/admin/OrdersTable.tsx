'use client';

import React, { useState, useTransition } from 'react';
import { Check, X, RotateCcw, Loader2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { updateOrderStatusAction } from '@/lib/supabase/admin-actions';
import { cn, formatCurrency, timeAgo } from '@/lib/utils';
import type { AdminOrder } from '@/lib/supabase/admin-queries';

const KIND_LABEL: Record<AdminOrder['kind'], string> = {
  buy: 'Beli Akun',
  topup: 'Top Up',
  rekber: 'Rekber',
};

const STATUS_BADGE: Record<string, { label: string; variant: 'neutral' | 'cyan' | 'trust' | 'danger' }> = {
  pending: { label: 'Menunggu', variant: 'neutral' },
  paid: { label: 'Dibayar', variant: 'cyan' },
  completed: { label: 'Selesai', variant: 'trust' },
  rejected: { label: 'Ditolak', variant: 'danger' },
  cancelled: { label: 'Dibatalkan', variant: 'danger' },
};

function OrderRow({ order }: { order: AdminOrder }) {
  const [status, setStatus] = useState(order.status);
  const [isPending, startTransition] = useTransition();
  const badge = STATUS_BADGE[status] ?? { label: status, variant: 'neutral' as const };

  function updateStatus(next: string) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.kind, order.id, next);
      if (result.success) setStatus(next);
    });
  }

  return (
    <tr className="border-b border-border-subtle/60 last:border-0">
      <td className="py-3 px-4">
        <span className="font-mono text-xs text-brand-cyan">{order.orderNumber}</span>
        <div className="text-[10px] text-text-dim">{timeAgo(order.createdAt)}</div>
      </td>
      <td className="py-3 px-4">
        <Badge variant="neutral" size="sm">{KIND_LABEL[order.kind]}</Badge>
      </td>
      <td className="py-3 px-4 max-w-[220px]">
        <p className="text-xs text-text-main line-clamp-2">{order.itemLabel}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-text-main">{order.buyerName ?? '—'}</p>
        <p className="text-[10px] text-text-dim">{order.buyerWhatsapp ?? '—'}</p>
      </td>
      <td className="py-3 px-4 font-mono text-xs text-text-main whitespace-nowrap">
        {formatCurrency(order.amount)}
      </td>
      <td className="py-3 px-4">
        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
      </td>
      <td className="py-3 px-4">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {status === 'pending' && (
              <Button size="sm" variant="primary" onClick={() => updateStatus('paid')}>
                <Check className="w-3.5 h-3.5" />
                Dibayar
              </Button>
            )}
            {status === 'paid' && (
              <Button size="sm" variant="primary" onClick={() => updateStatus('completed')}>
                <Check className="w-3.5 h-3.5" />
                Selesaikan
              </Button>
            )}
            {(status === 'pending' || status === 'paid') && (
              <Button size="sm" variant="danger" onClick={() => updateStatus('rejected')}>
                <X className="w-3.5 h-3.5" />
                Tolak
              </Button>
            )}
            {(status === 'rejected' || status === 'cancelled' || status === 'completed') && (
              <Button size="sm" variant="ghost" onClick={() => updateStatus('pending')}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

export default function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [filter, setFilter] = useState<'all' | AdminOrder['kind']>('all');
  const visible = filter === 'all' ? orders : orders.filter((o) => o.kind === filter);

  if (orders.length === 0) {
    return <p className="text-sm text-text-muted py-10 text-center">Belum ada pesanan masuk.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['all', 'buy', 'topup', 'rekber'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              filter === k
                ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30'
                : 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
            )}
          >
            {k === 'all' ? 'Semua' : KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
              <th className="py-3 px-4 font-semibold">Invoice</th>
              <th className="py-3 px-4 font-semibold">Jenis</th>
              <th className="py-3 px-4 font-semibold">Item</th>
              <th className="py-3 px-4 font-semibold">Pembeli</th>
              <th className="py-3 px-4 font-semibold">Total</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <OrderRow key={`${order.kind}-${order.id}`} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
