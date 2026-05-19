import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { child_id, category, situation } = await request.json()
  if (!child_id || !category || !situation?.trim()) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('observations')
    .insert({ child_id, category, situation: situation.trim(), teacher_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog(supabase, user.id, 'observation_created', { record_id: data.id, details: { child_id, category }, request })

  try {
    await fetch(`${process.env.N8N_BASE_URL}/observation-created`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observation_id: data.id, child_id, teacher_id: user.id }),
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ id: data.id })
}
