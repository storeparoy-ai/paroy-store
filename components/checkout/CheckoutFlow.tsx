'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Copy,
  Check,
  Landmark,
  Wallet,
  ShieldCheck,
  PartyPopper,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SubmitError from '@/components/shared/SubmitError';
import PaymentProofUpload from '@/components/shared/PaymentProofUpload';
import { createBuyOrder } from '@/lib/supabase/actions';
import { cn, formatCurrency } from '@/lib/utils';
import type { PaymentMethod } from '@/lib/supabase/queries';
import type { Product } from '@/types';

// Dulu ada hitung mundur "Bayar dalam 15:00" di sini. Tidak ada apa pun di
// server yang kedaluwarsa — pesanan baru dibuat saat tombol "Saya Sudah
// Transfer" ditekan, dan memuat ulang halaman mengembalikannya ke 15:00.
// Satu-satunya efek nyatanya: pembeli yang butuh lebih dari 15 menit di
// aplikasi bank mendapati tombol itu terkunci SETELAH uangnya terkirim.

export default function CheckoutFlow({
  product,
  paymentMethods,
}: {
  product: Product;
  paymentMethods: PaymentMethod[];
}) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerWhatsapp, setBuyerWhatsapp] = useState('');
  const [paymentId, setPaymentId] = useState(paymentMethods[0]?.id ?? '');
  const [confirmed, setConfirmed] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();

  const selectedPayment = paymentMethods.find((p) => p.id === paymentId) ?? paymentMethods[0];
  const canSubmit = buyerName.trim().length >= 3 && buyerWhatsapp.trim().length >= 9 && !!selectedPayment;

  function handleCopy() {
    if (!selectedPayment) return;
    navigator.clipboard?.writeText(selectedPayment.accountNumber.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleConfirmPayment() {
    if (!canSubmit || !selectedPayment) return;
    setSubmitError('');
    startTransition(async () => {
      // No `amount` — the server reads the price from the products table
      // itself (migration 00000000000010).
      const result = await createBuyOrder({
        productId: product.id,
        buyerName,
        buyerWhatsapp,
        paymentMethod: selectedPayment.label,
      });
      // A failed write must never be dressed up as a success. This used to
      // fall back to an invoice number invented in the browser, which sent
      // the buyer off to transfer money against an order that did not exist
      // anywhere — invisible to admin, untraceable in Cek Transaksi.
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setInvoiceNumber(result.orderNumber);
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
        <PaymentProofUpload orderNumber={invoiceNumber} />

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
              autoComplete="name"
              placeholder="Nama sesuai identitas"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
            <Input
              label="Nomor WhatsApp"
              type="tel"
              autoComplete="tel"
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
            {paymentMethods.map((method) => {
              const Icon = method.code.includes('bca') || method.code.includes('mandiri') ? Landmark : Wallet;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentId(method.id)}
                  aria-pressed={paymentId === method.id}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
                    paymentId === method.id
                      ? 'bg-brand-cyan/10 border-brand-cyan/40'
                      : 'bg-bg-card border-border-subtle hover:border-white/20'
                  )}
                >
                  <Icon className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-xs font-semibold text-text-main text-left">{method.label}</span>
                  {paymentId === method.id && <Check className="w-4 h-4 text-brand-cyan ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Payment instructions */}
        {selectedPayment && (
          <Card variant="default" className="rounded-[20px]">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <h2 className="font-heading font-bold text-sm text-text-main">Instruksi Pembayaran</h2>
              <div className="p-4 rounded-xl bg-bg-card-alt border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim">{selectedPayment.label}</span>
                  <span className="text-xs text-text-muted">a.n. {selectedPayment.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-lg text-text-main">{selectedPayment.accountNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 min-h-11 px-3 -mr-3 rounded-lg text-xs font-semibold text-brand-cyan hover:bg-brand-cyan/10 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span aria-live="polite">{copied ? 'Tersalin' : 'Salin'}</span>
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
        )}
      </div>

      {/* Summary sidebar */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <Card variant="raised" className="rounded-[22px]">
          <CardContent className="p-6 space-y-5">
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
            {!canSubmit && (
              <p className="text-[11px] text-text-dim text-center">
                Lengkapi nama dan nomor WhatsApp dulu ya.
              </p>
            )}
            <SubmitError message={submitError} />

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
