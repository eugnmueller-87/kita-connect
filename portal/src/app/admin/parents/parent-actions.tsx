'use client'

import { t } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

export default function ParentActions({ parentId, lang = 'de' }: { parentId: string; lang?: Lang }) {
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de
  return (
    <div className="flex gap-2 flex-shrink-0">
      <form action="/api/admin/approve" method="POST">
        <input type="hidden" name="parent_id" value={parentId} />
        <input type="hidden" name="action" value="approve" />
        <button type="submit" className="kc-btn text-xs bg-teal-600 text-white px-3 py-1.5">
          {tr(t.adminParents.approve)}
        </button>
      </form>
      <form action="/api/admin/approve" method="POST">
        <input type="hidden" name="parent_id" value={parentId} />
        <input type="hidden" name="action" value="reject" />
        <button type="submit" className="kc-btn text-xs bg-red-100 text-red-600 px-3 py-1.5">
          {tr(t.adminParents.reject)}
        </button>
      </form>
    </div>
  )
}
