'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import { X, Plus, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfileSettings } from '@/lib/useProfileSettings'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Profile } from '@/types'

const GROUP_EMOJI: Record<string, string> = { 'Schmetterlinge': '🦋', 'Bienen': '🐝', 'Sonnenkäfer': '🐞' }
const GROUP_COLORS: Record<string, string> = { 'Schmetterlinge': '#FFF0F5', 'Bienen': '#FFFBE7', 'Sonnenkäfer': '#F0FFF4' }

type Child = { id: string; name: string; birth_date: string; gender: string; group_name: string | null }

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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [assignTarget, setAssignTarget] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const { settings } = useProfileSettings(profile?.id ?? 'guest')
  const { tr } = useTranslation(settings.lang)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as Profile)
      const { data } = await supabase.from('children').select('id, name, birth_date, gender, group_name').order('name')
      if (data) {
        setChildren(data as Child[])
        setGroups([...new Set(data.map(c => c.group_name).filter(Boolean) as string[])])
      }
    }
    load()
  }, [])

  const unassigned = children.filter(c => !c.group_name)

  function assignChild(childId: string, group: string | null) {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, group_name: group } : c))
    setAssignTarget(null)
  }

  function removeFromGroup(childId: string) {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, group_name: null } : c))
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
    setChildren(prev => prev.map(c => c.group_name === group ? { ...c, group_name: null } : c))
  }

  async function save() {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const updates = children.map(c =>
      supabase.from('children').update({ group_name: c.group_name }).eq('id', c.id)
    )
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    setSaving(false)
    if (failed?.error) { setError(failed.error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={settings.lang} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-5 mb-6 flex items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.groupsPage.heading)}</h1>
            <p className="text-teal-200 text-sm font-semibold mt-0.5">
              {groups.length} Gruppen · {children.length} {tr(t.teacherDash.statChildren)} · {unassigned.length} {tr(t.groupsPage.unassigned).replace('({n})', '').trim()}
            </p>
          </div>
          <button onClick={() => setShowNewGroup(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-4 py-2.5 rounded-2xl border-2 border-white/30 transition-colors">
            <Plus size={16} /> {tr(t.groupsPage.newGroup)}
          </button>
        </div>

        {showNewGroup && (
          <div className="kc-card p-4 mb-6 flex gap-3 items-center" style={{ background: '#F0FFF4' }}>
            <span className="text-2xl">📍</span>
            <input autoFocus value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGroup()}
              placeholder={tr(t.groupsPage.groupNamePlaceholder)} className="kc-input flex-1 px-4 py-2 text-sm" />
            <button onClick={addGroup} className="kc-btn bg-teal-600 text-white text-sm font-black px-4 py-2">{tr(t.groupsPage.create)}</button>
            <button onClick={() => setShowNewGroup(false)} className="kc-btn bg-gray-100 text-gray-600 text-sm font-black px-3 py-2">{tr(t.common.cancel)}</button>
          </div>
        )}

        <div className="space-y-5 mb-6">
          {groups.map(group => {
            const groupChildren = children.filter(c => c.group_name === group)
            const bg = GROUP_COLORS[group] ?? '#F5F5F5'
            const emoji = GROUP_EMOJI[group] ?? '📍'
            return (
              <div key={group} className="kc-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#EDE8DF]" style={{ background: bg }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <h2 className="font-black text-gray-800">{group}</h2>
                    <span className="kc-badge bg-white/80 text-gray-600 text-xs">{groupChildren.length} {tr(t.teacherDash.statChildren)}</span>
                  </div>
                  <button onClick={() => deleteGroup(group)} className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1 transition-colors">
                    <X size={14} /> {tr(t.groupsPage.deleteGroup)}
                  </button>
                </div>
                <div className="p-4">
                  {groupChildren.length === 0 ? (
                    <p className="text-sm text-gray-400 font-semibold text-center py-2">{tr(t.groupsPage.noChildren)}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {groupChildren.map(child => (
                        <div key={child.id} className="flex items-center gap-2 bg-white border-2 border-[#EDE8DF] rounded-2xl px-3 py-1.5 text-sm font-bold text-gray-700">
                          <Avatar gender={child.gender} size={24} />
                          <span>{child.name}</span>
                          <span className="text-xs text-gray-400 font-semibold">{getAge(child.birth_date)}</span>
                          <button onClick={() => removeFromGroup(child.id)} className="ml-1 text-gray-300 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {unassigned.length > 0 && (
                    assignTarget === group ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-bold self-center mr-1">{tr(t.groupsPage.addChild)}</span>
                        {unassigned.map(c => (
                          <button key={c.id} onClick={() => assignChild(c.id, group)}
                            className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-2xl transition-colors">
                            <Avatar gender={c.gender} size={20} /> {c.name}
                          </button>
                        ))}
                        <button onClick={() => setAssignTarget(null)} className="text-xs text-gray-400 hover:text-gray-600 font-bold self-center">{tr(t.common.cancel)}</button>
                      </div>
                    ) : (
                      <button onClick={() => setAssignTarget(group)} className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-bold transition-colors">
                        <UserPlus size={14} /> {tr(t.groupsPage.assignChild)}
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {unassigned.length > 0 && (
          <div className="kc-card overflow-hidden mb-6">
            <div className="px-5 py-3 border-b-2 border-[#EDE8DF] flex items-center gap-2" style={{ background: '#FFF8E7' }}>
              <span className="text-xl">⏳</span>
              <h2 className="font-black text-gray-800">{tr(t.groupsPage.unassigned).replace('{n}', String(unassigned.length))}</h2>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {unassigned.map(child => (
                <div key={child.id} className="relative group">
                  <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-3 py-1.5 text-sm font-bold text-gray-700">
                    <Avatar gender={child.gender} size={24} />
                    <span>{child.name}</span>
                    <span className="text-xs text-gray-400">{getAge(child.birth_date)}</span>
                  </div>
                  {assignTarget === `unassigned-${child.id}` ? (
                    <div className="absolute left-0 top-full mt-1 bg-white rounded-2xl shadow-xl border-2 border-[#EDE8DF] overflow-hidden z-50 min-w-44">
                      {groups.map(g => (
                        <button key={g} onClick={() => assignChild(child.id, g)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-teal-50 text-left transition-colors">
                          <span>{GROUP_EMOJI[g] ?? '📍'}</span> {g}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => setAssignTarget(`unassigned-${child.id}`)}
                      className="absolute -top-1 -right-1 bg-teal-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 font-semibold mb-4">⚠️ {error}</p>}

        <button onClick={save} disabled={saving}
          className="kc-btn w-full py-3 font-black text-white text-base disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          {saving ? tr(t.common.saving) : saved ? tr(t.common.saved) : tr(t.groupsPage.saveAssignments)}
        </button>
      </div>
    </div>
  )
}
