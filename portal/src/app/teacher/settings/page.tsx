'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { useProfileSettings } from '@/lib/useProfileSettings'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const LANGUAGES = [
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'tr', flag: '🇹🇷', label: 'Türkçe' },
]

export default function TeacherSettingsPage() {
  const { settings, update } = useProfileSettings(mockProfile.id)
  const [saved, setSaved] = useState(false)
  const [defaultGroup, setDefaultGroup] = useState('Schmetterlinge')
  const [aiAssist, setAiAssist] = useState(true)
  const [layer2, setLayer2] = useState(true)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        {/* Header */}
        <div className="kc-card p-6 mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <span className="text-5xl">⚙️</span>
          <div>
            <h1 className="text-2xl font-black text-white">Erzieher-Einstellungen</h1>
            <p className="text-teal-200 text-sm font-semibold mt-0.5">{mockProfile.full_name} · {mockProfile.email}</p>
          </div>
        </div>

        {/* Language */}
        <div className="kc-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🌐</span>
            <h2 className="font-black text-gray-800">Sprache</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => update({ lang: l.code })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all border-2 ${
                  settings.lang === l.code
                    ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105'
                    : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Default group */}
        <div className="kc-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👥</span>
            <h2 className="font-black text-gray-800">Standard-Gruppe</h2>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-3">Welche Gruppe soll beim Öffnen des Dashboards vorausgewählt sein?</p>
          <div className="flex gap-2 flex-wrap">
            {['Alle Gruppen', 'Schmetterlinge', 'Bienen', 'Sonnenkäfer'].map(g => (
              <button
                key={g}
                onClick={() => setDefaultGroup(g)}
                className={`px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${
                  defaultGroup === g
                    ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                    : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                {{ 'Schmetterlinge': '🦋 ', 'Bienen': '🐝 ', 'Sonnenkäfer': '🐞 ', 'Alle Gruppen': '👥 ' }[g]}{g}
              </button>
            ))}
          </div>
        </div>

        {/* AI & Intelligence */}
        <div className="kc-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🤖</span>
            <h2 className="font-black text-gray-800">KI & Entwicklungsintelligenz</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'KI-Unterstützung beim Schreiben', desc: 'Claude Haiku schlägt beim Erfassen Formulierungen vor', value: aiAssist, set: setAiAssist },
              { label: 'Layer 2 — Globale Bildungsrahmen', desc: 'Zeigt HighScope, Reggio, Te Whāriki etc. beim Beobachten', value: layer2, set: setLayer2 },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{row.label}</p>
                  <p className="text-xs text-gray-400">{row.desc}</p>
                </div>
                <button
                  onClick={() => row.set(!row.value)}
                  className={`relative flex-shrink-0 transition-colors duration-200 rounded-full ${row.value ? 'bg-teal-600' : 'bg-gray-300'}`}
                  style={{ width: 52, height: 28 }}
                >
                  <span className="absolute bg-white rounded-full shadow-md transition-transform duration-200"
                    style={{ width: 22, height: 22, top: 3, left: 3, transform: row.value ? 'translateX(24px)' : 'translateX(0)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="kc-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔔</span>
            <h2 className="font-black text-gray-800">Benachrichtigungen</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'E-Mail', desc: 'Neue Tickets und Nachrichten per E-Mail', key: 'notifyEmail' as const },
              { label: 'Push', desc: 'Browser-Benachrichtigungen aktivieren', key: 'notifyPush' as const },
              { label: 'SMS', desc: 'Dringende Meldungen per SMS', key: 'notifySms' as const },
            ].map(row => (
              <div key={row.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{row.label}</p>
                  <p className="text-xs text-gray-400">{row.desc}</p>
                </div>
                <button
                  onClick={() => update({ [row.key]: !settings[row.key] })}
                  className={`relative flex-shrink-0 transition-colors duration-200 rounded-full ${settings[row.key] ? 'bg-teal-600' : 'bg-gray-300'}`}
                  style={{ width: 52, height: 28 }}
                >
                  <span className="absolute bg-white rounded-full shadow-md transition-transform duration-200"
                    style={{ width: 22, height: 22, top: 3, left: 3, transform: settings[row.key] ? 'translateX(24px)' : 'translateX(0)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className="kc-btn w-full py-3 font-black text-white text-base"
          style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}
        >
          {saved ? '✅ Gespeichert!' : '💾 Einstellungen speichern'}
        </button>

      </div>
    </div>
  )
}
