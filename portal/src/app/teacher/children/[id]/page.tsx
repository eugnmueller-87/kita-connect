import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getLang } from '@/lib/getLang'
import Navbar from '@/components/navbar'
import ChildDetailClient from './child-detail-client'

export default async function ChildDetailPage({ params }: { params: { id: string } }) {
  const { profile, userId } = await requireRole('teacher')
  const supabase = await createClient()
  const lang = await getLang()

  const [{ data: child }, { data: observations }, { data: stories }] = await Promise.all([
    supabase
      .from('children')
      .select('id, name, birth_date, group_name, gender, allergies, dietary_notes')
      .eq('id', params.id)
      .single(),
    supabase
      .from('observations')
      .select('id, category, text, created_at')
      .eq('child_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('learning_stories')
      .select('id, title, status, created_at')
      .eq('child_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  if (!child) notFound()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={0} lang={lang} />
      <ChildDetailClient
        child={child}
        observations={observations ?? []}
        stories={stories ?? []}
        teacherId={userId}
        lang={lang}
      />
    </div>
  )
}
