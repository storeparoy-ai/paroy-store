'use client';

import React, { useRef, useState, useTransition } from 'react';
import { Upload, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { uploadPaymentProof } from '@/lib/supabase/storage';
import { attachPaymentProofAction } from '@/lib/supabase/actions';

/**
 * Unggah bukti transfer untuk sebuah pesanan.
 *
 * Dipakai di dua tempat: layar sukses tiap alur pemesanan (saat pembeli baru
 * saja transfer) dan halaman Cek Transaksi (kalau ia keburu menutup tab).
 *
 * Berkasnya naik langsung dari browser ke Supabase Storage, lalu path-nya
 * dilampirkan ke pesanan lewat Server Action — dua langkah, karena berkas
 * sebesar foto kamera HP tidak muat lewat body Server Action.
 */
export default function PaymentProofUpload({
  orderNumber,
  alreadyUploaded = false,
  className,
}: {
  orderNumber: string;
  alreadyUploaded?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(alreadyUploaded);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setError('');
    setFile(picked);
  }

  function handleUpload() {
    if (!file) return;
    setError('');

    startTransition(async () => {
      const uploaded = await uploadPaymentProof(file, orderNumber);
      if ('error' in uploaded) {
        setError(uploaded.error);
        return;
      }

      const attached = await attachPaymentProofAction(orderNumber, uploaded.path);
      if (!attached.success) {
        setError(attached.error);
        return;
      }

      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className={className}>
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-trust-emerald/10 border border-trust-emerald/25 text-left">
          <CheckCircle2 className="w-4 h-4 text-trust-emerald shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-trust-emerald">Bukti transfer sudah kami terima</p>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Admin sedang mengeceknya. Tidak perlu mengirim ulang.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="text-[11px] font-semibold text-text-dim hover:text-text-main underline underline-offset-2"
            >
              Kirim bukti lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="p-4 rounded-xl bg-bg-card-alt border border-border-subtle space-y-3 text-left">
        <div>
          <p className="text-xs font-bold text-text-main">Kirim Bukti Transfer</p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Unggah tangkapan layar transfermu supaya admin bisa langsung memverifikasi. JPG, PNG, atau
            PDF, maksimal 5MB.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          onChange={handlePick}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-card border border-border-subtle">
            <FileText className="w-4 h-4 text-brand-cyan shrink-0" />
            <span className="text-[11px] text-text-main truncate flex-1 min-w-0">{file.name}</span>
            <button
              type="button"
              aria-label="Hapus pilihan berkas"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="text-text-dim hover:text-text-main shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => inputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Pilih Berkas
          </Button>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-urgency-red/10 border border-urgency-red/25 text-[11px] text-urgency-red">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {file && (
          <Button variant="primary" size="sm" className="w-full" onClick={handleUpload} isLoading={isPending}>
            Kirim Bukti
          </Button>
        )}
      </div>
    </div>
  );
}
