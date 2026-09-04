import React from 'react';
import { Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatRekberTierRange, type RekberFeeTier } from '@/lib/utils';

/** Public, upfront view of the same tiers RekberForm's calculator uses —
 * so a buyer/seller can see the whole fee structure before picking a
 * product, not just the one number that applies to their transaction.
 * Admin-managed at /admin/tarif-rekber (RekberFeeTiersTable); this table
 * only reads, never writes. */
export default function RekberFeeTable({ tiers }: { tiers: RekberFeeTier[] }) {
  if (tiers.length === 0) return null;

  return (
    <Card variant="alt" className="rounded-[20px] mb-6">
      <CardContent className="p-5 sm:p-6 space-y-3">
        <h2 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
          <Receipt className="w-4 h-4 text-brand-cyan" />
          Daftar Biaya Jasa Rekber
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-dim uppercase tracking-wider text-[10px] border-b border-border-subtle">
                <th className="text-left py-2 font-semibold">Nominal Transaksi</th>
                <th className="text-right py-2 font-semibold">Biaya Jasa</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, i) => (
                <tr key={tier.id} className="border-b border-border-subtle/50 last:border-0">
                  <td className="py-2 text-text-muted">{formatRekberTierRange(tiers, i)}</td>
                  <td className="py-2 text-right font-mono font-semibold text-text-main">
                    {formatCurrency(tier.fee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
