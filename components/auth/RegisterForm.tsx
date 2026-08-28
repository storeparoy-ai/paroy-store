'use client';

import React, { useState, useTransition } from 'react';
import { User, Phone, Mail, Lock, AlertCircle, MailCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signUpAction } from '@/lib/supabase/auth-actions';

export default function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    startTransition(async () => {
      const result = await signUpAction({ email, password, fullName, whatsapp });
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.needsConfirmation) {
        setNeedsConfirmation(true);
      }
      // Otherwise signUpAction already redirected server-side.
    });
  }

  if (needsConfirmation) {
    return (
      <Card variant="default">
        <CardContent className="p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-trust-emerald/10 border border-trust-emerald/25 text-trust-emerald flex items-center justify-center">
            <MailCheck className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-text-main">Cek Email Kamu</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Kami sudah kirim link konfirmasi ke <strong className="text-text-main">{email}</strong>.
            Klik link itu untuk mengaktifkan akun sebelum masuk.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            required
            leftIcon={<User className="w-4 h-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama sesuai identitas"
          />
          <Input
            label="Nomor WhatsApp"
            required
            leftIcon={<Phone className="w-4 h-4" />}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Contoh: 081234567890"
          />
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
            placeholder="Minimal 6 karakter"
          />

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isPending}>
            Daftar Sekarang
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
