'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-parent', full_name: 'Anna Müller', email: 'anna@example.de',
  role: 'parent', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const mockNotifications = [
  {
    id: '1',
    type: 'lerngeschichte_bereit',
    title: 'Neue Lerngeschichte',
    body: 'Eine neue Lerngeschichte über Emma wurde veröffentlicht.',
    read: false,
    created_at: new Date().toISOString(),
    detail: {
      text: 'Emma hat heute im Garten einen Käfer entdeckt und ihn fast 20 Minuten lang beobachtet. Ihre Erzieherin hat darüber eine Lerngeschichte geschrieben.',
      action: { label: '📖 Lerngeschichte lesen', href: '/parent/child' },
    },
  },
  {
    id: '2',
    type: 'broadcast',
    title: 'Elternabend',
    body: 'Der nächste Elternabend findet am 12. Juni um 19:00 Uhr statt.',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    detail: {
      text: 'Themen des Abends: Jahresplanung 2026/27, Ausflugsziele Sommer, DSGVO-Update. Bitte geben Sie bis 8. Juni Bescheid ob Sie kommen.',
      tips: ['📅 Termin: 12. Juni, 19:00 Uhr', '📍 Ort: Gruppenraum Schmetterlinge', '⏱️ Dauer: ca. 1,5 Stunden'],
    },
  },
  {
    id: '3',
    type: 'broadcast',
    title: 'Gruppenausflug — wetterfeste Kleidung',
    body: 'Die Schmetterlingsgruppe macht am Freitag einen Ausflug zum Stadtpark. Bitte wetterfeste Kleidung anziehen.',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    detail: {
      text: 'Es wird regnerisch. Damit Ihr Kind den Ausflug trotzdem genießen kann, bitte vollständige Regenausrüstung mitbringen:',
      tips: [
        '🥾 Gummistiefel — wasserdicht, gut sitzend',
        '🧥 Regenjacke — mit Kapuze, wind- und wasserdicht',
        '👖 Regenhose — über der normalen Hose tragen',
        '🧤 Handschuhe — optional, aber empfohlen',
        '👕 Wechselkleidung — immer eine Ersatzgarnitur in der Tasche',
      ],
      note: 'Tipp: Kleidung am Abend vorher bereitstellen, damit es morgens schnell geht.',
    },
  },
  {
    id: '4',
    type: 'onboarding_approved',
    title: 'Willkommen bei Kita Connect!',
    body: 'Ihr Konto wurde freigeschaltet. Sie haben jetzt Zugriff auf alle Funktionen.',
    read: true,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    detail: {
      text: 'Sie können jetzt alle Bereiche des Eltern-Portals nutzen:',
      tips: [
        '👶 Mein Kind — Beobachtungen und Lerngeschichten',
        '💬 Nachrichten — direkt mit der Erzieherin schreiben',
        '🎫 Tickets — Anfragen stellen',
        '🤖 FAQ — KI-Assistent für häufige Fragen',
      ],
    },
  },
]

const typeLabel: Record<string, { label: string; bg: string; color: string }> = {
  ticket_update:         { label: '💬 Ticket',       bg: '#E0F2FE', color: '#0369A1' },
  broadcast:             { label: '📢 Mitteilung',    bg: '#FEF3C7', color: '#92400E' },
  lerngeschichte_bereit: { label: '📖 Lerngeschichte', bg: '#F0FDF4', color: '#166534' },
  onboarding_approved:   { label: '✅ Freischaltung', bg: '#F0FDF4', color: '#166534' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [expanded, setExpanded] = useState<string | null>(null)

  const unread = notifications.filter(n => !n.read).length

  function toggle(id: string) {
    // mark as read when opened
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setExpanded(prev => prev === id ? null : id)
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={unread} />

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

                  {/* Expanded detail */}
                  {isOpen && n.detail && (
                    <div className="px-5 pb-5 pt-1">
                      <div className="rounded-2xl p-4 border-2 border-teal-100" style={{ background: '#F0FFF8' }}>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{n.detail.text}</p>

                        {n.detail.tips && (
                          <ul className="space-y-2">
                            {n.detail.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-semibold bg-white rounded-xl px-3 py-2 border border-teal-100">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}

                        {n.detail.note && (
                          <p className="text-xs text-teal-600 font-bold mt-3 pt-3 border-t border-teal-100">
                            💡 {n.detail.note}
                          </p>
                        )}

                        {n.detail.action && (
                          <a
                            href={n.detail.action.href}
                            className="kc-btn inline-flex items-center mt-3 bg-teal-600 text-white text-sm font-black px-4 py-2"
                          >
                            {n.detail.action.label}
                          </a>
                        )}
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
