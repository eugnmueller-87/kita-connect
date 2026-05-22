import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { publishEvent } from '@/lib/kafka'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, category, message } = await request.json()
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Betreff und Nachricht sind erforderlich' }, { status: 400 })
  }

  // Content moderation — block toxic/bullying language before saving
  try {
    const modRes = await fetch(`${process.env.N8N_BASE_URL}/content-moderation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.trim(),
        user_id: user.id,
        context: 'ticket',
        context_id: null,
      }),
    })
    if (modRes.status === 422) {
      const modData = await modRes.json()
      return NextResponse.json(
        { error: modData.reason ?? 'Nachricht nicht zulässig.' },
        { status: 422 }
      )
    }
  } catch {
    // Moderation service unavailable — fail open, ticket goes through
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: profile } = await admin.from('profiles').select('kita_id').eq('id', user.id).single()

  const { data: ticket, error: ticketError } = await admin
    .from('tickets')
    .insert({
      parent_id: user.id,
      subject: subject.trim(),
      body: message.trim(),
      status: 'open',
      kita_id: profile?.kita_id ?? null,
    })
    .select()
    .single()

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 })

  await admin.from('ticket_replies').insert({
    ticket_id: ticket.id,
    author_id: user.id,
    body: message.trim(),
  })

  await publishEvent('ticket.created', { ticket_id: ticket.id, parent_id: user.id, subject, category })

  return NextResponse.json({ id: ticket.id })
}
