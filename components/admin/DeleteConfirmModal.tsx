'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  productTitle: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  productTitle,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xs" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-3xl p-7 flex flex-col items-center gap-5 text-center bg-[#0d1220] border border-red-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-10"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-500/15 border border-red-500/30 text-red-400 shadow-md"
        >
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="font-bold font-heading text-xl text-white">
            Konfirmasi Hapus Produk
          </h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Produk <span className="font-bold text-white">"{productTitle}"</span> akan dihapus permanen dari database etalase toko dan tidak dapat dipulihkan.
          </p>
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-xs sm:text-sm py-3">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menghapus...
              </>
            ) : (
              'Ya, Hapus Produk'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
