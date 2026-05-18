import Navbar from '@/components/navbar'
import { ChevronRight } from 'lucide-react'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-admin',
  full_name: 'Admin Nutzer',
  email: 'admin@kita-connect.de',
  role: 'admin',
  phone: null,
  notify_email: true,
  notify_sms: false,
  onboarding_status: 'active',
  created_at: new Date().toISOString(),
}

const mockParents = [
  { id: '1', full_name: 'Anna Müller', email: 'anna@example.de', onboarding_status: 'pending' },
  { id: '2', full_name: 'Thomas Becker', email: 'thomas@example.de', onboarding_status: 'pending' },
  { id: '3', full_name: 'Sara Klein', email: 'sara@example.de', onboarding_status: 'active' },
]

const mockInvitations = [
  { id: '1', email: 'neue.mutter@example.de', role: 'parent', created_at: new Date().toISOString() },
  { id: '2', email: 'erzieherin@example.de', role: 'teacher', created_at: new Date(Date.now() - 86400000).toISOString() },
]

export default function AdminDashboard() {
  const profile = mockProfile
  const parents = mockParents
  const pending = mockParents.filter(p => p.onboarding_status === 'pending')
  const invitations = mockInvitations

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
            { emoji: '👨‍👩‍👧', count: parents.length, label: 'Eltern gesamt', color: '#E1F5EE', href: '/admin/parents' },
            { emoji: '⏳', count: pending.length, label: 'Ausstehend', color: '#FFF8E7', href: '/admin/parents' },
            { emoji: '✉️', count: invitations.length, label: 'Einladungen', color: '#F0F4FF', href: '/admin/invitations' },
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
              {pending.map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="kc-btn text-xs bg-teal-600 text-white px-3 py-1.5">✅ Ja</button>
                    <button className="kc-btn text-xs bg-red-100 text-red-600 px-3 py-1.5">❌ Nein</button>
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
              {invitations.map(inv => (
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
