import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: ticket }, { data: messages }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('tickets').select('*').eq('id', id).eq('parent_id', user.id).single(),
    supabase.from('ticket_messages').select('*, sender:profiles!sender_id(full_name, role)').eq('ticket_id', id).order('created_at', { ascending: true }),
  ])

  if (!profile || !ticket) redirect('/parent/tickets')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <a href="/parent/tickets" className="flex items-center gap-1 text-teal-600 text-sm font-bold hover:underline mb-4">
          <ArrowLeft size={14} /> Zurück zu Nachrichten
        </a>

        {/* Ticket header */}
        <div className="kc-card px-5 py-4 mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-black text-gray-800">{ticket.subject}</h1>
          <span className={`kc-badge text-xs flex-shrink-0 ${
            ticket.status === 'open' ? 'bg-teal-100 text-teal-700' :
            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {ticket.status === 'open' ? '🟢 Offen' : ticket.status === 'in_progress' ? '🟡 Aktiv' : '⚫ Geschlossen'}
          </span>
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-4">
          {(messages ?? []).length === 0 && (
            <div className="kc-card px-5 py-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-gray-400 font-semibold text-sm">Noch keine Nachrichten in diesem Ticket</p>
            </div>
          )}
          {(messages ?? []).map(m => {
            const isMe = m.sender_id === user.id
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 ${
                  isMe
                    ? 'kc-card bg-teal-600 text-white rounded-br-sm'
                    : 'kc-card bg-white text-gray-800 rounded-bl-sm'
                }`}>
                  {!isMe && (
                    <p className="text-xs font-black text-teal-600 mb-1">
                      {(m.sender as { full_name?: string } | null)?.full_name ?? 'Kita-Team'}
                    </p>
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

        {ticket.status !== 'closed' && (
          <form action={`/api/tickets/${id}/reply`} method="POST" className="kc-card p-4">
            <textarea
              name="body"
              rows={3}
              placeholder="Ihre Nachricht..."
              className="kc-input w-full px-4 py-3 text-sm resize-none"
              required
            />
            <div className="flex justify-end mt-3">
              <button type="submit" className="kc-btn bg-teal-600 text-white font-black text-sm px-5 py-2.5 hover:bg-teal-700 transition-colors">
                📤 Senden
              </button>
            </div>
          </form>
        )}

        {ticket.status === 'closed' && (
          <div className="kc-card px-5 py-4 text-center" style={{ background: '#F5F0E8' }}>
            <p className="text-gray-500 font-semibold text-sm">⚫ Dieses Ticket ist geschlossen.</p>
          </div>
        )}

      </div>
    </div>
  )
}
