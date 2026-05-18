import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { parent_id, action } = await request.json()
  if (!parent_id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const res = await fetch(`${process.env.N8N_BASE_URL}/parent-approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parent_id, action }),
  })

  if (!res.ok) return NextResponse.json({ error: 'n8n error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
