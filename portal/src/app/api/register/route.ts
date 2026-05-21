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
    .select('id, email, role, kita_id, used_at')
    .eq('token', token)
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

  // Store pending registration — kita_id carried over from invitation
  // Invitation is NOT marked used_at here; it gets marked after Magic Link confirmation
  const { error: profileErr } = await supabase
    .from('pending_registrations')
    .insert({
      token,
      email: invitation.email,
      role: invitation.role,
      kita_id: invitation.kita_id ?? null,
      full_name: full_name.trim(),
      phone: phone ?? null,
    })

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  // Mark invitation as used only after pending_registration is saved
  await supabase
    .from('invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.json({ ok: true })
}
