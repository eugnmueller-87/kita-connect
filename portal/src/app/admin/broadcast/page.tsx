'use client'

import { useState } from 'react'

export default function BroadcastPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      if (!res.ok) throw new Error('Fehler beim Senden')
      setSent(true)
      setTitle('')
      setBody('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>

      <div className="max-w-2xl mx-auto px-4 py-8">

        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück zum Dashboard</a>

        {/* Hero */}
        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' }}>
          <div className="text-6xl flex-shrink-0">📢</div>
          <div>
            <h1 className="text-2xl font-black text-white">Broadcast senden</h1>
            <p className="text-red-200 font-semibold text-sm mt-1">An alle aktiven Eltern</p>
          </div>
        </div>

        {sent ? (
          <div className="kc-card px-6 py-12 text-center" style={{ background: '#E1F5EE' }}>
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-xl font-black text-gray-800 mb-2">Broadcast gesendet!</h2>
            <p className="text-gray-500 text-sm mb-6 font-semibold">
              Alle Eltern wurden benachrichtigt (In-App, E-Mail, SMS je nach Präferenz).
            </p>
            <button
              onClick={() => setSent(false)}
              className="kc-btn bg-teal-600 text-white font-black text-sm px-6 py-3 hover:bg-teal-700 transition-colors"
            >
              ✏️ Neue Mitteilung senden
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="kc-card p-6 space-y-5">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Betreff</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="z.B. Schließtag am 24. Dezember"
                className="kc-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Nachricht</label>
              <textarea
                required
                rows={5}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Text der Mitteilung…"
                className="kc-input w-full px-4 py-3 text-sm resize-none"
              />
            </div>

            {error && (
              <div className="kc-card px-4 py-3 bg-red-50 border-red-200 text-sm text-red-600 font-semibold">
                ⚠️ {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400 font-semibold">In-App + E-Mail + SMS</p>
              <button
                type="submit"
                disabled={loading}
                className="kc-btn bg-teal-600 disabled:opacity-50 text-white font-black px-6 py-3 text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors"
              >
                {loading ? '⏳ Wird gesendet…' : '📤 Senden'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
