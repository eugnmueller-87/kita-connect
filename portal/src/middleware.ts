import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/auth/confirm', '/auth/callback', '/register']

const ROLE_PREFIXES: Record<string, string> = {
  admin: '/admin',
  super_admin: '/admin',
  traeger_admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths through without auth check
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as string | undefined

  if (!role) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  const allowedPrefix = role ? ROLE_PREFIXES[role] : null

  // /dashboard redirects to the role-specific dashboard
  if (pathname === '/dashboard' || pathname === '/') {
    const target = request.nextUrl.clone()
    target.pathname = allowedPrefix ?? '/login'
    return NextResponse.redirect(target)
  }

  // Block cross-role access: teacher cannot access /admin, parent cannot access /teacher, etc.
  const isProtectedPrefix = Object.values(ROLE_PREFIXES).some(p => pathname.startsWith(p))
  if (isProtectedPrefix && (!allowedPrefix || !pathname.startsWith(allowedPrefix))) {
    const target = request.nextUrl.clone()
    target.pathname = allowedPrefix ?? '/login'
    return NextResponse.redirect(target)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
