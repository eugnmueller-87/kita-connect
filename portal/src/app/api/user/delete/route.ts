import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE() {
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Delete all user data via DB function (audit log + cascade)
  const { error: deleteErr } = await adminSupabase.rpc('delete_user_account', {
    target_user_id: user.id,
  })

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  // Delete the auth user last
  const { error: authDeleteErr } = await adminSupabase.auth.admin.deleteUser(user.id)
  if (authDeleteErr) {
    return NextResponse.json({ error: authDeleteErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
