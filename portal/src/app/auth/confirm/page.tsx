'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'

function getLangFromCookie(): string {
  if (typeof document === 'undefined') return 'de'
  const match = document.cookie.match(/kc_lang=([^;]+)/)
  return match?.[1] ?? 'de'
}

function ConfirmHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tr } = useTranslation(getLangFromCookie())

  useEffect(() => {
    const supabase = createClient()
    const token_hash = searchParams.get('token_hash')
    const type = (searchParams.get('type') ?? 'email') as 'email' | 'magiclink'

    async function handle() {
      if (token_hash) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (error || !data.user) {
          console.error('[confirm] verifyOtp error:', error?.message)
          router.replace('/login?error=auth')
          return
        }
        redirect(supabase, data.user.id)
        return
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          subscription.unsubscribe()
          redirect(supabase, session.user.id)
        }
      })

      setTimeout(() => {
        router.replace('/login?error=auth')
      }, 10000)
    }

    async function redirect(supabase: ReturnType<typeof createClient>, userId: string) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const { data: pending } = await supabase
          .from('pending_registrations')
          .select('*')
          .eq('email', user.email)
          .is('completed_at', null)
          .single()

        if (pending) {
          await supabase.from('profiles').upsert({
            id: userId,
            email: user.email,
            role: pending.role,
            full_name: pending.full_name,
            phone: pending.phone,
            kita_id: pending.kita_id ?? null,
            onboarding_status: pending.role === 'parent' ? 'pending' : 'active',
          })
          await supabase
            .from('pending_registrations')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', pending.id)
        }
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (profile?.role === 'admin') router.replace('/admin')
      else if (profile?.role === 'teacher') router.replace('/teacher')
      else router.replace('/parent')
    }

    handle()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-gray-600 font-bold text-lg">{tr(t.auth.processing)}</p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmHandler />
    </Suspense>
  )
}
