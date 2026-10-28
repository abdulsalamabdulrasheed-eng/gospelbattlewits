import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. Protect Admin Routes (Server-Side)
  if (path.startsWith('/admin') && path !== '/admin/setup-2fa') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Verify the user is actually an Admin
    const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()
    if (!admin) {
      // Logged in but NOT an admin -> kick them out
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. Protect Contestant Routes
  if (path.startsWith('/contestant') && !path.includes('/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Verify the user is a Contestant
    const { data: contestant } = await supabase.from('contestants').select('id').eq('email', user.email).single()
    if (!contestant) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 3. NEVER auto-redirect from /login. Force them to log in again.
  // If they are logged in and visit /login, we do nothing. They see the form.
  // This prevents the "Contestant sees Admin panel" breach.

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/contestant/:path*'],
}
