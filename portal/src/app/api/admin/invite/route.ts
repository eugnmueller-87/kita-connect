import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, role } = await request.json()
  if (!email?.trim() || !['parent', 'teacher'].includes(role)) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  const token = crypto.randomUUID()

  const { error } = await supabase.from('invitations').insert({
    email: email.trim().toLowerCase(),
    role,
    token,
    invited_by: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog(supabase, user.id, 'invitation_sent', null, { role })

  try {
    await fetch(`${process.env.N8N_BASE_URL}/invitation-created`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, token }),
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true })
}
