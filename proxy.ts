import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Scoped to only the routes updateSession() actually makes a redirect
  // decision for (/admin, /profile, /login, /register — see the isProtectedRoute
  // /isAdminRoute /isAuthRoute checks in utils/supabase/middleware.ts).
  //
  // Previously this matched almost every request site-wide, meaning every
  // click/navigation anywhere on the site paid for a network round-trip to
  // Supabase Auth (auth.getUser() always revalidates over the network, it
  // never short-circuits locally) purely to refresh a session token that
  // most public pages never even read. Narrowing this is the single biggest
  // lever on perceived navigation latency across the site.
  //
  // Trade-off accepted deliberately: a session's access token (default 1h
  // lifetime) only gets proactively refreshed by middleware, and Server
  // Components can't persist a refreshed cookie themselves (see the setAll
  // comment in utils/supabase/server.ts) — so a visitor who lingers on only
  // public pages past that hour could see a stale session until they hit a
  // matched route or perform an authenticated action (which re-validates
  // for real via requireAdmin()/RLS regardless). For a shopping site with
  // short browsing sessions, that's a fine trade for cutting an auth
  // round-trip out of every single page view.
  matcher: ['/admin/:path*', '/profile/:path*', '/login', '/register'],
}
