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

  // 1. Protect Admin Routes
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    
    // Check if Admin
    const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()
    if (!admin) return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Protect Contestant Routes
  if (path.startsWith('/contestant/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    
    // Check if Contestant
    const { data: contestant } = await supabase.from('contestants').select('id').eq('email', user.email).single()
    if (!contestant) return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Redirect logged-in users away from login
  if (path === '/login' && user) {
    const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()
    if (admin) return NextResponse.redirect(new URL('/admin', request.url))
    
    const { data: contestant } = await supabase.from('contestants').select('id').eq('email', user.email).single()
    if (contestant) return NextResponse.redirect(new URL('/contestant/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/contestant/dashboard', '/login'],
}
