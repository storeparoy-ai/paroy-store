'use client';

import React, { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { updateProfileAction } from '@/lib/supabase/profile-actions';
import type { CurrentUser } from '@/lib/supabase/queries';

export default function SettingsForm({ user }: { user: CurrentUser }) {
  const [fullName, setFullName] = useState(user.fullName ?? '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp ?? '');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('idle');
    startTransition(async () => {
      const result = await updateProfileAction({ fullName, whatsapp });
      if (result.success) {
        setStatus('saved');
      } else {
        setStatus('error');
        setError(result.error);
      }
    });
  }

  return (
    <Card variant="default" className="max-w-md">
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" value={user.email ?? ''} disabled />
          <Input
            label="Nama Lengkap"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama sesuai identitas"
          />
          <Input
            label="Nomor WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Contoh: 081234567890"
          />

          {status === 'saved' && (
            <div className="flex items-center gap-2 text-xs text-trust-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Perubahan disimpan.
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-urgency-red">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isPending}>
            Simpan Perubahan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
