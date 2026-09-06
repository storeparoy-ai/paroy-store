import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser()

  // PROTECTED ROUTES
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  // NOTE: /checkout, /topup, and /rekber are intentionally NOT protected —
  // PRD requires guest checkout (no forced login) and a public, no-login
  // "Cek Transaksi" lookup. Only /profile (personal dashboard) and /admin
  // require an account.
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/profile')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // 1. Redirect if trying to access protected route without being logged in
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 2. Redirect logged-in users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 3. Admin check — role is looked up from `profiles`, not just "is logged in".
  if (user && isAdminRoute) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // 4. Halaman indeks yang isinya cuma meneruskan ke tab pertama.
  //
  // HARUS di sini, bukan dengan redirect() di dalam page.tsx. Dengan Cache
  // Components, redirect() dari sebuah halaman berjalan dalam konteks
  // streaming: alih-alih membalas 307, Next menyisipkan meta tag agar browser
  // yang menindaklanjutinya. Meta tag itu DIABAIKAN saat navigasi sisi klien —
  // router menerima muatan RSC berstatus 200 lalu tidak melakukan apa-apa, dan
  // pengunjung menatap spinner yang tidak pernah selesai. Itu persis keluhan
  // "menu profil tidak terbuka kecuali dibuka di tab baru", dan sebelumnya
  // keluhan yang sama untuk menu admin.
  //
  // Dokumentasi redirect() menyebut jalan keluarnya secara eksplisit: kalau
  // ingin mengalihkan SEBELUM proses render, lakukan di Proxy.
  const INDEX_REDIRECTS: Record<string, string> = {
    '/admin': '/admin/dashboard',
    '/profile': '/profile/riwayat',
  }
  const indexTarget = INDEX_REDIRECTS[request.nextUrl.pathname]
  if (indexTarget) {
    const url = request.nextUrl.clone()
    url.pathname = indexTarget
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
