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
  const [error, setError] = useState('')

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    setError('')
    const res = await fetch('/api/teacher/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticketId, body: reply.trim() }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Senden')
      setSending(false)
      return
    }
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
          {error && <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>}
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
        {[
          { value: 'open', label: `🟢 ${tr(t.status.markOpen)}`, active: 'bg-teal-500 text-white', inactive: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
          { value: 'in_progress', label: `🟡 ${tr(t.status.markInProgress)}`, active: 'bg-yellow-400 text-white', inactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
          { value: 'closed', label: `⚫ ${tr(t.status.markClosed)}`, active: 'bg-gray-500 text-white', inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
        ].map(s => (
          <button key={s.value} onClick={() => changeStatus(s.value)} disabled={updatingStatus || currentStatus === s.value}
            className={`kc-btn text-xs font-bold px-4 py-2 transition-colors ${currentStatus === s.value ? s.active + ' cursor-default' : s.inactive}`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
