import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl
  
  // Check if this is a recovery/auth callback with a code
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_code = searchParams.get('error_code')
  
  // If we have a code on the homepage, redirect to auth callback
  if (code && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
