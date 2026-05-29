import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getAdminRole } from '@/lib/admin-role'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    let response = NextResponse.json({ ok: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    const user = data.user

    const role = getAdminRole(user)
    if (!role) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'This account is not configured for the TESDA portal.' }, { status: 403 })
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Failed to login.' }, { status: 500 })
  }
}