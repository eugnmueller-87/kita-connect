'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'
import AddChildForm from './add-child-form'

type Child = {
  id: string; name: string; birth_date: string; group_name: string; gender?: string | null
  allergies?: string | null; dietary_notes?: string | null; avatar_url?: string | null
  fav_color?: string | null; fav_book?: string | null; fav_food?: string | null
  fav_game?: string | null; fav_song?: string | null
}
type Obs = { id: string; category: string; text: string; created_at: string }
type Story = { id: string; title: string; final_text: string | null; created_at: string }
type Detail = { childId: string; observations: Obs[]; stories: Story[] }

function getAge(birthDate: string) {
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return `${y} Jahre${m > 0 ? `, ${m} Monate` : ''}`
}

const COLORS = [
  { from: '#2a9d8f', to: '#457b9d', shadow: '#1D7A6F' },
  { from: '#e76f51', to: '#f4a261', shadow: '#c45d3e' },
  { from: '#7b5ea7', to: '#a885d8', shadow: '#5e4580' },
]
const EMOJIS = ['🌸', '🦋', '⭐']
const COLOR_OPTIONS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🩷', '🩵']
const GENDER_OPTIONS = [
  { value: 'male', emoji: '👦' },
  { value: 'female', emoji: '👧' },
]

function EditProfileModal({ child, lang, userId, onClose }: {
  child: Child; lang: Lang; userId: string; onClose: () => void
}) {
  const router = useRouter()
  const { tr } = useTranslation(lang)
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(child.name)
  const [birthDate, setBirthDate] = useState(child.birth_date ?? '')
  const [gender, setGender] = useState(child.gender ?? '')
  const [favColor, setFavColor] = useState(child.fav_color ?? '')
  const [favBook, setFavBook] = useState(child.fav_book ?? '')
  const [favFood, setFavFood] = useState(child.fav_food ?? '')
  const [favGame, setFavGame] = useState(child.fav_game ?? '')
  const [favSong, setFavSong] = useState(child.fav_song ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(child.avatar_url ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    let avatar_url = child.avatar_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${userId}/${child.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('child-photos').upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('child-photos').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }
    }

    const res = await fetch('/api/parent/children', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: child.id,
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

    setSaving(false)
    if (!res.ok) return
    setSaved(true)
    setTimeout(() => { onClose(); router.refresh() }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="kc-card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b-2 border-[#EDE8DF] flex items-center justify-between">
          <h2 className="font-black text-gray-800">{tr(t.childPage.editProfile)}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-black">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-teal-200 hover:border-teal-400 transition-colors flex items-center justify-center bg-teal-50">
              {avatarPreview
                ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl">📷</span>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <p className="text-xs text-gray-400">{tr(t.childPage.photoHint)}</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1">{tr(t.childPage.childName)}</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="kc-input w-full px-3 py-2 text-sm" />
          </div>

          {/* Birth date */}
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1">{tr(t.childPage.birthDate)}</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="kc-input w-full px-3 py-2 text-sm" />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-black text-gray-700 mb-2">{tr(t.childPage.gender)}</label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map(g => (
                <button key={g.value} type="button" onClick={() => setGender(g.value)}
                  style={gender === g.value ? { background: '#2a9d8f', color: '#fff', borderColor: '#1D7A6F', boxShadow: '0 4px 0 0 #1D7A6F' } : {}}
                  className={`kc-card flex-1 py-2 flex flex-col items-center gap-1 transition-all text-xs font-bold ${gender === g.value ? '' : 'text-gray-600'}`}>
                  <span className="text-xl">{g.emoji}</span>
                  <span>{tr(t.childPage[`gender${g.value.charAt(0).toUpperCase() + g.value.slice(1)}` as 'genderMale' | 'genderFemale'])}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Favorite color */}
          <div>
            <label className="block text-xs font-black text-gray-700 mb-2">{tr(t.childPage.favColor)}</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => setFavColor(c)}
                  className={`text-xl rounded-full w-9 h-9 flex items-center justify-center transition-all ${favColor === c ? 'ring-4 ring-teal-400 scale-110' : 'hover:scale-105'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Preference fields */}
          <div className="space-y-3">
            {([
              ['favBook', '📚', favBook, setFavBook],
              ['favFood', '🍕', favFood, setFavFood],
              ['favGame', '🎮', favGame, setFavGame],
              ['favSong', '🎵', favSong, setFavSong],
            ] as [keyof typeof t.childPage, string, string, (v: string) => void][]).map(([key, emoji, val, setter]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-lg w-6 flex-shrink-0">{emoji}</span>
                <input type="text" value={val} onChange={e => setter(e.target.value)}
                  placeholder={tr(t.childPage[key] as { de: string; en: string; tr: string; ru: string })}
                  className="kc-input flex-1 px-3 py-2 text-sm" />
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving || saved}
            className="kc-btn w-full bg-teal-600 text-white font-black py-3 text-sm disabled:opacity-60">
            {saved ? tr(t.childPage.profileSaved) : saving ? '...' : tr(t.childPage.saveChild)}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ChildTabs({ children, details, lang, userId }: {
  children: Child[]
  details: Detail[]
  lang: Lang
  userId: string
}) {
  const [selected, setSelected] = useState(children[0]?.id ?? '')
  const [askOpen, setAskOpen] = useState<string | null>(null)
  const [askText, setAskText] = useState('')
  const [askSent, setAskSent] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const { tr } = useTranslation(lang)

  const child = children.find(c => c.id === selected) ?? children[0]
  const childIndex = children.findIndex(c => c.id === child.id)
  const colors = COLORS[childIndex % COLORS.length]
  const emoji = EMOJIS[childIndex % EMOJIS.length]
  const detail = details.find(d => d.childId === child.id) ?? { childId: child.id, observations: [], stories: [] }

  async function sendAsk(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    await supabase.from('tickets').insert({ parent_id: userId, child_id: child.id, subject: askText.slice(0, 80), status: 'open' })
    setAskSent(true)
    setTimeout(() => { setAskSent(false); setAskOpen(null); setAskText('') }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {editOpen && (
        <EditProfileModal child={child} lang={lang} userId={userId} onClose={() => setEditOpen(false)} />
      )}

      {addOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setAddOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold z-10">✕</button>
            <AddChildForm lang={lang} userId={userId} />
          </div>
        </div>
      )}

      {/* Child selector tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {children.map((c, i) => {
            const col = COLORS[i % COLORS.length]
            const em = EMOJIS[i % EMOJIS.length]
            const isActive = c.id === selected
            return (
              <button key={c.id} onClick={() => { setSelected(c.id); setAskOpen(null) }}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                  color: '#fff', borderColor: col.from,
                  boxShadow: `0 4px 0 0 ${col.shadow}, 0 0 14px rgba(0,0,0,0.15)`,
                } : {}}
                className={`kc-card flex items-center gap-2 px-4 py-2.5 font-black text-sm whitespace-nowrap transition-all flex-shrink-0 ${isActive ? '' : 'text-gray-600 hover:border-teal-300'}`}>
                {c.avatar_url
                  ? <img src={c.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  : <span>{em}</span>
                }
                <span>{c.name}</span>
              </button>
            )
          })}
          <button onClick={() => setAddOpen(true)}
            className="kc-card flex items-center gap-2 px-4 py-2.5 font-black text-sm whitespace-nowrap flex-shrink-0 text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-all">
            <span>＋</span><span>Kind hinzufügen</span>
          </button>
        </div>

      {/* Child header */}
      <div className="kc-card p-6 mb-5 flex items-center gap-5" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
        <div className="flex-shrink-0">
          {child.avatar_url
            ? <img src={child.avatar_url} alt={child.name} className="w-16 h-16 rounded-full object-cover border-4 border-white/30" />
            : <div className="text-6xl">{emoji}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-black text-white">{child.name}</h1>
            <button onClick={() => setEditOpen(true)}
              className="flex-shrink-0 text-xs text-white/70 hover:text-white font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
              ✏️ {tr(t.childPage.editProfile)}
            </button>
          </div>
          <p className="text-white/80 font-semibold text-sm mt-0.5">
            {child.group_name && `Gruppe ${child.group_name} · `}{child.birth_date ? getAge(child.birth_date) : ''}
          </p>
          {(child.allergies || child.dietary_notes) && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {child.allergies && <span className="text-xs bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">⚠️ {child.allergies}</span>}
              {child.dietary_notes && <span className="text-xs bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">🥗 {child.dietary_notes}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Preferences card */}
      {(child.fav_color || child.fav_book || child.fav_food || child.fav_game || child.fav_song) && (
        <div className="kc-card p-5 mb-5">
          <p className="font-black text-gray-700 text-sm mb-3">{tr(t.childPage.preferences)}</p>
          <div className="grid grid-cols-2 gap-2">
            {child.fav_color && <div className="flex items-center gap-2 text-sm"><span className="text-xl">{child.fav_color}</span><span className="text-gray-600 font-semibold">{tr(t.childPage.favColor)}</span></div>}
            {child.fav_book  && <div className="flex items-center gap-2 text-sm"><span>📚</span><span className="text-gray-700 font-semibold truncate">{child.fav_book}</span></div>}
            {child.fav_food  && <div className="flex items-center gap-2 text-sm"><span>🍕</span><span className="text-gray-700 font-semibold truncate">{child.fav_food}</span></div>}
            {child.fav_game  && <div className="flex items-center gap-2 text-sm"><span>🎮</span><span className="text-gray-700 font-semibold truncate">{child.fav_game}</span></div>}
            {child.fav_song  && <div className="flex items-center gap-2 text-sm"><span>🎵</span><span className="text-gray-700 font-semibold truncate">{child.fav_song}</span></div>}
          </div>
        </div>
      )}

      {/* Observations */}
      <div className="kc-card overflow-hidden mb-5">
        <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
          <span className="text-xl">👁️</span>
          <h2 className="font-black text-gray-800">{tr(t.childPage.observations)}</h2>
          <span className="ml-auto kc-badge bg-teal-100 text-teal-700 text-xs">{detail.observations.length}</span>
        </div>
        <div className="divide-y-2 divide-[#F5F0E8]">
          {detail.observations.length === 0 && (
            <p className="px-5 py-6 text-sm text-gray-400 font-semibold text-center">{tr(t.childPage.noObservations)}</p>
          )}
          {detail.observations.map(o => (
            <div key={o.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{o.category}</span>
                <span className="text-xs text-gray-400 font-semibold">{new Date(o.created_at).toLocaleDateString('de-DE')}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{o.text}</p>
              {askOpen === o.id ? (
                askSent ? (
                  <p className="mt-3 text-sm font-black text-teal-600 text-center">{tr(t.common.sent)}</p>
                ) : (
                  <form onSubmit={sendAsk} className="mt-3 space-y-2">
                    <textarea rows={2} value={askText} onChange={e => setAskText(e.target.value)}
                      placeholder={tr(t.childPage.questionPlaceholder)}
                      className="kc-input w-full px-3 py-2 text-sm resize-none" required />
                    <div className="flex gap-2">
                      <button type="submit" className="kc-btn bg-teal-600 text-white text-xs font-black px-4 py-2">{tr(t.common.send)}</button>
                      <button type="button" onClick={() => setAskOpen(null)} className="kc-btn bg-gray-100 text-gray-600 text-xs font-black px-4 py-2">{tr(t.common.cancel)}</button>
                    </div>
                  </form>
                )
              ) : (
                <button onClick={() => setAskOpen(o.id)} className="mt-2 text-xs text-teal-600 font-bold hover:underline">
                  {tr(t.childPage.askTeacher)}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Learning stories */}
      <div className="kc-card overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
          <span className="text-xl">📖</span>
          <h2 className="font-black text-gray-800">{tr(t.childPage.learningStories)}</h2>
          <span className="ml-auto kc-badge bg-purple-100 text-purple-700 text-xs">{detail.stories.length}</span>
        </div>
        <div className="divide-y-2 divide-[#F5F0E8]">
          {detail.stories.length === 0 && (
            <p className="px-5 py-6 text-sm text-gray-400 font-semibold text-center">{tr(t.childPage.noStories)}</p>
          )}
          {detail.stories.map(s => (
            <div key={s.id} className="px-5 py-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-black text-gray-800">{s.title}</p>
                <span className="text-xs text-gray-400 font-semibold flex-shrink-0 ml-2">{new Date(s.created_at).toLocaleDateString('de-DE')}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{s.final_text ?? ''}</p>
              {askOpen === s.id ? (
                askSent ? (
                  <p className="mt-3 text-sm font-black text-teal-600 text-center">{tr(t.common.sent)}</p>
                ) : (
                  <form onSubmit={sendAsk} className="mt-3 space-y-2">
                    <textarea rows={2} value={askText} onChange={e => setAskText(e.target.value)}
                      placeholder={tr(t.childPage.storyQuestion)}
                      className="kc-input w-full px-3 py-2 text-sm resize-none" required />
                    <div className="flex gap-2">
                      <button type="submit" className="kc-btn bg-teal-600 text-white text-xs font-black px-4 py-2">{tr(t.common.send)}</button>
                      <button type="button" onClick={() => setAskOpen(null)} className="kc-btn bg-gray-100 text-gray-600 text-xs font-black px-4 py-2">{tr(t.common.cancel)}</button>
                    </div>
                  </form>
                )
              ) : (
                <button onClick={() => setAskOpen(s.id)} className="mt-2 text-xs text-teal-600 font-bold hover:underline">
                  {tr(t.childPage.askTeacher)}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
