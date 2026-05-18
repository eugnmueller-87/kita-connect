import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-parent', full_name: 'Anna Müller', email: 'anna@example.de',
  role: 'parent', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockTickets: Record<string, { subject: string; status: string }> = {
  '1': { subject: 'Frage zu Bring- und Abholzeiten', status: 'open' },
  '2': { subject: 'Essensplan diese Woche', status: 'in_progress' },
  '3': { subject: 'Termin Entwicklungsgespräch', status: 'closed' },
}

const mockMessages = [
  { id: '1', ticket_id: '1', sender_id: 'dev-parent', body: 'Hallo, ich wollte fragen, ob wir Emma manchmal schon um 7:15 Uhr bringen können?', sender: { full_name: 'Anna Müller', role: 'parent' }, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '2', ticket_id: '1', sender_id: 'dev-teacher', body: 'Hallo Frau Müller! Ja, das ist kein Problem. Wir öffnen ab 7:00 Uhr. Bitte klingeln Sie einfach.', sender: { full_name: 'Maria Schmidt', role: 'teacher' }, created_at: new Date(Date.now() - 3600000).toISOString() },
]

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = mockProfile
  const ticket = mockTickets[id] ?? { subject: 'Unbekanntes Ticket', status: 'closed' }
  const messages = mockMessages.filter(m => m.ticket_id === id)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <a href="/parent/tickets" className="flex items-center gap-1 text-teal-600 text-sm font-bold hover:underline mb-4">
          <ArrowLeft size={14} /> Zurück zu Nachrichten
        </a>

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

        <div className="space-y-3 mb-4">
          {messages.length === 0 && (
            <div className="kc-card px-5 py-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-gray-400 font-semibold text-sm">Noch keine Nachrichten in diesem Ticket</p>
            </div>
          )}
          {messages.map(m => {
            const isMe = m.sender_id === profile.id
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 ${
                  isMe
                    ? 'kc-card bg-teal-600 text-white rounded-br-sm'
                    : 'kc-card bg-white text-gray-800 rounded-bl-sm'
                }`}>
                  {!isMe && (
                    <p className="text-xs font-black text-teal-600 mb-1">{m.sender.full_name}</p>
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
