'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

// ── Developmental benchmarks: Layer 1 (German) + Layer 2 (global insight) ──
const benchmarks: Record<string, {
  de: string        // German Bildungsplan description for age 4-5
  global: string    // Global framework insight
  framework: string // Which framework
  indicators: string[]
}> = {
  sozial: {
    de: 'Kind kann Konflikte verbal lösen, zeigt Empathie und spielt kooperativ in Gruppen.',
    global: 'Te Whāriki (NZ): "Belonging & Contribution" — the child feels secure enough to take social risks and include others. Reggio: social relationships are the engine of all learning.',
    framework: 'Te Whāriki · Reggio Emilia',
    indicators: ['Teilt Spielmaterial spontan', 'Tröstet andere Kinder', 'Schlägt Lösungen bei Konflikten vor', 'Nimmt Rücksicht auf Gefühle anderer'],
  },
  sprache: {
    de: 'Kind erzählt zusammenhängende Geschichten, stellt Warum-Fragen, kennt ca. 5.000 Wörter.',
    global: 'HighScope: "Language & Literacy" — child initiates conversations about ideas and events. Finnish ECEC: multilingualism is seen as a cognitive superpower, never a deficit.',
    framework: 'HighScope · Finnish ECEC',
    indicators: ['Erzählt Erlebnisse mit Anfang & Ende', 'Stellt komplexe Warum-Fragen', 'Versteht Humor und Ironie', 'Interessiert sich für Buchstaben'],
  },
  kreativitaet: {
    de: 'Kind drückt sich durch verschiedene Medien aus (Malen, Musik, Bewegung, Sprache) und entwickelt eigene Ideen.',
    global: 'Reggio Emilia: children speak "100 languages" — every form of expression (clay, movement, paint, story) is an equally valid way of knowing the world. Montessori: the creative impulse peaks between 3-6.',
    framework: 'Reggio Emilia · Montessori',
    indicators: ['Entwickelt eigene Bildideen ohne Vorlage', 'Kombiniert verschiedene Materialien', 'Erzählt Geschichten zu eigenen Werken', 'Experimentiert mit Farben & Formen'],
  },
  motorik: {
    de: 'Kind balanciert auf einem Bein, fährt Dreirad, hält Stift mit Dreipunktgriff, schneidet mit Schere.',
    global: 'Scandinavian Forest Kindergarten: gross motor development through unstructured outdoor play is foundational — risk-taking in movement builds confidence and spatial intelligence.',
    framework: 'Skovbørnehave (DK/SE)',
    indicators: ['Balanciert auf einem Bein (5 Sek.)', 'Hält Stift korrekt', 'Schneidet entlang einer Linie', 'Klettert sicher & einschätzt Risiken'],
  },
  mathematik: {
    de: 'Kind zählt bis 20, versteht Mengen, erkennt einfache geometrische Formen, sortiert nach Merkmalen.',
    global: 'HighScope: spatial reasoning and mathematical thinking emerge through block play, pattern recognition, and real-world problem-solving — not worksheets. Heckman: mathematical thinking at 5 is one of the strongest predictors of adult outcomes.',
    framework: 'HighScope · Heckman Research',
    indicators: ['Zählt bis 20 ohne Fehler', 'Versteht "mehr" und "weniger"', 'Erkennt Muster & setzt sie fort', 'Sortiert nach Farbe, Form & Größe'],
  },
  selbstaendigkeit: {
    de: 'Kind trifft einfache Entscheidungen, trägt Verantwortung für eigene Sachen, beginnt Aufgaben selbst.',
    global: 'Montessori: "Help me do it myself" — autonomy at this age is not indulgence, it is developmental necessity. Finnish ECEC: children plan their own activities for significant portions of the day.',
    framework: 'Montessori · Finnish ECEC',
    indicators: ['Zieht sich selbst an & aus', 'Räumt ohne Aufforderung auf', 'Wählt selbst Aktivitäten', 'Bittet um Hilfe wenn nötig (nicht sofort)'],
  },
}

const categoryLabel: Record<string, string> = {
  sprache: '🗣️ Sprache', motorik: '🏃 Motorik', sozial: '🤝 Sozial',
  kreativitaet: '🎨 Kreativität', mathematik: '🔢 Mathe & Natur', selbstaendigkeit: '⭐ Selbständigkeit',
}

const CATEGORIES = Object.entries(categoryLabel).map(([key, label]) => ({ key, label }))

