import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Elevated, RLS-bypassing Supabase client for the handful of server-only
 * code paths that genuinely can't operate under a normal user session —
 * right now, only the Tripay payment webhook (Tripay calling us has no
 * Supabase auth session at all, but still needs to read the private_key to
 * verify its own callback signature, and needs to update order status
 * regardless of which guest/user placed the order).
 *
 * Deliberately NOT used anywhere else in this codebase — every other admin
 * operation goes through the logged-in admin's own session + RLS role
 * checks (see requireAdmin() in cms-actions.ts / admin-actions.ts), which is
 * the more idiomatic Supabase pattern and doesn't need this at all. Reach
 * for this only when there's truly no user session to authenticate as.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix — never sent to
 * the browser) in the server environment. Not set yet as of Phase 1 of the
 * Tripay integration (see migration 00000000000008's header comment) — this
 * throws a clear error rather than silently falling back to the anon key
 * (which would just re-hit the same RLS wall this client exists to bypass).
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY belum diatur di environment — diperlukan untuk mengaktifkan webhook Tripay (Phase 2). Minta Claude untuk memandu cara amannya.'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
