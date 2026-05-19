import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export default async function ParentDashboard() {
  const { profile, userId } = await requireRole('parent')
  const supabase = await createClient()

  const [{ data: notifData }, { data: ticketData }, { data: childData }] = await Promise.all([
    supabase.from('notifications').select('id, title, body, read, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('tickets').select('id, subject, status, updated_at').eq('parent_id', userId).order('updated_at', { ascending: false }),
    supabase.from('children').select('id, name').eq('parent_id', userId),
  ])

  const notifications = notifData ?? []
  const tickets = ticketData ?? []
  const children = childData ?? []
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={unread} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="text-6xl flex-shrink-0">👨‍👩‍👧</div>
          <div>
            <h1 className="text-2xl font-black text-white">Hallo, {profile.full_name.split(' ')[0]}! 👋</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">Willkommen in Ihrem Kita Connect Portal</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { emoji: '🔔', count: unread, label: 'Neue Meldungen', color: '#FFF8E7', href: '/parent/notifications' },
            { emoji: '💬', count: tickets.filter(t => t.status === 'open').length, label: 'Offene Tickets', color: '#E1F5EE', href: '/parent/tickets' },
            { emoji: '👶', count: children.length, label: 'Kinder', color: '#FFF0F5', href: '/parent/child' },
          ].map(s => (
            <a key={s.label} href={s.href} className="kc-card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer" style={{ background: s.color }}>
              <span className="text-4xl">{s.emoji}</span>
              <span className="text-3xl font-black text-gray-800">{s.count}</span>
              <span className="text-xs font-bold text-gray-500 text-center">{s.label}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2"><span className="text-xl">🔔</span><h2 className="font-black text-gray-800">Benachrichtigungen</h2></div>
              <a href="/parent/notifications" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">Alle <ChevronRight size={14} /></a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {notifications.length === 0 && <p className="px-5 py-4 text-sm text-gray-400 font-semibold">Keine Benachrichtigungen.</p>}
              {notifications.map(n => (
                <a key={n.id} href="/parent/notifications" className={`px-5 py-3 flex items-start gap-3 hover:bg-[#F5F0E8] transition-colors ${!n.read ? 'bg-teal-50 hover:bg-teal-100' : ''}`}>
                  {!n.read && <span className="mt-2 w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0" />}
                  <div>
                    <p className="text-sm font-bold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2"><span className="text-xl">💬</span><h2 className="font-black text-gray-800">Meine Nachrichten</h2></div>
              <a href="/parent/tickets" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">Alle <ChevronRight size={14} /></a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {tickets.length === 0 && <p className="px-5 py-4 text-sm text-gray-400 font-semibold">Keine Nachrichten.</p>}
              {tickets.slice(0, 3).map(t => (
                <a key={t.id} href={`/parent/tickets/${t.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-[#F5F0E8] transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(t.updated_at).toLocaleDateString('de-DE')}</p>
                  </div>
                  <span className={`kc-badge text-xs flex-shrink-0 ml-2 ${t.status === 'open' ? 'bg-teal-100 text-teal-700' : t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.status === 'open' ? '🟢 Offen' : t.status === 'in_progress' ? '🟡 Aktiv' : '⚫ Geschlossen'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <a href="/parent/child" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF8E7' }}>
            <span className="text-4xl">📖</span>
            <div><p className="font-black text-gray-800">Lerngeschichten</p><p className="text-xs text-gray-500 font-semibold">Entwicklung meines Kindes</p></div>
          </a>
          <a href="/parent/meals" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#FFF0E8' }}>
            <span className="text-4xl">🍽️</span>
            <div><p className="font-black text-gray-800">Speiseplan</p><p className="text-xs text-gray-500 font-semibold">Mahlzeiten & Ernährung</p></div>
          </a>
          <a href="/parent/faq" className="kc-card p-5 flex items-center gap-4 hover:scale-105 transition-transform" style={{ background: '#F0F4FF' }}>
            <span className="text-4xl">🤖</span>
            <div><p className="font-black text-gray-800">Fragen & Antworten</p><p className="text-xs text-gray-500 font-semibold">KI-Assistent</p></div>
          </a>
        </div>

      </div>
    </div>
  )
}
