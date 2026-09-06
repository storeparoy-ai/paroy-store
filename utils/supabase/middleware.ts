import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canOpenAdminPath, firstAllowedAdminPath, type AdminRole } from '@/lib/admin-permissions'

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

  // 3. Admin check — role DAN izin per-menu dibaca dari `profiles`, bukan
  //    sekadar "sudah login".
  //
  //    Sejak migrasi 19 ada dua tingkat: pemilik (akses penuh, statusnya tidak
  //    bisa diubah lewat situs) dan admin pembantu yang hanya memegang izin
  //    yang diberikan pemilik satu per satu.
  //
  //    Ini BUKAN pengaman. Yang benar-benar menolak adalah RLS: seorang admin
  //    katalog yang memanggil Supabase langsung tetap tidak akan mendapat satu
  //    baris pesanan pun, bahkan kalau blok ini dilewati sepenuhnya. Gunanya
  //    di sini supaya ia tidak mendarat di halaman kosong tanpa penjelasan.
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .maybeSingle()

    const access = {
      role: (profile?.role ?? 'user') as AdminRole,
      permissions: profile?.permissions ?? [],
    }

    const landing = firstAllowedAdminPath(access)

    // Halaman indeks: antar ke tab pertama yang memang boleh ia buka —
    // pemilik ke Dashboard, admin pesanan ke Pesanan, admin katalog ke
    // Item Top Up. Lihat catatan panjang di langkah 4 soal kenapa pengalihan
    // ini harus di sini dan bukan redirect() di dalam page.tsx.
    if (request.nextUrl.pathname === '/admin' && landing) {
      const url = request.nextUrl.clone()
      url.pathname = landing
      return NextResponse.redirect(url)
    }

    if (!canOpenAdminPath(access, request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      // Admin yang izinnya dicabut di tengah jalan dipulangkan ke tab yang
      // masih boleh ia buka, bukan ke beranda — kalau memang masih ada.
      url.pathname = landing ?? '/'
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
  // (/admin ikut aturan ini juga, tapi ditangani di langkah 3 karena tujuannya
  // tergantung izin siapa yang membuka.)
  const INDEX_REDIRECTS: Record<string, string> = {
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
