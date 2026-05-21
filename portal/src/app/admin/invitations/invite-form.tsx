'use client'

import { useState } from 'react'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

type Kita = { id: string; name: string }

export default function InviteForm({
  lang = 'de',
  kitas = [],
  isSuperAdmin = false,
}: {
  lang?: Lang
  kitas?: Kita[]
  isSuperAdmin?: boolean
}) {
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'parent' | 'teacher' | 'admin'>('parent')
  const [kitaId, setKitaId] = useState('')
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
        body: JSON.stringify({ email, role, kita_id: kitaId || undefined }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Fehler beim Senden')
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

  const roles: Array<{ key: 'parent' | 'teacher' | 'admin'; emoji: string; label: string }> = [
    { key: 'parent', emoji: '👨‍👩‍👧', label: tr(t.common.role_parent) },
    { key: 'teacher', emoji: '👩‍🏫', label: tr(t.common.role_teacher) },
    ...(isSuperAdmin ? [{ key: 'admin' as const, emoji: '⚙️', label: tr(t.common.role_admin) }] : []),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rolle wählen */}
      <div className="flex gap-3">
        {roles.map(r => (
          <button key={r.key} type="button" onClick={() => setRole(r.key)}
              className="kc-card flex-1 p-3 flex items-center justify-center gap-2 text-sm font-black transition-all"
            style={role === r.key ? {
              background: '#2a9d8f',
              color: '#ffffff',
              borderColor: '#1D7A6F',
              boxShadow: '0 4px 0 0 #1D7A6F, 0 0 12px rgba(42,157,143,0.35)',
            } : { color: '#4b5563' }}>
            <span className="text-xl">{r.emoji}</span> {r.label}
          </button>
        ))}
      </div>

      {/* Kita-Auswahl — nur für super_admin sichtbar */}
      {isSuperAdmin && kitas.length > 0 && (
        <select value={kitaId} onChange={e => setKitaId(e.target.value)}
          className="kc-input w-full px-4 py-3 text-sm">
          <option value="">— Kita wählen (optional) —</option>
          {kitas.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
      )}

      <div className="flex gap-3">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder={tr(t.adminInvitations.emailPlaceholder)}
          className="kc-input flex-1 px-4 py-3 text-sm" />
        <button type="submit" disabled={loading || !email.trim()}
          className="kc-btn bg-teal-600 disabled:opacity-50 text-white font-black px-5 py-3 text-sm hover:bg-teal-700 transition-colors">
          {loading ? '⏳' : tr(t.adminInvitations.sendBtn)}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 font-semibold">⚠️ {error}</p>}
    </form>
  )
}
