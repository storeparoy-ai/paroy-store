'use client';

import React, { useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
}) {
  const [error, setError] = React.useState('');
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError('');
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.success) {
        setError(result.error ?? 'Gagal menghapus.');
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 flex items-center justify-center mb-1">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isPending}>
            Ya, Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
