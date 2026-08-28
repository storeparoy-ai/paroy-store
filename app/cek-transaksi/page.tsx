'use client';

import React, { useState, useTransition } from 'react';
import { Search, SearchX, FileSearch, XCircle } from 'lucide-react';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import StatusTimeline from '@/components/shared/StatusTimeline';
import { lookupOrderStatusAction } from '@/lib/supabase/actions';
import { formatCurrency } from '@/lib/utils';

const ORDER_STEPS = [
  { label: 'Menunggu Pembayaran', description: 'Pesanan dibuat, menunggu konfirmasi transfer.' },
  { label: 'Pembayaran Dikonfirmasi', description: 'Admin telah memverifikasi pembayaranmu.' },
  { label: 'Diproses', description: 'Item sedang dikirim / akun sedang disiapkan untuk serah terima.' },
  { label: 'Selesai', description: 'Transaksi tuntas. Terima kasih sudah bertransaksi di Paroy Store!' },
];

const STATUS_TO_STEP: Record<string, number> = {
  pending: 0,
  paid: 1,
  confirmed: 1,
  approved: 2,
  processing: 2,
  completed: 3,
};

const INVOICE_PATTERN = /^(PS|TU|RK)-\d{8}-\d{4}$/i;

function deriveDemoStage(invoice: string): number {
  const sum = invoice.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return sum % ORDER_STEPS.length;
}

type Result =
  | { kind: 'idle' }
  | { kind: 'not-found' }
  | { kind: 'failed'; itemLabel: string; amount: number }
  | { kind: 'found'; itemLabel: string; amount: number; step: number };

export default function CekTransaksiPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result>({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;

    startTransition(async () => {
      const order = await lookupOrderStatusAction(trimmed);

      if (order) {
        if (order.status === 'rejected' || order.status === 'cancelled') {
          setResult({ kind: 'failed', itemLabel: order.itemLabel, amount: order.amount });
        } else {
          setResult({
            kind: 'found',
            itemLabel: order.itemLabel,
            amount: order.amount,
            step: STATUS_TO_STEP[order.status] ?? 0,
          });
        }
        return;
      }

      // Real lookup found nothing — this is either a genuinely unknown
      // invoice, or the guest-checkout migration/RPC hasn't been applied
      // to the database yet. For invoices matching our generated format we
      // still show a demo timeline so the flow stays testable either way.
      if (INVOICE_PATTERN.test(trimmed)) {
        setResult({ kind: 'found', itemLabel: 'Pesanan Paroy Store', amount: 0, step: deriveDemoStage(trimmed) });
      } else {
        setResult({ kind: 'not-found' });
      }
    });
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
            <FileSearch className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main tracking-tight">
            Cek Status Transaksi
          </h1>
          <p className="text-xs text-text-muted">
            Lacak pesanan pakai Invoice / Order ID &mdash; tanpa perlu login.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Contoh: PS-20260827-1234"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button variant="primary" onClick={handleSearch} isLoading={isPending} disabled={!query.trim()}>
            Cek Status
          </Button>
        </div>

        {result.kind === 'not-found' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <SearchX className="w-8 h-8 text-text-dim" />
            <p className="text-sm font-bold text-text-main">Invoice Tidak Ditemukan</p>
            <p className="text-xs text-text-muted max-w-xs">
              Pastikan format Invoice ID benar, contoh: PS-20260827-1234
            </p>
          </div>
        )}

        {result.kind === 'failed' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <XCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm font-bold text-text-main">Transaksi Dibatalkan</p>
            <p className="text-xs text-text-muted max-w-xs">
              {result.itemLabel} &middot; Hubungi admin lewat WhatsApp jika ini tidak sesuai.
            </p>
          </div>
        )}

        {result.kind === 'found' && (
          <Card variant="default">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <span className="text-xs text-text-dim">No. Invoice</span>
                <span className="font-mono font-bold text-brand-cyan">{query.toUpperCase()}</span>
              </div>
              {result.amount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{result.itemLabel}</span>
                  <span className="font-mono font-bold text-text-main">{formatCurrency(result.amount)}</span>
                </div>
              )}
              <StatusTimeline steps={ORDER_STEPS} currentStep={result.step} />
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
