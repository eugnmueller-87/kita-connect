'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { X, Plus, UserPlus } from 'lucide-react'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const INITIAL_CHILDREN = [
  { id: '1',  name: 'Emma Müller',    birth_date: '2020-03-15', gender: 'f', group: 'Schmetterlinge' },
  { id: '2',  name: 'Luca Becker',    birth_date: '2019-11-22', gender: 'm', group: 'Schmetterlinge' },
  { id: '3',  name: 'Mia Fischer',    birth_date: '2020-07-08', gender: 'f', group: 'Schmetterlinge' },
  { id: '4',  name: 'Noah Klein',     birth_date: '2019-09-14', gender: 'm', group: 'Schmetterlinge' },
  { id: '5',  name: 'Lea Wagner',     birth_date: '2020-01-30', gender: 'f', group: 'Bienen' },
  { id: '6',  name: 'Ben Schulz',     birth_date: '2019-12-05', gender: 'm', group: 'Bienen' },
  { id: '7',  name: 'Sofia Braun',    birth_date: '2021-02-14', gender: 'f', group: 'Bienen' },
  { id: '8',  name: 'Jonas Richter',  birth_date: '2021-05-20', gender: 'm', group: 'Bienen' },
  { id: '9',  name: 'Hanna Wolf',     birth_date: '2022-03-10', gender: 'f', group: 'Sonnenkäfer' },
  { id: '10', name: 'Felix Neumann',  birth_date: '2022-01-25', gender: 'm', group: 'Sonnenkäfer' },
  { id: '11', name: 'Laura König',    birth_date: '2022-06-18', gender: 'f', group: 'Sonnenkäfer' },
  { id: '12', name: 'Tim Hoffmann',   birth_date: '2023-04-02', gender: 'm', group: null },
  { id: '13', name: 'Anna Weber',     birth_date: '2023-01-15', gender: 'f', group: null },
]

const INITIAL_GROUPS = ['Schmetterlinge', 'Bienen', 'Sonnenkäfer']

const GROUP_EMOJI: Record<string, string> = {
  'Schmetterlinge': '🦋',
  'Bienen':         '🐝',
  'Sonnenkäfer':    '🐞',
}
const GROUP_COLORS: Record<string, string> = {
  'Schmetterlinge': '#FFF0F5',
  'Bienen':         '#FFFBE7',
  'Sonnenkäfer':    '#F0FFF4',
}

function getAge(birth: string) {
  const b = new Date(birth), now = new Date()
  const months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth())
  const y = Math.floor(months / 12), m = months % 12
  return y > 0 ? `${y}J ${m}M` : `${m}M`
}

function Avatar({ gender, size = 36 }: { gender: string; size?: number }) {
  return gender === 'f'
    ? <div className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0" style={{ width: size, height: size, background: '#FF9FB2', fontSize: size * 0.45 }}>♀</div>
    : <div className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0" style={{ width: size, height: size, background: '#7EC8E3', fontSize: size * 0.45 }}>♂</div>
}

