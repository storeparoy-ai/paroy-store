'use client';

import React, { useState, useTransition } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signInAction } from '@/lib/supabase/auth-actions';

export default function LoginForm({ redirectHint }: { redirectHint?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await signInAction({ email, password });
      if (result?.error) setError(result.error);
      // On success, signInAction redirects server-side — nothing else to do here.
    });
  }

  return (
    <div className="space-y-3">
      <Card variant="raised" className="rounded-[22px]">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
            />
            <Input
              label="Password"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isPending}>
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>

      {redirectHint && (
        <p className="text-[11px] text-text-dim text-center">
          Masuk dulu untuk melanjutkan ke halaman yang kamu tuju.
        </p>
      )}
    </div>
  );
}
