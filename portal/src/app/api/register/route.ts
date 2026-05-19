import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { token, full_name, phone } = await request.json()

  if (!token || !full_name?.trim()) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const supabase = await createClient()

  // Validate token — token is the invitation UUID (id)
  const { data: invitation, error: invErr } = await supabase
    .from('invitations')
    .select('id, email, role, used_at')
    .eq('id', token)
    .single()

  if (invErr || !invitation || invitation.used_at) {
    return NextResponse.json({ error: 'Ungültiger oder bereits verwendeter Einladungslink' }, { status: 400 })
  }

  // Check if profile already exists for this email
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', invitation.email)
    .single()

  if (existingProfile) {
    return NextResponse.json({ error: 'Account existiert bereits' }, { status: 409 })
  }

  // Create profile — user_id will be filled after they confirm via magic link
  // We store the pending profile keyed by invitation token
  const { error: profileErr } = await supabase
    .from('pending_registrations')
    .insert({
      token,
      email: invitation.email,
      role: invitation.role,
      full_name: full_name.trim(),
      phone: phone ?? null,
    })

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  // Mark invitation as used
  await supabase
    .from('invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.json({ ok: true })
}
