import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question } = await request.json()
  if (!question) return NextResponse.json({ error: 'Missing question' }, { status: 400 })

  const res = await fetch(`${process.env.N8N_BASE_URL}/faq-chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, user_id: user.id }),
  })

  if (!res.ok) return NextResponse.json({ error: 'n8n error' }, { status: 500 })
  const data = await res.json()
  return NextResponse.json(data)
}
