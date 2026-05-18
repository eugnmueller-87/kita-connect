'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { Loader2 } from 'lucide-react'
import type { Profile } from '@/types'

const SUGGESTED = [
  'Wie lange dauert die Eingewöhnung?',
  'Was passiert bei Krankheit meines Kindes?',
  'Wann beginnt die Mittagsruhe?',
  'Wie melde ich mein Kind krank?',
]

export default function FaqPage({ profile }: { profile: Profile }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [source, setSource] = useState<'cache' | 'claude' | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function ask(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setAnswer('')
    setError('')
    setSource('')
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setAnswer(data.answer)
      setSource(data.source)
    } catch {
      setError('Fehler beim Laden der Antwort.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
          <div className="text-6xl flex-shrink-0">🤖</div>
          <div>
            <h1 className="text-2xl font-black text-white">Fragen & Antworten</h1>
            <p className="text-purple-200 font-semibold text-sm mt-1">KI-Assistent für Kita-Fragen</p>
          </div>
        </div>

        <div className="kc-card p-5 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask(question)}
              placeholder="Ihre Frage eingeben…"
              className="kc-input flex-1 px-4 py-3 text-sm"
            />
            <button
              onClick={() => ask(question)}
              disabled={loading || !question.trim()}
              className="kc-btn bg-teal-600 disabled:opacity-50 text-white px-5 py-3 font-black transition-colors hover:bg-teal-700"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : '🔍'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <p className="text-xs font-black text-gray-400 w-full mb-1">Häufige Fragen:</p>
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => { setQuestion(s); ask(s) }}
                className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-3 py-1.5 rounded-full transition-colors border-2 border-teal-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="kc-card px-5 py-4 mb-4 bg-red-50 border-red-200 text-sm text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="kc-card px-5 py-8 mb-4 text-center">
            <div className="text-4xl mb-3 animate-bounce">🤔</div>
            <p className="text-gray-500 font-semibold text-sm">KI denkt nach…</p>
          </div>
        )}

        {answer && !loading && (
          <div className="kc-card p-6" style={{ background: 'linear-gradient(135deg, #F0F4FF, #EDE8FF)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💡</span>
              <span className="font-black text-gray-700">Antwort</span>
              <span className="kc-badge bg-purple-100 text-purple-700 text-xs ml-auto">
                {source === 'cache' ? '📚 Häufige Fragen' : '🤖 KI-Assistent'}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
            <p className="text-xs text-gray-400 font-semibold mt-4 pt-4 border-t border-purple-100">
              Kein Ersatz für Rücksprache mit dem Kita-Team.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
