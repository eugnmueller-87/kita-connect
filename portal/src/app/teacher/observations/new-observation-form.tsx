'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { key: 'sprache', label: '🗣️ Sprache' },
  { key: 'motorik', label: '🏃 Motorik' },
  { key: 'sozial', label: '🤝 Sozial' },
  { key: 'kreativitaet', label: '🎨 Kreativität' },
  { key: 'mathematik', label: '🔢 Mathe & Natur' },
  { key: 'selbstaendigkeit', label: '⭐ Selbständigkeit' },
]

interface Child { id: string; name: string }

export default function NewObservationForm({ children, teacherId }: { children: Child[]; teacherId: string }) {
  const router = useRouter()
  const [childId, setChildId] = useState('')
  const [category, setCategory] = useState('')
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/teacher/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId, category, situation, teacher_id: teacherId }),
      })
      if (!res.ok) throw new Error('Fehler beim Speichern')
      setChildId('')
      setCategory('')
      setSituation('')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-gray-600 mb-1">Kind</label>
          <select
            required
            value={childId}
            onChange={e => setChildId(e.target.value)}
            className="kc-input w-full px-4 py-3 text-sm"
          >
            <option value="">Kind auswählen…</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-600 mb-1">Kategorie</label>
          <select
            required
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="kc-input w-full px-4 py-3 text-sm"
          >
            <option value="">Kategorie wählen…</option>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-gray-600 mb-1">Situation / Beobachtung</label>
        <textarea
          required
          rows={4}
          value={situation}
          onChange={e => setSituation(e.target.value)}
          placeholder="Was haben Sie beobachtet? Beschreiben Sie die Situation…"
          className="kc-input w-full px-4 py-3 text-sm resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600 font-semibold">⚠️ {error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="kc-btn bg-teal-600 disabled:opacity-50 text-white font-black text-sm px-6 py-3 hover:bg-teal-700 transition-colors"
      >
        {loading ? '⏳ Wird gespeichert…' : '💾 Beobachtung speichern'}
      </button>
    </form>
  )
}