const childData: Record<string, {
  name: string; birth_date: string; group_name: string; gender: string;
  strengths: string[]; focus: string; mood: string;
  observations: { id: string; category: string; text: string; date: string; photo?: string }[];
  stories: { id: string; title: string; status: string; date: string }[];
}> = {
  '1': {
    name: 'Emma Müller', birth_date: '2020-03-15', group_name: 'Schmetterlinge', gender: 'f',
    strengths: ['Sozialverhalten', 'Empathie', 'Teamarbeit'],
    focus: 'Emma zeigt außergewöhnlich starkes Mitgefühl für andere Kinder. Sie übernimmt oft eine vermittelnde Rolle in der Gruppe und löst Konflikte mit Worten, nicht mit Macht.',
    mood: '😊',
    observations: [
      { id: 'o1', category: 'sozial', text: 'Hat beim Bauen im Sandkasten anderen Kindern spontan geholfen und Ideen eingebracht.', date: '18.05.2026' },
      { id: 'o2', category: 'sprache', text: 'Beschreibt Gefühle anderer Kinder mit bemerkenswert präzisen Wörtern.', date: '14.05.2026' },
      { id: 'o3', category: 'selbstaendigkeit', text: 'Räumt ihren Platz eigenständig auf und erinnert andere freundlich daran.', date: '10.05.2026' },
    ],
    stories: [{ id: 's1', title: 'Emma entdeckt die Welt der Insekten', status: 'published', date: '16.05.2026' }],
  },
  '2': {
    name: 'Luca Becker', birth_date: '2019-11-22', group_name: 'Schmetterlinge', gender: 'm',
    strengths: ['Konstruktives Denken', 'Ausdauer', 'Räumliches Vorstellungsvermögen'],
    focus: 'Luca plant und baut dreidimensionale Konstruktionen mit einer Präzision, die weit über sein Alter hinausgeht. Sein analytisches Denken kombiniert er mit echter Ausdauer.',
    mood: '🤔',
    observations: [
      { id: 'o1', category: 'mathematik', text: 'Hat eine komplexe Brücke aus Bauklötzen gebaut und dabei Gewicht & Balance experimentell erforscht.', date: '17.05.2026' },
      { id: 'o2', category: 'sprache', text: 'Stellt beim Vorlesen gezielte Warum-Fragen und merkt sich Zusammenhänge über mehrere Tage.', date: '13.05.2026' },
      { id: 'o3', category: 'motorik', text: 'Koordiniert Feinmotorik beim Basteln mit Schere sehr präzise für sein Alter.', date: '09.05.2026' },
    ],
    stories: [{ id: 's1', title: 'Luca baut seine erste Brücke', status: 'review', date: '17.05.2026' }],
  },
  '3': {
    name: 'Mia Fischer', birth_date: '2020-07-08', group_name: 'Schmetterlinge', gender: 'f',
    strengths: ['Kreativität', 'Farbgefühl', 'Fantasie'],
    focus: 'Mia hat eine außergewöhnliche Verbindung zur bildenden Kunst. Sie mischt Farben intuitiv und erzählt zu jedem Bild eine vollständige Geschichte — Reggio Emilia würde sagen, sie spricht ihre "hundertste Sprache" durch Farbe.',
    mood: '🎨',
    observations: [
      { id: 'o1', category: 'kreativitaet', text: 'Hat eigenständig Wasserfarben gemischt und dabei Komplementärfarben entdeckt.', date: '18.05.2026' },
      { id: 'o2', category: 'sprache', text: 'Erzählt detailreiche Geschichten zu ihren Bildern mit Anfang, Mitte und Ende.', date: '12.05.2026' },
    ],
    stories: [{ id: 's1', title: 'Mias Kunstwerk — Farben der Welt', status: 'draft', date: '18.05.2026' }],
  },
  '4': {
    name: 'Noah Klein', birth_date: '2019-09-14', group_name: 'Schmetterlinge', gender: 'm',
    strengths: ['Bewegungsfreude', 'Ausdauer', 'Naturbegeisterung'],
    focus: 'Noah ist ein geborener Entdecker der Natur. Er verbringt jede freie Minute im Außenbereich, beobachtet Tiere und Pflanzen mit großer Konzentration und erklärt seine Entdeckungen anderen Kindern.',
    mood: '🌿',
    observations: [
      { id: 'o1', category: 'motorik', text: 'Zeigt ausgezeichnete Grobmotorik beim Klettern und Balancieren — schätzt Risiken sicher ein.', date: '16.05.2026' },
      { id: 'o2', category: 'mathematik', text: 'Hat Regenwürmer beobachtet, gezählt und mit eigenen Worten ihre Bewegung erklärt.', date: '11.05.2026' },
    ],
    stories: [],
  },
  '5': {
    name: 'Lea Wagner', birth_date: '2020-01-30', group_name: 'Bienen', gender: 'f',
    strengths: ['Musikalität', 'Rhythmusgefühl', 'Ausdrucksstärke'],
    focus: 'Lea verbindet Musik und Bewegung mit einer natürlichen Leichtigkeit. Sie lernt Lieder nach einmaligem Hören und setzt Rhythmen sofort körperlich um — ein starkes Zeichen für auditive Intelligenz.',
    mood: '🎵',
    observations: [
      { id: 'o1', category: 'kreativitaet', text: 'Hat beim Morgenkreis spontan ein eigenes Lied gesungen und andere zum Mitmachen animiert.', date: '15.05.2026' },
      { id: 'o2', category: 'sozial', text: 'Organisiert Tanzspiele in der Freispielzeit und bezieht schüchterne Kinder aktiv ein.', date: '08.05.2026' },
    ],
    stories: [],
  },
  '6': {
    name: 'Ben Schulz', birth_date: '2019-12-05', group_name: 'Bienen', gender: 'm',
    strengths: ['Sprachgewandtheit', 'Geschichtenerzählen', 'Merkfähigkeit'],
    focus: 'Ben hat einen außergewöhnlich großen Wortschatz für sein Alter. Er erfindet Geschichten mit vollständiger Dramaturgie und hilft anderen Kindern intuitiv dabei, sich sprachlich auszudrücken.',
    mood: '📚',
    observations: [
      { id: 'o1', category: 'sprache', text: 'Hat der Gruppe eine fünfminütige Geschichte über einen Drachen erzählt — mit Dialogen, Spannungsbogen und Auflösung.', date: '17.05.2026' },
      { id: 'o2', category: 'selbstaendigkeit', text: 'Hilft jüngeren Kindern beim Bücheranschauen und erklärt Bilder geduldig mit eigenen Worten.', date: '14.05.2026' },
    ],
    stories: [],
  },
}

