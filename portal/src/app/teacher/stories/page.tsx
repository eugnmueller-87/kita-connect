import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockStories = [
  { id: '1', title: 'Emma entdeckt die Welt der Insekten', status: 'published', child: { name: 'Emma Müller' }, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '2', title: 'Luca baut seine erste Brücke', status: 'review', child: { name: 'Luca Becker' }, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'Mias Kunstwerk — Farben der Welt', status: 'draft', child: { name: 'Mia Fischer' }, created_at: new Date().toISOString() },
]

export default function TeacherStoriesPage() {
  const profile = mockProfile
  const stories = mockStories
  const published = stories.filter(s => s.status === 'published')
  const inReview = stories.filter(s => s.status === 'review')
  const drafts = stories.filter(s => s.status === 'draft')

  const statusGroups = [
    { key: 'published', label: '✅ Veröffentlicht', items: published, color: '#E1F5EE' },
    { key: 'review', label: '🔍 In Überprüfung', items: inReview, color: '#FFF8E7' },
    { key: 'draft', label: '✏️ Entwürfe', items: drafts, color: '#F5F0E8' },
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

        {statusGroups.filter(g => g.items.length > 0).map(group => (
          <div key={group.key} className="mb-6">
            <h2 className="font-black text-gray-600 text-sm mb-3 px-1">{group.label} ({group.items.length})</h2>
            <div className="kc-card overflow-hidden">
              <div className="divide-y-2 divide-[#F5F0E8]">
                {group.items.map(s => (
                  <a key={s.id} href={`/teacher/stories/${s.id}`} className="px-5 py-4 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                    <div>
                      <p className="font-black text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">
                        👶 {s.child.name} · {new Date(s.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
