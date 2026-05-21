import { requireRole } from '@/lib/auth'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getLang } from '@/lib/getLang'
import Navbar from '@/components/navbar'
import ChildTabs from './child-tabs'
import AddChildForm from './add-child-form'

export default async function ParentChildPage() {
  const { profile, userId } = await requireRole('parent')
  const lang = await getLang()
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: children } = await admin
    .from('children')
    .select('id, name, birth_date, group_name, gender, allergies, dietary_notes, avatar_url, fav_color, fav_book, fav_food, fav_game, fav_song')
    .eq('parent_id', userId)
    .order('name')

  const childList = children ?? []

  // Load observations + stories for all children
  const details = await Promise.all(
    childList.map(async c => {
      const [{ data: obs }, { data: stories }] = await Promise.all([
        admin.from('observations').select('id, category, text, created_at').eq('child_id', c.id).order('created_at', { ascending: false }),
        admin.from('learning_stories').select('id, title, final_text, created_at').eq('child_id', c.id).eq('status', 'published').order('created_at', { ascending: false }),
      ])
      return { childId: c.id, observations: obs ?? [], stories: stories ?? [] }
    })
  )

  const unread = 0

  if (childList.length === 0) return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={unread} lang={lang} />
      <AddChildForm lang={lang} userId={userId} />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <Navbar profile={profile} unreadCount={unread} lang={lang} />
      <ChildTabs children={childList} details={details} lang={lang} userId={userId} />
    </div>
  )
}
