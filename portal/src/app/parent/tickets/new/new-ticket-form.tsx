'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { emoji: '🏥', label: 'Gesundheit & Krankheit' },
  { emoji: '🍽️', label: 'Essen & Ernährung' },
  { emoji: '📅', label: 'Termine & Abwesenheit' },
  { emoji: '📖', label: 'Entwicklung & Lernen' },
  { emoji: '💬', label: 'Allgemeine Frage' },
  { emoji: '❓', label: 'Sonstiges' },
]

export default function NewTicketForm() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      if (!res.ok) throw new Error('Fehler beim Erstellen')
      const data = await res.json()
      router.push(`/parent/tickets/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="kc-card p-6 space-y-5">

      <div>
        <label className="block text-sm font-black text-gray-700 mb-2">Kategorie</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              type="button"
              onClick={() => setCategory(c.label)}
              className={`kc-card p-3 flex items-center gap-2 text-sm font-bold transition-all ${
                category === c.label
                  ? 'bg-teal-600 text-white border-teal-700'
                  : 'hover:bg-teal-50 text-gray-700'
              }`}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className="text-xs">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-black text-gray-700 mb-2">Betreff</label>
        <input
          type="text"
          required
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Kurze Beschreibung des Anliegens"
          className="kc-input w-full px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-black text-gray-700 mb-2">Nachricht</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Beschreiben Sie Ihr Anliegen…"
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
        {loading ? '⏳ Wird gesendet…' : '📤 Anfrage senden'}
      </button>
    </form>
  )
}
