'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

type AuthResult = { error?: string; needsConfirmation?: boolean };

export async function signInAction(input: { email: string; password: string }): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { error: error.message };
  redirect('/');
}

export async function signUpAction(input: {
  email: string;
  password: string;
  fullName: string;
  whatsapp: string;
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
  redirect('/');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
