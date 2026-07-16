import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get('admin_session')?.value === 'true'
  
  if (request.nextUrl.pathname.startsWith('/dashboard') && !isAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
