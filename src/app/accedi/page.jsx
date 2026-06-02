'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AccediPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const e = searchParams.get('error')
    if (e === 'DomainNotAllowed') setError('Accesso riservato agli account istituzionali (@conservatorio.ch).')
  }, [searchParams])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Email o password non corretti.'); return }
    router.push('/')
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div>
          <span
            className="font-black text-3xl tracking-tight"
            style={{
              background: 'linear-gradient(90deg,#FF4D4D,#00CFCF,#AAFF00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ASSUML
          </span>
          <h1 className="mt-3 font-bold text-2xl tracking-tight">Accedi</h1>
          <p className="mt-1 text-sm text-neutral-500">Portale studenti del Conservatorio della Svizzera Italiana</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Email</label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
              placeholder="nome@conservatorio.ch"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Password</label>
            <input
              type="password" required autoComplete="current-password"
              value={password} onChange={e => setPass(e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
            />
          </div>

          {error && <p className="text-[#FF4D4D] text-sm font-mono">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition disabled:opacity-40"
          >
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-neutral-950 px-3 text-xs text-neutral-400 font-mono">oppure</span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-3 border border-neutral-300 dark:border-neutral-700 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continua con Google
        </button>

      </div>
    </div>
  )
}
