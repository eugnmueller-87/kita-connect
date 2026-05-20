'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { useProfileSettings } from '@/lib/useProfileSettings'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-admin', full_name: 'Admin Nutzer', email: 'admin@kita-connect.de',
  role: 'admin', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const LANGUAGES = [
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'tr', flag: '🇹🇷', label: 'Türkçe' },
]

export default function AdminSettingsPage() {
  const { settings, update } = useProfileSettings(mockProfile.id)
  const { tr } = useTranslation(settings.lang)
  const [saved, setSaved] = useState(false)

  const [kitaName, setKitaName] = useState('Kita Sonnenschein')
  const [kitaCity, setKitaCity] = useState('Berlin')
  const [autoApprove, setAutoApprove] = useState(false)
  const [welcomeEmail, setWelcomeEmail] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [smsProvider, setSmsProvider] = useState('seven.io')
  const [maxGroupSize, setMaxGroupSize] = useState('12')

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} lang={settings.lang} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1D7A6F, #2EA89A)' }}>
          <span className="text-5xl">⚙️</span>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.settings.adminHeading)}</h1>
            <p className="text-teal-200 text-sm font-semibold mt-0.5">{mockProfile.full_name} · {mockProfile.email}</p>
          </div>
        </div>

        <div className="kc-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🌐</span>
            <h2 className="font-black text-gray-800">{tr(t.common.language)}</h2>
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

        <div className="kc-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏡</span>
            <h2 className="font-black text-gray-800">{tr(t.settings.kitaProfile)}</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">{tr(t.settings.kitaName)}</label>
              <input
                value={kitaName}
                onChange={e => setKitaName(e.target.value)}
                className="kc-input w-full px-4 py-2.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">{tr(t.settings.city)}</label>
              <input
                value={kitaCity}
                onChange={e => setKitaCity(e.target.value)}
                className="kc-input w-full px-4 py-2.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">{tr(t.settings.maxChildren)}</label>
              <input
                type="number"
                min="1"
                max="30"
                value={maxGroupSize}
                onChange={e => setMaxGroupSize(e.target.value)}
                className="kc-input w-32 px-4 py-2.5 text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="kc-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👋</span>
            <h2 className="font-black text-gray-800">{tr(t.settings.onboarding)}</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: tr(t.settings.autoApprove), desc: tr(t.settings.autoApproveDesc), value: autoApprove, set: setAutoApprove },
              { label: tr(t.settings.welcomeEmail), desc: tr(t.settings.welcomeEmailDesc), value: welcomeEmail, set: setWelcomeEmail },
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

        <div className="kc-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📡</span>
            <h2 className="font-black text-gray-800">{tr(t.settings.channels)}</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: tr(t.settings.channelEmail), desc: tr(t.settings.channelEmailDesc), value: true, set: () => {}, locked: true },
              { label: tr(t.settings.channelSms), desc: tr(t.settings.channelSmsDesc), value: smsEnabled, set: setSmsEnabled },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{row.label}</p>
                  <p className="text-xs text-gray-400">{row.desc}</p>
                </div>
                <button
                  onClick={() => !row.locked && row.set(!row.value)}
                  disabled={row.locked}
                  className={`relative flex-shrink-0 transition-colors duration-200 rounded-full ${row.value ? 'bg-teal-600' : 'bg-gray-300'} ${row.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ width: 52, height: 28 }}
                >
                  <span className="absolute bg-white rounded-full shadow-md transition-transform duration-200"
                    style={{ width: 22, height: 22, top: 3, left: 3, transform: row.value ? 'translateX(24px)' : 'translateX(0)' }} />
                </button>
              </div>
            ))}

            {smsEnabled && (
              <div className="pt-2 pl-4 border-l-4 border-teal-100">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">{tr(t.settings.smsProvider)}</label>
                <div className="flex gap-2">
                  {['seven.io', 'Twilio'].map(p => (
                    <button
                      key={p}
                      onClick={() => setSmsProvider(p)}
                      className={`px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${smsProvider === p ? 'bg-teal-600 text-white border-teal-700' : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-teal-300'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="kc-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔔</span>
            <h2 className="font-black text-gray-800">{tr(t.settings.myNotifications)}</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: tr(t.settings.notifEmail), desc: tr(t.settings.notifEmailDesc), key: 'notifyEmail' as const },
              { label: tr(t.settings.notifPush),  desc: tr(t.settings.notifPushDesc),  key: 'notifyPush' as const },
              { label: tr(t.settings.notifSms),   desc: tr(t.settings.notifSmsDesc),   key: 'notifySms' as const },
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
          style={{ background: 'linear-gradient(135deg, #1D7A6F, #2EA89A)' }}
        >
          {saved ? tr(t.common.saved) : tr(t.common.save)}
        </button>

      </div>
    </div>
  )
}
