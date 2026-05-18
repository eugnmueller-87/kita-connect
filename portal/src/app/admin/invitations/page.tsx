import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import InviteForm from './invite-form'

export default async function AdminInvitationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: invitations }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('invitations').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile || profile.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">← Zurück zum Dashboard</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
          <div className="text-6xl flex-shrink-0">✉️</div>
          <div>
            <h1 className="text-2xl font-black text-white">Einladungen</h1>
            <p className="text-purple-200 font-semibold text-sm mt-1">{(invitations ?? []).length} Einladungen gesendet</p>
          </div>
        </div>

        {/* Invite form */}
        <div className="kc-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📨</span>
            <h2 className="font-black text-gray-800">Neue Einladung senden</h2>
          </div>
          <InviteForm />
        </div>

        {/* Invitation list */}
        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="font-black text-gray-800">Gesendete Einladungen</h2>
          </div>
          <div className="divide-y-2 divide-[#F5F0E8]">
            {(invitations ?? []).length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-400 font-semibold text-sm">Noch keine Einladungen gesendet</p>
              </div>
            ) : (invitations ?? []).map(inv => (
              <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{inv.email}</p>
                  <p className="text-xs text-gray-400 font-semibold">{new Date(inv.created_at).toLocaleDateString('de-DE')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
                    {inv.role === 'parent' ? '👨‍👩‍👧 Elternteil' : '👩‍🏫 Erzieher/in'}
                  </span>
                  <span className={`kc-badge text-xs ${
                    inv.used_at ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {inv.used_at ? '✅ Angenommen' : '⏳ Ausstehend'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
