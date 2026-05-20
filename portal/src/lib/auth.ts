import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export async function requireRole(role: Profile['role'] | Profile['role'][]): Promise<{ profile: Profile; userId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const allowed = Array.isArray(role) ? role : [role]
  if (!profile || !allowed.includes(profile.role as Profile['role'])) {
    redirect(`/${profile?.role ?? 'login'}`)
  }

  return { profile: profile as Profile, userId: user.id }
}
