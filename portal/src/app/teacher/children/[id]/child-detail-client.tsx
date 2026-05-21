'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

type Child = {
  id: string; name: string; birth_date: string; group_name: string
  gender: string; allergies?: string | null; dietary_notes?: string | null
}
type Observation = { id: string; category: string; text: string; created_at: string }
type Story = { id: string; title: string; status: string; created_at: string }

const CATEGORIES = [
  { key: 'sprache', labelKey: 'language' as const },
  { key: 'motorik', labelKey: 'motor' as const },
  { key: 'sozial', labelKey: 'social' as const },
  { key: 'kreativitaet', labelKey: 'creative' as const },
  { key: 'mathematik', labelKey: 'mathNature' as const },
  { key: 'selbstaendigkeit', labelKey: 'independence' as const },
]

const STATUS_COLOR: Record<string, string> = {
  published: 'bg-teal-100 text-teal-700',
  review: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-500',
}

function getAge(birthDate: string) {
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return `${y} Jahre${m > 0 ? `, ${m} Monate` : ''}`
}

function ChildAvatar({ gender, size = 64 }: { gender: string; size?: number }) {
  const s = size
  if (gender === 'f') return (
    <svg width={s} height={s} viewBox="0 0 56 56" fill="none">
      <ellipse cx="28" cy="44" rx="14" ry="9" fill="#FF9FB2"/>
      <circle cx="28" cy="26" r="14" fill="#FFCF8B"/>
      <ellipse cx="28" cy="16" rx="14" ry="8" fill="#C0761A"/>
      <ellipse cx="14" cy="22" rx="4" ry="6" fill="#C0761A"/>
      <ellipse cx="42" cy="22" rx="4" ry="6" fill="#C0761A"/>
      <circle cx="23" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="33" cy="27" r="2.5" fill="#3D2B1F"/>
      <circle cx="24" cy="26" r="0.8" fill="white"/>
      <circle cx="34" cy="26" r="0.8" fill="white"/>
      <ellipse cx="20" cy="31" rx="3" ry="2" fill="#FFB3C6" opacity="0.7"/>
      <ellipse cx="36" cy="31" rx="3" ry="2" fill="#FFB3C6" opacity="0.7"/>
      <path d="M23 33 Q28 37 33 33" stroke="#C0761A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
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
      <path d="M23 33 Q28 37 33 33" stroke="#7B4F2E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export default function ChildDetailClient({
  child, observations: initialObs, stories: initialStories, teacherId, lang,
}: {
  child: Child
  observations: Observation[]
  stories: Story[]
  teacherId: string
  lang: Lang
}) {
  const { tr } = useTranslation(lang)
  const [activeTab, setActiveTab] = useState<'overview' | 'observe' | 'story'>('overview')
  const [observations, setObservations] = useState(initialObs)
  const [stories, setStories] = useState(initialStories)

  // Observation form
  const [obsCategory, setObsCategory] = useState('')
  const [obsText, setObsText] = useState('')
  const [obsLoading, setObsLoading] = useState(false)
  const [obsSaved, setObsSaved] = useState(false)
  const [obsError, setObsError] = useState('')

  // Story form
  const [storyTitle, setStoryTitle] = useState('')
  const [storyText, setStoryText] = useState('')
  const [storyLoading, setStoryLoading] = useState(false)
  const [storySaved, setStorySaved] = useState(false)
  const [storyError, setStoryError] = useState('')

  const categories = CATEGORIES.map(c => ({ key: c.key, label: tr(t.obsCategories[c.labelKey]) }))
  const categoryLabel = Object.fromEntries(categories.map(c => [c.key, c.label]))

  const bgHero = child.gender === 'f'
    ? 'linear-gradient(135deg, #FF69B4, #FF8C69)'
    : 'linear-gradient(135deg, #2a9d8f, #457b9d)'
  const bgCard = child.gender === 'f' ? '#FFF0F5' : '#EEF6FF'

  async function saveObservation(e: React.FormEvent) {
    e.preventDefault()
    setObsLoading(true)
    setObsError('')
    const supabase = createClient()
    const { data, error } = await supabase.from('observations').insert({
      child_id: child.id,
      teacher_id: teacherId,
      category: obsCategory,
      text: obsText.trim(),
    }).select('id, category, text, created_at').single()
    setObsLoading(false)
    if (error) { setObsError(error.message); return }
    setObservations(prev => [data, ...prev])
    setObsSaved(true)
    setTimeout(() => { setObsSaved(false); setObsCategory(''); setObsText(''); setActiveTab('overview') }, 1500)
  }

  async function saveStory(e: React.FormEvent) {
    e.preventDefault()
    setStoryLoading(true)
    setStoryError('')
    const supabase = createClient()
    const { data, error } = await supabase.from('learning_stories').insert({
      child_id: child.id,
      teacher_id: teacherId,
      title: storyTitle.trim(),
      final_text: storyText.trim(),
      status: 'draft',
    }).select('id, title, status, created_at').single()
    setStoryLoading(false)
    if (error) { setStoryError(error.message); return }
    setStories(prev => [data, ...prev])
    setStorySaved(true)
    setTimeout(() => { setStorySaved(false); setStoryTitle(''); setStoryText(''); setActiveTab('overview') }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/teacher/children" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">
        ← {tr(t.common.back)}
      </Link>

      {/* Hero */}
      <div className="kc-card p-6 mb-5 flex items-center gap-5" style={{ background: bgHero }}>
        <ChildAvatar gender={child.gender} size={72} />
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">{child.name}</h1>
          <p className="text-white/80 font-semibold text-sm mt-0.5">
            {child.group_name} · {getAge(child.birth_date)} · {new Date(child.birth_date).toLocaleDateString('de-DE')}
          </p>
          {child.allergies && (
            <span className="mt-2 inline-block text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">
              ⚠️ {child.allergies}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([
          { key: 'overview', label: tr(t.teacherChild.tabOverview) },
          { key: 'observe', label: tr(t.teacherChild.tabObserve) },
          { key: 'story', label: tr(t.teacherChild.tabStory) },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="kc-btn px-4 py-2.5 text-sm font-black transition-colors flex-1"
            style={activeTab === tab.key ? { background: '#2a9d8f', color: '#fff' } : { background: '#fff', color: '#4b5563' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Info card */}
          <div className="kc-card p-5 mb-4" style={{ background: bgCard }}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-gray-400 font-bold block">Geburtsdatum</span>{new Date(child.birth_date).toLocaleDateString('de-DE')}</div>
              <div><span className="text-xs text-gray-400 font-bold block">Gruppe</span>{child.group_name}</div>
              {child.allergies && <div className="col-span-2"><span className="text-xs text-gray-400 font-bold block">Allergien</span><span className="text-red-600">{child.allergies}</span></div>}
              {child.dietary_notes && <div className="col-span-2"><span className="text-xs text-gray-400 font-bold block">Ernährung</span>{child.dietary_notes}</div>}
            </div>
          </div>

          {/* Observations */}
          <div className="kc-card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
              <span className="text-xl">👁️</span>
              <h2 className="font-black text-gray-800">{tr(t.teacherChild.observationsSection)}</h2>
              <span className="ml-auto text-xs text-gray-400 font-semibold">{observations.length}</span>
            </div>
            {observations.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 font-semibold text-sm mb-2">{tr(t.teacherChild.noObservations)}</p>
                <button onClick={() => setActiveTab('observe')} className="text-teal-600 text-sm font-bold hover:underline">
                  {tr(t.teacherChild.addObservation)}
                </button>
              </div>
            ) : (
              <div className="divide-y-2 divide-[#F5F0E8]">
                {observations.map(o => (
                  <div key={o.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{categoryLabel[o.category] ?? o.category}</span>
                      <span className="text-xs text-gray-400 font-semibold">{new Date(o.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{o.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stories */}
          <div className="kc-card overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h2 className="font-black text-gray-800">{tr(t.teacherChild.storiesSection)}</h2>
            </div>
            {stories.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 font-semibold text-sm mb-2">{tr(t.teacherChild.noStories)}</p>
                <button onClick={() => setActiveTab('story')} className="text-teal-600 text-sm font-bold hover:underline">
                  {tr(t.teacherChild.writeStory)}
                </button>
              </div>
            ) : (
              <div className="divide-y-2 divide-[#F5F0E8]">
                {stories.map(s => (
                  <div key={s.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">{new Date(s.created_at).toLocaleDateString('de-DE')}</p>
                    </div>
                    <span className={`kc-badge text-xs ${STATUS_COLOR[s.status] ?? 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Observe Tab */}
      {activeTab === 'observe' && (
        <div className="kc-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">👁️</span>
            <h2 className="font-black text-gray-800">{tr(t.teacherChild.newObsHeading).replace('{name}', child.name)}</h2>
          </div>
          {obsSaved ? (
            <div className="py-8 text-center">
              <p className="text-5xl mb-3">✅</p>
              <p className="font-black text-teal-700 text-lg">{tr(t.teacherChild.obsSaved)}</p>
            </div>
          ) : (
            <form onSubmit={saveObservation} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-600 mb-2">{tr(t.teacherChild.eduArea)}</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(c => (
                    <button key={c.key} type="button" onClick={() => setObsCategory(c.key)}
                      className="kc-btn py-2.5 text-xs font-black transition-colors"
                      style={obsCategory === c.key ? { background: '#2a9d8f', color: '#fff' } : { background: '#fff', color: '#4b5563' }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">{tr(t.teacherChild.situationLabel)}</label>
                <textarea required rows={5} value={obsText} onChange={e => setObsText(e.target.value)}
                  placeholder={tr(t.teacherChild.situationPlaceholder)}
                  className="kc-input w-full px-4 py-3 text-sm resize-none" />
              </div>
              {obsError && <p className="text-sm text-red-600 font-semibold">⚠️ {obsError}</p>}
              <button type="submit" disabled={obsLoading || !obsCategory || !obsText.trim()}
                className="kc-btn w-full bg-teal-600 disabled:opacity-40 text-white font-black py-3.5 text-sm hover:bg-teal-700 transition-colors">
                {obsLoading ? tr(t.common.saving) : tr(t.teacherChild.saveObs)}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Story Tab */}
      {activeTab === 'story' && (
        <div className="kc-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">📖</span>
            <h2 className="font-black text-gray-800">{tr(t.teacherChild.storyHeading).replace('{name}', child.name)}</h2>
          </div>
          {storySaved ? (
            <div className="py-8 text-center">
              <p className="text-5xl mb-3">🎉</p>
              <p className="font-black text-teal-700 text-lg">{tr(t.teacherChild.storySaved)}</p>
              <p className="text-sm text-gray-500 mt-1">{tr(t.teacherChild.storyDraftInfo)}</p>
            </div>
          ) : (
            <form onSubmit={saveStory} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">{tr(t.teacherChild.storyTitleLabel)}</label>
                <input type="text" required value={storyTitle} onChange={e => setStoryTitle(e.target.value)}
                  placeholder={tr(t.teacherChild.storyTitlePlaceholder)}
                  className="kc-input w-full px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">{tr(t.teacherChild.storyTextLabel)}</label>
                <textarea required rows={8} value={storyText} onChange={e => setStoryText(e.target.value)}
                  placeholder={tr(t.teacherChild.storyTextPlaceholder)}
                  className="kc-input w-full px-4 py-3 text-sm resize-none" />
              </div>
              {storyError && <p className="text-sm text-red-600 font-semibold">⚠️ {storyError}</p>}
              <button type="submit" disabled={storyLoading || !storyTitle.trim() || !storyText.trim()}
                className="kc-btn w-full bg-teal-600 disabled:opacity-40 text-white font-black py-3.5 text-sm hover:bg-teal-700 transition-colors">
                {storyLoading ? tr(t.common.saving) : tr(t.teacherChild.saveStory)}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
