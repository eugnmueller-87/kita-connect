'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/translations'
import { useTranslation } from '@/lib/useTranslation'
import type { Lang } from '@/lib/translations'

export default function TicketActions({ ticketId, currentStatus, lang }: {
  ticketId: string
  currentStatus: string
  lang: Lang
}) {
  const router = useRouter()
  const { tr } = useTranslation(lang)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    await fetch('/api/teacher/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticketId, body: reply.trim() }),
    })
    setReply('')
    setSending(false)
    router.refresh()
  }

  async function changeStatus(status: string) {
    setUpdatingStatus(true)
    await fetch('/api/teacher/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ticketId, status }),
    })
    setUpdatingStatus(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {/* Reply form */}
      {currentStatus !== 'closed' && (
        <form onSubmit={sendReply} className="kc-card p-4">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={3}
            placeholder="Antwort schreiben…"
            className="kc-input w-full px-4 py-3 text-sm resize-none"
            required
          />
          <div className="flex justify-end mt-3">
            <button type="submit" disabled={sending || !reply.trim()}
              className="kc-btn bg-teal-600 text-white font-black text-sm px-5 py-2.5 hover:bg-teal-700 transition-colors disabled:opacity-50">
              {sending ? '⏳' : tr(t.common.send)}
            </button>
          </div>
        </form>
      )}

      {/* Status buttons */}
      <div className="kc-card p-4 flex flex-wrap gap-2">
        <p className="w-full text-xs font-black text-gray-500 mb-1">Status ändern:</p>
        {currentStatus !== 'open' && (
          <button onClick={() => changeStatus('open')} disabled={updatingStatus}
            className="kc-btn text-xs font-bold px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors">
            🟢 {tr(t.status.markOpen)}
          </button>
        )}
        {currentStatus !== 'in_progress' && (
          <button onClick={() => changeStatus('in_progress')} disabled={updatingStatus}
            className="kc-btn text-xs font-bold px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors">
            🟡 {tr(t.status.markInProgress)}
          </button>
        )}
        {currentStatus !== 'closed' && (
          <button onClick={() => changeStatus('closed')} disabled={updatingStatus}
            className="kc-btn text-xs font-bold px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            ⚫ {tr(t.status.markClosed)}
          </button>
        )}
      </div>

      {currentStatus === 'closed' && (
        <div className="kc-card px-5 py-4 text-center" style={{ background: '#F5F0E8' }}>
          <p className="text-gray-500 font-semibold text-sm">{tr(t.status.ticketClosed)}</p>
          <button onClick={() => changeStatus('open')} disabled={updatingStatus}
            className="mt-2 text-xs text-teal-600 font-bold hover:underline">
            🟢 {tr(t.status.markOpen)}
          </button>
        </div>
      )}
    </div>
  )
}
