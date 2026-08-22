'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail, Loader2, AlertCircle, User, Phone } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();
    
    // 1. SignUp with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          whatsapp: whatsapp,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      setSuccessMsg('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi atau langsung login jika fitur verifikasi dinonaktifkan.');
      // Optional: Auto redirect after few seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8" style={{ background: 'var(--surface-base)' }}>
      <Link href="/" className="absolute top-6 left-4 sm:left-8 flex items-center gap-2 text-sm transition-colors hover:text-[var(--primary-400)]" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-heavy animate-slide-up mt-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-black text-xl text-white mb-4" style={{ background: 'linear-gradient(135deg, var(--primary-400), var(--accent-purple))' }}>
            P
          </div>
          <h1 className="text-2xl font-black font-heading" style={{ color: 'var(--text-primary)' }}>Buat Akun</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Daftar untuk mulai bertransaksi</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base pl-9"
                placeholder="Nama Anda"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="input-base pl-9"
                placeholder="0812-xxxx-xxxx"
              />
            </div>
          </div>

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
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base pl-9"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password || !name || !whatsapp}
            className="btn-primary w-full py-3 text-sm mt-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-bold hover:underline" style={{ color: 'var(--primary-400)' }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
