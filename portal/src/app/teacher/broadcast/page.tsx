'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/client'
import { useProfileSettings } from '@/lib/useProfileSettings'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Profile } from '@/types'

const GROUP_EMOJI: Record<string, string> = { 'Schmetterlinge': '🦋', 'Bienen': '🐝', 'Sonnenkäfer': '🐞' }

export default function TeacherBroadcastPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [parentCount, setParentCount] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetGroup, setTargetGroup] = useState('all')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
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
      const { data: children } = await supabase.from('children').select('group_name').order('group_name')
      if (children) {
        const unique = [...new Set(children.map(c => c.group_name).filter(Boolean))]
        setGroups(unique)
      }
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent')
      setParentCount(count ?? 0)
    }
    load()
  }, [])

  async function handleSend(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('notifications').insert({
      sender_id: profile.id,
      title: title.trim(),
      body: body.trim(),
      target_group: targetGroup === 'all' ? null : targetGroup,
      type: 'broadcast',
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  if (!profile) return null

  const MY_GROUPS_KEYS = ['all', ...groups]

  if (sent) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
        <Navbar profile={profile} unreadCount={0} lang={settings.lang} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="kc-card px-6 py-14 text-center">
            <p className="text-7xl mb-4">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-1">{tr(t.broadcastPage.sentHeading)}</h2>
            <p className="text-gray-600 font-bold mb-6">„{title}"</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setSent(false); setTitle(''); setBody('') }}
                className="kc-btn bg-teal-600 text-white font-black text-sm px-6 py-3">
                {tr(t.broadcastPage.newBroadcast)}
              </button>
              <a href="/teacher" className="kc-btn bg-gray-100 text-gray-700 font-black text-sm px-6 py-3">
                {tr(t.common.backDashboard)}
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={settings.lang} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-6 mb-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="text-6xl flex-shrink-0">📢</div>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.broadcastPage.heading)}</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">
              {targetGroup === 'all'
                ? `${tr(t.broadcastPage.myGroups)} · ${parentCount} ${tr(t.broadcastPage.parentPlural)}`
                : `${GROUP_EMOJI[targetGroup] ?? '📍'} ${targetGroup}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="kc-card p-5">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{tr(t.broadcastPage.recipients)}</p>
            <div className="flex gap-2 flex-wrap">
              {MY_GROUPS_KEYS.map(g => (
                <button key={g} type="button" onClick={() => setTargetGroup(g)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all"
                  style={targetGroup === g ? { background: '#2a9d8f', color: '#fff', borderColor: '#1D7A6F' } : { background: '#fff', color: '#4b5563', borderColor: '#EDE8DF' }}>
                  <span>{g === 'all' ? '👥' : GROUP_EMOJI[g] ?? '📍'}</span>
                  {g === 'all' ? tr(t.broadcastPage.myGroups) : g}
                </button>
              ))}
            </div>
          </div>

          <div className="kc-card p-5 space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.subject)}</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder={tr(t.broadcastPage.subjectPlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.message)}</label>
              <textarea required rows={4} value={body} onChange={e => setBody(e.target.value)}
                placeholder={tr(t.broadcastPage.messagePlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm resize-none" />
            </div>
            {error && <p className="text-sm text-red-600 font-semibold">⚠️ {error}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={loading || !title.trim() || !body.trim()}
                className="kc-btn bg-teal-600 disabled:opacity-50 text-white font-black px-6 py-3 text-sm">
                {loading ? tr(t.common.sending) : tr(t.broadcastPage.sendBtn).replace('{n}', String(parentCount)).replace('{unit}', tr(t.broadcastPage.parentPlural))}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