export default function GroupManagementPage() {
  const [children, setChildren] = useState(INITIAL_CHILDREN)
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [assignTarget, setAssignTarget] = useState<string | null>(null) // child id being assigned
  const [saved, setSaved] = useState(false)

  const unassigned = children.filter(c => !c.group)

  function assignChild(childId: string, group: string | null) {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, group } : c))
    setAssignTarget(null)
  }

  function removeFromGroup(childId: string) {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, group: null } : c))
  }

  function addGroup() {
    const name = newGroupName.trim()
    if (!name || groups.includes(name)) return
    setGroups(prev => [...prev, name])
    setNewGroupName('')
    setShowNewGroup(false)
  }

  function deleteGroup(group: string) {
    setGroups(prev => prev.filter(g => g !== group))
    setChildren(prev => prev.map(c => c.group === group ? { ...c, group: null } : c))
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        {/* Header */}
        <div className="kc-card p-5 mb-6 flex items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div>
            <h1 className="text-2xl font-black text-white">Gruppen verwalten</h1>
            <p className="text-teal-200 text-sm font-semibold mt-0.5">
              {groups.length} Gruppen · {children.length} Kinder · {unassigned.length} ohne Gruppe
            </p>
          </div>
          <button
            onClick={() => setShowNewGroup(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-4 py-2.5 rounded-2xl border-2 border-white/30 transition-colors"
          >
            <Plus size={16} />
            Neue Gruppe
          </button>
        </div>

        {/* New group form */}
        {showNewGroup && (
          <div className="kc-card p-4 mb-6 flex gap-3 items-center" style={{ background: '#F0FFF4' }}>
            <span className="text-2xl">📍</span>
            <input
              autoFocus
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGroup()}
              placeholder="Gruppenname eingeben…"
              className="kc-input flex-1 px-4 py-2 text-sm"
            />
            <button onClick={addGroup} className="kc-btn bg-teal-600 text-white text-sm font-black px-4 py-2">
              ✅ Erstellen
            </button>
            <button onClick={() => setShowNewGroup(false)} className="kc-btn bg-gray-100 text-gray-600 text-sm font-black px-3 py-2">
              Abbrechen
            </button>
          </div>
        )}

        {/* Groups with assigned children */}
        <div className="space-y-5 mb-6">
          {groups.map(group => {
            const groupChildren = children.filter(c => c.group === group)
            const bg = GROUP_COLORS[group] ?? '#F5F5F5'
            const emoji = GROUP_EMOJI[group] ?? '📍'
            return (
              <div key={group} className="kc-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#EDE8DF]" style={{ background: bg }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <h2 className="font-black text-gray-800">{group}</h2>
                    <span className="kc-badge bg-white/80 text-gray-600 text-xs">{groupChildren.length} Kinder</span>
                  </div>
                  <button
                    onClick={() => deleteGroup(group)}
                    className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                  >
                    <X size={14} /> Gruppe löschen
                  </button>
                </div>

                <div className="p-4">
                  {groupChildren.length === 0 ? (
                    <p className="text-sm text-gray-400 font-semibold text-center py-2">Noch keine Kinder in dieser Gruppe</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {groupChildren.map(child => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 bg-white border-2 border-[#EDE8DF] rounded-2xl px-3 py-1.5 text-sm font-bold text-gray-700"
                        >
                          <Avatar gender={child.gender} size={24} />
                          <span>{child.name}</span>
                          <span className="text-xs text-gray-400 font-semibold">{getAge(child.birth_date)}</span>
                          <button
                            onClick={() => removeFromGroup(child.id)}
                            className="ml-1 text-gray-300 hover:text-red-400 transition-colors"
                            title="Aus Gruppe entfernen"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assign unassigned child to this group */}
                  {unassigned.length > 0 && (
                    <div className="relative">
                      {assignTarget === group ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-bold self-center mr-1">Kind hinzufügen:</span>
                          {unassigned.map(c => (
                            <button
                              key={c.id}
                              onClick={() => assignChild(c.id, group)}
                              className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-2xl transition-colors"
                            >
                              <Avatar gender={c.gender} size={20} />
                              {c.name}
                            </button>
                          ))}
                          <button onClick={() => setAssignTarget(null)} className="text-xs text-gray-400 hover:text-gray-600 font-bold self-center">Abbrechen</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssignTarget(group)}
                          className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-bold transition-colors"
                        >
                          <UserPlus size={14} /> Kind zuweisen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Unassigned children */}
        {unassigned.length > 0 && (
          <div className="kc-card overflow-hidden mb-6">
            <div className="px-5 py-3 border-b-2 border-[#EDE8DF] flex items-center gap-2" style={{ background: '#FFF8E7' }}>
              <span className="text-xl">⏳</span>
              <h2 className="font-black text-gray-800">Ohne Gruppe ({unassigned.length})</h2>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {unassigned.map(child => (
                <div key={child.id} className="relative group">
                  <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-3 py-1.5 text-sm font-bold text-gray-700">
                    <Avatar gender={child.gender} size={24} />
                    <span>{child.name}</span>
                    <span className="text-xs text-gray-400">{getAge(child.birth_date)}</span>
                  </div>
                  {/* Assign dropdown on hover */}
                  {assignTarget === `unassigned-${child.id}` ? (
                    <div className="absolute left-0 top-full mt-1 bg-white rounded-2xl shadow-xl border-2 border-[#EDE8DF] overflow-hidden z-50 min-w-44">
                      {groups.map(g => (
                        <button
                          key={g}
                          onClick={() => assignChild(child.id, g)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-teal-50 text-left transition-colors"
                        >
                          <span>{GROUP_EMOJI[g] ?? '📍'}</span> {g}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssignTarget(`unassigned-${child.id}`)}
                      className="absolute -top-1 -right-1 bg-teal-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Gruppe zuweisen"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={save}
          className="kc-btn w-full py-3 font-black text-white text-base"
          style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}
        >
          {saved ? '✅ Gespeichert!' : '💾 Gruppenzuordnungen speichern'}
        </button>

      </div>
    </div>
  )
}
