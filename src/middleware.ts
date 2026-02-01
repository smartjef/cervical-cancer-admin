import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('better-auth.session_token')?.value
    const { pathname } = request.nextUrl

    // Define public paths that don't require authentication
    const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.includes('.')

    if (!token && !isPublicPath) {
        // Redirect to login if no token and trying to access a protected path
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (token && (pathname === '/login' || pathname === '/')) {
        // Redirect to dashboard if logged in and trying to access login or root page
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    if (!token && pathname === '/') {
        // Redirect root to login if not authenticated
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
