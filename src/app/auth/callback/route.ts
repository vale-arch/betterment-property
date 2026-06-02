import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'buyer' // Catch the role we passed

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )
    
    // 1. Exchange the code for a session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // 2. Since this is an OAuth login, we update the profile 
      // table directly to make sure the role is set correctly.
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata.full_name,
        email: user.email,
        role: role as any,
      })

      const name = user.user_metadata.full_name || 'there'
      return NextResponse.redirect(`${origin}/auth/welcome?role=${role}&name=${encodeURIComponent(name)}&new=true`)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}