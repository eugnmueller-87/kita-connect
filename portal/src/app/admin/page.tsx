import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: parents }, { data: pending }, { data: invitations }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('profiles').select('*').eq('role', 'parent'),
      supabase.from('profiles').select('*').eq('role', 'parent').eq('onboarding_status', 'pending'),
      supabase.from('invitations').select('*').order('created_at', { ascending: false }).limit(5),
    ])

  if (!profile || profile.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #1D7A6F, #2EA89A)' }}>
          <div className="text-6xl flex-shrink-0">⚙️</div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin-Dashboard</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">Kita Connect Verwaltung</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { emoji: '👨‍👩‍👧', count: (parents ?? []).length, label: 'Eltern gesamt', color: '#E1F5EE', href: '/admin/parents' },
            { emoji: '⏳', count: (pending ?? []).length, label: 'Ausstehend', color: '#FFF8E7', href: '/admin/parents' },
            { emoji: '✉️', count: (invitations ?? []).length, label: 'Einladungen', color: '#F0F4FF', href: '/admin/invitations' },
            { emoji: '📢', count: null, label: 'Broadcast senden', color: '#FFF0F5', href: '/admin/broadcast' },
          ].map(s => (
            <a key={s.label} href={s.href} className="kc-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer" style={{ background: s.color }}>
              <span className="text-3xl">{s.emoji}</span>
              {s.count !== null && <span className="text-2xl font-black text-gray-800">{s.count}</span>}
              <span className="text-xs font-bold text-gray-500 text-center">{s.label}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Pending approvals */}
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏳</span>
                <h2 className="font-black text-gray-800">Freizuschaltende Eltern</h2>
              </div>
              <a href="/admin/parents" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">
                Alle <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {(pending ?? []).length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-gray-400 font-semibold text-sm">Alle Eltern freigeschaltet!</p>
                </div>
              ) : (pending ?? []).map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form action="/api/admin/approve" method="POST">
                      <input type="hidden" name="parent_id" value={p.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" className="kc-btn text-xs bg-teal-600 text-white px-3 py-1.5">
                        ✅ Ja
                      </button>
                    </form>
                    <form action="/api/admin/approve" method="POST">
                      <input type="hidden" name="parent_id" value={p.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button type="submit" className="kc-btn text-xs bg-red-100 text-red-600 px-3 py-1.5">
                        ❌ Nein
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent invitations */}
          <div className="kc-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#EDE8DF]">
              <div className="flex items-center gap-2">
                <span className="text-xl">✉️</span>
                <h2 className="font-black text-gray-800">Letzte Einladungen</h2>
              </div>
              <a href="/admin/invitations" className="text-teal-600 text-sm font-bold flex items-center gap-0.5 hover:underline">
                Alle <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y-2 divide-[#F5F0E8]">
              {(invitations ?? []).length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-gray-400 font-semibold text-sm">Noch keine Einladungen</p>
                  <a href="/admin/invitations" className="mt-2 inline-block text-teal-600 text-sm font-bold hover:underline">
                    Einladung senden →
                  </a>
                </div>
              ) : (invitations ?? []).map(inv => (
                <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{inv.email}</p>
                    <p className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                  <span className="kc-badge bg-teal-100 text-teal-700">
                    {inv.role === 'parent' ? '👨‍👩‍👧 Elternteil' : '👩‍🏫 Erzieher/in'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
