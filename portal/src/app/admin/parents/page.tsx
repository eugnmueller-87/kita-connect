import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import ParentActions from './parent-actions'

export default async function AdminParentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: parents }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').eq('role', 'parent').order('created_at', { ascending: false }),
  ])

  if (!profile || profile.role !== 'admin') redirect('/login')

  const pending = (parents ?? []).filter(p => p.onboarding_status === 'pending')
  const approved = (parents ?? []).filter(p => p.onboarding_status === 'approved')

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

        {/* Pending */}
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

        {/* All parents */}
        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">✅</span>
            <h2 className="font-black text-gray-800">Alle Eltern ({(parents ?? []).length})</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {(parents ?? []).length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-3xl mb-2">👨‍👩‍👧</p>
                <p className="text-gray-400 font-semibold text-sm">Noch keine Eltern registriert</p>
              </div>
            ) : (parents ?? []).map(p => (
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
