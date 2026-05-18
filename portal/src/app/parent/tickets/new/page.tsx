import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { ArrowLeft } from 'lucide-react'
import NewTicketForm from './new-ticket-form'

export default async function NewTicketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} />

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
