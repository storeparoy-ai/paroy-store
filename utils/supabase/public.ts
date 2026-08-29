import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Plain, session-less Supabase client for reads that are genuinely public
 * and identical for every visitor (games, site settings, payment methods,
 * rekber fee tiers, price ranges — all admin-managed CMS content with a
 * public SELECT RLS policy). Deliberately does NOT touch cookies()/headers()
 * like utils/supabase/server.ts's client does, which matters specifically
 * because that's what let these reads be wrapped in `'use cache'` (Cache
 * Components errors if a cached function's scope touches a per-request
 * dynamic API) — see the query functions in lib/supabase/queries.ts that
 * use this instead of createClient() for exactly that reason.
 *
 * Never use this for anything that should respect the calling user's
 * session or RLS role (admin-only tables, "my own orders", mutations) —
 * those need utils/supabase/server.ts's cookie-aware client instead.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
