import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import NewObservationForm from './new-observation-form'

const categoryLabel: Record<string, string> = {
  sprache: '🗣️ Sprache',
  motorik: '🏃 Motorik',
  sozial: '🤝 Sozial',
  kreativitaet: '🎨 Kreativität',
  mathematik: '🔢 Mathe & Natur',
  selbstaendigkeit: '⭐ Selbständigkeit',
}

export default async function TeacherObservationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: observations }, { data: children }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('observations').select('*, child:children!child_id(name)').eq('teacher_id', user.id).order('created_at', { ascending: false }),
    supabase.from('children').select('id, name').order('name'),
  ])

  if (!profile || profile.role !== 'teacher') redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">

        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FFD166, #FFB347)' }}>
          <div className="text-6xl flex-shrink-0">👁️</div>
          <div>
            <h1 className="text-2xl font-black text-white">Beobachtungen</h1>
            <p className="text-yellow-100 font-semibold text-sm mt-1">
              {(observations ?? []).length} erfasste Beobachtungen
            </p>
          </div>
        </div>

        {/* New observation */}
        <div className="kc-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📝</span>
            <h2 className="font-black text-gray-800">Neue Beobachtung erfassen</h2>
          </div>
          <NewObservationForm children={children ?? []} teacherId={user.id} />
        </div>

        {/* List */}
        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="font-black text-gray-800">Meine Beobachtungen</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {(observations ?? []).length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-gray-400 font-semibold text-sm">Noch keine Beobachtungen erfasst</p>
              </div>
            ) : (observations ?? []).map(o => (
              <div key={o.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
                      {categoryLabel[o.category] ?? o.category}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      👶 {(o.child as { name?: string } | null)?.name ?? '—'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">
                    {new Date(o.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{o.situation}</p>
                {o.learning_disposition && (
                  <p className="text-xs text-purple-600 font-semibold mt-1">💡 {o.learning_disposition}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
