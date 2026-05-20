import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { publishEvent } from '@/lib/kafka'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, body } = await request.json()
  if (!title || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await publishEvent('notification.created', { type: 'broadcast', title, body, sender_id: user.id })
  await writeAuditLog(supabase, user.id, 'broadcast_sent', { details: { title }, request })

  return NextResponse.json({ ok: true })
}
