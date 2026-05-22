import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const [{ data: ticket }, { data: replies }] = await Promise.all([
    admin.from('tickets').select('id, subject, status, created_at').eq('id', id).eq('parent_id', user.id).single(),
    admin.from('ticket_replies').select('id, body, author_id, created_at').eq('ticket_id', id).order('created_at'),
  ])

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const authorIds = [...new Set((replies ?? []).map(r => r.author_id).filter(Boolean))]
  const { data: profileData } = authorIds.length > 0
    ? await admin.from('profiles').select('id, full_name').in('id', authorIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.id, p.full_name]))

  const messages = (replies ?? []).map(r => ({
    id: r.id,
    body: r.body,
    author_id: r.author_id,
    created_at: r.created_at,
    author_name: profileMap[r.author_id] ?? 'Kita-Team',
  }))

  return NextResponse.json({ ticket, messages })
}
