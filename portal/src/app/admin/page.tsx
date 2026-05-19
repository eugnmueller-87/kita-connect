import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export default async function AdminDashboard() {
  const { profile } = await requireRole('admin')
  const supabase = await createClient()

  const [{ data: parents }, { data: invitations }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, onboarding_status').eq('role', 'parent').order('created_at', { ascending: false }),
    supabase.from('invitations').select('id, email, role, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const allParents = parents ?? []
  const pending = allParents.filter(p => p.onboarding_status === 'pending')
  const allInvitations = invitations ?? []

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #1D7A6F, #2EA89A)' }}>
          <div className="text-6xl flex-shrink-0">⚙️</div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin-Dashboard</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">Willkommen, {profile.full_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { emoji: '👨‍👩‍👧', count: allParents.length, label: 'Eltern gesamt', color: '#E1F5EE', href: '/admin/parents' },
            { emoji: '⏳', count: pending.length, label: 'Ausstehend', color: '#FFF8E7', href: '/admin/parents' },
            { emoji: '✉️', count: allInvitations.length, label: 'Einladungen', color: '#F0F4FF', href: '/admin/invitations' },
            { emoji: '🍽️', count: null, label: 'Speiseplan', color: '#FFF0E8', href: '/admin/meals' },
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
              {pending.length === 0 && (
                <p className="px-5 py-4 text-sm text-gray-400 font-semibold">Keine ausstehenden Freischaltungen</p>
              )}
              {pending.slice(0, 5).map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                  <a href="/admin/parents" className="kc-btn text-xs bg-teal-600 text-white px-3 py-1.5">Verwalten</a>
                </div>
              ))}
            </div>
          </div>

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
              {allInvitations.length === 0 && (
                <p className="px-5 py-4 text-sm text-gray-400 font-semibold">Noch keine Einladungen gesendet</p>
              )}
              {allInvitations.map(inv => (
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
