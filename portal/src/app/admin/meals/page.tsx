'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-admin', full_name: 'Admin Nutzer', email: 'admin@kita-connect.de',
  role: 'admin', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
const DATES = ['19.05.', '20.05.', '21.05.', '22.05.', '23.05.']

interface Meal {
  dish: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  vitamins: string[]
  allergens: string[]
}

const initialMeals: Record<string, Meal> = {
  Montag:     { dish: 'Spaghetti Bolognese',              kcal: 480, protein: 24, carbs: 58, fat: 12, vitamins: ['B12', 'Eisen'],        allergens: ['Gluten', 'Sellerie'] },
  Dienstag:   { dish: 'Gemüsesuppe mit Brot',             kcal: 320, protein: 12, carbs: 44, fat: 8,  vitamins: ['C', 'A', 'Folsäure'],  allergens: ['Gluten'] },
  Mittwoch:   { dish: 'Hähnchen mit Reis & Brokkoli',     kcal: 520, protein: 38, carbs: 46, fat: 10, vitamins: ['B6', 'C', 'K'],        allergens: [] },
  Donnerstag: { dish: 'Kartoffelauflauf',                 kcal: 440, protein: 18, carbs: 52, fat: 16, vitamins: ['C', 'B6', 'Kalzium'],  allergens: ['Milch', 'Ei'] },
  Freitag:    { dish: 'Fischstäbchen mit Kartoffelpüree', kcal: 490, protein: 28, carbs: 48, fat: 18, vitamins: ['D', 'B12', 'Omega-3'], allergens: ['Fisch', 'Gluten', 'Milch'] },
}

function NutritionBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
        <span>{label}</span><span>{value}g</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
      </div>
    </div>
  )
}

