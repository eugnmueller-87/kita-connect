import { requireRole } from '@/lib/auth'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getLang } from '@/lib/getLang'
import { t } from '@/lib/translations'
import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'

export default async function TeacherTicketsPage() {
  const { profile } = await requireRole('teacher')
  const lang = await getLang()
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data } = await admin
    .from('tickets')
    .select('id, subject, status, created_at, parent_id')
    .order('created_at', { ascending: false })

  const tickets = data ?? []

  const parentIds = [...new Set(tickets.map(tk => tk.parent_id).filter(Boolean))]
  const { data: profileData } = parentIds.length > 0
    ? await admin.from('profiles').select('id, full_name').in('id', parentIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.id, p.full_name]))

  const open = tickets.filter(t => t.status === 'open')
  const inProgress = tickets.filter(t => t.status === 'in_progress')
  const closed = tickets.filter(t => t.status === 'closed')

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2a9d8f, #457b9d)' }}>
          <div className="text-6xl flex-shrink-0">💬</div>
          <div>
            <h1 className="text-2xl font-black text-white">Eltern-Anfragen</h1>
            <p className="text-white/80 font-semibold text-sm mt-1">
              {open.length} offen · {inProgress.length} in Bearbeitung · {closed.length} geschlossen
            </p>
          </div>
        </div>

        {tickets.length === 0 && (
          <div className="kc-card p-8 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500 font-semibold">Noch keine Anfragen</p>
          </div>
        )}

        {[
          { label: '🟢 Offen', items: open },
          { label: '🟡 In Bearbeitung', items: inProgress },
          { label: '⚫ Geschlossen', items: closed },
        ].filter(g => g.items.length > 0).map(group => (
          <div key={group.label} className="mb-6">
            <h2 className="font-black text-gray-600 text-sm mb-3 px-1">{group.label} ({group.items.length})</h2>
            <div className="kc-card overflow-hidden">
              <div className="divide-y-2 divide-[#F5F0E8]">
                {group.items.map(ticket => (
                    <a key={ticket.id} href={`/teacher/tickets/${ticket.id}`}
                      className="px-5 py-4 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                      <div>
                        <p className="font-black text-gray-800">{ticket.subject}</p>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">
                          👨‍👩‍👧 {profileMap[ticket.parent_id] ?? 'Unbekannt'} · {new Date(ticket.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`kc-badge text-xs ${statusBadge(ticket.status)}`}>{statusLabel(ticket.status)}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
