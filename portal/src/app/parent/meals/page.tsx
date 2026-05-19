'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-parent', full_name: 'Anna Müller', email: 'anna@example.de',
  role: 'parent', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
const DATES = ['19.05.', '20.05.', '21.05.', '22.05.', '23.05.']

const meals = {
  Montag:     { dish: 'Spaghetti Bolognese',              kcal: 480, protein: 24, carbs: 58, fat: 12, vitamins: ['B12', 'Eisen'],           allergens: ['Gluten', 'Sellerie'] },
  Dienstag:   { dish: 'Gemüsesuppe mit Brot',             kcal: 320, protein: 12, carbs: 44, fat: 8,  vitamins: ['C', 'A', 'Folsäure'],     allergens: ['Gluten'] },
  Mittwoch:   { dish: 'Hähnchen mit Reis & Brokkoli',     kcal: 520, protein: 38, carbs: 46, fat: 10, vitamins: ['B6', 'C', 'K'],           allergens: [] },
  Donnerstag: { dish: 'Kartoffelauflauf',                 kcal: 440, protein: 18, carbs: 52, fat: 16, vitamins: ['C', 'B6', 'Kalzium'],     allergens: ['Milch', 'Ei'] },
  Freitag:    { dish: 'Fischstäbchen mit Kartoffelpüree', kcal: 490, protein: 28, carbs: 48, fat: 18, vitamins: ['D', 'B12', 'Omega-3'],    allergens: ['Fisch', 'Gluten', 'Milch'] },
}

// Emma's eating feedback from teacher
const emmaFeedback: Record<string, { status: string; note: string }> = {
  Montag:     { status: 'great',   note: '' },
  Dienstag:   { status: 'good',    note: '' },
  Mittwoch:   { status: 'great',   note: 'Hat den Brokkoli besonders gemocht!' },
  Donnerstag: { status: 'little',  note: 'War etwas müde heute' },
  Freitag:    { status: '',        note: '' },
}

const FEEDBACK_DISPLAY: Record<string, { label: string; color: string; text: string }> = {
  great:   { label: '😄 Alles aufgegessen',  color: '#E1F5EE', text: '#1D7A6F' },
  good:    { label: '🙂 Gut gegessen',        color: '#F0FFF4', text: '#166534' },
  little:  { label: '😐 Wenig gegessen',      color: '#FFF8E7', text: '#92400E' },
  refused: { label: '😕 Nicht gemocht',       color: '#FFF0F5', text: '#9D174D' },
}

function NutritionBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
        <span>{label}</span><span>{value}g</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 rounded-full" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ParentMealsPage() {
  const [selectedDay, setSelectedDay] = useState('Montag')
  const meal = meals[selectedDay as keyof typeof meals]
  const fb = emmaFeedback[selectedDay]

  // DGE-Ampel: Qualitätsstandard für Verpflegung in Tageseinrichtungen für Kinder (2023)
  const dge = {
    kcal:    meal.kcal >= 530 && meal.kcal <= 600   ? 'green' : meal.kcal >= 450 && meal.kcal <= 680  ? 'yellow' : 'red',
    protein: meal.protein >= 15                      ? 'green' : meal.protein >= 10                    ? 'yellow' : 'red',
    fat:     meal.fat >= 17 && meal.fat <= 23        ? 'green' : meal.fat >= 12 && meal.fat <= 28      ? 'yellow' : 'red',
    carbs:   meal.carbs >= 70 && meal.carbs <= 80    ? 'green' : meal.carbs >= 55 && meal.carbs <= 95  ? 'yellow' : 'red',
  }
  const dgeColor:  Record<string, string> = { green: '#16a34a', yellow: '#d97706', red: '#dc2626' }
  const dgeBg:     Record<string, string> = { green: '#f0fdf4', yellow: '#fffbeb', red: '#fff1f2' }
  const dgeBorder: Record<string, string> = { green: '#bbf7d0', yellow: '#fde68a', red: '#fecdd3' }
  const dgeIcon:   Record<string, string> = { green: '✅', yellow: '⚠️', red: '❌' }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href="/parent" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück</a>

        {/* Header */}
        <div className="kc-card p-5 mb-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #FFD166, #FFB347)' }}>
          <span className="text-5xl">🍽️</span>
          <div>
            <h1 className="text-2xl font-black text-white">Speiseplan</h1>
            <p className="text-yellow-100 font-semibold text-sm mt-0.5">KW 21 · Emma Müller · Gruppe Schmetterlinge</p>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {DAYS.map((day, i) => {
            const dayFb = emmaFeedback[day]
            const hasFeedback = dayFb?.status
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                  selectedDay === day
                    ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                    : 'bg-white text-gray-600 border-[#EDE8DF] hover:border-teal-300'
                }`}
              >
                <span className="text-xs opacity-70">{DATES[i]}</span>
                <span>{day}</span>
                {hasFeedback && (
                  <span className="absolute -top-1 -right-1 text-sm">
                    {{ great: '😄', good: '🙂', little: '😐', refused: '😕' }[dayFb.status]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Meal detail */}
        <div className="kc-card p-5 mb-4">
          <p className="font-black text-gray-800 text-xl mb-1">{meal.dish}</p>
          <p className="text-xs text-gray-400 font-semibold mb-4">{selectedDay}, {DATES[DAYS.indexOf(selectedDay)]}2026</p>

          {/* DGE-Ampel */}
          <div className="mb-4 p-3 rounded-2xl border-2 border-[#EDE8DF] bg-gray-50">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">DGE-Richtwerte · Kinder 4–6 J. · Mittagessen</p>
            <div className="grid grid-cols-2 gap-2">
              {([['kcal', 'Energie', `${meal.kcal} kcal`, '530–600 kcal'], ['protein', 'Eiweiß', `${meal.protein}g`, '≥ 15g'], ['fat', 'Fett', `${meal.fat}g`, '17–23g'], ['carbs', 'Kohlenhydrate', `${meal.carbs}g`, '70–80g']] as const).map(([key, label, val, ref]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-xl border" style={{ background: dgeBg[dge[key]], borderColor: dgeBorder[dge[key]] }}>
                  <span className="text-base">{dgeIcon[dge[key]]}</span>
                  <div>
                    <p className="text-xs font-black text-gray-700">{label}</p>
                    <p className="text-xs font-bold" style={{ color: dgeColor[dge[key]] }}>{val} <span className="text-gray-400 font-normal">({ref})</span></p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Richtwerte basieren auf dem DGE-Qualitätsstandard für Kita-Verpflegung. Keine medizinische Ernährungsberatung.</p>
          </div>

          {/* Kcal + macros */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Nährwerte</span>
              <span className="font-black text-gray-800">{meal.kcal} kcal</span>
            </div>
            <div className="space-y-2">
              <NutritionBar label="Eiweiß" value={meal.protein} max={50} color="#2EA89A" />
              <NutritionBar label="Kohlenhydrate" value={meal.carbs} max={80} color="#FFD166" />
              <NutritionBar label="Fett" value={meal.fat} max={40} color="#FF9FB2" />
            </div>
          </div>

          {/* Vitamins */}
          <div className="mb-3">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Vitamine & Nährstoffe</p>
            <div className="flex flex-wrap gap-1.5">
              {meal.vitamins.map(v => (
                <span key={v} className="kc-badge bg-green-100 text-green-700 text-xs">✅ {v}</span>
              ))}
              {meal.vitamins.length === 0 && <span className="text-xs text-gray-400 font-semibold">Keine Angaben</span>}
            </div>
          </div>

          {/* Allergens */}
          {meal.allergens.length > 0 && (
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Allergene</p>
              <div className="flex flex-wrap gap-1.5">
                {meal.allergens.map(a => (
                  <span key={a} className="kc-badge bg-red-50 text-red-500 text-xs">⚠️ {a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emma's eating feedback from teacher */}
        <div className="kc-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">👶</span>
            <h2 className="font-black text-gray-800">Wie hat Emma gegessen?</h2>
          </div>

          {fb?.status ? (
            <div>
              <div className="flex items-center gap-3 p-4 rounded-2xl border-2" style={{
                background: FEEDBACK_DISPLAY[fb.status]?.color ?? '#F5F5F5',
                borderColor: FEEDBACK_DISPLAY[fb.status]?.color ?? '#F5F5F5',
              }}>
                <span className="text-3xl">
                  {{ great: '😄', good: '🙂', little: '😐', refused: '😕' }[fb.status]}
                </span>
                <div>
                  <p className="font-black text-sm" style={{ color: FEEDBACK_DISPLAY[fb.status]?.text }}>
                    {FEEDBACK_DISPLAY[fb.status]?.label}
                  </p>
                  {fb.note && (
                    <p className="text-xs text-gray-600 font-semibold mt-0.5">
                      Notiz der Erzieherin: „{fb.note}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-3xl mb-2">⏳</p>
              <p className="text-sm font-bold">Noch kein Feedback für diesen Tag</p>
              <p className="text-xs font-semibold mt-1">Die Erzieherin trägt es nach dem Mittagessen ein.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
