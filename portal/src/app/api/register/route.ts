import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { token, full_name, phone, password } = await request.json()

  if (!token || !full_name?.trim() || !password || password.length < 8) {
    return NextResponse.json({ error: 'Fehlende oder ungültige Felder' }, { status: 400 })
  }

  const supabase = await createClient()

  // Validate token
  const { data: invitation, error: invErr } = await supabase
    .from('invitations')
    .select('id, email, role, kita_id, used_at')
    .eq('token', token)
    .single()

  if (invErr || !invitation || invitation.used_at) {
    return NextResponse.json({ error: 'Ungültiger oder bereits verwendeter Einladungslink' }, { status: 400 })
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', invitation.email)
    .single()

  if (existingProfile) {
    return NextResponse.json({ error: 'Account existiert bereits' }, { status: 409 })
  }

  // Create user via service role (bypasses email confirmation)
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: newUser, error: signUpErr } = await adminSupabase.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name.trim() },
  })

  if (signUpErr || !newUser.user) {
    return NextResponse.json({ error: signUpErr?.message ?? 'Registrierung fehlgeschlagen' }, { status: 500 })
  }

  // Create profile
  const { error: profileErr } = await adminSupabase.from('profiles').insert({
    id: newUser.user.id,
    email: invitation.email,
    full_name: full_name.trim(),
    phone: phone ?? null,
    role: invitation.role,
    kita_id: invitation.kita_id ?? null,
  })

  if (profileErr) {
    // Rollback: delete the created auth user
    await adminSupabase.auth.admin.deleteUser(newUser.user.id)
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  // Mark invitation as used
  await adminSupabase
    .from('invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.json({ ok: true })
}
