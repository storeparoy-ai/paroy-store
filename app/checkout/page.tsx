'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Lock, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const handleCopy = () => {
    navigator.clipboard.writeText('24500');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f1414', color: '#dfe3e3' }}>
      {/* Simplified Secure Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 shadow-sm px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16 flex justify-between items-center" style={{ background: 'rgba(15,20,20,0.95)' }}>
        <div className="text-headline-md font-headline-md font-black tracking-tight text-[#42e5b0]">PAROY STORE</div>
        <div className="text-on-surface-variant text-label-md font-label-md flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Secure Checkout
        </div>
      </nav>

      <main className="flex-grow pt-[104px] pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Status Banner - Pending */}
        <div className="rounded-lg p-gutter mb-stack-md flex flex-col md:flex-row justify-between items-center gap-4 border" style={{ background: '#2B2516', borderColor: 'rgba(255,208,54,0.3)' }}>
          <div className="flex items-center gap-4">
            <span className="text-3xl">⏳</span>
            <div>
              <h2 className="text-headline-md font-headline-md" style={{ color: '#FFD036' }}>Menunggu Pembayaran</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Selesaikan pembayaran sebelum batas waktu berakhir.</p>
            </div>
          </div>
          <div className="bg-surface-container-highest px-6 py-3 rounded-lg border border-white/10 text-center">
            <div className="text-label-md font-label-md text-on-surface-variant mb-1">BATAS WAKTU</div>
            <div className="text-headline-lg font-headline-lg text-[#42e5b0] tracking-widest font-mono">{minutes}:{seconds}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Order Details */}
          <div className="lg:col-span-5 flex flex-col gap-gutter">
            <div className="bg-surface-container rounded-xl border border-white/10 p-gutter">
              <div className="border-b border-white/10 pb-4 mb-4 flex justify-between items-center">
                <h3 className="text-headline-md font-headline-md text-on-surface">Detail Pesanan</h3>
                <span className="bg-surface-container-highest px-3 py-1 rounded text-label-md font-label-md font-mono text-on-surface-variant">#INV-12345</span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex-shrink-0 border border-white/10 overflow-hidden">
                  <img src="https://placehold.co/64x64/232B2B/00c896?text=ML" alt="game" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-body-md font-body-md text-on-surface-variant">Mobile Legends</div>
                  <div className="text-headline-md font-headline-md text-on-surface">86 Diamonds</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-body-md text-on-surface-variant">User ID</span>
                  <span className="text-body-md font-mono text-on-surface">12345678 (1234)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-md text-on-surface-variant">Metode</span>
                  <span className="text-body-md text-on-surface">QRIS</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-body-lg text-on-surface-variant">Total Bayar</span>
                  <span className="text-headline-md font-headline-md text-[#42e5b0]">Rp 24.500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container rounded-xl border border-white/10 p-gutter h-full">
              <h3 className="text-headline-md font-headline-md border-b border-white/10 pb-4 mb-6 text-on-surface">Instruksi Pembayaran</h3>
              <div className="flex flex-col items-center justify-center bg-surface-container-highest rounded-lg p-8 mb-6 border border-white/5">
                <div className="w-48 h-48 bg-white p-3 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-black text-center text-sm font-mono">QR CODE PLACEHOLDER</div>
                </div>
                <p className="text-body-md text-on-surface-variant text-center max-w-md">
                  Scan QR code di atas menggunakan aplikasi e-wallet atau m-banking pilihan Anda (GoPay, OVO, Dana, BCA, dll).
                </p>
              </div>
              <div className="bg-surface-container-lowest rounded-lg border border-white/10 p-4 flex justify-between items-center">
                <div>
                  <div className="text-label-md text-on-surface-variant mb-1">Nominal Pembayaran (Bayar Sesuai Nominal)</div>
                  <div className="text-headline-md font-headline-md font-mono text-on-surface">Rp 24.500</div>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded border transition-colors text-label-md"
                  style={{
                    background: copied ? 'rgba(0,200,150,0.2)' : 'rgba(0,200,150,0.1)',
                    color: '#00c896',
                    borderColor: 'rgba(0,200,150,0.2)',
                  }}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-stack-md text-center">
          <Link href="/" className="text-label-md text-on-surface-variant hover:text-[#00c896] transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}