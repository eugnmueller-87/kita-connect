'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-teacher', full_name: 'Maria Schmidt', email: 'maria@kita-connect.de',
  role: 'teacher', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
const DATES = ['19.05.', '20.05.', '21.05.', '22.05.', '23.05.']

const CHILDREN = [
  { id: '1', name: 'Emma Müller',  gender: 'f' },
  { id: '2', name: 'Luca Becker',  gender: 'm' },
  { id: '3', name: 'Mia Fischer',  gender: 'f' },
  { id: '4', name: 'Noah Klein',   gender: 'm' },
]

const FEEDBACK_OPTIONS = [
  { value: 'great',   label: '😄 Alles aufgegessen',    color: '#E1F5EE', text: '#1D7A6F' },
  { value: 'good',    label: '🙂 Gut gegessen',          color: '#F0FFF4', text: '#166534' },
  { value: 'little',  label: '😐 Wenig gegessen',        color: '#FFF8E7', text: '#92400E' },
  { value: 'refused', label: '😕 Nicht gemocht',         color: '#FFF0F5', text: '#9D174D' },
]

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
  Montag:     { dish: 'Spaghetti Bolognese', kcal: 480, protein: 24, carbs: 58, fat: 12, vitamins: ['B12', 'Eisen'], allergens: ['Gluten', 'Sellerie'] },
  Dienstag:   { dish: 'Gemüsesuppe mit Brot', kcal: 320, protein: 12, carbs: 44, fat: 8, vitamins: ['C', 'A', 'Folsäure'], allergens: ['Gluten'] },
  Mittwoch:   { dish: 'Hähnchen mit Reis & Brokkoli', kcal: 520, protein: 38, carbs: 46, fat: 10, vitamins: ['B6', 'C', 'K'], allergens: [] },
  Donnerstag: { dish: 'Kartoffelauflauf', kcal: 440, protein: 18, carbs: 52, fat: 16, vitamins: ['C', 'B6', 'Kalzium'], allergens: ['Milch', 'Ei'] },
  Freitag:    { dish: 'Fischstäbchen mit Kartoffelpüree', kcal: 490, protein: 28, carbs: 48, fat: 18, vitamins: ['D', 'B12', 'Omega-3'], allergens: ['Fisch', 'Gluten', 'Milch'] },
}

type FeedbackMap = Record<string, Record<string, { status: string; note: string }>>

