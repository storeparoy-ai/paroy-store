'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { Check, X, RotateCcw, Loader2, Receipt, Search, BellRing } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { updateOrderStatusAction } from '@/lib/supabase/admin-actions';
import { cn, formatCurrency, timeAgo } from '@/lib/utils';
import type { AdminOrder } from '@/lib/supabase/admin-queries';

const KIND_LABEL: Record<AdminOrder['kind'], string> = {
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

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'completed', label: 'Selesai' },
  { value: 'closed', label: 'Ditolak / Batal' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

/** Pesanan yang menunggu verifikasi DAN sudah ada bukti transfernya. Ini
 * antrean kerja yang sesungguhnya: pembeli bilang sudah bayar, tinggal admin
 * mencocokkan ke mutasi rekening. */
function perluDitindak(order: AdminOrder, status: string): boolean {
  return status === 'pending' && !!order.proofUrl;
}

const keyOf = (o: AdminOrder) => `${o.kind}-${o.id}`;

/** Cocokkan satu pesanan dengan kata kunci pencarian.
 *
 * Nomor WhatsApp dibandingkan angkanya saja, supaya "0812 3456" tetap ketemu
 * saat yang tersimpan "081234567890" â€” pembeli menulis nomornya dengan spasi
 * dan tanda hubung sesuka hati. Kata kunci tanpa angka sama sekali sengaja
 * tidak dicocokkan ke nomor, karena string kosong cocok dengan apa pun. */
function cocokDenganPencarian(order: AdminOrder, q: string): boolean {
  if (order.orderNumber.toLowerCase().includes(q)) return true;
  if ((order.buyerName ?? '').toLowerCase().includes(q)) return true;
  if (order.itemLabel.toLowerCase().includes(q)) return true;

  const angkaKunci = q.replace(/\D/g, '');
  if (angkaKunci.length > 0) {
    const angkaNomor = (order.buyerWhatsapp ?? '').replace(/\D/g, '');
    if (angkaNomor.includes(angkaKunci)) return true;
  }
  return false;
}

function ProofLink({ url }: { url: string | null }) {
  // Tautan bertanda tangan yang kedaluwarsa dalam sejam â€” bukti transfer
  // memuat nama dan nomor rekening orang, jadi bucket-nya privat dan tautan
  // ini tidak untuk diteruskan ke siapa pun.
  if (!url) return <span className="text-[10px] text-text-dim">belum ada</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan hover:underline whitespace-nowrap"
    >
      <Receipt className="w-3.5 h-3.5" />
      Lihat
    </a>
  );
}

function StatusActions({
  status,
  isPending,
  onChange,
}: {
  status: string;
  isPending: boolean;
  onChange: (next: string) => void;
}) {
  if (isPending) return <Loader2 className="w-4 h-4 animate-spin text-text-dim" />;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {status === 'pending' && (
        <Button size="sm" variant="primary" onClick={() => onChange('paid')}>
          <Check className="w-3.5 h-3.5" />
          Dibayar
        </Button>
      )}
      {status === 'paid' && (
        <Button size="sm" variant="primary" onClick={() => onChange('completed')}>
          <Check className="w-3.5 h-3.5" />
          Selesaikan
        </Button>
      )}
      {(status === 'pending' || status === 'paid') && (
        <Button size="sm" variant="danger" onClick={() => onChange('rejected')}>
          <X className="w-3.5 h-3.5" />
          Tolak
        </Button>
      )}
      {(status === 'rejected' || status === 'cancelled' || status === 'completed') && (
        <Button size="sm" variant="ghost" onClick={() => onChange('pending')}>
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}

function OrderRow({
  order,
  status,
  isPending,
  onChange,
}: {
  order: AdminOrder;
  status: string;
  isPending: boolean;
  onChange: (next: string) => void;
}) {
  const badge = STATUS_BADGE[status] ?? { label: status, variant: 'neutral' as const };
  const urgen = perluDitindak(order, status);

  return (
    <tr
      className={cn(
        'border-b border-border-subtle/60 last:border-0',
        urgen && 'bg-urgency-orange/5'
      )}
    >
      <td className={cn('py-3 px-4', urgen && 'border-l-2 border-l-urgency-orange')}>
        <span className="font-mono text-xs text-brand-cyan">{order.orderNumber}</span>
        <div className="text-[10px] text-text-dim">{timeAgo(order.createdAt)}</div>
      </td>
      <td className="py-3 px-4">
        <Badge variant="neutral" size="sm">{KIND_LABEL[order.kind]}</Badge>
      </td>
      <td className="py-3 px-4 max-w-55">
        <p className="text-xs text-text-main line-clamp-2">{order.itemLabel}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-text-main">{order.buyerName ?? 'â€”'}</p>
        <p className="text-[10px] text-text-dim">{order.buyerWhatsapp ?? 'â€”'}</p>
      </td>
      <td className="py-3 px-4 font-mono text-xs text-text-main whitespace-nowrap">
        {formatCurrency(order.amount)}
      </td>
      <td className="py-3 px-4">
        <ProofLink url={order.proofUrl} />
      </td>
      <td className="py-3 px-4">
        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
      </td>
      <td className="py-3 px-4">
        <StatusActions status={status} isPending={isPending} onChange={onChange} />
      </td>
    </tr>
  );
}

/** Tampilan kartu untuk layar HP. Tabel delapan kolom di layar selebar 390px
 * berarti menggeser ke samping untuk membaca satu pesanan â€” dan admin akan
 * sering membuka halaman ini persis dari HP, lewat notifikasi Telegram. */
function OrderCard({
  order,
  status,
  isPending,
  onChange,
}: {
  order: AdminOrder;
  status: string;
  isPending: boolean;
  onChange: (next: string) => void;
}) {
  const badge = STATUS_BADGE[status] ?? { label: status, variant: 'neutral' as const };
  const urgen = perluDitindak(order, status);

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 space-y-3',
        urgen ? 'border-urgency-orange/40 bg-urgency-orange/5' : 'border-border-subtle bg-bg-card'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-xs text-brand-cyan">{order.orderNumber}</span>
          <div className="text-[10px] text-text-dim">{timeAgo(order.createdAt)}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="neutral" size="sm">{KIND_LABEL[order.kind]}</Badge>
          <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
        </div>
      </div>

      <p className="text-xs text-text-main line-clamp-2">{order.itemLabel}</p>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-text-main truncate">{order.buyerName ?? 'â€”'}</p>
          <p className="text-[10px] text-text-dim truncate">{order.buyerWhatsapp ?? 'â€”'}</p>
        </div>
        <span className="font-mono text-sm font-bold text-text-main whitespace-nowrap">
          {formatCurrency(order.amount)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border-subtle/60">
        <ProofLink url={order.proofUrl} />
        <StatusActions status={status} isPending={isPending} onChange={onChange} />
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  tone = 'default',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'default' | 'urgent';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap',
        active && tone === 'urgent' && 'bg-urgency-orange/15 text-urgency-orange border-urgency-orange/40',
        active && tone === 'default' && 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30',
        !active && tone === 'urgent' && 'bg-urgency-orange/5 text-urgency-orange/80 border-urgency-orange/25 hover:border-urgency-orange/50',
        !active && tone === 'default' && 'bg-white/5 text-text-muted border-border-subtle hover:border-white/20'
      )}
    >
      {children}
    </button>
  );
}

