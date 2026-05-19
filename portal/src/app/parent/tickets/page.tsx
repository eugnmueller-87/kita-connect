import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export default async function TicketsPage() {
  const { profile, userId } = await requireRole('parent')
  const supabase = await createClient()

  const { data } = await supabase
    .from('tickets')
    .select('id, subject, status, updated_at')
    .eq('parent_id', userId)
    .order('updated_at', { ascending: false })

  const tickets = data ?? []

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <a href="/parent" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        <div className="kc-card p-6 mb-6 flex items-center justify-between gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="flex items-center gap-5">
            <div className="text-6xl flex-shrink-0">💬</div>
            <div>
              <h1 className="text-2xl font-black text-white">Meine Nachrichten</h1>
              <p className="text-teal-200 font-semibold text-sm mt-1">Anfragen ans Kita-Team</p>
            </div>
          </div>
          <a href="/parent/tickets/new" className="kc-btn bg-white text-teal-700 font-black text-sm px-4 py-2.5 flex-shrink-0 hover:bg-teal-50 transition-colors">
            ✏️ Neu
          </a>
        </div>

        <div className="kc-card overflow-hidden">
          {tickets.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 font-semibold text-center">Noch keine Nachrichten gesendet.</p>
          ) : (
            <div className="divide-y-2 divide-[#F5F0E8]">
              {tickets.map(t => (
                <a key={t.id} href={`/parent/tickets/${t.id}`} className="px-5 py-4 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                  <div>
                    <p className="font-black text-gray-800">{t.subject}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-1">{new Date(t.updated_at).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`kc-badge text-xs ${t.status === 'open' ? 'bg-teal-100 text-teal-700' : t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.status === 'open' ? '🟢 Offen' : t.status === 'in_progress' ? '🟡 Aktiv' : '⚫ Geschlossen'}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
