import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'

const typeLabel: Record<string, string> = {
  ticket_update: '💬 Ticket',
  broadcast: '📢 Mitteilung',
  welcome: '👋 Willkommen',
  observation_added: '📝 Beobachtung',
  lerngeschichte_bereit: '📖 Lerngeschichte',
  onboarding_approved: '✅ Freischaltung',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: notifications }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  if (!profile) redirect('/login')

  await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)

  const unread = (notifications ?? []).filter(n => !n.read).length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={unread} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header card */}
        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #FFD166, #FFB347)' }}>
          <div className="text-6xl flex-shrink-0">🔔</div>
          <div>
            <h1 className="text-2xl font-black text-white">Benachrichtigungen</h1>
            <p className="text-yellow-100 font-semibold text-sm mt-1">
              {unread > 0 ? `${unread} ungelesen` : 'Alles gelesen ✓'}
            </p>
          </div>
        </div>

        <div className="kc-card overflow-hidden">
          {(notifications ?? []).length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-5xl mb-3">✨</p>
              <p className="text-gray-500 font-bold">Keine Benachrichtigungen vorhanden.</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-[#F5F0E8]">
              {(notifications ?? []).map(n => (
                <div key={n.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1">
                    <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
                      {typeLabel[n.type] ?? n.type}
                    </span>
                    <p className="font-black text-gray-800 mt-1">{n.title}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.body}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 font-semibold mt-1">
                    {new Date(n.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
