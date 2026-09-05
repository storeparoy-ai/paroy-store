'use client';

import React, { useState, useTransition } from 'react';
import { Search, SearchX, FileSearch, XCircle } from 'lucide-react';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import StatusTimeline from '@/components/shared/StatusTimeline';
import PaymentProofUpload from '@/components/shared/PaymentProofUpload';
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

type Result =
  | { kind: 'idle' }
  | { kind: 'not-found' }
  | { kind: 'failed'; itemLabel: string; amount: number }
  | {
      kind: 'found';
      orderNumber: string;
      itemLabel: string;
      amount: number;
      step: number;
      pending: boolean;
      hasProof: boolean;
    };

export default function CekTransaksiPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result>({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;

    startTransition(async () => {
      const order = await lookupOrderStatusAction(trimmed);

      // Tidak ketemu berarti tidak ketemu. Sebelumnya, invoice yang cuma
      // cocok polanya ditampilkan dengan linimasa palsu hasil hitungan dari
      // huruf-huruf nomornya sendiri — jadi salah ketik satu digit bisa
      // menampilkan "Selesai" untuk pesanan yang tidak pernah ada. Itu
      // penyakit yang sama dengan nomor invoice palsu yang sudah dibuang di
      // audit: menenangkan pembeli dengan kabar yang tidak berdasar.
      if (!order) {
        setResult({ kind: 'not-found' });
        return;
      }

      if (order.status === 'rejected' || order.status === 'cancelled') {
        setResult({ kind: 'failed', itemLabel: order.itemLabel, amount: order.amount });
        return;
      }

      setResult({
        kind: 'found',
        orderNumber: order.orderNumber,
        itemLabel: order.itemLabel,
        amount: order.amount,
        step: STATUS_TO_STEP[order.status] ?? 0,
        pending: order.status === 'pending',
        hasProof: order.hasProof,
      });
    });
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
            <FileSearch className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Cek Status Transaksi
          </h1>
          <p className="text-xs text-text-muted">
            Lacak pesanan pakai Invoice / Order ID &mdash; tanpa perlu login.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Contoh: PS-20260905-A3F91C"
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
              Pastikan format Invoice ID benar, contoh: PS-20260905-A3F91C
            </p>
          </div>
        )}

        {result.kind === 'failed' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <XCircle className="w-8 h-8 text-urgency-red" />
            <p className="text-sm font-bold text-text-main">Transaksi Dibatalkan</p>
            <p className="text-xs text-text-muted max-w-xs">
              {result.itemLabel} &middot; Hubungi admin lewat WhatsApp jika ini tidak sesuai.
            </p>
          </div>
        )}

        {result.kind === 'found' && (
          <Card variant="raised" className="rounded-[22px]">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <span className="text-xs text-text-dim">No. Invoice</span>
                <span className="font-mono font-bold text-brand-cyan">{result.orderNumber}</span>
              </div>
              {result.amount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{result.itemLabel}</span>
                  <span className="font-mono font-bold text-text-main">{formatCurrency(result.amount)}</span>
                </div>
              )}
              <StatusTimeline steps={ORDER_STEPS} currentStep={result.step} />

              {/* Hanya selama pesanan masih menunggu verifikasi — setelah itu
                  RPC-nya menolak lampiran baru, jadi kotak ini akan bohong. */}
              {result.pending && (
                <PaymentProofUpload
                  orderNumber={result.orderNumber}
                  alreadyUploaded={result.hasProof}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
