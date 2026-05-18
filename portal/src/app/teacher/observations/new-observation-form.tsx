'use client'

import { useState } from 'react'

const CATEGORIES = [
  { key: 'sprache', label: '🗣️ Sprache' },
  { key: 'motorik', label: '🏃 Motorik' },
  { key: 'sozial', label: '🤝 Sozial' },
  { key: 'kreativitaet', label: '🎨 Kreativität' },
  { key: 'mathematik', label: '🔢 Mathe & Natur' },
  { key: 'selbstaendigkeit', label: '⭐ Selbständigkeit' },
]

interface Child { id: string; name: string }

export default function NewObservationForm({ children }: { children: Child[]; teacherId: string }) {
  const [childId, setChildId] = useState('')
  const [category, setCategory] = useState('')
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setChildId('')
      setCategory('')
      setSituation('')
    }, 2000)
  }

  if (saved) {
    return (
      <div className="py-6 text-center">
        <p className="text-4xl mb-2">✅</p>
        <p className="font-black text-teal-700">Beobachtung gespeichert!</p>
      </div>
    )
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
