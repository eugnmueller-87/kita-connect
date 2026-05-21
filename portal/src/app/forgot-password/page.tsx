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

export default function ForgotPasswordPage() {
  const { tr } = useTranslation(getLangFromCookie())
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetErr) {
      setError(resetErr.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 50%, #FFF8E7 100%)' }}>
      <div className="fixed top-10 left-10 text-5xl opacity-20 select-none">🌤️</div>
      <div className="fixed bottom-10 right-10 text-5xl opacity-20 select-none">🎨</div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🔑</div>
          <h1 className="text-3xl font-black text-teal-700 tracking-tight">{tr(t.forgotPassword.title)}</h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">{tr(t.forgotPassword.subtitle)}</p>
        </div>

        <div className="kc-card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-6xl">📬</div>
              <p className="text-sm text-gray-600 font-semibold">{tr(t.forgotPassword.sent)}</p>
              <a href="/login" className="block text-teal-600 font-bold text-sm underline underline-offset-2">
                {tr(t.forgotPassword.backToLogin)}
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="kc-btn w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black py-3.5 text-sm transition-colors"
              >
                {loading ? tr(t.forgotPassword.sending) : tr(t.forgotPassword.send)}
              </button>

              <a href="/login" className="block text-center text-xs text-teal-600 font-bold underline underline-offset-2 pt-1">
                {tr(t.forgotPassword.backToLogin)}
              </a>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-semibold">{tr(t.common.gdpr)}</p>
      </div>
    </div>
  )
}
