'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-parent', full_name: 'Anna Müller', email: 'anna@example.de',
  role: 'parent', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const child = {
  name: 'Emma Müller', birth_date: '2020-03-15', group_name: 'Schmetterlinge', gender: 'f',
  teacher: 'Maria Schmidt',
}

const observations = [
  { id: 'o1', category: '🤝 Sozial', text: 'Emma hat beim Bauen im Sandkasten anderen Kindern spontan geholfen und Ideen eingebracht. Sie übernahm eine natürliche Vermittlerrolle.', date: '18.05.2026', awareness: 'Was das bedeutet: Emma zeigt das, was Pädagogen in Neuseeland "Contribution" nennen — sie fühlt sich sicher genug, anderen zu geben. Das ist ein starkes Zeichen für emotionale Reife.' },
  { id: 'o2', category: '🗣️ Sprache', text: 'Emma beschreibt Gefühle anderer Kinder mit bemerkenswert präzisen Wörtern — auch wenn sie selbst nicht beteiligt ist.', date: '14.05.2026', awareness: 'Was das bedeutet: Emotionsvokabular in diesem Alter ist laut Forschern wie Shonkoff ein starker Indikator für spätere soziale Kompetenz und schulischen Erfolg.' },
  { id: 'o3', category: '⭐ Selbständigkeit', text: 'Emma räumt ihren Platz eigenständig auf und erinnert andere Kinder freundlich — ohne aufgefordert zu werden.', date: '10.05.2026', awareness: 'Was das bedeutet: Selbstregulation und Verantwortungsgefühl in diesem Alter sind nach Heckman (Nobelpreisträger) wichtiger für den Lebensweg als spätere kognitive Fähigkeiten.' },
]

const stories = [
  { id: 's1', title: 'Emma entdeckt die Welt der Insekten', date: '16.05.2026', text: 'Emma war heute ganz fasziniert von einem kleinen Käfer im Garten. Mit großen Augen beobachtete sie, wie er über den Boden krabbelte, und fragte: "Wohin geht er denn?" Ihre Neugier und Ausdauer beim Beobachten waren beeindruckend — sie blieb fast 20 Minuten dabei, ohne abgelenkt zu werden.', awareness: 'Was das bedeutet: Diese Art von tiefer, selbstgewählter Konzentration nennt Montessori den "Polarisationseffekt" — ein Zeichen, dass Emma sich in einem sensiblen Lernmoment befindet. Zuhause: Lassen Sie sie ähnliche Entdeckungen im Garten oder Park machen — ohne Zeitdruck.' },
]

function getAge(birthDate: string) {
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return `${y} Jahre${m > 0 ? `, ${m} Monate` : ''}`
}

