import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export default async function TeacherStoriesPage() {
  const { profile, userId } = await requireRole('teacher')
  const supabase = await createClient()

  const { data } = await supabase
    .from('learning_stories')
    .select('id, title, status, created_at, child:children(name)')
    .eq('teacher_id', userId)
    .order('created_at', { ascending: false })

  const stories = data ?? []
  const published = stories.filter(s => s.status === 'published')
  const inReview = stories.filter(s => s.status === 'review')
  const drafts = stories.filter(s => s.status === 'draft')

  const statusGroups = [
    { key: 'published', label: '✅ Veröffentlicht', items: published },
    { key: 'review', label: '🔍 In Überprüfung', items: inReview },
    { key: 'draft', label: '✏️ Entwürfe', items: drafts },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">

        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' }}>
          <div className="text-6xl flex-shrink-0">📖</div>
          <div>
            <h1 className="text-2xl font-black text-white">Lerngeschichten</h1>
            <p className="text-red-200 font-semibold text-sm mt-1">
              {published.length} veröffentlicht · {inReview.length} in Überprüfung · {drafts.length} Entwürfe
            </p>
          </div>
        </div>

        {stories.length === 0 && (
          <div className="kc-card p-8 text-center">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-gray-500 font-semibold">Noch keine Lerngeschichten erstellt.</p>
          </div>
        )}

        {statusGroups.filter(g => g.items.length > 0).map(group => (
          <div key={group.key} className="mb-6">
            <h2 className="font-black text-gray-600 text-sm mb-3 px-1">{group.label} ({group.items.length})</h2>
            <div className="kc-card overflow-hidden">
              <div className="divide-y-2 divide-[#F5F0E8]">
                {group.items.map(s => {
                  const child = Array.isArray(s.child) ? s.child[0] as { name: string } | undefined : s.child as { name: string } | null
                  return (
                    <a key={s.id} href={`/teacher/stories/${s.id}`} className="px-5 py-4 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                      <div>
                        <p className="font-black text-gray-800">{s.title}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">
                          {child && `👶 ${child.name} · `}{new Date(s.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
