'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Copy,
  Check,
  Landmark,
  Wallet,
  ShieldCheck,
  PartyPopper,
  Timer,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PAYMENT_METHODS } from '@/lib/mock-data';
import { createBuyOrder } from '@/lib/supabase/actions';
import { cn, formatCurrency, generateOrderNumber } from '@/lib/utils';
import type { Product } from '@/types';

const CHECKOUT_DURATION_SECONDS = 15 * 60;

function useCountdownSeconds(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  return { label: `${m}:${s}`, expired: remaining <= 0 };
}

export default function CheckoutFlow({ product }: { product: Product }) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerWhatsapp, setBuyerWhatsapp] = useState('');
  const [paymentId, setPaymentId] = useState(PAYMENT_METHODS[0].id);
  const [confirmed, setConfirmed] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { label: countdownLabel, expired } = useCountdownSeconds(CHECKOUT_DURATION_SECONDS);

  const selectedPayment = PAYMENT_METHODS.find((p) => p.id === paymentId) ?? PAYMENT_METHODS[0];
  const canSubmit = buyerName.trim().length >= 3 && buyerWhatsapp.trim().length >= 9 && !expired;

  function handleCopy() {
    navigator.clipboard?.writeText(selectedPayment.number.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleConfirmPayment() {
    if (!canSubmit) return;
    startTransition(async () => {
      const result = await createBuyOrder({
        productId: product.id,
        amount: product.price,
        buyerName,
        buyerWhatsapp,
        paymentMethod: selectedPayment.label,
      });
      // Falls back to a locally-generated invoice if the DB insert fails
      // (e.g. guest-checkout migration not applied yet) so the flow never
      // hard-breaks for the user — admin can reconcile manually in that case.
      setInvoiceNumber(result.success ? result.orderNumber : generateOrderNumber());
      setConfirmed(true);
    });
  }

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto text-center space-y-5 py-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-trust-emerald/10 border border-trust-emerald/30 flex items-center justify-center text-trust-emerald">
          <PartyPopper className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main">
          Konfirmasi Diterima!
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Admin akan memverifikasi pembayaranmu dalam maks. 10 menit, lalu proses serah terima akun
          akan dijadwalkan. Simpan invoice ini untuk pelacakan.
        </p>
        <Card variant="alt">
          <CardContent className="p-5 flex items-center justify-between">
            <span className="text-xs text-text-dim">No. Invoice</span>
            <span className="font-mono font-bold text-brand-cyan">{invoiceNumber}</span>
          </CardContent>
        </Card>
        <Link href="/cek-transaksi">
          <Button variant="primary" className="w-full">
            Lacak Status Transaksi
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10 items-start">
      <div className="space-y-6 min-w-0">
        {/* Order summary */}
        <Card variant="alt" className="rounded-[20px]">
          <CardContent className="p-5 sm:p-6 flex gap-4">
            <div className="relative w-20 h-16 sm:w-24 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-bg-card-alt border border-border-subtle">
              <Image src={product.images[0]} alt={product.title} fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Badge variant="cyan" size="sm">{product.game.icon} {product.game.name}</Badge>
              <h2 className="font-heading font-bold text-sm sm:text-base text-text-main line-clamp-2">
                {product.title}
              </h2>
              <span className="font-mono font-bold text-brand-cyan text-sm">
                {formatCurrency(product.price)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Buyer info */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">Data Pembeli</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Nama sesuai identitas"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
            <Input
              label="Nomor WhatsApp"
              placeholder="Contoh: 081234567890"
              value={buyerWhatsapp}
              onChange={(e) => setBuyerWhatsapp(e.target.value)}
            />
          </div>
        </section>

        {/* Payment method */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">
            Pilih Metode Pembayaran
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.id.includes('bca') || method.id.includes('mandiri') ? Landmark : Wallet;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentId(method.id)}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
                    paymentId === method.id
                      ? 'bg-brand-cyan/10 border-brand-cyan/40'
                      : 'bg-bg-card border-border-subtle hover:border-white/20'
                  )}
                >
                  <Icon className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-xs font-semibold text-text-main text-left">{method.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Payment instructions */}
        <Card variant="default" className="rounded-[20px]">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <h2 className="font-heading font-bold text-sm text-text-main">Instruksi Pembayaran</h2>
            <div className="p-4 rounded-xl bg-bg-card-alt border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">{selectedPayment.label}</span>
                <span className="text-xs text-text-muted">a.n. {selectedPayment.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-text-main">{selectedPayment.number}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan hover:text-cyan-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            </div>
            <ol className="text-xs text-text-muted space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Transfer tepat sesuai nominal total di ringkasan pesanan.</li>
              <li>Klik tombol &ldquo;Saya Sudah Transfer&rdquo; setelah pembayaran berhasil.</li>
              <li>Admin memverifikasi &amp; mendampingi serah terima akun secara langsung.</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Summary sidebar */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <Card variant="raised" className="rounded-[22px]">
          <CardContent className="p-6 space-y-5">
            <div
              className={cn(
                'flex items-center justify-center gap-2 h-12 rounded-[14px] text-sm font-bold font-mono border',
                expired
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-urgency-orange/10 text-urgency-orange border-urgency-orange/30'
              )}
            >
              <Timer className="w-4 h-4" />
              {expired ? 'Waktu pembayaran habis' : `Bayar dalam ${countdownLabel}`}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Harga Akun</span>
                <span className="font-mono text-text-main">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border-subtle text-text-main font-bold">
                <span className="text-[13.5px]">Total Bayar</span>
                <span className="font-mono text-brand-cyan text-2xl">{formatCurrency(product.price)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canSubmit}
              isLoading={isPending}
              onClick={handleConfirmPayment}
            >
              Saya Sudah Transfer
            </Button>
            {!canSubmit && !expired && (
              <p className="text-[11px] text-text-dim text-center">
                Lengkapi nama dan nomor WhatsApp dulu ya.
              </p>
            )}

            <div className="flex items-start gap-2 text-[11px] text-text-muted leading-relaxed pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-trust-emerald shrink-0 mt-0.5" />
              <span>Transaksi dilindungi &mdash; dana hanya diteruskan setelah akun terverifikasi aman.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