function ChildAvatar({ gender, size = 56 }: { gender: string; size?: number }) {
  const s = size
  if (gender === 'f') {
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
  return (
    <svg width={s} height={s} viewBox="0 0 56 56" fill="none">
      <ellipse cx="28" cy="44" rx="14" ry="9" fill="#7EC8E3"/>
      <circle cx="28" cy="26" r="14" fill="#FFCF8B"/>
      <ellipse cx="28" cy="15" rx="13" ry="7" fill="#7B4F2E"/>
      <ellipse cx="15" cy="20" rx="4" ry="5" fill="#7B4F2E"/>
      <ellipse cx="41" cy="20" rx="4" ry="5" fill="#7B4F2E"/>
      <circle cx="23" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="33" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="24" cy="26" r="0.8" fill="white"/>
      <circle cx="34" cy="26" r="0.8" fill="white"/>
      <ellipse cx="20" cy="31" rx="3" ry="2" fill="#FFCBA4" opacity="0.7"/>
      <ellipse cx="36" cy="31" rx="3" ry="2" fill="#FFCBA4" opacity="0.7"/>
      <path d="M23 33 Q28 37 33 33" stroke="#7B4F2E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function getAge(birthDate: string) {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  const totalMonths = years * 12 + months
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return { years: y, months: m, label: `${y} Jahre${m > 0 ? `, ${m} Monate` : ''}` }
}

const statusLabel: Record<string, string> = { published: '✅ Veröffentlicht', review: '🔍 Überprüfung', draft: '✏️ Entwurf' }
const statusColor: Record<string, string> = { published: 'bg-teal-100 text-teal-700', review: 'bg-yellow-100 text-yellow-700', draft: 'bg-gray-100 text-gray-500' }

export default function ChildDetailPage({ params }: { params: { id: string } }) {
  const child = childData[params.id]
  const [activeTab, setActiveTab] = useState<'overview' | 'observe' | 'story'>('overview')
  const [obsCategory, setObsCategory] = useState('')
  const [obsSituation, setObsSituation] = useState('')
  const [obsLoading, setObsLoading] = useState(false)
  const [obsSaved, setObsSaved] = useState(false)
  const [storyTitle, setStoryTitle] = useState('')
  const [storyText, setStoryText] = useState('')
  const [storySaved, setStorySaved] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  if (!child) return <div className="p-8 text-center text-gray-400">Kind nicht gefunden.</div>

  const age = getAge(child.birth_date)
  const bgHero = child.gender === 'f'
    ? 'linear-gradient(135deg, #FF69B4, #FF8C69)'
    : 'linear-gradient(135deg, #4FACFE, #00C6FF)'
  const bgCard = child.gender === 'f' ? '#FFF0F5' : '#EEF6FF'
  const activeBenchmark = benchmarks[obsCategory]

  async function saveObservation(e: React.FormEvent) {
    e.preventDefault()
    setObsLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setObsLoading(false)
    setObsSaved(true)
    setTimeout(() => { setObsSaved(false); setObsCategory(''); setObsSituation(''); setPhotoPreview(null) }, 2500)
  }

  async function saveStory(e: React.FormEvent) {
    e.preventDefault()
    setStorySaved(true)
    setTimeout(() => { setStorySaved(false); setStoryTitle(''); setStoryText('') }, 2500)
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <Link href="/teacher/children" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">
          ← Alle Kinder
        </Link>

        {/* Hero */}
        <div className="kc-card p-6 mb-5 flex items-center gap-5" style={{ background: bgHero }}>
          <ChildAvatar gender={child.gender} size={72} />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{child.name}</h1>
            <p className="text-white/80 font-semibold text-sm mt-0.5">
              Gruppe {child.group_name} · {age.label} · Geb. {new Date(child.birth_date).toLocaleDateString('de-DE')}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {child.strengths.map(s => (
                <span key={s} className="text-xs font-bold bg-white/25 text-white px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div className="text-4xl flex-shrink-0">{child.mood}</div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {([
            { key: 'overview', label: '📋 Übersicht' },
            { key: 'observe',  label: '👁️ Beobachtung erfassen' },
            { key: 'story',    label: '📖 Geschichte schreiben' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`kc-btn px-4 py-2.5 text-sm font-black transition-colors flex-1 ${
                activeTab === tab.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-teal-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <>
            {/* Development focus */}
            <div className="kc-card p-5 mb-4" style={{ background: bgCard }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔍</span>
                <h2 className="font-black text-gray-800">Entwicklungsprofil</h2>
                <span className="ml-auto text-xs text-gray-400 font-semibold">Alter: {age.label}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{child.focus}</p>
            </div>

            {/* Observations */}
            <div className="kc-card overflow-hidden mb-4">
              <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <h2 className="font-black text-gray-800">Beobachtungen</h2>
                <span className="ml-auto text-xs text-gray-400 font-semibold">{child.observations.length} gesamt</span>
              </div>
              <div className="divide-y-2 divide-[#F5F0E8]">
                {child.observations.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-gray-400 font-semibold text-sm">Noch keine Beobachtungen</p>
                  </div>
                ) : child.observations.map(o => (
                  <div key={o.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{categoryLabel[o.category] ?? o.category}</span>
                      <span className="text-xs text-gray-400 font-semibold">{o.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{o.text}</p>
                    <button
                      onClick={() => setActiveTab('observe')}
                      className="mt-2 text-xs text-teal-600 font-bold hover:underline"
                    >
                      + Neue Beobachtung dazu erfassen
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stories */}
            <div className="kc-card overflow-hidden">
              <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h2 className="font-black text-gray-800">Lerngeschichten</h2>
              </div>
              <div className="divide-y-2 divide-[#F5F0E8]">
                {child.stories.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-gray-400 font-semibold text-sm mb-2">Noch keine Lerngeschichten</p>
                    <button onClick={() => setActiveTab('story')} className="text-teal-600 text-sm font-bold hover:underline">
                      Jetzt eine schreiben →
                    </button>
                  </div>
                ) : child.stories.map(s => (
                  <div key={s.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">{s.date}</p>
                    </div>
                    <span className={`kc-badge text-xs ${statusColor[s.status]}`}>{statusLabel[s.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── TAB: NEW OBSERVATION ── */}
        {activeTab === 'observe' && (
          <div className="kc-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">👁️</span>
              <h2 className="font-black text-gray-800">Neue Beobachtung — {child.name}</h2>
            </div>

            {obsSaved ? (
              <div className="py-8 text-center">
                <p className="text-5xl mb-3">✅</p>
                <p className="font-black text-teal-700 text-lg">Beobachtung gespeichert!</p>
              </div>
            ) : (
              <form onSubmit={saveObservation} className="space-y-5">

                {/* Category */}
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">Bildungsbereich (Bildungsplan)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setObsCategory(c.key)}
                        className={`kc-btn py-2.5 text-xs font-black transition-colors ${
                          obsCategory === c.key ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-teal-50'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer 2: Developmental context appears when category selected */}
                {activeBenchmark && (
                  <div className="rounded-2xl border-2 border-purple-200 overflow-hidden">
                    <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
                      <span className="text-sm">🌍</span>
                      <span className="text-xs font-black text-white">Weltweiter Entwicklungskontext · {age.label}</span>
                      <span className="ml-auto text-xs text-purple-200 font-semibold">{activeBenchmark.framework}</span>
                    </div>
                    <div className="p-4 bg-purple-50 space-y-3">
                      <div>
                        <p className="text-xs font-black text-gray-500 mb-1">📋 Bildungsplan (DE) — Typisch für {age.years}-Jährige:</p>
                        <p className="text-sm text-gray-700">{activeBenchmark.de}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-500 mb-1">🌍 Internationale Perspektive:</p>
                        <p className="text-sm text-gray-600 italic">{activeBenchmark.global}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-500 mb-1.5">✓ Beobachtungsindikatoren:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeBenchmark.indicators.map(ind => (
                            <span key={ind} className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">{ind}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Situation text */}
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">Situation / Beobachtung</label>
                  <textarea
                    required
                    rows={4}
                    value={obsSituation}
                    onChange={e => setObsSituation(e.target.value)}
                    placeholder="Was haben Sie beobachtet? Beschreiben Sie die Situation konkret…"
                    className="kc-input w-full px-4 py-3 text-sm resize-none"
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">Foto hinzufügen (optional)</label>
                  <label className="flex items-center gap-3 cursor-pointer kc-card p-4 hover:bg-teal-50 transition-colors border-dashed" style={{ borderStyle: 'dashed' }}>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                    {photoPreview ? (
                      <img src={photoPreview} alt="Vorschau" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">📷</span>
                      </div>
                    )}
                    <div>
                      <p className="font-black text-gray-700 text-sm">{photoPreview ? 'Foto ausgewählt' : 'Foto auswählen'}</p>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">JPG, PNG · max. 10 MB</p>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={obsLoading || !obsCategory || !obsSituation.trim()}
                  className="kc-btn w-full bg-teal-600 disabled:opacity-40 text-white font-black py-3.5 text-sm hover:bg-teal-700 transition-colors"
                >
                  {obsLoading ? '⏳ Wird gespeichert…' : '💾 Beobachtung speichern'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── TAB: NEW STORY ── */}
        {activeTab === 'story' && (
          <div className="kc-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">📖</span>
              <h2 className="font-black text-gray-800">Lerngeschichte — {child.name}</h2>
            </div>

            {storySaved ? (
              <div className="py-8 text-center">
                <p className="text-5xl mb-3">🎉</p>
                <p className="font-black text-teal-700 text-lg">Lerngeschichte gespeichert!</p>
                <p className="text-sm text-gray-500 mt-1">Sie liegt jetzt im Entwurfsmodus — die Leitung kann sie freigeben.</p>
              </div>
            ) : (
              <form onSubmit={saveStory} className="space-y-4">

                {/* Context from child */}
                <div className="rounded-2xl p-4 text-sm" style={{ background: bgCard }}>
                  <p className="font-black text-gray-700 mb-1">Entwicklungsprofil als Ausgangspunkt:</p>
                  <p className="text-gray-600 leading-relaxed text-xs">{child.focus}</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">Titel der Lerngeschichte</label>
                  <input
                    type="text"
                    required
                    value={storyTitle}
                    onChange={e => setStoryTitle(e.target.value)}
                    placeholder={`z.B. "${child.name.split(' ')[0]} und die große Entdeckung"`}
                    className="kc-input w-full px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">Geschichte</label>
                  <textarea
                    required
                    rows={8}
                    value={storyText}
                    onChange={e => setStoryText(e.target.value)}
                    placeholder={`Beschreiben Sie ${child.name.split(' ')[0]}s Lernerlebnis in eigenen Worten. Was hat sie/er getan? Was hat Sie überrascht? Was hat das über ihre/seine Entwicklung gezeigt?`}
                    className="kc-input w-full px-4 py-3 text-sm resize-none"
                  />
                </div>

                {/* Tip */}
                <div className="rounded-2xl px-4 py-3 bg-purple-50 border-2 border-purple-100">
                  <p className="text-xs font-black text-purple-700 mb-1">💡 Tipp — Was macht eine gute Lerngeschichte?</p>
                  <p className="text-xs text-purple-600 leading-relaxed">
                    Beschreiben Sie eine konkrete Situation. Zeigen Sie, was das Kind <em>getan</em> hat — nicht nur was es "kann".
                    Reggio Emilia: jede Geschichte ist ein Fenster in die hundert Sprachen des Kindes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!storyTitle.trim() || !storyText.trim()}
                  className="kc-btn w-full bg-teal-600 disabled:opacity-40 text-white font-black py-3.5 text-sm hover:bg-teal-700 transition-colors"
                >
                  💾 Als Entwurf speichern
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
