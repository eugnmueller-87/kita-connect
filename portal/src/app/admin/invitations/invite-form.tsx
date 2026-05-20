'use client'

import { useState } from 'react'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

export default function InviteForm({ lang = 'de' }: { lang?: Lang }) {
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'parent' | 'teacher'>('parent')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      if (!res.ok) throw new Error('Fehler beim Senden')
      setSent(true)
      setEmail('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-black text-gray-800 mb-1">{tr(t.adminInvitations.sentSuccess)}</p>
        <button onClick={() => setSent(false)} className="text-teal-600 text-sm font-bold hover:underline mt-2">
          {tr(t.adminInvitations.sendAnother)}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setRole('parent')}
          className={`kc-card flex-1 p-3 flex items-center justify-center gap-2 text-sm font-black transition-all ${
            role === 'parent' ? 'bg-teal-600 text-white border-teal-700' : 'text-gray-600 hover:bg-teal-50'
          }`}
        >
          <span className="text-xl">👨‍👩‍👧</span> {tr(t.common.role_parent)}
        </button>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`kc-card flex-1 p-3 flex items-center justify-center gap-2 text-sm font-black transition-all ${
            role === 'teacher' ? 'bg-teal-600 text-white border-teal-700' : 'text-gray-600 hover:bg-teal-50'
          }`}
        >
          <span className="text-xl">👩‍🏫</span> {tr(t.common.role_teacher)}
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={tr(t.adminInvitations.emailPlaceholder)}
          className="kc-input flex-1 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="kc-btn bg-teal-600 disabled:opacity-50 text-white font-black px-5 py-3 text-sm hover:bg-teal-700 transition-colors"
        >
          {loading ? '⏳' : tr(t.adminInvitations.sendBtn)}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 font-semibold">⚠️ {error}</p>
      )}
    </form>
  )
}
