import React from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import Container from '@/components/ui/Container';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Container className="py-12 sm:py-20">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text-main tracking-tight">
            Masuk ke Paroy Store
          </h1>
          <p className="text-xs text-text-muted">
            Belum punya akun?{' '}
            <Link href="/register" className="text-brand-cyan font-semibold hover:text-cyan-300">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <LoginForm redirectHint={next} />
      </div>
    </Container>
  );
}
