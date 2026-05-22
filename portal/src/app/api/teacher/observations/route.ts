import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { writeAuditLog } from '@/lib/audit'
import { publishEvent } from '@/lib/kafka'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { child_id, category, text } = await request.json()
  if (!child_id || !category || !text?.trim()) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await admin
    .from('observations')
    .insert({ child_id, category, text: text.trim(), teacher_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog(supabase, user.id, 'observation_created', { record_id: data.id, details: { child_id, category }, request })
  await publishEvent('notification.created', { observation_id: data.id, child_id, teacher_id: user.id })

  return NextResponse.json({ id: data.id })
}
