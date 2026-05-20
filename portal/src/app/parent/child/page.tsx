'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/client'
import { useProfileSettings } from '@/lib/useProfileSettings'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Profile } from '@/types'

type ChildData = { id: string; name: string; birth_date: string; group_name: string; gender: string }
type ObsData = { id: string; category: string; situation: string; created_at: string }
type StoryData = { id: string; title: string; final_text: string | null; created_at: string }

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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [child, setChild] = useState<ChildData | null>(null)
  const [observations, setObservations] = useState<ObsData[]>([])
  const [stories, setStories] = useState<StoryData[]>([])
  const [awarenessOn, setAwarenessOn] = useState(false)
  const [askOpen, setAskOpen] = useState<string | null>(null)
  const [askText, setAskText] = useState('')
  const [askSent, setAskSent] = useState(false)

  const { settings } = useProfileSettings(profile?.id ?? 'guest')
  const { tr } = useTranslation(settings.lang)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as Profile)

      const { data: childData } = await supabase.from('children').select('id, name, birth_date, group_name, gender').eq('parent_id', user.id).single()
      if (!childData) return
      setChild(childData as ChildData)

      const [{ data: obsData }, { data: storyData }] = await Promise.all([
        supabase.from('observations').select('id, category, situation, created_at').eq('child_id', childData.id).order('created_at', { ascending: false }),
        supabase.from('learning_stories').select('id, title, final_text, created_at').eq('child_id', childData.id).eq('status', 'published').order('created_at', { ascending: false }),
      ])
      if (obsData) setObservations(obsData as ObsData[])
      if (storyData) setStories(storyData as StoryData[])
    }
    load()
  }, [])

  async function sendAsk(e: React.FormEvent) {
    e.preventDefault()
    if (!child) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('tickets').insert({ parent_id: user.id, child_id: child.id, subject: askText.slice(0, 80), status: 'open' })
    setAskSent(true)
    setTimeout(() => { setAskSent(false); setAskOpen(null); setAskText('') }, 2000)
  }

  if (!profile || !child) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={settings.lang} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="kc-card p-6 mb-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FF69B4, #FF8C69)' }}>
          <ChildAvatar size={72} />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{child.name}</h1>
            <p className="text-white/80 font-semibold text-sm mt-0.5">
              {child.group_name && `Gruppe ${child.group_name} · `}{getAge(child.birth_date)}
            </p>
          </div>
        </div>

        <div className="kc-card p-4 mb-5 flex items-center justify-between gap-4" style={{ background: awarenessOn ? 'linear-gradient(135deg, #F0F4FF, #EDE8FF)' : 'white' }}>
          <div>
            <p className="font-black text-gray-800 text-sm">{tr(t.childPage.globalToggle)}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              {awarenessOn ? tr(t.childPage.globalOn) : tr(t.childPage.globalOff)}
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

        <div className="kc-card overflow-hidden mb-5">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">👁️</span>
            <h2 className="font-black text-gray-800">{tr(t.childPage.observations)}</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {observations.map(o => (
              <div key={o.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{o.category}</span>
                  <span className="text-xs text-gray-400 font-semibold">{new Date(o.created_at).toLocaleDateString('de-DE')}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{o.situation}</p>

                {askOpen === o.id ? (
                  askSent ? (
                    <div className="mt-3 text-center py-2">
                      <p className="text-sm font-black text-teal-600">{tr(t.common.sent)}</p>
                    </div>
                  ) : (
                    <form onSubmit={sendAsk} className="mt-3 space-y-2">
                      <textarea
                        rows={2}
                        value={askText}
                        onChange={e => setAskText(e.target.value)}
                        placeholder={tr(t.childPage.questionPlaceholder)}
                        className="kc-input w-full px-3 py-2 text-sm resize-none"
                        required
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="kc-btn bg-teal-600 text-white text-xs font-black px-4 py-2">
                          {tr(t.common.send)}
                        </button>
                        <button type="button" onClick={() => setAskOpen(null)} className="kc-btn bg-gray-100 text-gray-600 text-xs font-black px-4 py-2">
                          {tr(t.common.cancel)}
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <button
                    onClick={() => setAskOpen(o.id)}
                    className="mt-2 text-xs text-teal-600 font-bold hover:underline"
                  >
                    {tr(t.childPage.askTeacher)}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="font-black text-gray-800">{tr(t.childPage.learningStories)}</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {stories.map(s => (
              <div key={s.id} className="px-5 py-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-black text-gray-800">{s.title}</p>
                  <span className="text-xs text-gray-400 font-semibold flex-shrink-0 ml-2">{new Date(s.created_at).toLocaleDateString('de-DE')}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.final_text ?? ''}</p>

                {askOpen === s.id ? (
                  askSent ? (
                    <div className="mt-3 text-center py-2">
                      <p className="text-sm font-black text-teal-600">{tr(t.common.sent)}</p>
                    </div>
                  ) : (
                    <form onSubmit={sendAsk} className="mt-3 space-y-2">
                      <textarea
                        rows={2}
                        value={askText}
                        onChange={e => setAskText(e.target.value)}
                        placeholder={tr(t.childPage.storyQuestion)}
                        className="kc-input w-full px-3 py-2 text-sm resize-none"
                        required
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="kc-btn bg-teal-600 text-white text-xs font-black px-4 py-2">{tr(t.common.send)}</button>
                        <button type="button" onClick={() => setAskOpen(null)} className="kc-btn bg-gray-100 text-gray-600 text-xs font-black px-4 py-2">{tr(t.common.cancel)}</button>
                      </div>
                    </form>
                  )
                ) : (
                  <button onClick={() => setAskOpen(s.id)} className="mt-2 text-xs text-teal-600 font-bold hover:underline">
                    {tr(t.childPage.askTeacher)}
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
