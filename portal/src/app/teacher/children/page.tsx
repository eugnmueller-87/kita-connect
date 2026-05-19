'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

type Child = { id: string; name: string; birth_date: string; group_name: string; gender: string }

const GROUP_COLORS: Record<string, string> = { 'Schmetterlinge': '#FFF0F5', 'Bienen': '#FFFBE7', 'Sonnenkäfer': '#F0FFF4' }
const GROUP_EMOJI: Record<string, string> = { 'Schmetterlinge': '🦋', 'Bienen': '🐝', 'Sonnenkäfer': '🐞' }

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
      <path d="M23 33 Q28 37 33 33" stroke="#7B4F2E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export default function TeacherChildrenPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [allChildren, setAllChildren] = useState<Child[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as Profile)

      const { data } = await supabase.from('children').select('id, name, birth_date, group_name, gender').order('group_name').order('name')
      if (data) setAllChildren(data as Child[])
    }
    load()
  }, [])

  const allGroups = [...new Set(allChildren.map(c => c.group_name).filter(Boolean))]
  const visibleGroups = selectedGroup === 'all' ? allGroups : [selectedGroup]
  const filteredChildren = selectedGroup === 'all' ? allChildren : allChildren.filter(c => c.group_name === selectedGroup)

  if (!profile) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        <div className="kc-card p-5 mb-6 flex items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="flex items-center gap-4">
            <ChildAvatar gender="f" size={56} />
            <div>
              <h1 className="text-2xl font-black text-white">Kinder</h1>
              <p className="text-teal-200 font-semibold text-sm mt-0.5">
                {filteredChildren.length} Kinder · {selectedGroup === 'all' ? `${allGroups.length} Gruppen` : selectedGroup}
              </p>
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-4 py-2.5 rounded-2xl transition-colors border-2 border-white/30">
              <span>{selectedGroup === 'all' ? '👥 Alle Gruppen' : `${GROUP_EMOJI[selectedGroup] ?? '📍'} ${selectedGroup}`}</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border-2 border-[#EDE8DF] overflow-hidden z-50 min-w-48">
                <button onClick={() => { setSelectedGroup('all'); setDropdownOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors text-left hover:bg-teal-50 ${selectedGroup === 'all' ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}>
                  <span>👥</span><span>Alle Gruppen</span>
                  <span className="ml-auto text-xs text-gray-400">{allChildren.length}</span>
                </button>
                <div className="border-t border-[#F5F0E8]" />
                {allGroups.map(g => (
                  <button key={g} onClick={() => { setSelectedGroup(g); setDropdownOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors text-left hover:bg-teal-50 ${selectedGroup === g ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}>
                    <span>{GROUP_EMOJI[g] ?? '📍'}</span><span>{g}</span>
                    <span className="ml-auto text-xs text-gray-400">{allChildren.filter(c => c.group_name === g).length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {visibleGroups.map(group => (
          <div key={group} className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-lg">{GROUP_EMOJI[group] ?? '📍'}</span>
              <h2 className="font-black text-gray-700 text-sm uppercase tracking-wider">Gruppe {group}</h2>
              <span className="kc-badge bg-gray-100 text-gray-500 text-xs">{allChildren.filter(c => c.group_name === group).length} Kinder</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allChildren.filter(c => c.group_name === group).map(child => (
                <Link key={child.id} href={`/teacher/children/${child.id}`}
                  className="kc-card p-4 flex items-center gap-3 hover:scale-105 transition-transform"
                  style={{ background: child.gender === 'f' ? '#FFF0F5' : '#EEF6FF' }}>
                  <ChildAvatar gender={child.gender ?? 'm'} size={48} />
                  <div>
                    <p className="font-black text-gray-800 text-sm">{child.name}</p>
                    <p className="text-xs text-gray-400 font-semibold">{new Date(child.birth_date).toLocaleDateString('de-DE')}</p>
                    <span className="text-xs font-bold mt-0.5 block text-teal-600">{GROUP_EMOJI[group]} {group}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {allChildren.length === 0 && (
          <div className="kc-card p-8 text-center">
            <p className="text-4xl mb-3">👶</p>
            <p className="text-gray-500 font-semibold">Noch keine Kinder angelegt.</p>
          </div>
        )}
      </div>
    </div>
  )
}
