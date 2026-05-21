'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

const GENDER_OPTIONS = [
  { value: 'male',   emoji: '👦' },
  { value: 'female', emoji: '👧' },
  { value: 'other',  emoji: '🧒' },
]

const COLOR_OPTIONS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🩷', '🩵']

export default function AddChildForm({ lang, userId }: { lang: Lang; userId: string }) {
  const router = useRouter()
  const { tr } = useTranslation(lang)
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [favColor, setFavColor] = useState('')
  const [favBook, setFavBook] = useState('')
  const [favFood, setFavFood] = useState('')
  const [favGame, setFavGame] = useState('')
  const [favSong, setFavSong] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()

    let avatar_url: string | null = null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('child-photos').upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('child-photos').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }
    }

    const res = await fetch('/api/parent/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        birth_date: birthDate || null,
        gender: gender || null,
        avatar_url,
        fav_color: favColor || null,
        fav_book: favBook.trim() || null,
        fav_food: favFood.trim() || null,
        fav_game: favGame.trim() || null,
        fav_song: favSong.trim() || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Speichern')
      setSaving(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="kc-card p-6 mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #2a9d8f, #457b9d)' }}>
        <div className="text-5xl">👶</div>
        <div>
          <h1 className="text-xl font-black text-white">{tr(t.childPage.addChild)}</h1>
          <p className="text-white/80 text-sm font-semibold mt-0.5">{tr(t.childPage.addChildSubtitle)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="kc-card p-6 space-y-6">

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-teal-200 hover:border-teal-400 transition-colors flex items-center justify-center bg-teal-50"
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              : <span className="text-4xl">📷</span>
            }
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-xs text-gray-400 font-semibold">{tr(t.childPage.photoHint)}</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-1">{tr(t.childPage.childName)} *</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="z.B. Emma Müller"
            className="kc-input w-full px-4 py-3 text-sm"
          />
        </div>

        {/* Birth date */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-1">{tr(t.childPage.birthDate)}</label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="kc-input w-full px-4 py-3 text-sm"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.childPage.gender)}</label>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender(g.value)}
                style={gender === g.value ? {
                  background: '#2a9d8f',
                  color: '#fff',
                  borderColor: '#1D7A6F',
                  boxShadow: '0 4px 0 0 #1D7A6F, 0 0 12px rgba(42,157,143,0.4)',
                } : {}}
                className={`kc-card flex-1 py-3 flex flex-col items-center gap-1 transition-all font-bold text-sm ${
                  gender === g.value ? '' : 'text-gray-600 hover:border-teal-300'
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs">{tr(t.childPage[`gender${g.value.charAt(0).toUpperCase() + g.value.slice(1)}` as 'genderMale' | 'genderFemale' | 'genderOther'])}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <p className="text-sm font-black text-gray-700 mb-3">{tr(t.childPage.preferences)}</p>

          {/* Favorite color */}
          <label className="block text-xs font-bold text-gray-500 mb-2">{tr(t.childPage.favColor)}</label>
          <div className="flex gap-2 flex-wrap mb-4">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFavColor(c)}
                className={`text-2xl rounded-full w-10 h-10 flex items-center justify-center transition-all ${
                  favColor === c ? 'ring-4 ring-teal-400 scale-110' : 'hover:scale-105'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {([
              ['favBook', '📚', favBook, setFavBook],
              ['favFood', '🍕', favFood, setFavFood],
              ['favGame', '🎮', favGame, setFavGame],
              ['favSong', '🎵', favSong, setFavSong],
            ] as [keyof typeof t.childPage, string, string, (v: string) => void][]).map(([key, emoji, val, setter]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xl w-7 flex-shrink-0">{emoji}</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={val}
                    onChange={e => setter(e.target.value)}
                    placeholder={tr(t.childPage[key] as { de: string; en: string; tr: string; ru: string })}
                    className="kc-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="kc-card px-4 py-3 bg-red-50 border-red-200 text-sm text-red-600 font-semibold">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="kc-btn w-full bg-teal-600 text-white font-black py-3.5 text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '...' : tr(t.childPage.saveChild)}
        </button>
      </form>
    </div>
  )
}
