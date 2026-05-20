import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, kita_id').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, role, kita_id } = await request.json()
  if (!email?.trim() || !['parent', 'teacher', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })
  }

  // Kita-Kontext: super_admin kann kita_id frei wählen, admin nutzt eigene kita_id
  const resolvedKitaId = profile.role === 'super_admin' ? (kita_id || null) : profile.kita_id

  const token = crypto.randomUUID()

  const { error } = await supabase.from('invitations').insert({
    email: email.trim().toLowerCase(),
    role,
    token,
    invited_by: user.id,
    kita_id: resolvedKitaId,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog(supabase, user.id, 'invitation_sent', { details: { role }, request })

  try {
    await fetch(`${process.env.N8N_BASE_URL}/invitation-created`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, token }),
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true })
}
