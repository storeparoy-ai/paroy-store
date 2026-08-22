'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/profile');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4" style={{ background: 'var(--surface-base)' }}>
      <Link href="/" className="absolute top-6 left-4 sm:left-8 flex items-center gap-2 text-sm transition-colors hover:text-[var(--primary-400)]" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-heavy animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-black text-xl text-white mb-4" style={{ background: 'linear-gradient(135deg, var(--primary-400), var(--accent-purple))' }}>
            P
          </div>
          <h1 className="text-2xl font-black font-heading" style={{ color: 'var(--text-primary)' }}>Selamat Datang</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Masuk ke akun PAROY STORE Anda</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base pl-9"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Password</label>
              <Link href="#" className="text-xs hover:underline" style={{ color: 'var(--primary-400)' }}>Lupa password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="btn-primary w-full py-3 text-sm mt-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold hover:underline" style={{ color: 'var(--primary-400)' }}>
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
