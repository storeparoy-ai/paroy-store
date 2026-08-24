'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4 text-center"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)' }}
        >
          <AlertTriangle className="w-7 h-7" style={{ color: 'var(--error)' }} />
        </div>

        <div>
          <h3 className="font-bold font-heading text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            Hapus Produk?
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Produk{' '}
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
              "{productTitle}"
            </span>{' '}
            akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: 'var(--error)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Trash2 className="w-4 h-4" /> Hapus</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
