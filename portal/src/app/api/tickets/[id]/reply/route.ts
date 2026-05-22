import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const body = formData.get('body')?.toString().trim()
  if (!body) return NextResponse.json({ error: 'Nachricht ist leer' }, { status: 400 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await admin.from('ticket_replies').insert({
    ticket_id: id,
    author_id: user.id,
    body,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return Response.redirect(new URL(`/parent/tickets/${id}`, request.url))
}
