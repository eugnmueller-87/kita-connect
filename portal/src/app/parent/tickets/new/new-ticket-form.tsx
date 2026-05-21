'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

export default function NewTicketForm({ lang = 'de' }: { lang?: Lang }) {
  const router = useRouter()
  const { tr } = useTranslation(lang)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const CATEGORIES = [
    { emoji: '🏥', label: tr(t.tickets.categories.health) },
    { emoji: '🍽️', label: tr(t.tickets.categories.food) },
    { emoji: '📅', label: tr(t.tickets.categories.dates) },
    { emoji: '📖', label: tr(t.tickets.categories.development) },
    { emoji: '💬', label: tr(t.tickets.categories.general) },
    { emoji: '❓', label: tr(t.tickets.categories.other) },
  ]

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler beim Erstellen')
      router.push(`/parent/tickets/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="kc-card p-6 space-y-5">

      <div>
        <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.category)}</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              type="button"
              onClick={() => setCategory(c.label)}
              style={category === c.label ? {
                background: '#2a9d8f',
                color: '#ffffff',
                borderColor: '#1D7A6F',
                boxShadow: '0 4px 0 0 #1D7A6F, 0 0 12px rgba(42,157,143,0.45)',
              } : {}}
              className={`kc-card p-3 flex items-center gap-2 text-sm font-bold transition-all ${
                category === c.label
                  ? ''
                  : 'hover:border-teal-300 hover:shadow-[0_4px_0_0_#D4C9BA,0_0_8px_rgba(42,157,143,0.2)] text-gray-700'
              }`}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className="text-xs">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.subject)}</label>
        <input
          type="text"
          required
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder={tr(t.tickets.subjectPlaceholder)}
          className="kc-input w-full px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.message)}</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={tr(t.tickets.messagePlaceholder)}
          className="kc-input w-full px-4 py-3 text-sm resize-none"
        />
      </div>

      {error && (
        <div className="kc-card px-4 py-3 bg-red-50 border-red-200 text-sm text-red-600 font-semibold">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !subject.trim() || !message.trim()}
        className="kc-btn w-full bg-teal-600 disabled:opacity-50 text-white font-black py-3.5 text-sm hover:bg-teal-700 transition-colors"
      >
        {loading ? tr(t.common.sending) : tr(t.tickets.submitBtn)}
      </button>
    </form>
  )
}
