'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { useProfileSettings } from '@/lib/useProfileSettings'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockParents = [
  { id: '1', name: 'Anna Müller',   group: 'Schmetterlinge', notifyEmail: true,  notifySms: false, notifyPush: true  },
  { id: '2', name: 'Thomas Becker', group: 'Schmetterlinge', notifyEmail: true,  notifySms: false, notifyPush: false },
  { id: '3', name: 'Mia Fischer',   group: 'Schmetterlinge', notifyEmail: false, notifySms: false, notifyPush: true  },
  { id: '4', name: 'Noah Klein',    group: 'Schmetterlinge', notifyEmail: true,  notifySms: true,  notifyPush: true  },
  { id: '5', name: 'Sara Klein',    group: 'Bienen',         notifyEmail: false, notifySms: true,  notifyPush: true  },
  { id: '6', name: 'Marc Weber',    group: 'Bienen',         notifyEmail: true,  notifySms: true,  notifyPush: true  },
  { id: '7', name: 'Sofia Braun',   group: 'Bienen',         notifyEmail: true,  notifySms: false, notifyPush: false },
  { id: '8', name: 'Jonas Richter', group: 'Bienen',         notifyEmail: false, notifySms: false, notifyPush: true  },
]

const GROUP_EMOJI: Record<string, string> = { 'Schmetterlinge': '🦋', 'Bienen': '🐝' }

export default function TeacherBroadcastPage() {
  const { settings } = useProfileSettings(mockProfile.id)
  const { tr } = useTranslation(settings.lang)

  const MY_GROUPS_KEYS = ['all', 'Schmetterlinge', 'Bienen']

  const [title, setTitle]             = useState('')
  const [body, setBody]               = useState('')
  const [targetGroup, setTargetGroup] = useState('all')
  const [sent, setSent]               = useState(false)
  const [loading, setLoading]         = useState(false)

  const audience = targetGroup === 'all'
    ? mockParents
    : mockParents.filter(p => p.group === targetGroup)

  const total      = audience.length
  const pushCount  = audience.filter(p => p.notifyPush).length
  const emailCount = audience.filter(p => p.notifyEmail).length
  const smsCount   = audience.filter(p => p.notifySms).length

  async function handleSend(e: React.SyntheticEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
        <Navbar profile={mockProfile} unreadCount={0} lang={settings.lang} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="kc-card px-6 py-14 text-center">
            <p className="text-7xl mb-4">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-1">{tr(t.broadcastPage.sentHeading)}</h2>
            <p className="text-gray-600 font-bold mb-1">„{title}"</p>
            <div className="flex justify-center gap-4 text-sm font-bold text-gray-500 mb-8">
              <span>🔔 {total} In-App</span>
              <span>📲 {pushCount} Push</span>
              <span>✉️ {emailCount} E-Mail</span>
              <span>💬 {smsCount} SMS</span>
            </div>
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
      <Navbar profile={mockProfile} unreadCount={0} lang={settings.lang} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-6 mb-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="text-6xl flex-shrink-0">📢</div>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.broadcastPage.heading)}</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">
              {targetGroup === 'all'
                ? `${tr(t.broadcastPage.myGroups)} · ${total} ${tr(t.broadcastPage.parentPlural)}`
                : `Gruppe ${targetGroup} · ${total} ${tr(t.broadcastPage.parentPlural)}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">

          <div className="kc-card p-5">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{tr(t.broadcastPage.recipients)}</p>
            <div className="flex gap-2 flex-wrap">
              {MY_GROUPS_KEYS.map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setTargetGroup(g)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                    targetGroup === g
                      ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105'
                      : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  <span>{g === 'all' ? '👥' : GROUP_EMOJI[g] ?? '📍'}</span>
                  {g === 'all' ? tr(t.broadcastPage.myGroups) : g}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-[#F5F0E8]">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                {tr(t.broadcastPage.parentCount).replace('{n}', String(total))}
              </p>
              <div className="flex flex-wrap gap-2">
                {audience.map(p => (
                  <span key={p.id} className="flex items-center gap-1.5 bg-gray-50 border border-[#EDE8DF] rounded-2xl px-3 py-1 text-xs font-bold text-gray-600">
                    {p.name}
                    <span className="flex gap-0.5 ml-0.5 text-[11px]">
                      {p.notifyPush  && <span>📲</span>}
                      {p.notifyEmail && <span>✉️</span>}
                      {p.notifySms   && <span>💬</span>}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="kc-card p-5">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{tr(t.broadcastPage.reach)}</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: '🔔', label: 'In-App', count: total,      note: tr(t.broadcastPage.reachAlways), bg: '#E1F5EE', color: '#1D7A6F' },
                { icon: '📲', label: 'Push',   count: pushCount,  note: tr(t.broadcastPage.reachOptIn),  bg: '#EEF6FF', color: '#1D4ED8' },
                { icon: '✉️', label: 'E-Mail', count: emailCount, note: tr(t.broadcastPage.reachOptIn),  bg: '#FFF8E7', color: '#92400E' },
                { icon: '💬', label: 'SMS',    count: smsCount,   note: tr(t.broadcastPage.reachOptIn),  bg: '#FFF0F5', color: '#9D174D' },
              ].map(ch => (
                <div key={ch.label} className="rounded-2xl p-3 text-center border-2" style={{ background: ch.bg, borderColor: ch.bg }}>
                  <div className="text-xl mb-1">{ch.icon}</div>
                  <div className="text-2xl font-black" style={{ color: ch.color }}>{ch.count}</div>
                  <div className="text-xs font-black text-gray-700">{ch.label}</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-0.5">{ch.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="kc-card p-5 space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.subject)}</label>
              <input
                type="text" required value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={tr(t.broadcastPage.subjectPlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.message)}</label>
              <textarea
                required rows={4} value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={tr(t.broadcastPage.messagePlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit" disabled={loading || total === 0}
                className="kc-btn bg-teal-600 disabled:opacity-50 text-white font-black px-6 py-3 text-sm flex items-center gap-2"
              >
                {loading ? tr(t.common.sending) : tr(t.broadcastPage.sendBtn).replace('{n}', String(total)).replace('{unit}', total === 1 ? tr(t.broadcastPage.parentSingular) : tr(t.broadcastPage.parentPlural))}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