const initialFeedback: FeedbackMap = {
  Montag: {
    '1': { status: 'great', note: '' },
    '2': { status: 'good', note: '' },
    '3': { status: 'refused', note: 'Mag keine Bolognese' },
    '4': { status: 'great', note: '' },
  },
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

export default function TeacherMealsPage() {
  const [selectedDay, setSelectedDay] = useState('Montag')
  const [meals, setMeals] = useState<Record<string, Meal>>(initialMeals)
  const [feedback, setFeedback] = useState<FeedbackMap>(initialFeedback)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editMeal, setEditMeal] = useState<Meal>({ ...initialMeals.Montag })

  const meal = meals[selectedDay]
  const dayFeedback = feedback[selectedDay] ?? {}

  function startEdit() {
    setEditMeal({ ...meal })
    setEditing(true)
  }

  function saveEdit() {
    setMeals(prev => ({ ...prev, [selectedDay]: editMeal }))
    setEditing(false)
  }

  function setChildFeedback(childId: string, field: 'status' | 'note', value: string) {
    setFeedback(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [childId]: { ...(prev[selectedDay]?.[childId] ?? { status: '', note: '' }), [field]: value },
      },
    }))
  }

  function saveFeedback() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // DGE-Ampel: Qualitätsstandard für Verpflegung in Tageseinrichtungen für Kinder (2023)
  const dge = {
    kcal:    meal.kcal >= 530 && meal.kcal <= 600  ? 'green' : meal.kcal >= 450 && meal.kcal <= 680  ? 'yellow' : 'red',
    protein: meal.protein >= 15                     ? 'green' : meal.protein >= 10                    ? 'yellow' : 'red',
    fat:     meal.fat >= 17 && meal.fat <= 23       ? 'green' : meal.fat >= 12 && meal.fat <= 28      ? 'yellow' : 'red',
    carbs:   meal.carbs >= 70 && meal.carbs <= 80   ? 'green' : meal.carbs >= 55 && meal.carbs <= 95  ? 'yellow' : 'red',
  }
  const dgeColor:  Record<string, string> = { green: '#16a34a', yellow: '#d97706', red: '#dc2626' }
  const dgeBg:     Record<string, string> = { green: '#f0fdf4', yellow: '#fffbeb', red: '#fff1f2' }
  const dgeBorder: Record<string, string> = { green: '#bbf7d0', yellow: '#fde68a', red: '#fecdd3' }
  const dgeIcon:   Record<string, string> = { green: '✅', yellow: '⚠️', red: '❌' }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href="/teacher" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        {/* Header */}
        <div className="kc-card p-5 mb-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <span className="text-5xl">🍽️</span>
          <div>
            <h1 className="text-2xl font-black text-white">Speiseplan</h1>
            <p className="text-teal-200 text-sm font-semibold mt-0.5">KW 21 · 19.–23. Mai 2026</p>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                selectedDay === day
                  ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                  : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-teal-300'
              }`}
            >
              <span className="text-xs opacity-70">{DATES[i]}</span>
              <span>{day}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Meal card */}
          <div className="kc-card overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥘</span>
                <h2 className="font-black text-gray-800">{selectedDay}</h2>
              </div>
              <button onClick={startEdit} className="text-xs text-teal-600 font-bold hover:underline">✏️ Bearbeiten</button>
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
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit} className="kc-btn bg-teal-600 text-white text-sm font-black px-4 py-2">✅ Speichern</button>
                  <button onClick={() => setEditing(false)} className="kc-btn bg-gray-100 text-gray-600 text-sm font-black px-4 py-2">Abbrechen</button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <p className="font-black text-gray-800 text-lg mb-4">{meal.dish}</p>

                {/* DGE-Ampel */}
                <div className="mb-4 p-3 rounded-2xl border-2 border-[#EDE8DF] bg-gray-50">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">DGE-Richtwerte · Kinder 4–6 J.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([['kcal', 'Energie', `${meal.kcal} kcal`, '530–600'], ['protein', 'Eiweiß', `${meal.protein}g`, '≥15g'], ['fat', 'Fett', `${meal.fat}g`, '17–23g'], ['carbs', 'Kohlenh.', `${meal.carbs}g`, '70–80g']] as const).map(([key, label, val, ref]) => (
                      <div key={key} className="flex items-center gap-2 p-2 rounded-xl border" style={{ background: dgeBg[dge[key]], borderColor: dgeBorder[dge[key]] }}>
                        <span>{dgeIcon[dge[key]]}</span>
                        <div>
                          <p className="text-xs font-black text-gray-700">{label}</p>
                          <p className="text-xs font-bold" style={{ color: dgeColor[dge[key]] }}>{val} <span className="text-gray-400 font-normal">({ref})</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Richtwerte: DGE-Qualitätsstandard für Kita-Verpflegung. Keine medizinische Beratung.</p>
                </div>

                {/* Macros */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-black text-gray-500 mb-2">
                    <span>Kalorien</span><span className="text-gray-800 font-black">{meal.kcal} kcal</span>
                  </div>
                  <NutritionBar label="Eiweiß" value={meal.protein} max={50} color="#2EA89A" />
                  <NutritionBar label="Kohlenhydrate" value={meal.carbs} max={80} color="#FFD166" />
                  <NutritionBar label="Fett" value={meal.fat} max={40} color="#FF9FB2" />
                </div>

                {/* Vitamins & allergens */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {meal.vitamins.map(v => (
                    <span key={v} className="kc-badge bg-green-100 text-green-700 text-xs">✅ {v}</span>
                  ))}
                </div>
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

          {/* Child feedback */}
          <div className="kc-card overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">👶</span>
                <h2 className="font-black text-gray-800">Ess-Feedback</h2>
              </div>
              <button onClick={saveFeedback} className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all ${saved ? 'bg-teal-100 text-teal-700' : 'bg-teal-600 text-white'}`}>
                {saved ? '✅ Gespeichert' : '💾 Speichern'}
              </button>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {CHILDREN.map(child => {
                const fb = dayFeedback[child.id] ?? { status: '', note: '' }
                return (
                  <div key={child.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{ background: child.gender === 'f' ? '#FF9FB2' : '#7EC8E3' }}>
                        {child.name.split(' ')[0][0]}
                      </div>
                      <span className="font-black text-gray-800 text-sm">{child.name}</span>
                    </div>

                    {/* Status buttons */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {FEEDBACK_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setChildFeedback(child.id, 'status', opt.value)}
                          className="text-xs font-bold px-2 py-1.5 rounded-xl border-2 text-left transition-all"
                          style={{
                            background: fb.status === opt.value ? opt.color : 'white',
                            borderColor: fb.status === opt.value ? opt.text : '#EDE8DF',
                            color: fb.status === opt.value ? opt.text : '#6B7280',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Optional note */}
                    <input
                      value={fb.note}
                      onChange={e => setChildFeedback(child.id, 'note', e.target.value)}
                      placeholder="Kurze Notiz (optional)…"
                      className="kc-input w-full px-3 py-1.5 text-xs"
                    />
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
