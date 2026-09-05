'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Zap, CheckCircle2, Wallet, PartyPopper, Copy, ArrowLeft } from 'lucide-react';
import Container from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SubmitError from '@/components/shared/SubmitError';
import { createTopupOrder } from '@/lib/supabase/actions';
import { cn, formatCurrency } from '@/lib/utils';
import type { PaymentMethod, TopupGameGroup } from '@/lib/supabase/queries';

type Status = 'form' | 'processing' | 'success';

/**
 * Alur Top Up. Dulu seluruh halaman ini komponen klien dengan katalog dan
 * daftar metode pembayarannya ditulis keras di dalam kode; sekarang dua-duanya
 * datang dari database (migrasi 00000000000013) dan dioper sebagai prop.
 *
 * Total yang tampil di sini murni perkiraan untuk pembeli — nominal yang
 * benar-benar tercatat di invoice dihitung ulang di database saat pesanan
 * dibuat, jadi angka di layar tidak bisa dipakai menentukan harga.
 */
export default function TopupFlow({
  catalog,
  paymentMethods,
}: {
  catalog: TopupGameGroup[];
  paymentMethods: PaymentMethod[];
}) {
  const [gameIndex, setGameIndex] = useState(0);
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [itemId, setItemId] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('form');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();

  const activeGameGroup = catalog[gameIndex];
  const selectedItem = activeGameGroup?.items.find((i) => i.id === itemId);
  const selectedPayment = paymentMethods.find((p) => p.code === paymentCode);

  const adminFee =
    selectedItem && selectedPayment
      ? Math.round((selectedItem.price * selectedPayment.feePercent) / 100 + selectedPayment.feeFlat)
      : 0;
  const total = (selectedItem?.price ?? 0) + adminFee;

  const canSubmit = userId.trim().length >= 4 && !!selectedItem && !!selectedPayment;

  function handleSubmit() {
    if (!canSubmit || !selectedItem || !selectedPayment) return;
    setSubmitError('');
    setStatus('processing');
    startTransition(async () => {
      const result = await createTopupOrder({
        topupItemId: selectedItem.id,
        gameUserId: zoneId ? `${userId} (${zoneId})` : userId,
        paymentCode: selectedPayment.code,
      });
      if (!result.success) {
        setSubmitError(result.error);
        setStatus('form');
        return;
      }
      setInvoiceNumber(result.orderNumber);
      setStatus('success');
    });
  }

  function resetForm() {
    setStatus('form');
    setUserId('');
    setZoneId('');
    setItemId(null);
    setPaymentCode(null);
  }

  const header = (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
        <Zap className="w-5 h-5" />
      </div>
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
          Top Up Kilat
        </h1>
        <p className="text-xs text-text-muted">Diamond &amp; voucher masuk otomatis dalam 1 detik</p>
      </div>
    </div>
  );

  if (catalog.length === 0) {
    return (
      <Container className="py-8 sm:py-10">
        {header}
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-dim">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-text-main">Katalog Top Up Masih Kosong</h3>
          <p className="text-xs text-text-muted max-w-xs">
            Tambahkan item top up dulu lewat Admin &gt; Top Up supaya nominalnya bisa dipilih di sini.
          </p>
        </div>
      </Container>
    );
  }

  if (status === 'success') {
    return (
      <Container className="py-12 sm:py-20">
        <div className="max-w-md mx-auto text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-trust-emerald/10 border border-trust-emerald/30 flex items-center justify-center text-trust-emerald">
            <PartyPopper className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main">
            Top Up Berhasil Diproses!
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            {selectedItem?.label} untuk ID <strong className="text-text-main">{userId}</strong>{' '}
            sedang dikirim otomatis. Simpan nomor invoice ini untuk pelacakan.
          </p>

          <Card variant="alt">
            <CardContent className="p-5 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">No. Invoice</span>
                <span className="font-mono font-bold text-brand-cyan flex items-center gap-1.5">
                  {invoiceNumber}
                  <Copy className="w-3.5 h-3.5 text-text-dim" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">Total Bayar</span>
                <span className="font-mono font-bold text-text-main">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/cek-transaksi" className={cn('inline-flex')}>
              <Button variant="primary" className="w-full">
                Lacak Status Transaksi
              </Button>
            </Link>
            <Button variant="ghost" onClick={resetForm}>
              Top Up Lagi
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      {header}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10 items-start">
        <div className="space-y-6 min-w-0">
          {/* Step 1: Game */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">1. Pilih Game</h2>
            <div className="grid grid-cols-3 gap-3">
              {catalog.map((group, idx) => (
                <button
                  key={group.gameId}
                  onClick={() => {
                    setGameIndex(idx);
                    setItemId(null);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors',
                    idx === gameIndex
                      ? 'bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan'
                      : 'bg-bg-card border-border-subtle text-text-muted hover:border-white/20'
                  )}
                >
                  <span className="text-2xl">{group.gameIcon ?? '🎮'}</span>
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {group.gameName}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: User ID */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">
              2. Masukkan ID Akun
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="User ID"
                placeholder="Contoh: 123456789"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <Input
                label="Zone / Server ID (opsional)"
                placeholder="Contoh: 8888"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              />
            </div>
          </section>

          {/* Step 3: Nominal */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">
              3. Pilih Nominal
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeGameGroup.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setItemId(item.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-colors',
                    itemId === item.id
                      ? 'bg-brand-cyan/10 border-brand-cyan/40'
                      : 'bg-bg-card border-border-subtle hover:border-white/20'
                  )}
                >
                  <span className="text-xs font-bold text-text-main">{item.label}</span>
                  <span className="font-mono text-xs text-brand-cyan">{formatCurrency(item.price)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 4: Payment */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">
              4. Metode Pembayaran
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.code}
                  onClick={() => setPaymentCode(method.code)}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
                    paymentCode === method.code
                      ? 'bg-brand-cyan/10 border-brand-cyan/40'
                      : 'bg-bg-card border-border-subtle hover:border-white/20'
                  )}
                >
                  <Wallet className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-xs font-semibold text-text-main text-left">{method.label}</span>
                  {paymentCode === method.code && (
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24">
          <Card variant="raised" className="rounded-[22px]">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading font-bold text-sm text-text-main">Ringkasan Pesanan</h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Game</span>
                  <span className="text-text-main font-semibold">{activeGameGroup.gameName}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Item</span>
                  <span className="text-text-main font-semibold">
                    {selectedItem ? selectedItem.label : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>User ID</span>
                  <span className="text-text-main font-semibold">
                    {userId || '-'}
                    {zoneId ? ` (${zoneId})` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle space-y-1.5 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(selectedItem?.price ?? 0)}</span>
                </div>
                {adminFee > 0 && (
                  <div className="flex justify-between text-text-muted">
                    <span>Biaya Layanan</span>
                    <span className="font-mono">{formatCurrency(adminFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-border-subtle/50 text-text-main font-bold">
                  <span className="text-[13.5px]">Total</span>
                  <span className="font-mono text-brand-cyan text-2xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!canSubmit}
                isLoading={isPending}
                onClick={handleSubmit}
              >
                {status === 'processing' ? 'Memproses...' : 'Bayar Sekarang'}
              </Button>

              {!canSubmit && (
                <p className="text-[11px] text-text-dim text-center">
                  Lengkapi User ID, nominal, dan metode pembayaran dulu ya.
                </p>
              )}
              <SubmitError message={submitError} />
            </CardContent>
          </Card>

          <Link
            href="/"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </Container>
  );
}
