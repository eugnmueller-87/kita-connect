import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'

export default async function TeacherChildrenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: children }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('children').select('*').order('name'),
  ])

  if (!profile || profile.role !== 'teacher') redirect('/login')

  const groups = [...new Set((children ?? []).map(c => c.group_name).filter(Boolean))]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">

        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="text-6xl flex-shrink-0">👶</div>
          <div>
            <h1 className="text-2xl font-black text-white">Alle Kinder</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">
              {(children ?? []).length} Kinder · {groups.length} Gruppen
            </p>
          </div>
        </div>

        {(children ?? []).length === 0 ? (
          <div className="kc-card px-6 py-12 text-center">
            <p className="text-5xl mb-3">🌱</p>
            <p className="font-black text-gray-700">Noch keine Kinder erfasst</p>
          </div>
        ) : groups.length > 0 ? (
          groups.map(group => (
            <div key={group} className="mb-6">
              <h2 className="font-black text-gray-600 text-sm uppercase tracking-wider mb-3 px-1">
                📍 Gruppe {group}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(children ?? []).filter(c => c.group_name === group).map(child => (
                  <div key={child.id} className="kc-card p-4 flex items-center gap-3" style={{ background: '#FFF0F5' }}>
                    <span className="text-3xl">👶</span>
                    <div>
                      <p className="font-black text-gray-800 text-sm">{child.name}</p>
                      <p className="text-xs text-gray-400 font-semibold">
                        {new Date(child.birth_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(children ?? []).map(child => (
              <div key={child.id} className="kc-card p-4 flex items-center gap-3" style={{ background: '#FFF0F5' }}>
                <span className="text-3xl">👶</span>
                <div>
                  <p className="font-black text-gray-800 text-sm">{child.name}</p>
                  <p className="text-xs text-gray-400 font-semibold">
                    {new Date(child.birth_date).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
