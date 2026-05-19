import Navbar from '@/components/navbar'
import ParentActions from './parent-actions'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-admin', full_name: 'Admin Nutzer', email: 'admin@kita-connect.de',
  role: 'admin', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockParents = [
  { id: '1', full_name: 'Anna Müller', email: 'anna@example.de', onboarding_status: 'pending', created_at: new Date().toISOString() },
  { id: '2', full_name: 'Thomas Becker', email: 'thomas@example.de', onboarding_status: 'pending', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', full_name: 'Sara Klein', email: 'sara@example.de', onboarding_status: 'approved', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', full_name: 'Marc Weber', email: 'marc@example.de', onboarding_status: 'approved', created_at: new Date(Date.now() - 259200000).toISOString() },
]

export default function AdminParentsPage() {
  const profile = mockProfile
  const parents = mockParents
  const pending = parents.filter(p => p.onboarding_status === 'pending')
  const approved = parents.filter(p => p.onboarding_status === 'approved')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">

        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück zum Dashboard</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #1D7A6F, #2EA89A)' }}>
          <div className="text-6xl flex-shrink-0">👨‍👩‍👧</div>
          <div>
            <h1 className="text-2xl font-black text-white">Eltern verwalten</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">
              {pending.length} ausstehend · {approved.length} freigeschaltet
            </p>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="kc-card overflow-hidden mb-6">
            <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2" style={{ background: '#FFF8E7' }}>
              <span className="text-xl">⏳</span>
              <h2 className="font-black text-gray-800">Freizuschalten ({pending.length})</h2>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {pending.map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-800">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                    <p className="text-xs text-gray-400 font-semibold">{new Date(p.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                  <ParentActions parentId={p.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">✅</span>
            <h2 className="font-black text-gray-800">Alle Eltern ({parents.length})</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {parents.map(p => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{p.full_name}</p>
                  <p className="text-xs text-gray-400">{p.email}</p>
                </div>
                <span className={`kc-badge text-xs ${
                  p.onboarding_status === 'approved' ? 'bg-teal-100 text-teal-700' :
                  p.onboarding_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-600'
                }`}>
                  {p.onboarding_status === 'approved' ? '✅ Aktiv' :
                   p.onboarding_status === 'pending' ? '⏳ Ausstehend' : '❌ Abgelehnt'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
