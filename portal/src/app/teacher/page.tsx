'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfileSettings } from '@/lib/useProfileSettings'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Profile } from '@/types'

const GROUP_EMOJI: Record<string, string> = { 'Schmetterlinge': '🦋', 'Bienen': '🐝', 'Sonnenkäfer': '🐞' }

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [children, setChildren] = useState<{ id: string; name: string; group_name: string }[]>([])
  const [observations, setObservations] = useState<{ id: string; category: string; text: string; child_id: string; created_at: string }[]>([])
  const [stories, setStories] = useState<{ id: string; title: string; status: string; child?: { name: string } }[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [openTickets, setOpenTickets] = useState(0)

  const { settings } = useProfileSettings(profile?.id ?? 'guest')
  const { tr } = useTranslation(settings.lang)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as Profile)

      const [{ data: childData }, { data: obsData }, { data: storyData }] = await Promise.all([
        supabase.from('children').select('id, name, group_name').order('name'),
        supabase.from('observations').select('id, category, text, child_id, created_at').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('learning_stories').select('id, title, status, child:children(name)').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])

      if (childData) {
        setChildren(childData)
        setGroups([...new Set(childData.map(c => c.group_name).filter(Boolean))])
      }
      if (obsData) setObservations(obsData)
      if (storyData) setStories(storyData.map(s => ({ ...s, child: Array.isArray(s.child) ? s.child[0] : s.child })))

      const ticketRes = await fetch('/api/teacher/tickets/count')
      if (ticketRes.ok) {
        const { count } = await ticketRes.json()
        setOpenTickets(count)
      }
    }
    load()
  }, [])

  const filteredChildren = selectedGroup === 'all' ? children : children.filter(c => c.group_name === selectedGroup)
  const filteredObs = selectedGroup === 'all' ? observations : observations.filter(o => {
    const child = children.find(c => c.id === o.child_id)
    return child?.group_name === selectedGroup
  })
  const filteredStories = stories

  const groupLabel = selectedGroup === 'all'
    ? `👥 ${tr(t.teacherDash.allGroups)}`
    : `${GROUP_EMOJI[selectedGroup] ?? '📍'} ${selectedGroup}`

  if (!profile) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={settings.lang} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="kc-card p-6 mb-6 flex items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="flex items-center gap-4">
            <div className="text-6xl flex-shrink-0">👩‍🏫</div>
            <div>
              <h1 className="text-2xl font-black text-white">{tr(t.parentDash.greeting).replace('{name}', profile.full_name.split(' ')[0])}</h1>
              <p className="text-teal-200 font-semibold text-sm mt-1">
                {selectedGroup === 'all' ? tr(t.teacherDash.allGroups) : `Gruppe ${selectedGroup}`} · {tr(t.teacherDash.childrenCount).replace('{n}', String(filteredChildren.length))}
              </p>
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-4 py-2.5 rounded-2xl transition-colors border-2 border-white/30"
            >
              <span>{groupLabel}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border-2 border-[#EDE8DF] overflow-hidden z-50 min-w-52">
                <button onClick={() => { setSelectedGroup('all'); setDropdownOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-colors hover:bg-teal-50 ${selectedGroup === 'all' ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}>
                  <span>👥</span><span>{tr(t.teacherDash.allGroups)}</span>
                  <span className="ml-auto text-xs text-gray-400 font-semibold">{children.length}</span>
                </button>
                <div className="border-t-2 border-[#F5F0E8]" />
                {groups.map(g => (
                  <button key={g} onClick={() => { setSelectedGroup(g); setDropdownOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-colors hover:bg-teal-50 ${selectedGroup === g ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}>
                    <span>{GROUP_EMOJI[g] ?? '📍'}</span><span>{g}</span>
                    <span className="ml-auto text-xs text-gray-400 font-semibold">{children.filter(c => c.group_name === g).length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { emoji: '👶', count: filteredChildren.length, label: tr(t.teacherDash.statChildren), color: '#E1F5EE', href: '/teacher/children' },
            { emoji: '👁️', count: filteredObs.length, label: tr(t.teacherDash.statObservations), color: '#FFF8E7', href: '/teacher/observations' },
            { emoji: '📖', count: filteredStories.length, label: tr(t.teacherDash.statStories), color: '#FFF0F5', href: '/teacher/stories' },
            { emoji: '💬', count: openTickets, label: 'Offene Anfragen', color: '#EEF6FF', href: '/teacher/tickets' },
          ].map(s => (
            <a key={s.label} href={s.href} className="kc-card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform" style={{ background: s.color }}>
              <span className="text-4xl">{s.emoji}</span>
              <span className="text-3xl font-black text-gray-800">{s.count}</span>
              <span className="text-xs font-bold text-gray-500 text-center">{s.label}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2"><span className="text-xl">👁️</span><h2 className="font-black text-gray-800">{tr(t.teacherDash.latestObservations)}</h2></div>
              <a href="/teacher/observations" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">{tr(t.common.all)} <ChevronRight size={14} /></a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {filteredObs.length === 0
                ? <p className="px-5 py-4 text-sm text-gray-400 font-semibold">{tr(t.teacherDash.noObservations)}</p>
                : filteredObs.map(o => (
                  <div key={o.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{o.category}</span>
                      <span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">{o.text}</p>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2"><span className="text-xl">📖</span><h2 className="font-black text-gray-800">{tr(t.teacherDash.latestStories)}</h2></div>
              <a href="/teacher/stories" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">{tr(t.common.all)} <ChevronRight size={14} /></a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {filteredStories.length === 0
                ? <p className="px-5 py-4 text-sm text-gray-400 font-semibold">{tr(t.teacherDash.noStories)}</p>
                : filteredStories.map(s => (
                  <a key={s.id} href={`/teacher/stories/${s.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                    <p className="text-sm font-bold text-gray-800">{s.title}</p>
                    <span className={`kc-badge text-xs flex-shrink-0 ml-2 ${s.status === 'published' ? 'bg-teal-100 text-teal-700' : s.status === 'review' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.status === 'published' ? tr(t.status.published) : s.status === 'review' ? tr(t.status.inReview) : tr(t.status.draft)}
                    </span>
                  </a>
                ))
              }
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <a href="/teacher/children" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#E1F5EE' }}>
            <span className="text-4xl">👶</span><div><p className="font-black text-gray-800">{tr(t.teacherDash.cardChildren)}</p><p className="text-xs text-gray-500 font-semibold">{tr(t.teacherDash.cardChildrenSub)}</p></div>
          </a>
          <a href="/teacher/observations" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF8E7' }}>
            <span className="text-4xl">👁️</span><div><p className="font-black text-gray-800">{tr(t.teacherDash.cardObserve)}</p><p className="text-xs text-gray-500 font-semibold">{tr(t.teacherDash.cardObserveSub)}</p></div>
          </a>
          <a href="/teacher/stories" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF0F5' }}>
            <span className="text-4xl">📖</span><div><p className="font-black text-gray-800">{tr(t.teacherDash.cardStories)}</p><p className="text-xs text-gray-500 font-semibold">{tr(t.teacherDash.cardStoriesSub)}</p></div>
          </a>
        </div>

      </div>
    </div>
  )
}
