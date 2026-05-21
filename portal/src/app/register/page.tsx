'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'

function getLangFromCookie(): string {
  if (typeof document === 'undefined') return 'de'
  const match = document.cookie.match(/kc_lang=([^;]+)/)
  return match?.[1] ?? 'de'
}

function RegisterHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { tr } = useTranslation(getLangFromCookie())

  const [step, setStep] = useState<'loading' | 'form' | 'error'>('loading')
  const [invitation, setInvitation] = useState<{ email: string; role: string } | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStep('error')
      return
    }
    async function validateToken() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('invitations')
        .select('email, role, used_at')
        .eq('token', token)
        .single()

      if (error || !data || data.used_at) {
        setStep('error')
        return
      }
      setInvitation({ email: data.email, role: data.role })
      setStep('form')
    }
    validateToken()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !invitation) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, full_name: fullName.trim(), phone: phone.trim() || null }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? 'Fehler beim Registrieren')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email: invitation.email,
      options: { shouldCreateUser: true },
    })

    router.replace(`/login?registered=1&email=${encodeURIComponent(invitation.email)}`)
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 font-bold text-lg">{tr(t.register.checking)}</p>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 100%)' }}>
        <div className="kc-card p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-xl font-black text-gray-800 mb-2">{tr(t.register.invalidTitle)}</h1>
          <p className="text-sm text-gray-500 font-semibold">{tr(t.register.invalidMsg)}</p>
          <a href="/login" className="mt-6 block text-teal-600 font-bold text-sm underline">{tr(t.register.toLogin)}</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 50%, #FFF8E7 100%)' }}>
      <div className="fixed top-10 left-10 text-5xl opacity-20 select-none">🌤️</div>
      <div className="fixed bottom-10 right-10 text-5xl opacity-20 select-none">🎨</div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🏡</div>
          <h1 className="text-3xl font-black text-teal-700 tracking-tight">Kita Connect</h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">{tr(t.register.subtitle)}</p>
        </div>

        <div className="kc-card p-8">
          <div className="mb-5 p-3 rounded-2xl bg-teal-50 border-2 border-teal-200 text-sm text-teal-700 font-semibold text-center">
            {tr(t.register.invitedAs)} <strong>{invitation?.role === 'parent' ? tr(t.common.role_parent) : tr(t.common.role_teacher)}</strong>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.email)}</label>
              <input
                type="email"
                value={invitation?.email ?? ''}
                disabled
                className="kc-input w-full px-4 py-3 text-sm opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.common.name)}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={tr(t.register.namePlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                {tr(t.common.phone)} <span className="font-normal text-gray-400">{tr(t.common.optional)}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={tr(t.register.phonePlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting || !fullName.trim()}
              className="kc-btn w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black py-3.5 text-sm transition-colors"
            >
              {submitting ? tr(t.register.creating) : tr(t.register.create)}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-semibold">{tr(t.common.gdpr)}</p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterHandler />
    </Suspense>
  )
}
