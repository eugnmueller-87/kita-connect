import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'
import NewTicketForm from './new-ticket-form'
import { getLang } from '@/lib/getLang'
import { t } from '@/lib/translations'
import { requireRole } from '@/lib/auth'

export default async function NewTicketPage() {
  const { profile } = await requireRole('parent')
  const lang = await getLang()
  const tr = (node: { de: string; en: string; tr: string; ru: string }) => node[lang] ?? node.de

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={lang} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <a href="/parent/tickets" className="flex items-center gap-1 text-teal-600 text-sm font-bold hover:underline mb-4">
          <ArrowLeft size={14} /> {tr(t.common.backMessages)}
        </a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="text-6xl flex-shrink-0">✏️</div>
          <div>
            <h1 className="text-2xl font-black text-white">{tr(t.tickets.newHeading)}</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">{tr(t.tickets.newSubtitle)}</p>
          </div>
        </div>

        <NewTicketForm lang={lang} />

      </div>
    </div>
  )
}
