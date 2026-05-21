import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) return NextResponse.json({ error: 'Token fehlt' }, { status: 400 })

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await adminSupabase
    .from('invitations')
    .select('email, role, used_at')
    .eq('token', token)
    .single()

  if (error || !data || data.used_at) {
    return NextResponse.json({ error: 'Ungültige Einladung' }, { status: 400 })
  }

  return NextResponse.json({ email: data.email, role: data.role })
}
