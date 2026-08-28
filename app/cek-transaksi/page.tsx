'use client';

import React, { useState } from 'react';
import { Search, SearchX, FileSearch } from 'lucide-react';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import StatusTimeline from '@/components/shared/StatusTimeline';

const ORDER_STEPS = [
  { label: 'Menunggu Pembayaran', description: 'Pesanan dibuat, menunggu konfirmasi transfer.' },
  { label: 'Pembayaran Dikonfirmasi', description: 'Admin telah memverifikasi pembayaranmu.' },
  { label: 'Diproses', description: 'Item sedang dikirim / akun sedang disiapkan untuk serah terima.' },
  { label: 'Selesai', description: 'Transaksi tuntas. Terima kasih sudah bertransaksi di Paroy Store!' },
];

const INVOICE_PATTERN = /^PS-\d{8}-\d{4}$/i;

function deriveStage(invoice: string): number {
  const sum = invoice.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return sum % ORDER_STEPS.length;
}

export default function CekTransaksiPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [stage, setStage] = useState(0);

  function handleSearch() {
    const trimmed = query.trim();
    if (INVOICE_PATTERN.test(trimmed)) {
      setStage(deriveStage(trimmed.toUpperCase()));
      setResult('found');
    } else {
      setResult('not-found');
    }
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
          <Button variant="primary" onClick={handleSearch} disabled={!query.trim()}>
            Cek Status
          </Button>
        </div>

        {result === 'not-found' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <SearchX className="w-8 h-8 text-text-dim" />
            <p className="text-sm font-bold text-text-main">Invoice Tidak Ditemukan</p>
            <p className="text-xs text-text-muted max-w-xs">
              Pastikan format Invoice ID benar, contoh: PS-20260827-1234
            </p>
          </div>
        )}

        {result === 'found' && (
          <Card variant="default">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <span className="text-xs text-text-dim">No. Invoice</span>
                <span className="font-mono font-bold text-brand-cyan">{query.toUpperCase()}</span>
              </div>
              <StatusTimeline steps={ORDER_STEPS} currentStep={stage} />
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
