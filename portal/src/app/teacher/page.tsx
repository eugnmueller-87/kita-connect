'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher',
  full_name: 'Maria Schmidt',
  email: 'maria@kita-connect.de',
  role: 'teacher',
  phone: null,
  notify_email: true,
  notify_sms: false,
  onboarding_status: 'active',
  created_at: new Date().toISOString(),
}

const allChildren = [
  { id: '1', name: 'Emma Müller',    group_name: 'Schmetterlinge' },
  { id: '2', name: 'Luca Becker',    group_name: 'Schmetterlinge' },
  { id: '3', name: 'Mia Fischer',    group_name: 'Schmetterlinge' },
  { id: '4', name: 'Noah Klein',     group_name: 'Schmetterlinge' },
  { id: '5', name: 'Lea Wagner',     group_name: 'Bienen' },
  { id: '6', name: 'Ben Schulz',     group_name: 'Bienen' },
  { id: '7', name: 'Sofia Braun',    group_name: 'Bienen' },
  { id: '8', name: 'Jonas Richter',  group_name: 'Bienen' },
  { id: '9', name: 'Hanna Wolf',     group_name: 'Sonnenkäfer' },
  { id: '10', name: 'Felix Neumann', group_name: 'Sonnenkäfer' },
  { id: '11', name: 'Laura König',   group_name: 'Sonnenkäfer' },
]

const mockObservations = [
  { id: '1', category: 'Sozialverhalten', situation: 'Emma hat heute beim Bauen im Sandkasten anderen Kindern geholfen und Ideen eingebracht.', group: 'Schmetterlinge', created_at: new Date().toISOString() },
  { id: '2', category: 'Sprache', situation: 'Luca hat beim Vorlesen viele Fragen gestellt und neue Wörter wiederholt.', group: 'Schmetterlinge', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', category: 'Bewegung', situation: 'Lea hat beim Turnen neue Gleichgewichtsübungen gemeistert.', group: 'Bienen', created_at: new Date(Date.now() - 172800000).toISOString() },
]

const mockStories = [
  { id: '1', title: 'Emma entdeckt die Welt der Insekten', status: 'published', group: 'Schmetterlinge' },
  { id: '2', title: 'Luca baut seine erste Brücke', status: 'review', group: 'Schmetterlinge' },
  { id: '3', title: 'Mias Kunstwerk', status: 'draft', group: 'Schmetterlinge' },
  { id: '4', title: 'Lea und der große Sprung', status: 'published', group: 'Bienen' },
]

const GROUP_EMOJI: Record<string, string> = {
  'Schmetterlinge': '🦋',
  'Bienen':         '🐝',
  'Sonnenkäfer':    '🐞',
}

const allGroups = [...new Set(allChildren.map(c => c.group_name))]

export default function TeacherDashboard() {
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const children = selectedGroup === 'all' ? allChildren : allChildren.filter(c => c.group_name === selectedGroup)
  const observations = selectedGroup === 'all' ? mockObservations : mockObservations.filter(o => o.group === selectedGroup)
  const stories = selectedGroup === 'all' ? mockStories : mockStories.filter(s => s.group === selectedGroup)

  const groupLabel = selectedGroup === 'all'
    ? '👥 Alle Gruppen'
    : `${GROUP_EMOJI[selectedGroup] ?? '📍'} ${selectedGroup}`

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero with group selector */}
        <div className="kc-card p-6 mb-6 flex items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="flex items-center gap-4">
            <div className="text-6xl flex-shrink-0">👩‍🏫</div>
            <div>
              <h1 className="text-2xl font-black text-white">
                Hallo, {mockProfile.full_name.split(' ')[0]}! 👋
              </h1>
              <p className="text-teal-200 font-semibold text-sm mt-1">
                {selectedGroup === 'all' ? 'Alle Gruppen' : `Gruppe ${selectedGroup}`} · {children.length} Kinder
              </p>
            </div>
          </div>

          {/* Group dropdown */}
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
                <button
                  onClick={() => { setSelectedGroup('all'); setDropdownOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-colors hover:bg-teal-50 ${selectedGroup === 'all' ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                >
                  <span>👥</span>
                  <span>Alle Gruppen</span>
                  <span className="ml-auto text-xs text-gray-400 font-semibold">{allChildren.length}</span>
                </button>
                <div className="border-t-2 border-[#F5F0E8]" />
                {allGroups.map(g => (
                  <button
                    key={g}
                    onClick={() => { setSelectedGroup(g); setDropdownOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-colors hover:bg-teal-50 ${selectedGroup === g ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                  >
                    <span>{GROUP_EMOJI[g] ?? '📍'}</span>
                    <span>{g}</span>
                    <span className="ml-auto text-xs text-gray-400 font-semibold">{allChildren.filter(c => c.group_name === g).length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { emoji: '👶', count: children.length, label: 'Kinder', color: '#E1F5EE', href: '/teacher/children' },
            { emoji: '👁️', count: observations.length, label: 'Beobachtungen', color: '#FFF8E7', href: '/teacher/observations' },
            { emoji: '📖', count: stories.length, label: 'Lerngeschichten', color: '#FFF0F5', href: '/teacher/stories' },
          ].map(s => (
            <a key={s.label} href={s.href} className="kc-card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform" style={{ background: s.color }}>
              <span className="text-4xl">{s.emoji}</span>
              <span className="text-3xl font-black text-gray-800">{s.count}</span>
              <span className="text-xs font-bold text-gray-500 text-center">{s.label}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Recent Observations */}
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <h2 className="font-black text-gray-800">Letzte Beobachtungen</h2>
              </div>
              <a href="/teacher/observations" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">
                Alle <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {observations.length === 0
                ? <p className="px-5 py-4 text-sm text-gray-400 font-semibold">Keine Beobachtungen für diese Gruppe.</p>
                : observations.map(o => (
                  <div key={o.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{o.category}</span>
                      <span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">{o.situation}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Learning Stories */}
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h2 className="font-black text-gray-800">Lerngeschichten</h2>
              </div>
              <a href="/teacher/stories" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">
                Alle <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {stories.length === 0
                ? <p className="px-5 py-4 text-sm text-gray-400 font-semibold">Keine Lerngeschichten für diese Gruppe.</p>
                : stories.map(s => (
                  <a key={s.id} href={`/teacher/stories/${s.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                    <p className="text-sm font-bold text-gray-800">{s.title}</p>
                    <span className={`kc-badge text-xs flex-shrink-0 ml-2 ${
                      s.status === 'published' ? 'bg-teal-100 text-teal-700' :
                      s.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {s.status === 'published' ? '✅ Veröffentlicht' : s.status === 'review' ? '🔍 Überprüfung' : '✏️ Entwurf'}
                    </span>
                  </a>
                ))
              }
            </div>
          </div>

        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <a href="/teacher/children" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#E1F5EE' }}>
            <span className="text-4xl">👶</span>
            <div>
              <p className="font-black text-gray-800">Kinder</p>
              <p className="text-xs text-gray-500 font-semibold">Alle Kinder anzeigen</p>
            </div>
          </a>
          <a href="/teacher/observations/new" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF8E7' }}>
            <span className="text-4xl">👁️</span>
            <div>
              <p className="font-black text-gray-800">Beobachten</p>
              <p className="text-xs text-gray-500 font-semibold">Neue Beobachtung</p>
            </div>
          </a>
          <a href="/teacher/stories" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF0F5' }}>
            <span className="text-4xl">📖</span>
            <div>
              <p className="font-black text-gray-800">Geschichten</p>
              <p className="text-xs text-gray-500 font-semibold">Lerngeschichten</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  )
}
