import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-parent', full_name: 'Anna Müller', email: 'anna@example.de',
  role: 'parent', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockTickets = [
  { id: '1', subject: 'Frage zu Bring- und Abholzeiten', status: 'open', updated_at: new Date().toISOString() },
  { id: '2', subject: 'Essensplan diese Woche', status: 'in_progress', updated_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', subject: 'Termin Entwicklungsgespräch', status: 'closed', updated_at: new Date(Date.now() - 604800000).toISOString() },
]

export default function TicketsPage() {
  const profile = mockProfile

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

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
          <div className="divide-y-2 divide-[#F5F0E8]">
            {mockTickets.map(t => (
              <a key={t.id} href={`/parent/tickets/${t.id}`} className="px-5 py-4 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                <div>
                  <p className="font-black text-gray-800">{t.subject}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1">
                    {new Date(t.updated_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`kc-badge text-xs ${
                    t.status === 'open' ? 'bg-teal-100 text-teal-700' :
                    t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {t.status === 'open' ? '🟢 Offen' : t.status === 'in_progress' ? '🟡 Aktiv' : '⚫ Geschlossen'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
