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

export async function signInAction(input: { email: string; password: string; next?: string }): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error) return { error: error.message };
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
  if (error) return { error: error.message };
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
