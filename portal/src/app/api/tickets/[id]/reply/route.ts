import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const body = formData.get('body')?.toString().trim()
  if (!body) return NextResponse.json({ error: 'Nachricht ist leer' }, { status: 400 })

  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: id,
    sender_id: user.id,
    body,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return Response.redirect(new URL(`/parent/tickets/${id}`, request.url))
}
