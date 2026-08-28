import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Receipt, Calculator, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatNumber, timeAgo } from '@/lib/utils';
import type { SalesDashboardData, SalesTrendPoint, AdminOrder } from '@/lib/supabase/admin-queries';

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

const COMPOSITION_COLOR: Record<AdminOrder['kind'], string> = {
  buy: 'var(--brand-magenta)',
  topup: 'var(--brand-cyan)',
  rekber: 'var(--brand-violet)',
  rental: '#4a3d75',
};

/** Compact "Rp 187,4jt" style formatting — reuses formatNumber's jt/rb
 * suffixing but swaps the decimal point for an Indonesian comma. */
function compactCurrency(amount: number): string {
  return `Rp ${formatNumber(Math.round(amount)).replace('.', ',')}`;
}

function pct(value: number, opts: { signed?: boolean } = {}): string {
  const formatted = Math.abs(value).toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  if (!opts.signed) return `${formatted}%`;
  return `${value >= 0 ? '▲' : '▼'} ${formatted}%`;
}

function Delta({ value, suffix = ' vs bulan lalu' }: { value: number | null; suffix?: string }) {
  if (value === null) {
    return <span className="text-[11.5px] font-mono text-text-dim">Belum ada data bulan lalu</span>;
  }
  const up = value >= 0;
  return (
    <span className={`text-[11.5px] font-mono inline-flex items-center gap-1 ${up ? 'text-trust-emerald' : 'text-urgency-red'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pct(value)}
      {suffix}
    </span>
  );
}

/** Builds an SVG polyline `points` string for a small sparkline, normalized
 * into a width x height box with a little vertical padding so the line
 * never touches the top/bottom edge. */
function sparkPoints(values: number[], width: number, height: number, pad = 3): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  return (
    <svg className="mt-2.5 block" width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none">
      <polyline points={sparkPoints(values, 120, 26)} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  sparkValues,
  sparkColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: React.ReactNode;
  sparkValues: number[];
  sparkColor: string;
}) {
  return (
    <div className="holo-ring rounded-2xl">
      <div className="rounded-2xl bg-bg-card p-5">
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-text-dim font-semibold mb-3">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        <div className="font-heading font-bold text-xl text-text-main">{value}</div>
        <div className="mt-1.5">{delta}</div>
        <Sparkline values={sparkValues} color={sparkColor} />
      </div>
    </div>
  );
}

/** Trend chart: technical straight-line segments (not a smoothed curve) plus
 * a faint area fill and an emphasized endpoint — same treatment the Nexus
 * mockup gave every chart. */
function TrendChart({ trend }: { trend: SalesTrendPoint[] }) {
  const width = 600;
  const height = 170;
  const values = trend.map((t) => t.revenue);
  const points = sparkPoints(values, width, height, 10);
  const coords = points.split(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const [lastX, lastY] = (coords[coords.length - 1] ?? '0,0').split(',').map(Number);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          y1={(height / 3) * i}
          x2={width}
          y2={(height / 3) * i}
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
      ))}
      <polygon points={areaPoints} fill="url(#revenueFill)" />
      <polyline points={points} fill="none" stroke="url(#revenueLine)" strokeWidth="2.5" />
      {Number.isFinite(lastX) && (
        <>
          <circle cx={lastX} cy={lastY} r="5" fill="var(--brand-cyan)" />
          <circle cx={lastX} cy={lastY} r="10" fill="none" stroke="var(--brand-cyan)" strokeWidth="1.5" opacity="0.5" />
        </>
      )}
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand-cyan)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--brand-violet)" />
          <stop offset="100%" stopColor="var(--brand-cyan)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function SalesDashboard({ data }: { data: SalesDashboardData }) {
  const { revenue, revenueDeltaPct, orderCount, orderCountDeltaPct, aov, aovDeltaPct, completionRate, completionRateDeltaPp, trend, composition, recentTransactions } = data;

  const revenueSpark = trend.map((t) => t.revenue);
  const orderSpark = trend.map((t) => t.orderCount);
  const aovSpark = trend.map((t) => (t.orderCount > 0 ? t.revenue / t.orderCount : 0));
  const completionSpark = trend.map((t) => (t.resolvedCount > 0 ? (t.completedCount / t.resolvedCount) * 100 : 0));

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted -mt-1">
        Ringkasan penjualan bulan berjalan, dibandingkan bulan lalu. Hanya pesanan berstatus{' '}
        <span className="text-text-main font-semibold">Dibayar</span> atau{' '}
        <span className="text-text-main font-semibold">Selesai</span> yang dihitung sebagai omzet.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Wallet}
          label="Omzet Bulan Ini"
          value={compactCurrency(revenue)}
          delta={<Delta value={revenueDeltaPct} />}
          sparkValues={revenueSpark}
          sparkColor="#00e5ff"
        />
        <KpiCard
          icon={Receipt}
          label="Total Transaksi"
          value={orderCount.toLocaleString('id-ID')}
          delta={<Delta value={orderCountDeltaPct} />}
          sparkValues={orderSpark}
          sparkColor="#9d4eff"
        />
        <KpiCard
          icon={Calculator}
          label="Rata-rata Nilai Transaksi"
          value={compactCurrency(aov)}
          delta={<Delta value={aovDeltaPct} />}
          sparkValues={aovSpark}
          sparkColor="#ff2e9a"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Tingkat Penyelesaian"
          value={pct(completionRate)}
          delta={
            completionRateDeltaPp === null ? (
              <span className="text-[11.5px] font-mono text-text-dim">Belum ada data bulan lalu</span>
            ) : (
              <span
                className={`text-[11.5px] font-mono inline-flex items-center gap-1 ${
                  completionRateDeltaPp >= 0 ? 'text-trust-emerald' : 'text-urgency-red'
                }`}
              >
                {completionRateDeltaPp >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {pct(completionRateDeltaPp)} poin vs bulan lalu
              </span>
            )
          }
          sparkValues={completionSpark}
          sparkColor="#c6ff3d"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="holo-ring rounded-2xl">
          <div className="rounded-2xl bg-bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-wide">
                Tren Omzet — 15 Hari Terakhir
              </h3>
              <span className="font-mono text-[10.5px] text-text-dim">satuan: rupiah</span>
            </div>
            {trend.every((t) => t.revenue === 0) ? (
              <p className="text-sm text-text-muted py-14 text-center">Belum ada transaksi terbayar 15 hari terakhir.</p>
            ) : (
              <TrendChart trend={trend} />
            )}
          </div>
        </div>

        <div className="holo-ring rounded-2xl">
          <div className="rounded-2xl bg-bg-card p-5 sm:p-6">
            <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-wide mb-4">
              Komposisi Layanan
            </h3>
            {composition.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">Belum ada omzet bulan ini.</p>
            ) : (
              <>
                <div className="h-2 rounded-full bg-bg-card-alt flex overflow-hidden mb-5">
                  {composition.map((c) => (
                    <div key={c.kind} style={{ width: `${c.pct}%`, background: COMPOSITION_COLOR[c.kind] }} />
                  ))}
                </div>
                <div className="space-y-3">
                  {composition.map((c) => (
                    <div key={c.kind} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-text-dim">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COMPOSITION_COLOR[c.kind] }} />
                        {c.label}
                      </span>
                      <span className="font-mono font-semibold text-text-main">{pct(c.pct)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="holo-ring rounded-2xl">
        <div className="rounded-2xl bg-bg-card p-5 sm:p-6">
          <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-wide mb-4">
            Transaksi Terbaru
          </h3>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-text-muted py-10 text-center">Belum ada pesanan masuk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-text-dim border-b border-border-subtle">
                    <th className="py-2.5 pr-4 font-semibold">Invoice</th>
                    <th className="py-2.5 pr-4 font-semibold">Jenis</th>
                    <th className="py-2.5 pr-4 font-semibold">Item</th>
                    <th className="py-2.5 pr-4 font-semibold">Jumlah</th>
                    <th className="py-2.5 pr-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => {
                    const badge = STATUS_BADGE[tx.status] ?? { label: tx.status, variant: 'neutral' as const };
                    return (
                      <tr key={`${tx.kind}-${tx.id}`} className="border-b border-border-subtle/60 last:border-0">
                        <td className="py-2.5 pr-4">
                          <span className="font-mono text-xs text-brand-cyan">{tx.orderNumber}</span>
                          <div className="text-[10px] text-text-dim">{timeAgo(tx.createdAt)}</div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="neutral" size="sm">{KIND_LABEL[tx.kind]}</Badge>
                        </td>
                        <td className="py-2.5 pr-4 max-w-64">
                          <p className="text-xs text-text-main line-clamp-1">{tx.itemLabel}</p>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-text-main whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
