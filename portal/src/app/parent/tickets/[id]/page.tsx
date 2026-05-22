'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'
import type { Profile } from '@/types'

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState('')
  const [ticket, setTicket] = useState<{ id: string; subject: string; status: string } | null>(null)
  const [messages, setMessages] = useState<{ id: string; body: string; author_id: string; created_at: string; author_name: string }[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as Profile)

      const res = await fetch(`/api/parent/tickets/${id}`)
      if (res.status === 404) { setNotFound(true); return }
      if (res.ok) {
        const data = await res.json()
        setTicket(data.ticket)
        setMessages(data.messages)
      }
    }
    load()
  }, [id])

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    await fetch(`/api/tickets/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: reply.trim() }),
    })
    setReply('')
    setSending(false)
    // reload messages
    const res = await fetch(`/api/parent/tickets/${id}`)
    if (res.ok) {
      const data = await res.json()
      setTicket(data.ticket)
      setMessages(data.messages)
    }
  }

  if (notFound) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Ticket nicht gefunden.</p></div>
  if (!profile || !ticket) return null

  const statusLabel = ticket.status === 'open' ? 'Offen' : ticket.status === 'in_progress' ? 'In Bearbeitung' : 'Geschlossen'
  const statusClass = ticket.status === 'open' ? 'bg-teal-100 text-teal-700' : ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={(profile as any).lang ?? 'de'} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href="/parent/tickets" className="flex items-center gap-1 text-teal-600 text-sm font-bold hover:underline mb-4">
          <ArrowLeft size={14} /> Zurück
        </a>

        <div className="kc-card px-5 py-4 mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-black text-gray-800">{ticket.subject}</h1>
          <span className={`kc-badge text-xs flex-shrink-0 ${statusClass}`}>{statusLabel}</span>
        </div>

        <div className="space-y-3 mb-4">
          {messages.length === 0 && (
            <div className="kc-card px-5 py-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-gray-400 font-semibold text-sm">Noch keine Nachrichten</p>
            </div>
          )}
          {messages.map(m => {
            const isMe = m.author_id === userId
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  isMe ? 'bg-teal-600 text-white' : 'kc-card bg-white text-gray-800'
                }`}>
                  {!isMe && (
                    <p className="text-xs font-black text-teal-600 mb-1">{m.author_name}</p>
                  )}
                  <p className="text-sm leading-relaxed">{m.body}</p>
                  <p className={`text-xs mt-1.5 font-semibold ${isMe ? 'text-teal-200' : 'text-gray-400'}`}>
                    {new Date(m.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {ticket.status !== 'closed' ? (
          <form onSubmit={sendReply} className="kc-card p-4">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={3}
              placeholder="Nachricht schreiben…"
              className="kc-input w-full px-4 py-3 text-sm resize-none"
              required
            />
            <div className="flex justify-end mt-3">
              <button type="submit" disabled={sending || !reply.trim()}
                className="kc-btn bg-teal-600 text-white font-black text-sm px-5 py-2.5 hover:bg-teal-700 transition-colors disabled:opacity-50">
                {sending ? '⏳' : 'Senden'}
              </button>
            </div>
          </form>
        ) : (
          <div className="kc-card px-5 py-4 text-center" style={{ background: '#F5F0E8' }}>
            <p className="text-gray-500 font-semibold text-sm">Dieses Ticket ist geschlossen.</p>
          </div>
        )}
      </div>
    </div>
  )
}
