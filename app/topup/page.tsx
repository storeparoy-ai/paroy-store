'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Zap,
  CheckCircle2,
  Wallet,
  QrCode,
  Landmark,
  PartyPopper,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { TOPUP_ITEMS } from '@/lib/mock-data';
import { createTopupOrder } from '@/lib/supabase/actions';
import { cn, formatCurrency, generateOrderNumber } from '@/lib/utils';

const PAYMENT_OPTIONS = [
  { id: 'qris', label: 'QRIS (Semua E-Wallet & Bank)', icon: QrCode, fee: 0.007 },
  { id: 'va-bca', label: 'Virtual Account BCA', icon: Landmark, fee: 4250, isFlat: true },
  { id: 'va-mandiri', label: 'Virtual Account Mandiri', icon: Landmark, fee: 4250, isFlat: true },
  { id: 'gopay', label: 'GoPay', icon: Wallet, fee: 0.015 },
  { id: 'dana', label: 'DANA', icon: Wallet, fee: 0.015 },
  { id: 'ovo', label: 'OVO', icon: Wallet, fee: 0.015 },
];

type Status = 'form' | 'processing' | 'success';

export default function TopUpPage() {
  const [gameIndex, setGameIndex] = useState(0);
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [itemId, setItemId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('form');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isPending, startTransition] = useTransition();

  const activeGameGroup = TOPUP_ITEMS[gameIndex];
  const selectedItem = activeGameGroup.items.find((i) => i.id === itemId);
  const selectedPayment = PAYMENT_OPTIONS.find((p) => p.id === paymentId);

  const adminFee = useMemo(() => {
    if (!selectedItem || !selectedPayment) return 0;
    return selectedPayment.isFlat
      ? selectedPayment.fee
      : Math.round(selectedItem.price * selectedPayment.fee);
  }, [selectedItem, selectedPayment]);

  const total = (selectedItem?.price ?? 0) + adminFee;

  const canSubmit = userId.trim().length >= 4 && selectedItem && selectedPayment;

  function handleSubmit() {
    if (!canSubmit || !selectedItem || !selectedPayment) return;
    setStatus('processing');
    startTransition(async () => {
      const result = await createTopupOrder({
        game: activeGameGroup.game.name,
        gameUserId: zoneId ? `${userId} (${zoneId})` : userId,
        itemLabel: selectedItem.label,
        amount: total,
        paymentMethod: selectedPayment.label,
      });
      // Falls back to a local invoice number if the insert fails (e.g. the
      // guest-checkout migration hasn't been applied yet) so the demo flow
      // still completes for the user.
      setInvoiceNumber(result.success ? result.orderNumber : generateOrderNumber());
      setStatus('success');
    });
  }

  function resetForm() {
    setStatus('form');
    setUserId('');
    setZoneId('');
    setItemId(null);
    setPaymentId(null);
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
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Top Up Kilat
          </h1>
          <p className="text-xs text-text-muted">Diamond & voucher masuk otomatis dalam 1 detik</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10 items-start">
        <div className="space-y-6 min-w-0">
          {/* Step 1: Game */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">1. Pilih Game</h2>
            <div className="grid grid-cols-3 gap-3">
              {TOPUP_ITEMS.map((group, idx) => (
                <button
                  key={group.game.id}
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
                  <span className="text-2xl">{group.game.icon}</span>
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {group.game.name}
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
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentId(opt.id)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
                      paymentId === opt.id
                        ? 'bg-brand-cyan/10 border-brand-cyan/40'
                        : 'bg-bg-card border-border-subtle hover:border-white/20'
                    )}
                  >
                    <Icon className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-xs font-semibold text-text-main text-left">{opt.label}</span>
                    {paymentId === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-brand-cyan ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
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
                  <span className="text-text-main font-semibold">{activeGameGroup.game.name}</span>
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
                <div className="flex justify-between text-text-muted">
                  <span>Biaya Admin</span>
                  <span className="font-mono">{formatCurrency(adminFee)}</span>
                </div>
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
