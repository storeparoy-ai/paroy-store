'use client';

import React, { useState } from 'react';
import { Copy, Check, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, formatCurrency } from '@/lib/utils';
import type { PaymentMethod } from '@/lib/supabase/queries';

/**
 * Ke mana pembeli harus mentransfer, dan berapa persisnya.
 *
 * Dibuat setelah menemukan bahwa alur Top Up dan Rekber tidak pernah
 * menampilkan nomor rekening sama sekali: pembeli memilih "Transfer BRI",
 * menekan Bayar, mendapat nomor invoice, lalu diminta mengunggah bukti
 * transfer yang tidak mungkin ia lakukan — tidak ada yang memberitahunya
 * rekening tujuannya. Hanya alur beli akun yang menampilkannya.
 *
 * Ditampilkan sesudah pesanan tersimpan, jadi nominalnya adalah nominal yang
 * benar-benar tercatat di invoice, bukan perkiraan di browser.
 */
export default function PaymentDestination({
  methods,
  total,
}: {
  methods: PaymentMethod[];
  total: number;
}) {
  const [activeCode, setActiveCode] = useState(methods[0]?.code ?? '');
  const [copied, setCopied] = useState<'number' | 'total' | null>(null);

  if (methods.length === 0) return null;
  const method = methods.find((m) => m.code === activeCode) ?? methods[0];

  function copy(value: string, which: 'number' | 'total') {
    navigator.clipboard?.writeText(value);
    setCopied(which);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <Card variant="alt" className="border-brand-cyan/25">
      <CardContent className="p-5 space-y-4 text-left">
        <div>
          <h2 className="font-heading font-bold text-sm text-text-main">Transfer ke Rekening Ini</h2>
          <p className="text-[11px] text-text-muted">
            Setelah transfer, kirim bukti di bawah supaya admin bisa langsung memverifikasi.
          </p>
        </div>

        {/* Pilihan hanya muncul kalau memang ada lebih dari satu — satu tombol
            tunggal yang tidak mengubah apa pun cuma bikin ragu. */}
        {methods.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {methods.map((m) => {
              const Icon = m.code.includes('bri') || m.code.includes('bca') || m.code.includes('mandiri') ? Landmark : Wallet;
              return (
                <button
                  key={m.code}
                  onClick={() => setActiveCode(m.code)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors',
                    m.code === method.code
                      ? 'bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan'
                      : 'bg-bg-card border-border-subtle text-text-muted hover:border-white/20'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-dim">{method.label}</span>
            <button
              onClick={() => copy(method.accountNumber.replace(/[-\s]/g, ''), 'number')}
              className="flex items-center gap-2 w-full text-left group"
            >
              <span className="font-mono font-bold text-lg text-text-main tracking-wide">
                {method.accountNumber}
              </span>
              {copied === 'number' ? (
                <Check className="w-4 h-4 text-trust-emerald shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-text-dim group-hover:text-brand-cyan shrink-0" />
              )}
            </button>
            <span className="text-xs text-text-muted">a.n. {method.accountName}</span>
          </div>

          <div className="pt-3 border-t border-border-subtle">
            <span className="text-[10px] uppercase tracking-wider text-text-dim">Nominal Transfer</span>
            <button
              onClick={() => copy(String(Math.round(total)), 'total')}
              className="flex items-center gap-2 w-full text-left group"
            >
              <span className="font-mono font-extrabold text-xl text-brand-cyan">
                {formatCurrency(total)}
              </span>
              {copied === 'total' ? (
                <Check className="w-4 h-4 text-trust-emerald shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-text-dim group-hover:text-brand-cyan shrink-0" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-urgency-orange leading-relaxed">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Transfer <strong>persis sejumlah di atas</strong>. Nominal yang berbeda membuat admin sulit
            mencocokkannya dengan pesananmu.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
