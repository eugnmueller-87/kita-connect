import Navbar from '@/components/navbar'
import InviteForm from './invite-form'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-admin', full_name: 'Admin Nutzer', email: 'admin@kita-connect.de',
  role: 'admin', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockInvitations = [
  { id: '1', email: 'neue.mutter@example.de', role: 'parent', used_at: null, created_at: new Date().toISOString() },
  { id: '2', email: 'erzieherin@example.de', role: 'teacher', used_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', email: 'vater@example.de', role: 'parent', used_at: null, created_at: new Date(Date.now() - 172800000).toISOString() },
]

export default function AdminInvitationsPage() {
  const profile = mockProfile
  const invitations = mockInvitations

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück zum Dashboard</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
          <div className="text-6xl flex-shrink-0">✉️</div>
          <div>
            <h1 className="text-2xl font-black text-white">Einladungen</h1>
            <p className="text-purple-200 font-semibold text-sm mt-1">{invitations.length} Einladungen gesendet</p>
          </div>
        </div>

        <div className="kc-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📨</span>
            <h2 className="font-black text-gray-800">Neue Einladung senden</h2>
          </div>
          <InviteForm />
        </div>

        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="font-black text-gray-800">Gesendete Einladungen</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {invitations.map(inv => (
              <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{inv.email}</p>
                  <p className="text-xs text-gray-400 font-semibold">{new Date(inv.created_at).toLocaleDateString('de-DE')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
                    {inv.role === 'parent' ? '👨‍👩‍👧 Elternteil' : '👩‍🏫 Erzieher/in'}
                  </span>
                  <span className={`kc-badge text-xs ${inv.used_at ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                    {inv.used_at ? '✅ Angenommen' : '⏳ Ausstehend'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