export default function AdminMealsPage() {
  const [selectedDay, setSelectedDay] = useState('Montag')
  const [meals, setMeals] = useState<Record<string, Meal>>(initialMeals)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editMeal, setEditMeal] = useState<Meal>({ ...initialMeals.Montag })

  const meal = meals[selectedDay]

  function startEdit() {
    setEditMeal({ ...meal })
    setEditing(true)
  }

  function saveEdit() {
    setMeals(prev => ({ ...prev, [selectedDay]: editMeal }))
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const score = Math.min(100, Math.round(
    (meal.protein / 40) * 35 +
    (meal.vitamins.length / 4) * 35 +
    (meal.kcal >= 300 && meal.kcal <= 600 ? 30 : 10)
  ))
  const scoreColor = score >= 75 ? '#1D7A6F' : score >= 50 ? '#92400E' : '#9D174D'
  const scoreLabel = score >= 75 ? '🌟 Sehr gut' : score >= 50 ? '👍 Gut' : '⚠️ Ausbaufähig'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        {/* Header */}
        <div className="kc-card p-5 mb-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' }}>
          <span className="text-5xl">🍽️</span>
          <div>
            <h1 className="text-2xl font-black text-white">Speiseplan verwalten</h1>
            <p className="text-red-200 font-semibold text-sm mt-0.5">KW 21 · 19.–23. Mai 2026 · Alle Gruppen</p>
          </div>
          {saved && (
            <span className="ml-auto bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-xl">✅ Gespeichert</span>
          )}
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => { setSelectedDay(day); setEditing(false) }}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                selectedDay === day
                  ? 'bg-red-500 text-white border-red-600 shadow-md'
                  : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-red-300'
              }`}
            >
              <span className="text-xs opacity-70">{DATES[i]}</span>
              <span>{day}</span>
            </button>
          ))}
        </div>

        {/* Meal card */}
        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥘</span>
              <h2 className="font-black text-gray-800">{selectedDay}, {DATES[DAYS.indexOf(selectedDay)]}2026</h2>
            </div>
            {!editing && (
              <button onClick={startEdit} className="text-xs text-red-500 font-bold hover:underline">✏️ Bearbeiten</button>
            )}
          </div>

          {editing ? (
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Gericht</label>
                <input value={editMeal.dish} onChange={e => setEditMeal(p => ({ ...p, dish: e.target.value }))} className="kc-input w-full px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['kcal', 'protein', 'carbs', 'fat'] as const).map(f => (
                  <div key={f}>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                      {f === 'kcal' ? 'Kalorien (kcal)' : f === 'protein' ? 'Eiweiß (g)' : f === 'carbs' ? 'Kohlenh. (g)' : 'Fett (g)'}
                    </label>
                    <input type="number" value={editMeal[f]}
                      onChange={e => setEditMeal(p => ({ ...p, [f]: Number(e.target.value) }))}
                      className="kc-input w-full px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Vitamine (kommagetrennt)</label>
                <input value={editMeal.vitamins.join(', ')}
                  onChange={e => setEditMeal(p => ({ ...p, vitamins: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))}
                  className="kc-input w-full px-3 py-2 text-sm" placeholder="z.B. B12, C, Eisen" />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Allergene (kommagetrennt)</label>
                <input value={editMeal.allergens.join(', ')}
                  onChange={e => setEditMeal(p => ({ ...p, allergens: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))}
                  className="kc-input w-full px-3 py-2 text-sm" placeholder="z.B. Gluten, Milch" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} className="kc-btn bg-red-500 text-white text-sm font-black px-4 py-2">✅ Speichern</button>
                <button onClick={() => setEditing(false)} className="kc-btn bg-gray-100 text-gray-600 text-sm font-black px-4 py-2">Abbrechen</button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <p className="font-black text-gray-800 text-xl mb-4">{meal.dish}</p>

              {/* Score */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl border-2" style={{ background: '#F0FFF8', borderColor: '#C6F6D5' }}>
                <div className="text-center flex-shrink-0">
                  <div className="text-3xl font-black" style={{ color: scoreColor }}>{score}</div>
                  <div className="text-[10px] font-black text-gray-400">/ 100</div>
                </div>
                <div>
                  <p className="font-black text-sm text-gray-800">Nährwert-Score</p>
                  <p className="text-xs font-bold" style={{ color: scoreColor }}>{scoreLabel}</p>
                </div>
                <div className="ml-auto text-2xl">{score >= 75 ? '🌟' : score >= 50 ? '👍' : '⚠️'}</div>
              </div>

              {/* Macros */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-black text-gray-500 mb-2">
                  <span>Kalorien</span><span className="text-gray-800">{meal.kcal} kcal</span>
                </div>
                <NutritionBar label="Eiweiß" value={meal.protein} max={50} color="#2EA89A" />
                <NutritionBar label="Kohlenhydrate" value={meal.carbs} max={80} color="#FFD166" />
                <NutritionBar label="Fett" value={meal.fat} max={40} color="#FF9FB2" />
              </div>

              {/* Vitamins */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {meal.vitamins.map(v => (
                  <span key={v} className="kc-badge bg-green-100 text-green-700 text-xs">✅ {v}</span>
                ))}
                {meal.vitamins.length === 0 && <span className="text-xs text-gray-400 font-semibold">Keine Angaben</span>}
              </div>

              {/* Allergens */}
              {meal.allergens.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {meal.allergens.map(a => (
                    <span key={a} className="kc-badge bg-red-50 text-red-500 text-xs">⚠️ {a}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Week overview */}
        <div className="kc-card p-5 mt-5">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Wochenübersicht</p>
          <div className="space-y-2">
            {DAYS.map((day, i) => {
              const m = meals[day]
              const s = Math.min(100, Math.round((m.protein / 40) * 35 + (m.vitamins.length / 4) * 35 + (m.kcal >= 300 && m.kcal <= 600 ? 30 : 10)))
              return (
                <button key={day} onClick={() => { setSelectedDay(day); setEditing(false) }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all hover:border-red-300 ${selectedDay === day ? 'border-red-400 bg-red-50' : 'border-[#EDE8DF] bg-white'}`}>
                  <span className="text-xs font-black text-gray-400 w-6 text-center">{DATES[i]}</span>
                  <span className="font-black text-gray-700 text-sm w-20">{day}</span>
                  <span className="flex-1 text-xs text-gray-500 font-semibold truncate">{m.dish}</span>
                  <span className="text-xs font-black flex-shrink-0" style={{ color: s >= 75 ? '#1D7A6F' : s >= 50 ? '#92400E' : '#9D174D' }}>
                    {s >= 75 ? '🌟' : s >= 50 ? '👍' : '⚠️'} {s}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
