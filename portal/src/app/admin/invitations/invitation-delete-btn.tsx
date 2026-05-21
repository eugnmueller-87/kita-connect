'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function InvitationDeleteBtn({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/admin/invite/${id}`, { method: 'DELETE' })
    onDeleted()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
      title="Einladung löschen"
    >
      <X size={14} />
    </button>
  )
}