function ChildAvatar({ size = 56 }: { size?: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 56 56" fill="none">
      <ellipse cx="28" cy="44" rx="14" ry="9" fill="#FF9FB2"/>
      <circle cx="28" cy="26" r="14" fill="#FFCF8B"/>
      <ellipse cx="28" cy="16" rx="14" ry="8" fill="#C0761A"/>
      <ellipse cx="14" cy="22" rx="4" ry="6" fill="#C0761A"/>
      <ellipse cx="42" cy="22" rx="4" ry="6" fill="#C0761A"/>
      <ellipse cx="14" cy="17" rx="4" ry="2.5" fill="#FF6B9D" transform="rotate(-20 14 17)"/>
      <ellipse cx="14" cy="17" rx="4" ry="2.5" fill="#FF6B9D" transform="rotate(20 14 17)"/>
      <circle cx="14" cy="17" r="2" fill="#FF3D7F"/>
      <circle cx="23" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="33" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="24" cy="26" r="0.8" fill="white"/>
      <circle cx="34" cy="26" r="0.8" fill="white"/>
      <ellipse cx="20" cy="31" rx="3" ry="2" fill="#FFB3C6" opacity="0.7"/>
      <ellipse cx="36" cy="31" rx="3" ry="2" fill="#FFB3C6" opacity="0.7"/>
      <path d="M23 33 Q28 37 33 33" stroke="#C0761A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export default function ParentChildPage() {
  const [awarenessOn, setAwarenessOn] = useState(false)
  const [askOpen, setAskOpen] = useState<string | null>(null)
  const [askText, setAskText] = useState('')
  const [askSent, setAskSent] = useState(false)

  function sendAsk(e: React.FormEvent) {
    e.preventDefault()
    setAskSent(true)
    setTimeout(() => { setAskSent(false); setAskOpen(null); setAskText('') }, 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="kc-card p-6 mb-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FF69B4, #FF8C69)' }}>
          <ChildAvatar size={72} />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{child.name}</h1>
            <p className="text-white/80 font-semibold text-sm mt-0.5">
              Gruppe {child.group_name} · {getAge(child.birth_date)}
            </p>
            <p className="text-white/70 text-xs font-semibold mt-1">Erzieher/in: {child.teacher}</p>
          </div>
        </div>

        {/* Opt-in awareness toggle */}
        <div className="kc-card p-4 mb-5 flex items-center justify-between gap-4" style={{ background: awarenessOn ? 'linear-gradient(135deg, #F0F4FF, #EDE8FF)' : 'white' }}>
          <div>
            <p className="font-black text-gray-800 text-sm">🌍 Weltweite Entwicklungsperspektive</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              {awarenessOn
                ? 'Eingeschaltet — Sie sehen Einblicke aus den weltbesten Bildungssystemen'
                : 'Optional: Erfahren Sie, was Entwicklungsexperten weltweit dazu sagen'}
            </p>
          </div>
          <button
            onClick={() => setAwarenessOn(!awarenessOn)}
            className={`relative flex-shrink-0 transition-colors duration-200 rounded-full ${awarenessOn ? 'bg-purple-600' : 'bg-gray-300'}`}
            style={{ width: 52, height: 28 }}
          >
            <span
              className="absolute bg-white rounded-full shadow-md transition-transform duration-200"
              style={{ width: 22, height: 22, top: 3, left: 3, transform: awarenessOn ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>
        </div>

        {/* Observations */}
        <div className="kc-card overflow-hidden mb-5">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">👁️</span>
            <h2 className="font-black text-gray-800">Beobachtungen der Erzieherin</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {observations.map(o => (
              <div key={o.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{o.category}</span>
                  <span className="text-xs text-gray-400 font-semibold">{o.date}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{o.text}</p>

                {/* Layer 3: awareness */}
                {awarenessOn && (
                  <div className="mt-3 rounded-xl px-4 py-3 border-2 border-purple-100 bg-purple-50">
                    <p className="text-xs font-black text-purple-700 mb-1">🌍 Entwicklungsperspektive</p>
                    <p className="text-xs text-purple-600 leading-relaxed">{o.awareness}</p>
                  </div>
                )}

                {/* Ask teacher button */}
                {askOpen === o.id ? (
                  askSent ? (
                    <div className="mt-3 text-center py-2">
                      <p className="text-sm font-black text-teal-600">✅ Nachricht gesendet!</p>
                    </div>
                  ) : (
                    <form onSubmit={sendAsk} className="mt-3 space-y-2">
                      <textarea
                        rows={2}
                        value={askText}
                        onChange={e => setAskText(e.target.value)}
                        placeholder="Ihre Frage an die Erzieherin…"
                        className="kc-input w-full px-3 py-2 text-sm resize-none"
                        required
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="kc-btn bg-teal-600 text-white text-xs font-black px-4 py-2">
                          📤 Senden
                        </button>
                        <button type="button" onClick={() => setAskOpen(null)} className="kc-btn bg-gray-100 text-gray-600 text-xs font-black px-4 py-2">
                          Abbrechen
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <button
                    onClick={() => setAskOpen(o.id)}
                    className="mt-2 text-xs text-teal-600 font-bold hover:underline"
                  >
                    💬 Erzieherin dazu fragen
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Stories */}
        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="font-black text-gray-800">Lerngeschichten</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {stories.map(s => (
              <div key={s.id} className="px-5 py-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-black text-gray-800">{s.title}</p>
                  <span className="text-xs text-gray-400 font-semibold flex-shrink-0 ml-2">{s.date}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>

                {awarenessOn && (
                  <div className="mt-3 rounded-xl px-4 py-3 border-2 border-purple-100 bg-purple-50">
                    <p className="text-xs font-black text-purple-700 mb-1">🌍 Was bedeutet das für Zuhause?</p>
                    <p className="text-xs text-purple-600 leading-relaxed">{s.awareness}</p>
                  </div>
                )}

                {askOpen === s.id ? (
                  askSent ? (
                    <div className="mt-3 text-center py-2">
                      <p className="text-sm font-black text-teal-600">✅ Nachricht gesendet!</p>
                    </div>
                  ) : (
                    <form onSubmit={sendAsk} className="mt-3 space-y-2">
                      <textarea
                        rows={2}
                        value={askText}
                        onChange={e => setAskText(e.target.value)}
                        placeholder="Ihre Frage zur Lerngeschichte…"
                        className="kc-input w-full px-3 py-2 text-sm resize-none"
                        required
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="kc-btn bg-teal-600 text-white text-xs font-black px-4 py-2">📤 Senden</button>
                        <button type="button" onClick={() => setAskOpen(null)} className="kc-btn bg-gray-100 text-gray-600 text-xs font-black px-4 py-2">Abbrechen</button>
                      </div>
                    </form>
                  )
                ) : (
                  <button onClick={() => setAskOpen(s.id)} className="mt-2 text-xs text-teal-600 font-bold hover:underline">
                    💬 Erzieherin dazu fragen
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
