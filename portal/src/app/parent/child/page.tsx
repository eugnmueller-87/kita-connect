import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'

const categoryLabel: Record<string, string> = {
  sprache: '🗣️ Sprache',
  motorik: '🏃 Motorik',
  sozial: '🤝 Sozial',
  kreativitaet: '🎨 Kreativität',
  mathematik: '🔢 Mathe & Natur',
  selbstaendigkeit: '⭐ Selbständigkeit',
}

export default async function ChildPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: children }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('children').select('*'),
  ])

  if (!profile) redirect('/login')

  const childIds = (children ?? []).map(c => c.id)

  const [{ data: observations }, { data: stories }] = await Promise.all([
    childIds.length > 0
      ? supabase.from('observations').select('*, teacher:profiles!teacher_id(full_name)').in('child_id', childIds).order('created_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
    childIds.length > 0
      ? supabase.from('learning_stories').select('*').in('child_id', childIds).eq('status', 'published').order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FF69B4, #FF8C69)' }}>
          <div className="text-6xl flex-shrink-0">👶</div>
          <div>
            <h1 className="text-2xl font-black text-white">Mein Kind</h1>
            <p className="text-pink-100 font-semibold text-sm mt-1">Entwicklung & Lerngeschichten</p>
          </div>
        </div>

        {(children ?? []).length === 0 ? (
          <div className="kc-card px-6 py-12 text-center">
            <p className="text-5xl mb-3">🌱</p>
            <p className="font-black text-gray-700 mb-1">Noch keine Kinder verknüpft</p>
            <p className="text-gray-400 text-sm">Wenden Sie sich an das Kita-Team.</p>
          </div>
        ) : (children ?? []).map(child => (
          <div key={child.id} className="mb-8">

            {/* Child header */}
            <div className="kc-card p-5 mb-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #FFF0F5, #FFE4E8)' }}>
              <div className="text-5xl">👶</div>
              <div>
                <h2 className="text-xl font-black text-gray-800">{child.name}</h2>
                <p className="text-gray-500 text-sm font-semibold">
                  Gruppe: {child.group_name ?? '—'} · Geb.: {new Date(child.birth_date).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>

            {/* Observations */}
            <div className="kc-card overflow-hidden mb-4">
              <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <h3 className="font-black text-gray-800">Entwicklungsbeobachtungen</h3>
              </div>
              <div className="divide-y-2 divide-[#F5F0E8]">
                {(observations ?? []).filter(o => o.child_id === child.id).length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-gray-400 font-semibold text-sm">Noch keine Beobachtungen</p>
                  </div>
                ) : (observations ?? []).filter(o => o.child_id === child.id).map(obs => (
                  <div key={obs.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
                        {categoryLabel[obs.category] ?? obs.category}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        {new Date(obs.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{obs.situation}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-2">
                      Erzieher/in: {(obs.teacher as { full_name?: string } | null)?.full_name ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Stories */}
            <div className="kc-card overflow-hidden">
              <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h3 className="font-black text-gray-800">Lerngeschichten</h3>
              </div>
              <div className="divide-y-2 divide-[#F5F0E8]">
                {(stories ?? []).filter(s => s.child_id === child.id).length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-3xl mb-2">📚</p>
                    <p className="text-gray-400 font-semibold text-sm">Noch keine Lerngeschichten</p>
                  </div>
                ) : (stories ?? []).filter(s => s.child_id === child.id).map(story => (
                  <div key={story.id} className="px-5 py-4">
                    <p className="font-black text-gray-800">{story.title}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">{story.final_text}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-2">{new Date(story.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
