'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ConfirmHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

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
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (profile?.role === 'admin') router.replace('/admin')
      else if (profile?.role === 'teacher') router.replace('/teacher')
      else router.replace('/parent')
    }

    handle()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-gray-600 font-bold text-lg">Anmeldung wird verarbeitet…</p>
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
