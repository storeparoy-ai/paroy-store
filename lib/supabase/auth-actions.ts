'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

type AuthResult = { error?: string; needsConfirmation?: boolean };

/** Only ever redirect to a same-site path after login/register — `next`
 * comes from a URL query param (middleware sets it when bouncing an
 * unauthenticated visitor away from /admin or /profile, see
 * utils/supabase/middleware.ts), which is attacker-controllable. Without
 * this check, a crafted link like /login?next=https://evil.com or
 * /login?next=//evil.com could send someone straight to a phishing site
 * right after they legitimately sign in — classic open-redirect. Anything
 * that isn't an unambiguous single-slash relative path falls back to '/'. */
function safeNext(next?: string): string {
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
    return next;
  }
  return '/';
}

/** Supabase Auth menjawab dalam bahasa Inggris ("Invalid login credentials"),
 * dan dulu pesan itu diteruskan mentah ke pembeli di situs berbahasa
 * Indonesia. Diterjemahkan per `code`; kode yang tak dikenal jatuh ke pesan
 * umum (aslinya tetap dicatat di log server). */
const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'Email atau password salah.',
  email_not_confirmed: 'Email belum dikonfirmasi. Cek kotak masuk emailmu.',
  user_already_exists: 'Email ini sudah terdaftar. Silakan masuk.',
  email_exists: 'Email ini sudah terdaftar. Silakan masuk.',
  weak_password: 'Password terlalu lemah. Gunakan minimal 6 karakter.',
  email_address_invalid: 'Alamat email tidak valid.',
  validation_failed: 'Data belum lengkap atau formatnya salah.',
  over_request_rate_limit: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
  over_email_send_rate_limit: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
  signup_disabled: 'Pendaftaran akun sedang ditutup.',
};

function authMessage(error: { code?: string; message: string }): string {
  const known = error.code ? AUTH_ERRORS[error.code] : undefined;
  if (!known) console.error('[auth] kesalahan tak dikenal:', error.code, error.message);
  return known ?? 'Terjadi kesalahan. Coba lagi sebentar lagi.';
}

export async function signInAction(input: { email: string; password: string; next?: string }): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error) return { error: authMessage(error) };
  redirect(safeNext(input.next));
}

export async function signUpAction(input: {
  email: string;
  password: string;
  fullName: string;
  whatsapp: string;
  next?: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName, whatsapp: input.whatsapp } },
  });
  if (error) return { error: authMessage(error) };
  // If email confirmation is required, Supabase returns a user but no
  // active session yet — surface that instead of a hard redirect.
  if (!data.session) return { needsConfirmation: true };
  redirect(safeNext(input.next));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
