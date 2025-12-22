import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Handle token_hash (from email template)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'signup' | 'invite' | 'magiclink' | 'email_change',
    })

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/actualizar-contrasena`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Token verification error:', error)
    return NextResponse.redirect(`${origin}/iniciar-sesion?error=invalid_token`)
  }

  // Handle code (from PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Code exchange error:', error)
  }

  return NextResponse.redirect(`${origin}/iniciar-sesion?error=auth`)
}
