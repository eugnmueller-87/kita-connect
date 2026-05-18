import Navbar from '@/components/navbar'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-parent', full_name: 'Anna Müller', email: 'anna@example.de',
  role: 'parent', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockNotifications = [
  { id: '1', type: 'lerngeschichte_bereit', title: 'Neue Lerngeschichte', body: 'Eine neue Lerngeschichte über Emma wurde veröffentlicht.', read: false, created_at: new Date().toISOString() },
  { id: '2', type: 'broadcast', title: 'Elternabend', body: 'Der nächste Elternabend findet am 12. Juni um 19:00 Uhr statt.', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', type: 'broadcast', title: 'Gruppenausflug', body: 'Die Schmetterlingsgruppe macht am Freitag einen Ausflug zum Stadtpark. Bitte wetterfeste Kleidung anziehen.', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', type: 'onboarding_approved', title: 'Willkommen bei Kita Connect!', body: 'Ihr Konto wurde freigeschaltet. Sie haben jetzt Zugriff auf alle Funktionen.', read: true, created_at: new Date(Date.now() - 604800000).toISOString() },
]

const typeLabel: Record<string, string> = {
  ticket_update: '💬 Ticket', broadcast: '📢 Mitteilung', welcome: '👋 Willkommen',
  observation_added: '📝 Beobachtung', lerngeschichte_bereit: '📖 Lerngeschichte', onboarding_approved: '✅ Freischaltung',
}

export default function NotificationsPage() {
  const profile = mockProfile
  const notifications = mockNotifications
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={unread} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FFD166, #FFB347)' }}>
          <div className="text-6xl flex-shrink-0">🔔</div>
          <div>
            <h1 className="text-2xl font-black text-white">Benachrichtigungen</h1>
            <p className="text-yellow-100 font-semibold text-sm mt-1">
              {unread > 0 ? `${unread} ungelesen` : 'Alles gelesen ✓'}
            </p>
          </div>
        </div>

        <div className="kc-card overflow-hidden">
          <div className="divide-y-2 divide-[#F5F0E8]">
            {notifications.map(n => (
              <div key={n.id} className={`px-5 py-4 flex items-start gap-4 ${!n.read ? 'bg-teal-50' : ''}`}>
                <div className="flex-1">
                  <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
                    {typeLabel[n.type] ?? n.type}
                  </span>
                  <p className="font-black text-gray-800 mt-1">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.body}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 font-semibold mt-1">
                  {new Date(n.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
