import React from 'react';
import Badge from '@/components/ui/Badge';
import { getUserOrderHistory } from '@/lib/supabase/queries';
import { formatCurrency, timeAgo } from '@/lib/utils';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const KIND_LABEL: Record<string, string> = {
  buy: 'Beli Akun',
  rental: 'Sewa Akun',
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

export default async function ProfileHistoryPage() {
  const orders = await getUserOrderHistory();

  if (orders.length === 0) {
    return (
      <p className="text-sm text-text-muted py-16 text-center">
        Belum ada riwayat transaksi. Yuk mulai belanja!
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {orders.map((order) => {
        const badge = STATUS_BADGE[order.status] ?? { label: order.status, variant: 'neutral' as const };
        return (
          <div
            key={`${order.kind}-${order.id}`}
            className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border-subtle"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="neutral" size="sm">{KIND_LABEL[order.kind]}</Badge>
                <span className="font-mono text-[10px] text-text-dim">{order.orderNumber}</span>
              </div>
              <p className="text-xs text-text-main truncate">{order.itemLabel}</p>
              <p className="text-[10px] text-text-dim">{timeAgo(order.createdAt)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-xs font-bold text-text-main">{formatCurrency(order.amount)}</p>
              <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
