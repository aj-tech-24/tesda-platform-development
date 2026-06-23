import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Simple IP-based in-memory rate-limiter
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()
const LIMIT = 5 // Max 5 inquiries
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes window

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const record = rateLimitCache.get(ip)

  if (!record || now > record.resetTime) {
    const newRecord = { count: 1, resetTime: now + WINDOW_MS }
    rateLimitCache.set(ip, newRecord)
    return { allowed: true, remaining: LIMIT - 1, reset: newRecord.resetTime }
  }

  if (record.count >= LIMIT) {
    return { allowed: false, remaining: 0, reset: record.resetTime }
  }

  record.count += 1
  return { allowed: true, remaining: LIMIT - record.count, reset: record.resetTime }
}

export async function POST(request: Request) {
  try {
    // 1. Get Client IP Address from request headers
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    // 2. Perform Rate Limit check
    const { allowed, remaining, reset } = checkRateLimit(ip)

    if (!allowed) {
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${retryAfterSeconds} seconds.` },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
            'X-RateLimit-Limit': LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    const { name, email, category, message } = await request.json()

    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: 'Name, email, category, and message are required.' },
        { status: 400 }
      )
    }

    if (!['training_center', 'assessment_center', 'general'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category.' },
        { status: 400 }
      )
    }

    // Use a service client or direct client to allow insertions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('inquiries')
      .insert([{ name, email, category, message }])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'X-RateLimit-Limit': LIMIT.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to submit inquiry.' },
      { status: 500 }
    )
  }
}
