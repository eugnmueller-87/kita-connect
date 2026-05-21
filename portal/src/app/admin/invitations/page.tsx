import Navbar from '@/components/navbar'
import InviteForm from './invite-form'
import InvitationList from './invitation-list'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { getLang } from '@/lib/getLang'
import { t } from '@/lib/translations'

export default async function AdminInvitationsPage() {
  const { profile } = await requireRole(['admin', 'super_admin', 'traeger_admin'])
  const supabase = await createClient()
  const lang = await getLang()
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de
  const isSuperAdmin = (profile.role as string) === 'super_admin'

  const [{ data }, { data: kitas }] = await Promise.all([
    supabase.from('invitations').select('id, email, role, used_at, created_at, kita_id').order('created_at', { ascending: false }),
    isSuperAdmin ? supabase.from('kitas').select('id, name').order('name') : Promise.resolve({ data: [] }),
  ])

  const invitations = data ?? []

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={lang} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        <a href="/admin" className="text-teal-600 text-sm font-bold hover:underline mb-4 block">{tr(t.common.back)}</a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)' }}>
          <div className="text-6xl flex-shrink-0">✉️</div>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.adminInvitations.heading)}</h1>
            <p className="text-purple-200 font-semibold text-sm mt-1">{invitations.length} {tr(t.adminInvitations.sentInvites).toLowerCase()}</p>
          </div>
        </div>

        <div className="kc-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📨</span>
            <h2 className="font-black text-gray-800">{tr(t.adminInvitations.newInvite)}</h2>
          </div>
          <InviteForm lang={lang} kitas={kitas ?? []} isSuperAdmin={isSuperAdmin} />
        </div>

        <div className="kc-card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#EDE8DF] flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="font-black text-gray-800">{tr(t.adminInvitations.sentInvites)}</h2>
          </div>
          <InvitationList initialInvitations={invitations} lang={lang} />
        </div>

      </div>
    </div>
  )
}
