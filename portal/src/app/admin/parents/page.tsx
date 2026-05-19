import Navbar from '@/components/navbar'
import ParentActions from './parent-actions'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export default async function AdminParentsPage() {
  const { profile } = await requireRole('admin')
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, onboarding_status, created_at')
    .eq('role', 'parent')
    .order('created_at', { ascending: false })

  const parents = data ?? []
  const pending = parents.filter(p => p.onboarding_status === 'pending')
  const approved = parents.filter(p => p.onboarding_status === 'active')

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
          {parents.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400 font-semibold text-center">Noch keine Eltern registriert</p>
          ) : (
            <div className="divide-y-2 divide-[#F5F0E8]">
              {parents.map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                  <span className={`kc-badge text-xs ${
                    p.onboarding_status === 'active' ? 'bg-teal-100 text-teal-700' :
                    p.onboarding_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {p.onboarding_status === 'active' ? '✅ Aktiv' :
                     p.onboarding_status === 'pending' ? '⏳ Ausstehend' : '❌ Gesperrt'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
