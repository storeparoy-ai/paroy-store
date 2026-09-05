'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ShieldAlert, PartyPopper, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SubmitError from '@/components/shared/SubmitError';
import { createBuyOrder } from '@/lib/supabase/actions';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

type Unit = 'hourly' | 'daily';

export default function RentalFlow({ product }: { product: Product }) {
  const availableUnits: { value: Unit; label: string; rate: number }[] = [
    ...(product.rentalPriceHourly ? [{ value: 'hourly' as const, label: 'Per Jam', rate: product.rentalPriceHourly }] : []),
    ...(product.rentalPriceDaily ? [{ value: 'daily' as const, label: 'Per Hari', rate: product.rentalPriceDaily }] : []),
  ];

  const [unit, setUnit] = useState<Unit>(availableUnits[0]?.value ?? 'daily');
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerWhatsapp, setBuyerWhatsapp] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();

  const rate = availableUnits.find((u) => u.value === unit)?.rate ?? 0;
  const total = rate * qty;
  const maxQty = unit === 'hourly' ? 24 : 30;
  const canSubmit = buyerName.trim().length >= 3 && buyerWhatsapp.trim().length >= 9 && total > 0;

  const durationLabel = useMemo(
    () => `${qty} ${unit === 'hourly' ? 'jam' : 'hari'}`,
    [qty, unit]
  );

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitError('');
    startTransition(async () => {
      // Durasi dikirim mentah (satuan + jumlah); tarifnya diambil server dari
      // kolom rental_price_* milik produk, jadi total tidak bisa dikarang dari
      // sisi browser — lihat migrasi 00000000000010.
      const result = await createBuyOrder({
        productId: product.id,
        buyerName,
        buyerWhatsapp,
        paymentMethod: 'Transfer (dikonfirmasi admin)',
        mode: 'rental',
        note: `Sewa ${durationLabel}`,
        rentalUnit: unit,
        rentalQty: qty,
      });
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setInvoiceNumber(result.orderNumber);
      setConfirmed(true);
    });
  }

  if (availableUnits.length === 0) {
    return (
      <p className="text-sm text-text-muted py-10 text-center">
        Produk ini belum punya harga sewa yang diatur.
      </p>
    );
  }

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto text-center space-y-5 py-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-trust-emerald/10 border border-trust-emerald/30 flex items-center justify-center text-trust-emerald">
          <PartyPopper className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main">
          Pengajuan Sewa Diterima!
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Admin akan menghubungi kamu di WhatsApp untuk instruksi pembayaran & jadwal mulai sewa
          ({durationLabel}).
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
        <Card variant="alt">
          <CardContent className="p-5 sm:p-6 flex gap-4">
            <div className="relative w-20 h-16 sm:w-24 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-bg-card-alt border border-border-subtle">
              <Image src={product.images[0]} alt={product.title} fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Badge variant="cyan" size="sm">{product.game.icon} {product.game.name}</Badge>
              <h2 className="font-heading font-bold text-sm sm:text-base text-text-main line-clamp-2">
                {product.title}
              </h2>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">Durasi Sewa</h2>
          <div className="flex gap-2">
            {availableUnits.map((u) => (
              <button
                key={u.value}
                onClick={() => {
                  setUnit(u.value);
                  setQty(1);
                }}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 p-4 rounded-xl border transition-colors',
                  unit === u.value
                    ? 'bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan'
                    : 'bg-bg-card border-border-subtle text-text-muted hover:border-white/20'
                )}
              >
                <span className="text-xs font-bold">{u.label}</span>
                <span className="font-mono text-[11px]">{formatCurrency(u.rate)}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border-subtle">
            <span className="text-xs font-semibold text-text-main">Jumlah {unit === 'hourly' ? 'Jam' : 'Hari'}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-main hover:bg-white/10 transition-colors"
                aria-label="Kurangi"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-text-main w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-main hover:bg-white/10 transition-colors"
                aria-label="Tambah"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim">Data Penyewa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Nama sesuai identitas"
            />
            <Input
              label="Nomor WhatsApp"
              value={buyerWhatsapp}
              onChange={(e) => setBuyerWhatsapp(e.target.value)}
              placeholder="Contoh: 081234567890"
            />
          </div>
        </section>

        <Card variant="default" className="border-urgency-orange/25">
          <CardContent className="p-5 sm:p-6 space-y-2.5">
            <h2 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-urgency-orange" />
              Panduan Aman Sewa Akun
            </h2>
            <ul className="text-xs text-text-muted space-y-1.5 leading-relaxed list-disc list-inside">
              <li>Login akun hanya diberikan admin lewat WhatsApp setelah pembayaran dikonfirmasi.</li>
              <li>Dilarang mengganti email, password, atau mengikat akun lain selama masa sewa.</li>
              <li>Password otomatis direset admin begitu masa sewa berakhir.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-24">
        <Card variant="raised" className="rounded-[22px]">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading font-bold text-sm text-text-main">Ringkasan Sewa</h2>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Durasi</span>
                <span className="text-text-main font-semibold">{durationLabel}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Tarif</span>
                <span className="font-mono text-text-main">{formatCurrency(rate)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border-subtle text-text-main font-bold">
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
              <Clock className="w-4 h-4" />
              Ajukan Sewa
            </Button>
            {!canSubmit && (
              <p className="text-[11px] text-text-dim text-center">
                Lengkapi nama dan nomor WhatsApp dulu ya.
              </p>
            )}
            <SubmitError message={submitError} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
