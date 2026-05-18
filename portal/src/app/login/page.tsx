'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #F5F0E8 50%, #FFF8E7 100%)' }}>

      {/* Floating decorations */}
      <div className="fixed top-10 left-10 text-5xl opacity-20 select-none">🌤️</div>
      <div className="fixed top-20 right-16 text-4xl opacity-20 select-none">⭐</div>
      <div className="fixed bottom-16 left-20 text-4xl opacity-20 select-none">🌱</div>
      <div className="fixed bottom-10 right-10 text-5xl opacity-20 select-none">🎨</div>

      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🏡</div>
          <h1 className="text-3xl font-black text-teal-700 tracking-tight">Kita Connect</h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">Eltern- und Erzieherportal</p>
        </div>

        {/* Card */}
        <div className="kc-card p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📬</div>
              <h2 className="text-xl font-black text-gray-800 mb-2">E-Mail gesendet!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Wir haben einen Magic Link an<br />
                <strong className="text-teal-700">{email}</strong><br />
                gesendet. Klicke auf den Link zum Anmelden.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-teal-600 text-sm font-bold underline underline-offset-2"
              >
                Andere E-Mail verwenden
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Deine E-Mail-Adresse
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@beispiel.de"
                  className="kc-input w-full px-4 py-3 text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="kc-btn w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black py-3.5 text-sm transition-colors"
              >
                {loading ? '⏳ Wird gesendet…' : '✉️  Magic Link senden'}
              </button>

              <p className="text-center text-xs text-gray-400 font-semibold pt-1">
                Kein Passwort nötig — sicher & einfach 🔒
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-semibold">
          DSGVO-konform · EU-Hosting 🇪🇺
        </p>
      </div>
    </div>
  )
}
