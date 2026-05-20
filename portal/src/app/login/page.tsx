'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSend(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, data: {} },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  async function handleVerify(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (error || !data.user) {
      const msg = error ? `${error.message} (status: ${error.status})` : 'Kein Nutzer zurückgegeben'
      setError(msg)
      setLoading(false)
      return
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'admin') router.replace('/admin')
    else if (profile?.role === 'teacher') router.replace('/teacher')
    else router.replace('/parent')
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
          {!sent ? (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  {tr(t.login.emailLabel)}
                </label>
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
              <button type="submit" disabled={loading} className="kc-btn w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black py-3.5 text-sm transition-colors">
                {loading ? tr(t.login.sending) : tr(t.login.sendCode)}
              </button>
              <p className="text-center text-xs text-gray-400 font-semibold pt-1">{tr(t.login.noPassword)}</p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center mb-2">
                <div className="text-5xl mb-3">📬</div>
                <p className="text-sm text-gray-500 font-semibold">{tr(t.login.codeSentTo)} <strong className="text-teal-700">{email}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  {tr(t.login.codeLabel)}
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="12345678"
                  className="kc-input w-full px-4 py-3 text-sm text-center tracking-widest text-2xl font-black"
                  maxLength={8}
                />
              </div>
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold">{error}</div>
              )}
              <button type="submit" disabled={loading || code.length < 6} className="kc-btn w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black py-3.5 text-sm transition-colors">
                {loading ? tr(t.login.verifying) : tr(t.login.verify)}
              </button>
              <button type="button" onClick={() => { setSent(false); setCode(''); setError('') }} className="w-full text-teal-600 text-sm font-bold underline underline-offset-2">
                {tr(t.login.otherEmail)}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-semibold">{tr(t.common.gdpr)}</p>
      </div>
    </div>
  )
}
