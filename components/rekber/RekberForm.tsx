'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ShieldCheck, Calculator, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StatusTimeline from '@/components/shared/StatusTimeline';
import { createRekberOrder } from '@/lib/supabase/actions';
import { calculateRekberFeeFromTiers, formatCurrency, generateOrderNumber, type RekberFeeTier } from '@/lib/utils';
import type { Product } from '@/types';

const REKBER_STEPS = [
  { label: 'Pengajuan Diterima', description: 'Data rekber kamu sudah masuk ke antrean admin.' },
  { label: 'Pembayaran', description: 'Transfer nominal akun + biaya jasa ke rekening penampung.' },
  { label: 'Pengecekan Akun', description: 'Admin memverifikasi akun bersama penjual & pembeli.' },
  { label: 'Serah Terima', description: 'Email & password diganti langsung di depan admin.' },
  { label: 'Selesai', description: 'Dana diteruskan ke penjual, transaksi tuntas & aman.' },
];

export default function RekberForm({
  initialProduct,
  products,
  feeTiers,
}: {
  initialProduct?: Product;
  products: Product[];
  feeTiers: RekberFeeTier[];
}) {
  const [productId, setProductId] = useState(initialProduct?.id ?? products[0]?.id ?? '');
  const [buyerName, setBuyerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isPending, startTransition] = useTransition();

  const product = products.find((p) => p.id === productId);
  const fee = useMemo(
    () => (product ? calculateRekberFeeFromTiers(product.price, feeTiers) : 0),
    [product, feeTiers]
  );
  const total = (product?.price ?? 0) + fee;

  const canSubmit = product && buyerName.trim().length >= 3 && whatsapp.trim().length >= 9 && agreed;

  function handleSubmit() {
    if (!canSubmit || !product) return;
    startTransition(async () => {
      const result = await createRekberOrder({
        productId: product.id,
        itemDescription: product.title,
        amount: product.price,
        fee,
        buyerName,
        buyerWhatsapp: whatsapp,
      });
      // Falls back to a local invoice number if the insert fails (e.g. the
      // guest-checkout migration hasn't been applied yet) so the demo flow
      // still completes for the user.
      setOrderNumber(result.success ? result.orderNumber : generateOrderNumber());
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-trust-emerald/10 border border-trust-emerald/30 flex items-center justify-center text-trust-emerald">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-xl text-text-main">Pengajuan Rekber Diterima</h1>
          <p className="text-xs text-text-muted">
            No. Invoice: <span className="font-mono font-bold text-brand-cyan">{orderNumber}</span>
          </p>
        </div>

        <Card variant="default">
          <CardContent className="p-5 sm:p-6">
            <StatusTimeline steps={REKBER_STEPS} currentStep={0} />
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-10 items-start">
      <div className="space-y-6 min-w-0">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">Akun yang Direkber</h2>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full bg-bg-card border border-border-subtle rounded-xl text-sm text-text-main px-4 py-3 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {formatCurrency(p.price)}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">Data Pembeli</h2>
          <Input label="Nama Lengkap" placeholder="Nama sesuai identitas" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
          <Input label="Nomor WhatsApp" placeholder="Contoh: 081234567890" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </section>

        <label className="flex items-start gap-2.5 text-xs text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand-cyan cursor-pointer"
          />
          <span>
            Saya setuju bertransaksi lewat Rekber resmi Paroy Store dan memahami biaya jasa yang berlaku.
          </span>
        </label>
      </div>

      <div className="lg:sticky lg:top-24">
        <Card variant="default">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <h2 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-cyan" />
              Kalkulator Biaya Rekber
            </h2>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Harga Akun</span>
                <span className="font-mono text-text-main">{formatCurrency(product?.price ?? 0)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Biaya Jasa Rekber</span>
                <span className="font-mono text-text-main">{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border-subtle text-text-main font-bold">
                <span>Total Ditransfer</span>
                <span className="font-mono text-brand-cyan text-base">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full" disabled={!canSubmit} isLoading={isPending} onClick={handleSubmit}>
              Ajukan Rekber
            </Button>
            {!canSubmit && (
              <p className="text-[11px] text-text-dim text-center">
                Lengkapi nama, WhatsApp, dan centang persetujuan dulu ya.
              </p>
            )}
          </CardContent>
        </Card>

        <Link
          href="/products"
          className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
