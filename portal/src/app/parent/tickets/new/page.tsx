import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'
import NewTicketForm from './new-ticket-form'
import type { Profile } from '@/types'

const mockProfile: Profile = {
  id: 'dev-parent', full_name: 'Anna Müller', email: 'anna@example.de',
  role: 'parent', phone: null, notify_email: true, notify_sms: false,
  onboarding_status: 'active', created_at: new Date().toISOString(),
}

export default function NewTicketPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={mockProfile} unreadCount={0} />

      <div className="max-w-2xl mx-auto px-4 py-8">

        <a href="/parent/tickets" className="flex items-center gap-1 text-teal-600 text-sm font-bold hover:underline mb-4">
          <ArrowLeft size={14} /> Zurück zu Nachrichten
        </a>

        <div className="kc-card p-6 mb-6 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #2EA89A, #1D7A6F)' }}>
          <div className="text-6xl flex-shrink-0">✏️</div>
          <div>
            <h1 className="text-2xl font-black text-white">Neue Anfrage</h1>
            <p className="text-teal-200 font-semibold text-sm mt-1">Nachricht an das Kita-Team</p>
          </div>
        </div>

        <NewTicketForm />

      </div>
    </div>
  )
}
