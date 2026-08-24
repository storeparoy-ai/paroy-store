'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2, Upload, X, Copy, ChevronLeft, AlertCircle, Loader2
} from 'lucide-react';
import { MOCK_PRODUCTS, PAYMENT_METHODS } from '@/lib/mock-data';
import { cn, formatCurrency, generateOrderNumber } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { mapSupabaseProduct } from '@/lib/supabase-helpers';
import { useRouter } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get('productId');
  const mode = params.get('mode') ?? 'buy';

  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderNumber] = useState(generateOrderNumber());
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(full_name, is_verified, avatar_url)')
        .eq('id', productId)
        .single();
      
      if (!error && data) {
        setProduct(mapSupabaseProduct(data));
      }
      setLoadingProduct(false);
    };
    fetchProduct();
  }, [productId, supabase]);

  if (loadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-400)' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="text-5xl">😵</span>
        <p style={{ color: 'var(--text-muted)' }}>Produk tidak ditemukan</p>
        <Link href="/products" className="btn-primary">Kembali</Link>
      </div>
    );
  }

  const price = mode === 'rental' ? (product.rentalPriceDaily ?? product.price) : product.price;
  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedPayment);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!selectedPayment || !proofFile) return;
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Upload proof to Supabase Storage (bucket: payment_proofs)
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${orderNumber}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, proofFile, {
          cacheControl: '3600',
          upsert: false
        });

      let proofUrl = '';
      if (uploadError) {
        console.error('Upload Error:', uploadError);
        // Tetap lanjut tanpa URL (tapi di production harus dihandle lebih baik)
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(fileName);
        proofUrl = publicUrlData.publicUrl;
      }

      // Insert Order to Supabase
      const { error: orderError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        buyer_id: user.id,
        product_id: product.id,
        amount: price,
        status: 'pending',
        mode: mode,
        payment_method: selectedPayment,
        proof_url: proofUrl,
        note: note
      });

      if (orderError) throw orderError;

      setSubmitted(true);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Terjadi kesalahan saat checkout. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 gap-6 animate-slide-up">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow"
          style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success)' }} />
        </div>
        <div className="text-center">
          <h2 className="font-bold font-heading text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Pesanan Terkirim! 🎉
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Order kamu sedang diproses admin. Cek status di halaman pesanan.
          </p>
        </div>
        <div
          className="w-full max-w-sm p-4 rounded-xl text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Nomor Order</p>
          <p className="font-black font-heading text-lg" style={{ color: 'var(--primary-400)' }}>{orderNumber}</p>
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <Link href="/" className="btn-secondary flex-1 text-sm justify-center">
            Beranda
          </Link>
          <Link href="/profile" className="btn-primary flex-1 text-sm justify-center">
            Cek Pesanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-4">
      {/* Back */}
      <Link
        href={`/products/${product.id}`}
        className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-[var(--primary-400)]"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali
      </Link>

      <h1 className="font-bold font-heading text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
        💳 Checkout
      </h1>

      {/* Order summary */}
      <div className="glass-card p-3 mb-3 flex gap-3">
        <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-raised)]">
          <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="64px" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">{product.game.icon}</span>
            <span className="text-xs" style={{ color: product.game.color }}>{product.game.name}</span>
          </div>
          <p className="text-sm font-semibold line-clamp-2 font-heading" style={{ color: 'var(--text-primary)' }}>
            {product.title}
          </p>
          {mode === 'rental' && (
            <span className="badge badge-rental mt-1">⏱ Rental 1 Hari</span>
          )}
          <p className="mt-2 font-black" style={{ color: 'var(--primary-400)', fontSize: '1rem' }}>
            {formatCurrency(price)}
          </p>
        </div>
      </div>

      {/* Order number */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl mb-3 text-xs"
        style={{ background: 'rgba(232,120,159,0.06)', border: '1px solid rgba(232,120,159,0.15)' }}
      >
        <span style={{ color: 'var(--text-muted)' }}>No. Order</span>
        <span className="font-bold font-heading" style={{ color: 'var(--primary-400)' }}>{orderNumber}</span>
      </div>

      {/* Payment method */}
      <div className="glass-card p-4 mb-3">
        <p className="section-label text-sm mb-3">Metode Pembayaran</p>
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((method) => {
            const isActive = selectedPayment === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl text-left transition-all border',
                  'hover:scale-[1.005] active:scale-[0.998]'
                )}
                style={{
                  background: isActive ? 'rgba(232,120,159,0.08)' : 'var(--surface-raised)',
                  borderColor: isActive ? 'rgba(232,120,159,0.4)' : 'var(--border-default)',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor: isActive ? 'var(--primary-400)' : 'var(--text-muted)',
                    background: isActive ? 'var(--primary-400)' : 'transparent',
                  }}
                >
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account detail after method selected */}
      {selectedMethod && (
        <div className="glass-card p-4 mb-3 animate-slide-up">
          <p className="section-label text-sm mb-3">Detail Rekening</p>
          <div className="space-y-2">
            {[
              { label: 'Bank / Platform', value: selectedMethod.label },
              { label: 'Nomor Rekening', value: selectedMethod.number, copyId: 'number' },
              { label: 'Atas Nama', value: selectedMethod.name },
              { label: 'Jumlah Transfer', value: formatCurrency(price), copyId: 'amount', highlight: true },
            ].map(({ label, value, copyId, highlight }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn('text-sm font-semibold', highlight && 'font-black')}
                    style={{ color: highlight ? 'var(--primary-400)' : 'var(--text-primary)' }}
                  >
                    {value}
                  </span>
                  {copyId && (
                    <button
                      onClick={() => handleCopy(value, copyId)}
                      aria-label={`Copy ${label}`}
                      className="p-1 rounded-md transition-all hover:scale-110"
                      style={{ color: copied === copyId ? 'var(--success)' : 'var(--text-muted)' }}
                    >
                      {copied === copyId ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload proof */}
      <div className="glass-card p-4 mb-3">
        <p className="section-label text-sm mb-3">Upload Bukti Transfer</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload bukti transfer"
        />
        {proofPreview ? (
          <div className="relative">
            <Image
              src={proofPreview}
              alt="Bukti transfer"
              width={400}
              height={200}
              className="w-full rounded-xl object-cover max-h-48"
            />
            <button
              onClick={() => { setProofFile(null); setProofPreview(''); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.8)' }}
              aria-label="Hapus bukti"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className={cn(
              'w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2',
              'transition-all hover:border-[rgba(232,120,159,0.5)] hover:bg-[rgba(232,120,159,0.04)]'
            )}
            style={{ borderColor: 'var(--border-default)' }}
          >
            <Upload className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Klik untuk upload foto bukti
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WEBP • Maks 5MB</span>
          </button>
        )}
      </div>

      {/* Note */}
      <div className="glass-card p-4 mb-4">
        <p className="section-label text-sm mb-3">Catatan (opsional)</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambahkan catatan untuk admin..."
          rows={3}
          className="input-base resize-none"
          aria-label="Catatan"
        />
      </div>

      {/* Warning */}
      {!selectedPayment && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-3 text-xs"
          style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          Pilih metode pembayaran terlebih dahulu
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedPayment || !proofFile || isLoading}
        className={cn(
          'btn-primary w-full text-sm py-3.5',
          (!selectedPayment || !proofFile) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            Memproses...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Konfirmasi Pembayaran
          </>
        )}
      </button>

      <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        Pesananmu akan diproses admin dalam 1×24 jam setelah pembayaran dikonfirmasi
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <div className="pt-9 lg:pt-[5.75rem] min-h-screen">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="skeleton w-full max-w-lg h-96 mx-4" />
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </div>
      <BottomNav />
      <div className="h-[116px] lg:hidden" />
    </>
  );
}
