'use client'

import { useState } from 'react'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

type Traeger = { id: string; name: string; city?: string }
type Kita = {
  id: string; name: string; city?: string; phone?: string; email?: string
  max_children?: number; status: string; traeger_id?: string
  traeger?: { id: string; name: string } | null
}

export default function KitaManager({
  initialKitas, initialTraeger, lang,
}: {
  initialKitas: Kita[]
  initialTraeger: Traeger[]
  lang: Lang
}) {
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  const [kitas, setKitas] = useState<Kita[]>(initialKitas)
  const [traegerList, setTraegerList] = useState<Traeger[]>(initialTraeger)
  const [tab, setTab] = useState<'kitas' | 'traeger'>('kitas')

  // Kita form
  const [kitaForm, setKitaForm] = useState({ name: '', address: '', city: '', phone: '', email: '', max_children: '50', traeger_id: '' })
  const [kitaSaving, setKitaSaving] = useState(false)
  const [kitaSaved, setKitaSaved] = useState(false)
  const [kitaError, setKitaError] = useState('')

  // Träger form
  const [traegerForm, setTraegerForm] = useState({ name: '', address: '', city: '', phone: '', email: '' })
  const [traegerSaving, setTraegerSaving] = useState(false)
  const [traegerSaved, setTraegerSaved] = useState(false)
  const [traegerError, setTraegerError] = useState('')

  async function saveKita(e: React.FormEvent) {
    e.preventDefault()
    setKitaSaving(true); setKitaError('')
    try {
      const res = await fetch('/api/admin/kitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...kitaForm, max_children: parseInt(kitaForm.max_children) || 50 }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const created = await res.json()
      const matchedTraeger = traegerList.find(t => t.id === kitaForm.traeger_id) ?? null
      setKitas(prev => [...prev, { ...created, traeger: matchedTraeger }])
      setKitaForm({ name: '', address: '', city: '', phone: '', email: '', max_children: '50', traeger_id: '' })
      setKitaSaved(true); setTimeout(() => setKitaSaved(false), 2000)
    } catch (err: unknown) {
      setKitaError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setKitaSaving(false)
    }
  }

  async function saveTraeger(e: React.FormEvent) {
    e.preventDefault()
    setTraegerSaving(true); setTraegerError('')
    try {
      const res = await fetch('/api/admin/traeger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(traegerForm),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const created = await res.json()
      setTraegerList(prev => [...prev, created])
      setTraegerForm({ name: '', address: '', city: '', phone: '', email: '' })
      setTraegerSaved(true); setTimeout(() => setTraegerSaved(false), 2000)
    } catch (err: unknown) {
      setTraegerError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setTraegerSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {(['kitas', 'traeger'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`kc-btn px-5 py-2 text-sm font-black transition-all ${tab === tabKey ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-50'}`}
          >
            {tabKey === 'kitas' ? '🏫 Kitas' : '🏢 Träger'}
          </button>
        ))}
      </div>

      {tab === 'kitas' && (
        <>
          {/* Neue Kita anlegen */}
          <div className="kc-card p-6">
            <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
              <span>➕</span> {tr(t.adminKitas.newKita)}
            </h2>
            <form onSubmit={saveKita} className="grid grid-cols-2 gap-3">
              <input required placeholder={tr(t.adminKitas.kitaName)} value={kitaForm.name}
                onChange={e => setKitaForm(f => ({ ...f, name: e.target.value }))}
                className="kc-input px-4 py-3 text-sm col-span-2" />
              <input placeholder={tr(t.adminKitas.address)} value={kitaForm.address}
                onChange={e => setKitaForm(f => ({ ...f, address: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <input placeholder={tr(t.adminKitas.city)} value={kitaForm.city}
                onChange={e => setKitaForm(f => ({ ...f, city: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <input placeholder={tr(t.adminKitas.phone)} value={kitaForm.phone}
                onChange={e => setKitaForm(f => ({ ...f, phone: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <input type="email" placeholder={tr(t.adminKitas.email)} value={kitaForm.email}
                onChange={e => setKitaForm(f => ({ ...f, email: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <input type="number" min="1" max="500" placeholder={tr(t.adminKitas.maxChildren)} value={kitaForm.max_children}
                onChange={e => setKitaForm(f => ({ ...f, max_children: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <select value={kitaForm.traeger_id}
                onChange={e => setKitaForm(f => ({ ...f, traeger_id: e.target.value }))}
                className="kc-input px-4 py-3 text-sm">
                <option value="">{tr(t.adminKitas.noTraeger)}</option>
                {traegerList.map(tr => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
              </select>
              <div className="col-span-2 flex items-center gap-3">
                <button type="submit" disabled={kitaSaving}
                  className="kc-btn bg-teal-600 text-white font-black px-5 py-3 text-sm hover:bg-teal-700 disabled:opacity-50">
                  {kitaSaving ? '⏳' : kitaSaved ? '✅ ' + tr(t.adminKitas.savedOk) : tr(t.adminKitas.saveBtn)}
                </button>
                {kitaError && <p className="text-red-600 text-sm font-semibold">⚠️ {kitaError}</p>}
              </div>
            </form>
          </div>

          {/* Kita-Liste */}
          <div className="kc-card overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
              <span className="text-xl">🏫</span>
              <h2 className="font-black text-gray-800">Kitas ({kitas.length})</h2>
            </div>
            {kitas.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 font-semibold">{tr(t.adminKitas.noKitas)}</p>
            ) : (
              <div className="divide-y divide-[#EDE8DF]">
                {kitas.map(kita => (
                  <div key={kita.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-gray-800">{kita.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {kita.city && `${kita.city} · `}
                        {kita.traeger ? `🏢 ${kita.traeger.name} · ` : ''}
                        Max. {kita.max_children ?? 50} Kinder
                      </p>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${kita.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {kita.status === 'active' ? tr(t.adminKitas.status_active) : tr(t.adminKitas.status_suspended)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'traeger' && (
        <>
          {/* Neuen Träger anlegen */}
          <div className="kc-card p-6">
            <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
              <span>➕</span> {tr(t.adminKitas.newTraeger)}
            </h2>
            <form onSubmit={saveTraeger} className="grid grid-cols-2 gap-3">
              <input required placeholder={tr(t.adminKitas.traegerName)} value={traegerForm.name}
                onChange={e => setTraegerForm(f => ({ ...f, name: e.target.value }))}
                className="kc-input px-4 py-3 text-sm col-span-2" />
              <input placeholder={tr(t.adminKitas.address)} value={traegerForm.address}
                onChange={e => setTraegerForm(f => ({ ...f, address: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <input placeholder={tr(t.adminKitas.city)} value={traegerForm.city}
                onChange={e => setTraegerForm(f => ({ ...f, city: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <input placeholder={tr(t.adminKitas.phone)} value={traegerForm.phone}
                onChange={e => setTraegerForm(f => ({ ...f, phone: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <input type="email" placeholder={tr(t.adminKitas.email)} value={traegerForm.email}
                onChange={e => setTraegerForm(f => ({ ...f, email: e.target.value }))}
                className="kc-input px-4 py-3 text-sm" />
              <div className="col-span-2 flex items-center gap-3">
                <button type="submit" disabled={traegerSaving}
                  className="kc-btn bg-teal-600 text-white font-black px-5 py-3 text-sm hover:bg-teal-700 disabled:opacity-50">
                  {traegerSaving ? '⏳' : traegerSaved ? '✅ ' + tr(t.adminKitas.savedOk) : tr(t.adminKitas.saveBtn)}
                </button>
                {traegerError && <p className="text-red-600 text-sm font-semibold">⚠️ {traegerError}</p>}
              </div>
            </form>
          </div>

          {/* Träger-Liste */}
          <div className="kc-card overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
              <span className="text-xl">🏢</span>
              <h2 className="font-black text-gray-800">Träger ({traegerList.length})</h2>
            </div>
            {traegerList.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 font-semibold">{tr(t.adminKitas.noTraegers)}</p>
            ) : (
              <div className="divide-y divide-[#EDE8DF]">
                {traegerList.map(tr => (
                  <div key={tr.id} className="px-5 py-4">
                    <p className="font-black text-gray-800">{tr.name}</p>
                    {tr.city && <p className="text-xs text-gray-500 mt-0.5">{tr.city}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
