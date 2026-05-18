import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: children }, { data: observations }, { data: stories }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('children').select('*').order('name'),
      supabase.from('observations').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('learning_stories').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false }).limit(5),
    ])

  if (!profile || profile.role !== 'teacher') redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="text-6xl flex-shrink-0">👩‍🏫</div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Hallo, {profile.full_name.split(' ')[0]}! 👋
            </h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">Erzieher-Dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { emoji: '👶', count: (children ?? []).length, label: 'Kinder', color: '#E1F5EE', href: '/teacher/children' },
            { emoji: '👁️', count: (observations ?? []).length, label: 'Meine Beobachtungen', color: '#FFF8E7', href: '/teacher/observations' },
            { emoji: '📖', count: (stories ?? []).length, label: 'Lerngeschichten', color: '#FFF0F5', href: '/teacher/stories' },
          ].map(s => (
            <a key={s.label} href={s.href} className="kc-card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer" style={{ background: s.color }}>
              <span className="text-4xl">{s.emoji}</span>
              <span className="text-3xl font-black text-gray-800">{s.count}</span>
              <span className="text-xs font-bold text-gray-500 text-center">{s.label}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Recent Observations */}
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <h2 className="font-black text-gray-800">Letzte Beobachtungen</h2>
              </div>
              <a href="/teacher/observations" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">
                Alle <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {(observations ?? []).length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-gray-400 font-semibold text-sm">Noch keine Beobachtungen</p>
                  <a href="/teacher/observations" className="mt-2 inline-block text-teal-600 text-sm font-bold hover:underline">
                    Erste erfassen →
                  </a>
                </div>
              ) : (observations ?? []).map(o => (
                <div key={o.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="kc-badge bg-teal-100 text-teal-700 text-xs">{o.category}</span>
                    <span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{o.situation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Stories */}
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h2 className="font-black text-gray-800">Lerngeschichten</h2>
              </div>
              <a href="/teacher/stories" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">
                Alle <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {(stories ?? []).length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-3xl mb-2">✨</p>
                  <p className="text-gray-400 font-semibold text-sm">Noch keine Lerngeschichten</p>
                  <a href="/teacher/stories" className="mt-2 inline-block text-teal-600 text-sm font-bold hover:underline">
                    Neue erstellen →
                  </a>
                </div>
              ) : (stories ?? []).map(s => (
                <a key={s.id} href={`/teacher/stories/${s.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                  <p className="text-sm font-bold text-gray-800">{s.title}</p>
                  <span className={`kc-badge text-xs ${
                    s.status === 'published' ? 'bg-teal-100 text-teal-700' :
                    s.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {s.status === 'published' ? '✅ Veröffentlicht' : s.status === 'review' ? '🔍 Überprüfung' : '✏️ Entwurf'}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <a href="/teacher/children" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#E1F5EE' }}>
            <span className="text-4xl">👶</span>
            <div>
              <p className="font-black text-gray-800">Kinder</p>
              <p className="text-xs text-gray-500 font-semibold">Alle Kinder anzeigen</p>
            </div>
          </a>
          <a href="/teacher/observations" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF8E7' }}>
            <span className="text-4xl">👁️</span>
            <div>
              <p className="font-black text-gray-800">Beobachten</p>
              <p className="text-xs text-gray-500 font-semibold">Neue Beobachtung</p>
            </div>
          </a>
          <a href="/teacher/stories" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF0F5' }}>
            <span className="text-4xl">📖</span>
            <div>
              <p className="font-black text-gray-800">Geschichten</p>
              <p className="text-xs text-gray-500 font-semibold">Lerngeschichten</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  )
}