export default function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [kind, setKind] = useState<'all' | AdminOrder['kind']>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [query, setQuery] = useState('');

  // Status dipegang di sini, bukan di dalam baris. Kalau tiap baris menyimpan
  // statusnya sendiri, mengubah pesanan jadi "Dibayar" saat filter "Menunggu"
  // aktif akan meninggalkan baris itu tetap terlihat â€” filternya menyaring
  // status lama yang sudah tidak berlaku.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function changeStatus(order: AdminOrder, next: string) {
    const key = keyOf(order);
    setSavingId(key);
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.kind, order.id, next);
      if (result.success) setOverrides((prev) => ({ ...prev, [key]: next }));
      setSavingId(null);
    });
  }

  // Status yang berlaku dihitung sekali di sini; seluruh saringan di bawah
  // membaca dari daftar ini, jadi tidak ada tempat yang tertinggal memakai
  // status lama sesudah admin mengubahnya.
  const withStatus = useMemo(
    () => orders.map((order) => ({ order, status: overrides[keyOf(order)] ?? order.status })),
    [orders, overrides]
  );

  const urgentCount = useMemo(
    () => withStatus.filter(({ order, status }) => perluDitindak(order, status)).length,
    [withStatus]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withStatus.filter(({ order: o, status }) => {
      if (kind !== 'all' && o.kind !== kind) return false;
      if (urgentOnly && !perluDitindak(o, status)) return false;
      if (statusFilter === 'closed') {
        if (status !== 'rejected' && status !== 'cancelled') return false;
      } else if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }
      return q.length === 0 || cocokDenganPencarian(o, q);
    });
  }, [withStatus, kind, statusFilter, urgentOnly, query]);

  if (orders.length === 0) {
    return <p className="text-sm text-text-muted py-10 text-center">Belum ada pesanan masuk.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:max-w-xs w-full">
            <Input
              type="search"
              aria-label="Cari pesanan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari invoice, nama, WhatsApp, item..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          {urgentCount > 0 && (
            <Chip active={urgentOnly} tone="urgent" onClick={() => setUrgentOnly((v) => !v)}>
              <span className="inline-flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5" />
                Perlu ditindak ({urgentCount})
              </span>
            </Chip>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'buy', 'rental', 'topup', 'rekber'] as const).map((k) => (
            <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
              {k === 'all' ? 'Semua jenis' : KIND_LABEL[k]}
            </Chip>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <Chip key={s.value} active={statusFilter === s.value} onClick={() => setStatusFilter(s.value)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Menampilkan {visible.length} dari {orders.length} pesanan.
        {urgentCount > 0 && (
          <>
            {' '}
            <span className="text-urgency-orange font-semibold">
              {urgentCount} sudah mengirim bukti transfer dan menunggu kamu verifikasi.
            </span>
          </>
        )}
      </p>

      {visible.length === 0 ? (
        <p className="text-sm text-text-muted py-10 text-center">
          Tidak ada pesanan yang cocok dengan pencarian atau saringan ini.
        </p>
      ) : (
        <>
          {/* Kartu di HP, tabel di layar lebar. */}
          <div className="space-y-3 md:hidden">
            {visible.map(({ order, status }) => (
              <OrderCard
                key={keyOf(order)}
                order={order}
                status={status}
                isPending={savingId === keyOf(order)}
                onChange={(next) => changeStatus(order, next)}
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border-subtle">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
                  <th className="py-3 px-4 font-semibold">Invoice</th>
                  <th className="py-3 px-4 font-semibold">Jenis</th>
                  <th className="py-3 px-4 font-semibold">Item</th>
                  <th className="py-3 px-4 font-semibold">Pembeli</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Bukti</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ order, status }) => (
                  <OrderRow
                    key={keyOf(order)}
                    order={order}
                    status={status}
                    isPending={savingId === keyOf(order)}
                    onChange={(next) => changeStatus(order, next)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
