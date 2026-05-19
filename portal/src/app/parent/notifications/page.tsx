'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

type Notification = { id: string; type: string; title: string; body: string; read: boolean; created_at: string }

const typeLabel: Record<string, { label: string; bg: string; color: string }> = {
  ticket_update:         { label: '💬 Ticket',       bg: '#E0F2FE', color: '#0369A1' },
  broadcast:             { label: '📢 Mitteilung',    bg: '#FEF3C7', color: '#92400E' },
  lerngeschichte_bereit: { label: '📖 Lerngeschichte', bg: '#F0FDF4', color: '#166534' },
  onboarding_approved:   { label: '✅ Freischaltung', bg: '#F0FDF4', color: '#166534' },
}

export default function NotificationsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as Profile)
      const { data } = await supabase.from('notifications').select('id, type, title, body, read, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
      if (data) setNotifications(data as Notification[])
    }
    load()
  }, [])

  const unread = notifications.filter(n => !n.read).length

  async function toggle(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setExpanded(prev => prev === id ? null : id)
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    const supabase = createClient()
    const ids = notifications.filter(n => !n.read).map(n => n.id)
    if (ids.length > 0) await supabase.from('notifications').update({ read: true }).in('id', ids)
  }

  if (!profile) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={unread} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="kc-card p-6 mb-6 flex items-center justify-between gap-5" style={{ background: 'linear-gradient(135deg, #FFD166, #FFB347)' }}>
          <div className="flex items-center gap-4">
            <div className="text-6xl flex-shrink-0">🔔</div>
            <div>
              <h1 className="text-2xl font-black text-white">Benachrichtigungen</h1>
              <p className="text-yellow-100 font-semibold text-sm mt-1">
                {unread > 0 ? `${unread} ungelesen` : 'Alles gelesen ✓'}
              </p>
            </div>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-white/80 hover:text-white font-bold underline flex-shrink-0"
            >
              Alle als gelesen markieren
            </button>
          )}
        </div>

        <div className="kc-card overflow-hidden">
          <div className="divide-y-2 divide-[#F5F0E8]">
            {notifications.map(n => {
              const isOpen = expanded === n.id
              const meta = typeLabel[n.type]
              return (
                <div key={n.id} className={`transition-colors ${!n.read ? 'bg-teal-50' : 'bg-white'} ${isOpen ? '!bg-[#F0FFF8]' : ''}`}>

                  {/* Row — always visible, clickable */}
                  <button
                    onClick={() => toggle(n.id)}
                    className="w-full px-5 py-4 flex items-start gap-4 text-left"
                  >
                    {/* Unread dot */}
                    <span className={`mt-2 w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${!n.read ? 'bg-teal-500' : 'bg-transparent'}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="kc-badge text-xs"
                          style={{ background: meta?.bg ?? '#F3F4F6', color: meta?.color ?? '#374151' }}
                        >
                          {meta?.label ?? n.type}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold ml-auto flex-shrink-0">
                          {new Date(n.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <p className={`font-black text-gray-800 ${isOpen ? 'text-teal-700' : ''}`}>{n.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    </div>

                    <span className="flex-shrink-0 text-gray-400 mt-1">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {/* Expanded — show full body */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1">
                      <div className="rounded-2xl p-4 border-2 border-teal-100" style={{ background: '#F0FFF8' }}>
                        <p className="text-sm text-gray-700 leading-relaxed">{n.body}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
