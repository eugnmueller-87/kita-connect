'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/useTranslation'
import { t } from '@/lib/translations'

function getLangFromCookie(): string {
  if (typeof document === 'undefined') return 'de'
  const match = document.cookie.match(/kc_lang=([^;]+)/)
  return match?.[1] ?? 'de'
}

export default function LoginPage() {
  const { tr } = useTranslation(getLangFromCookie())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr || !data.user) {
      setError(authErr?.message ?? 'Anmeldung fehlgeschlagen')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (['admin', 'super_admin', 'traeger_admin'].includes(profile?.role ?? '')) window.location.href = '/admin'
    else if (profile?.role === 'teacher') window.location.href = '/teacher'
    else window.location.href = '/parent'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 50%, #FFF8E7 100%)' }}>
      <div className="fixed top-10 left-10 text-5xl opacity-20 select-none">🌤️</div>
      <div className="fixed top-20 right-16 text-4xl opacity-20 select-none">⭐</div>
      <div className="fixed bottom-16 left-20 text-4xl opacity-20 select-none">🌱</div>
      <div className="fixed bottom-10 right-10 text-5xl opacity-20 select-none">🎨</div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🏡</div>
          <h1 className="text-3xl font-black text-teal-700 tracking-tight">{tr(t.login.title)}</h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">{tr(t.login.subtitle)}</p>
        </div>

        <div className="kc-card p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.login.emailLabel)}</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={tr(t.login.emailPlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{tr(t.login.passwordLabel)}</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tr(t.login.passwordPlaceholder)}
                className="kc-input w-full px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="kc-btn w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black py-3.5 text-sm transition-colors"
            >
              {loading ? tr(t.login.signingIn) : tr(t.login.signIn)}
            </button>

            <div className="text-center space-y-1 pt-1">
              <a href="/forgot-password" className="block text-xs text-teal-600 font-bold underline underline-offset-2">
                {tr(t.login.forgotPassword)}
              </a>
              <p className="text-xs text-gray-400 font-semibold">{tr(t.login.noAccount)}</p>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-semibold">{tr(t.common.gdpr)}</p>
      </div>
    </div>
  )
}
