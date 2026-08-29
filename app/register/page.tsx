import React, { Suspense } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import Container from '@/components/ui/Container';
import RegisterForm from '@/components/auth/RegisterForm';

/** searchParams is only known at request time — isolating it here (same
 * pattern as ProductResults in app/products/page.tsx) lets the rest of the
 * page prerender/cache instead of forcing the whole route dynamic just to
 * read a `next` param that's usually absent anyway. */
async function RegisterFormSection({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <RegisterForm redirectHint={next} />;
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Container className="py-12 sm:py-20">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-14 h-14 mx-auto rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan flex items-center justify-center">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-brand-cyan/20 blur-2xl" />
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-[30px] text-text-main tracking-[-0.02em]">
            Daftar Akun Baru
          </h1>
          <p className="text-xs text-text-muted">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-brand-cyan font-semibold hover:opacity-80">
              Masuk di sini
            </Link>
          </p>
        </div>

        <Suspense fallback={<RegisterForm />}>
          <RegisterFormSection searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}
