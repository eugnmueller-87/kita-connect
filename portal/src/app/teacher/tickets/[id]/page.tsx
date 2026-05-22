import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getLang } from '@/lib/getLang'
import { t } from '@/lib/translations'
import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'
import TicketActions from './ticket-actions'

export default async function TeacherTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { profile, userId } = await requireRole('teacher')
  const lang = await getLang()
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const [{ data: ticket }, { data: replies }] = await Promise.all([
    admin.from('tickets').select('id, subject, status, created_at, parent:profiles(full_name, email)').eq('id', id).single(),
    admin.from('ticket_replies').select('id, body, author_id, created_at, author:profiles(full_name, role)').eq('ticket_id', id).order('created_at'),
  ])

  if (!ticket) notFound()

  const parent = Array.isArray(ticket.parent) ? ticket.parent[0] : ticket.parent

  function statusBadge(status: string) {
    if (status === 'open') return 'bg-teal-100 text-teal-700'
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-500'
  }

  function statusLabel(status: string) {
    if (status === 'open') return tr(t.status.open)
    if (status === 'in_progress') return tr(t.status.inProgress)
    return tr(t.status.closed)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={lang} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href="/teacher/tickets" className="flex items-center gap-1 text-teal-600 text-sm font-bold hover:underline mb-4">
          <ArrowLeft size={14} /> Alle Anfragen
        </a>

        {/* Header */}
        <div className="kc-card px-5 py-4 mb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-lg font-black text-gray-800">{ticket.subject}</h1>
            <span className={`kc-badge text-xs flex-shrink-0 ${statusBadge(ticket.status)}`}>
              {statusLabel(ticket.status)}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-semibold">
            👨‍👩‍👧 {parent?.full_name ?? 'Unbekannt'} · {new Date(ticket.created_at).toLocaleDateString('de-DE')}
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-4">
          {(!replies || replies.length === 0) && (
            <div className="kc-card px-5 py-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-gray-400 font-semibold text-sm">Noch keine Nachrichten</p>
            </div>
          )}
          {(replies ?? []).map(r => {
            const isMe = r.author_id === userId
            const author = Array.isArray(r.author) ? r.author[0] : r.author
            return (
              <div key={r.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  isMe ? 'bg-teal-600 text-white' : 'kc-card bg-white text-gray-800'
                }`}>
                  {!isMe && author && (
                    <p className="text-xs font-black text-teal-600 mb-1">{author.full_name}</p>
                  )}
                  <p className="text-sm leading-relaxed">{r.body}</p>
                  <p className={`text-xs mt-1.5 font-semibold ${isMe ? 'text-teal-200' : 'text-gray-400'}`}>
                    {new Date(r.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions: reply + status */}
        <TicketActions ticketId={id} currentStatus={ticket.status} lang={lang} />
      </div>
    </div>
  )
}
