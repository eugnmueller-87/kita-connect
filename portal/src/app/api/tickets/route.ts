import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, category, message } = await request.json()
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Betreff und Nachricht sind erforderlich' }, { status: 400 })
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({ parent_id: user.id, subject: subject.trim(), status: 'open' })
    .select()
    .single()

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 })

  await supabase.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    body: message.trim(),
  })

  try {
    await fetch(`${process.env.N8N_BASE_URL}/ticket-created`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticket.id, parent_id: user.id, subject, category }),
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ id: ticket.id })
}
