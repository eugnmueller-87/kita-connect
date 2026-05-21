'use client'

import { useState } from 'react'
import InvitationDeleteBtn from './invitation-delete-btn'
import type { Lang } from '@/lib/translations'
import { t } from '@/lib/translations'

type Invitation = {
  id: string
  email: string
  role: string
  used_at: string | null
  created_at: string
}

export default function InvitationList({ initialInvitations, lang }: { initialInvitations: Invitation[]; lang: Lang }) {
  const [invitations, setInvitations] = useState(initialInvitations)
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  if (invitations.length === 0) {
    return <p className="px-5 py-6 text-sm text-gray-400 font-semibold text-center">{tr(t.adminInvitations.noInvites)}</p>
  }

  return (
    <div className="divide-y-2 divide-[#F5F0E8]">
      {invitations.map(inv => (
        <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800">{inv.email}</p>
            <p className="text-xs text-gray-400 font-semibold">{new Date(inv.created_at).toLocaleDateString('de-DE')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="kc-badge bg-teal-100 text-teal-700 text-xs">
              {inv.role === 'parent' ? `👨‍👩‍👧 ${tr(t.common.role_parent)}` : `👩‍🏫 ${tr(t.common.role_teacher)}`}
            </span>
            <span className={`kc-badge text-xs ${inv.used_at ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
              {inv.used_at ? tr(t.status.approved) : tr(t.status.pending)}
            </span>
            <InvitationDeleteBtn id={inv.id} onDeleted={() => setInvitations(prev => prev.filter(i => i.id !== inv.id))} />
          </div>
        </div>
      ))}
    </div>
  )
}
