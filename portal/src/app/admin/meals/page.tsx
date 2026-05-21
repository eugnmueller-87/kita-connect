'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/client'
import { useProfileSettings } from '@/lib/useProfileSettings'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Profile } from '@/types'

const DAY_KEYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedDay, setSelectedDay] = useState('Montag')
  const [meals, setMeals] = useState<Record<string, Meal>>(initialMeals)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editMeal, setEditMeal] = useState<Meal>({ ...initialMeals.Montag })

  const { settings } = useProfileSettings(profile?.id ?? 'guest')
  const { tr } = useTranslation(settings.lang)

  const DAYS = [
    tr(t.meals.days.monday),
    tr(t.meals.days.tuesday),
    tr(t.meals.days.wednesday),
    tr(t.meals.days.thursday),
    tr(t.meals.days.friday),
  ]

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) setProfile(p as Profile)

      const monday = getMonday()
      const { data: mealData } = await supabase
        .from('meals')
        .select('*')
        .gte('date', monday)
        .lt('date', addDays(monday, 5))

      if (mealData && mealData.length > 0) {
        const mapped: Record<string, Meal> = {}
        mealData.forEach((m: { date: string; dish: string; kcal: number; protein: number; carbs: number; fat: number; vitamins: string[]; allergens: string[] }) => {
          const dayIndex = new Date(m.date).getDay() - 1
          const dayKey = DAY_KEYS[dayIndex]
          if (dayKey) mapped[dayKey] = { dish: m.dish, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat, vitamins: m.vitamins ?? [], allergens: m.allergens ?? [] }
        })
        setMeals(prev => ({ ...prev, ...mapped }))
      }
    }
    load()
  }, [])

  function getMonday() {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  function addDays(dateStr: string, days: number) {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  const meal = meals[selectedDay]

  function startEdit() {
    setEditMeal({ ...meal })
    setEditing(true)
  }

  async function saveEdit() {
    setMeals(prev => ({ ...prev, [selectedDay]: editMeal }))
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    const supabase = createClient()
    const dayIndex = DAY_KEYS.indexOf(selectedDay)
    const monday = getMonday()
    const mealDate = addDays(monday, dayIndex)
    await supabase.from('meals').upsert({
      date: mealDate,
      dish: editMeal.dish,
      kcal: editMeal.kcal,
      protein: editMeal.protein,
      carbs: editMeal.carbs,
      fat: editMeal.fat,
      vitamins: editMeal.vitamins,
      allergens: editMeal.allergens,
    }, { onConflict: 'date' })
  }

  const dge = {
    kcal:    meal.kcal >= 530 && meal.kcal <= 600   ? 'green' : meal.kcal >= 450 && meal.kcal < 530 || meal.kcal > 600 && meal.kcal <= 680 ? 'yellow' : 'red',
    protein: meal.protein >= 15                      ? 'green' : meal.protein >= 10                                                          ? 'yellow' : 'red',
    fat:     meal.fat >= 17 && meal.fat <= 23        ? 'green' : meal.fat >= 12 && meal.fat < 17 || meal.fat > 23 && meal.fat <= 28          ? 'yellow' : 'red',
    carbs:   meal.carbs >= 70 && meal.carbs <= 80    ? 'green' : meal.carbs >= 55 && meal.carbs < 70 || meal.carbs > 80 && meal.carbs <= 95  ? 'yellow' : 'red',
  }
  const dgeColor:   Record<string, string> = { green: '#16a34a', yellow: '#d97706', red: '#dc2626' }
  const dgeBg:      Record<string, string> = { green: '#f0fdf4', yellow: '#fffbeb', red: '#fff1f2' }
  const dgeBorder:  Record<string, string> = { green: '#bbf7d0', yellow: '#fde68a', red: '#fecdd3' }
  const dgeLabel:   Record<string, string> = { green: '✅', yellow: '⚠️', red: '❌' }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      {profile && <Navbar profile={profile} unreadCount={0} lang={settings.lang} />}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-5 mb-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #2a9d8f, #457b9d)' }}>
          <span className="text-5xl">🍽️</span>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.meals.manageHeading)}</h1>
            <p className="text-white/70 font-semibold text-sm mt-0.5">KW 21 · 19.–23. Mai 2026 · {tr(t.teacherDash.allGroups)}</p>
          </div>
          {saved && (
            <span className="ml-auto bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-xl">{tr(t.common.mealSaved)}</span>
          )}
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {DAYS.map((day, i) => (
            <button
              key={DAY_KEYS[i]}
              onClick={() => { setSelectedDay(DAY_KEYS[i]); setEditing(false) }}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                selectedDay === DAY_KEYS[i]
                  ? 'bg-red-500 text-white border-red-600 shadow-md'
                  : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-red-300'
              }`}
            >
              <span className="text-xs opacity-70">{DATES[i]}</span>
              <span>{day}</span>
            </button>
          ))}
        </div>

        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥘</span>
              <h2 className="font-black text-gray-800">{DAYS[DAY_KEYS.indexOf(selectedDay)]}, {DATES[DAY_KEYS.indexOf(selectedDay)]}2026</h2>
            </div>
            {!editing && (
              <button onClick={startEdit} className="text-xs text-red-500 font-bold hover:underline">{tr(t.common.edit)}</button>
            )}
          </div>

          {editing ? (
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">{tr(t.meals.dish)}</label>
                <input value={editMeal.dish} onChange={e => setEditMeal(p => ({ ...p, dish: e.target.value }))} className="kc-input w-full px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['kcal', 'protein', 'carbs', 'fat'] as const).map(f => (
                  <div key={f}>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                      {f === 'kcal' ? tr(t.meals.caloriesShort) : f === 'protein' ? tr(t.meals.proteinShort) : f === 'carbs' ? tr(t.meals.carbsShort) : tr(t.meals.fatShort)}
                    </label>
                    <input type="number" value={editMeal[f]}
                      onChange={e => setEditMeal(p => ({ ...p, [f]: Number(e.target.value) }))}
                      className="kc-input w-full px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">{tr(t.meals.vitamins)}</label>
                <input value={editMeal.vitamins.join(', ')}
                  onChange={e => setEditMeal(p => ({ ...p, vitamins: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))}
                  className="kc-input w-full px-3 py-2 text-sm" placeholder={tr(t.meals.vitaminPlaceholder)} />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">{tr(t.meals.allergens)}</label>
                <input value={editMeal.allergens.join(', ')}
                  onChange={e => setEditMeal(p => ({ ...p, allergens: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))}
                  className="kc-input w-full px-3 py-2 text-sm" placeholder={tr(t.meals.allergenPlaceholder)} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} className="kc-btn bg-red-500 text-white text-sm font-black px-4 py-2">{tr(t.common.saveMeal)}</button>
                <button onClick={() => setEditing(false)} className="kc-btn bg-gray-100 text-gray-600 text-sm font-black px-4 py-2">{tr(t.common.cancel)}</button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <p className="font-black text-gray-800 text-xl mb-4">{meal.dish}</p>

              <div className="mb-4 p-3 rounded-2xl border-2 border-[#EDE8DF] bg-gray-50">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{tr(t.meals.dgeLabel)}</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['kcal',    tr(t.meals.calories), `${meal.kcal} kcal`, '530–600'],
                    ['protein', tr(t.meals.protein),  `${meal.protein}g`,  '≥ 15g'],
                    ['fat',     tr(t.meals.fat),      `${meal.fat}g`,      '17–23g'],
                    ['carbs',   tr(t.meals.carbs),    `${meal.carbs}g`,    '70–80g'],
                  ] as const).map(([key, label, val, ref]) => (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-xl border" style={{ background: dgeBg[dge[key]], borderColor: dgeBorder[dge[key]] }}>
                      <span className="text-base">{dgeLabel[dge[key]]}</span>
                      <div>
                        <p className="text-xs font-black text-gray-700">{label}</p>
                        <p className="text-xs font-bold" style={{ color: dgeColor[dge[key]] }}>{val} <span className="text-gray-400 font-normal">({ref})</span></p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">{tr(t.meals.dgeDisclaimer)}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-black text-gray-500 mb-2">
                  <span>{tr(t.meals.calories)}</span><span className="text-gray-800">{meal.kcal} kcal</span>
                </div>
                <NutritionBar label={tr(t.meals.protein)} value={meal.protein} max={50} color="#2EA89A" />
                <NutritionBar label={tr(t.meals.carbs)} value={meal.carbs} max={80} color="#FFD166" />
                <NutritionBar label={tr(t.meals.fat)} value={meal.fat} max={40} color="#FF9FB2" />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {meal.vitamins.map(v => (
                  <span key={v} className="kc-badge bg-green-100 text-green-700 text-xs">✅ {v}</span>
                ))}
                {meal.vitamins.length === 0 && <span className="text-xs text-gray-400 font-semibold">{tr(t.common.noEntries)}</span>}
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

        <div className="kc-card p-5 mt-5">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{tr(t.meals.weekOverview)}</p>
          <div className="space-y-2">
            {DAY_KEYS.map((dayKey, i) => {
              const m = meals[dayKey]
              const kcalOk = m.kcal >= 530 && m.kcal <= 600
              const protOk = m.protein >= 15
              const ampel = kcalOk && protOk ? '✅' : (!kcalOk || !protOk) ? '⚠️' : '❌'
              return (
                <button key={dayKey} onClick={() => { setSelectedDay(dayKey); setEditing(false) }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all hover:border-red-300 ${selectedDay === dayKey ? 'border-red-400 bg-red-50' : 'border-[#EDE8DF] bg-white'}`}>
                  <span className="text-xs font-black text-gray-400 w-6 text-center">{DATES[i]}</span>
                  <span className="font-black text-gray-700 text-sm w-24">{DAYS[i]}</span>
                  <span className="flex-1 text-xs text-gray-500 font-semibold truncate">{m.dish}</span>
                  <span className="text-xs font-black flex-shrink-0">{ampel} {m.kcal} kcal</span>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
