import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getLang } from '@/lib/getLang'
import { t } from '@/lib/translations'
import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { profile, userId } = await requireRole('parent')
  const lang = await getLang()
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const [{ data: ticket }, { data: messages }] = await Promise.all([
    admin.from('tickets').select('id, subject, status, created_at').eq('id', id).eq('parent_id', userId).single(),
    admin.from('ticket_replies').select('id, body, author_id, created_at, author:profiles(full_name, role)').eq('ticket_id', id).order('created_at'),
  ])

  if (!ticket) notFound()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={lang} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <a href="/parent/tickets" className="flex items-center gap-1 text-teal-600 text-sm font-bold hover:underline mb-4">
          <ArrowLeft size={14} /> {tr(t.common.backMessages)}
        </a>

        <div className="kc-card px-5 py-4 mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-black text-gray-800">{ticket.subject}</h1>
          <span className={`kc-badge text-xs flex-shrink-0 ${
            ticket.status === 'open' ? 'bg-teal-100 text-teal-700' :
            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {ticket.status === 'open' ? tr(t.status.open) : ticket.status === 'in_progress' ? tr(t.status.active) : tr(t.status.closed)}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          {(!messages || messages.length === 0) && (
            <div className="kc-card px-5 py-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-gray-400 font-semibold text-sm">{tr(t.tickets.noMessages)}</p>
            </div>
          )}
          {(messages ?? []).map(m => {
            const isMe = m.author_id === userId
            const author = Array.isArray(m.author) ? m.author[0] : m.author
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  isMe ? 'bg-teal-600 text-white' : 'kc-card bg-white text-gray-800'
                }`}>
                  {!isMe && author && (
                    <p className="text-xs font-black text-teal-600 mb-1">{author.full_name}</p>
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
          <form action={`/api/tickets/${id}/reply`} method="POST" className="kc-card p-4">
            <textarea
              name="body"
              rows={3}
              placeholder={tr(t.tickets.placeholder)}
              className="kc-input w-full px-4 py-3 text-sm resize-none"
              required
            />
            <div className="flex justify-end mt-3">
              <button type="submit" className="kc-btn bg-teal-600 text-white font-black text-sm px-5 py-2.5 hover:bg-teal-700 transition-colors">
                {tr(t.common.send)}
              </button>
            </div>
          </form>
        ) : (
          <div className="kc-card px-5 py-4 text-center" style={{ background: '#F5F0E8' }}>
            <p className="text-gray-500 font-semibold text-sm">{tr(t.status.ticketClosed)}</p>
          </div>
        )}

      </div>
    </div>
  )
}
