import Navbar from '@/components/navbar'
import NewObservationForm from './new-observation-form'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockChildren = [
  { id: '1', name: 'Emma Müller' },
  { id: '2', name: 'Luca Becker' },
  { id: '3', name: 'Mia Fischer' },
  { id: '4', name: 'Noah Klein' },
]

const mockObservations = [
  { id: '1', category: 'sozial', situation: 'Emma hat heute beim Bauen im Sandkasten anderen Kindern geholfen und Ideen eingebracht.', child: { name: 'Emma Müller' }, learning_disposition: 'Zugehörigkeit und Gemeinschaft', created_at: new Date().toISOString() },
  { id: '2', category: 'sprache', situation: 'Luca hat beim Vorlesen viele Fragen gestellt und neue Wörter aktiv wiederholt.', child: { name: 'Luca Becker' }, learning_disposition: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', category: 'kreativitaet', situation: 'Mia hat eigenständig ein Bild mit Wasserfarben gemalt und dabei Farben gemischt.', child: { name: 'Mia Fischer' }, learning_disposition: 'Wohlbefinden und Zugehörigkeit', created_at: new Date(Date.now() - 172800000).toISOString() },
]

const categoryLabel: Record<string, string> = {
  sprache: '🗣️ Sprache',
  motorik: '🏃 Motorik',
  sozial: '🤝 Sozial',
  kreativitaet: '🎨 Kreativität',
  mathematik: '🔢 Mathe & Natur',
  selbstaendigkeit: '⭐ Selbständigkeit',
}

export default function TeacherObservationsPage() {
  const profile = mockProfile

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
              {mockObservations.length} erfasste Beobachtungen
            </p>
          </div>
        </div>

        <div className="kc-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📝</span>
            <h2 className="font-black text-gray-800">Neue Beobachtung erfassen</h2>
          </div>
          <NewObservationForm children={mockChildren} teacherId={mockProfile.id} />
        </div>

        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="font-black text-gray-800">Meine Beobachtungen</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {mockObservations.map(o => (
              <div key={o.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
                      {categoryLabel[o.category] ?? o.category}
                    </span>
                    <span className="text-xs font-bold text-gray-500">👶 {o.child.name}</span>
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
