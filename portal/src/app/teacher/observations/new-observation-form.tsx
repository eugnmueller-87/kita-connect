'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

interface Child { id: string; name: string }

export default function NewObservationForm({ children, lang = 'de' }: { children: Child[]; teacherId: string; lang?: Lang }) {
  const { tr } = useTranslation(lang)
  const [childId, setChildId] = useState('')
  const [category, setCategory] = useState('')
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const CATEGORIES = [
    { key: 'sprache', label: tr(t.obsCategories.language) },
    { key: 'motorik', label: tr(t.obsCategories.motor) },
    { key: 'sozial', label: tr(t.obsCategories.social) },
    { key: 'kreativitaet', label: tr(t.obsCategories.creative) },
    { key: 'mathematik', label: tr(t.obsCategories.mathNature) },
    { key: 'selbstaendigkeit', label: tr(t.obsCategories.independence) },
  ]

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
        <p className="font-black text-teal-700">{tr(t.teacherChild.obsSaved)}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-gray-600 mb-1">{tr(t.obsPage.childLabel)}</label>
          <select
            required
            value={childId}
            onChange={e => setChildId(e.target.value)}
            className="kc-input w-full px-4 py-3 text-sm"
          >
            <option value="">{tr(t.obsPage.childPlaceholder)}</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-600 mb-1">{tr(t.common.category)}</label>
          <select
            required
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="kc-input w-full px-4 py-3 text-sm"
          >
            <option value="">{tr(t.obsPage.categoryPlaceholder)}</option>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-gray-600 mb-1">{tr(t.obsPage.obsSituation)}</label>
        <textarea
          required
          rows={4}
          value={situation}
          onChange={e => setSituation(e.target.value)}
          placeholder={tr(t.obsPage.obsPlaceholder)}
          className="kc-input w-full px-4 py-3 text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="kc-btn bg-teal-600 disabled:opacity-50 text-white font-black text-sm px-6 py-3 hover:bg-teal-700 transition-colors"
      >
        {loading ? tr(t.common.saving) : tr(t.obsPage.saveBtn)}
      </button>
    </form>
  )
}
