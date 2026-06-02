'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import { useLang } from '@/contexts/LanguageContext'

const NAV_KEYS = [
  { href: '/appunti',    key: 'nav.appunti' },
  { href: '/cisiamo',   key: 'nav.cisiamo' },
  { href: '/sostienici', key: 'nav.sostienici' },
  { href: '/contatti',   key: 'nav.contatti' },
]

function initials(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (email?.[0] ?? '?').toUpperCase()
}

function AvatarBubble({ user }) {
  const [imgOk, setImgOk] = useState(true)
  const src = user.image?.replace(/^"+|"+$/g, '') // rimuove virgolette spurie

  if (src && imgOk) {
    return (
      <img
        src={src}
        alt={user.name ?? 'Avatar'}
        referrerPolicy="no-referrer"
        className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
        onError={() => setImgOk(false)}
      />
    )
  }
  return (
    <span className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold select-none">
      {initials(user.name, user.email)}
    </span>
  )
}

export default function Navbar() {
  const [open, setOpen]         = useState(false)       // mobile menu
  const [dropOpen, setDropOpen] = useState(false)       // user dropdown
  const dropRef                 = useRef(null)
  const { resolvedTheme, setTheme } = useTheme()
  const { data: session }       = useSession()
  const { lang, setLang, t }    = useLang()

  // Chiudi dropdown al click fuori
  useEffect(() => {
    function onOut(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-[#121212]/90 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 select-none">
          <span className="font-black text-xl tracking-tight" style={{
            background: 'linear-gradient(90deg,#FF4D4D,#00CFCF,#AAFF00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            ASSUML
          </span>
          <span className="hidden sm:block text-[10px] font-mono text-neutral-400 uppercase tracking-widest leading-tight">
            Associazione<br />Studenti
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_KEYS.map(({ href, key }) => (
            <li key={href}>
              <Link href={href} className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                {t(key)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
            className="hidden md:flex items-center text-[11px] font-mono font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition gap-0.5"
            aria-label="Cambia lingua"
          >
            <span className={lang === 'it' ? 'text-neutral-900 dark:text-white' : ''}>IT</span>
            <span className="opacity-30 mx-0.5">|</span>
            <span className={lang === 'en' ? 'text-neutral-900 dark:text-white' : ''}>EN</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="hidden md:flex w-8 h-8 items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            aria-label="Cambia tema"
          >
            {resolvedTheme === 'dark' ? '☀' : '◑'}
          </button>

          {/* Auth area */}
          {session?.user ? (
            <div className="relative" ref={dropRef}>
              {/* Avatar */}
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 focus:outline-none"
                aria-label="Menu utente"
              >
                <AvatarBubble user={session.user} />
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg animate-fade-in z-50">
                  {/* Info utente */}
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{session.user.name ?? 'Utente'}</p>
                    <p className="text-[11px] font-mono text-neutral-400 truncate">{session.user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/area-personale"
                      onClick={() => setDropOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                      Area personale
                    </Link>

                    {session.user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-[#FF4D4D] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                      >
                        ⚙ Pannello Admin
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 py-1">
                    <button
                      onClick={() => { setDropOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                      Esci
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/accedi"
              className="hidden md:inline-flex items-center px-4 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-75 transition"
            >
              {t('nav.accedi')}
            </Link>
          )}

          {/* Hamburger */}
          <button className="md:hidden p-1.5 text-neutral-700 dark:text-neutral-300" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open
              ? <span className="text-lg leading-none">✕</span>
              : <span className="block space-y-1"><span className="block w-5 h-0.5 bg-current"/><span className="block w-5 h-0.5 bg-current"/><span className="block w-3 h-0.5 bg-current"/></span>
            }
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] animate-fade-in">
          <ul className="px-6 py-4 space-y-4">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300" onClick={() => setOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
              {session?.user ? (
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-semibold text-[#FF4D4D]">
                  Esci
                </button>
              ) : (
                <Link href="/accedi" className="block text-sm font-semibold text-[#FF4D4D]" onClick={() => setOpen(false)}>
                  Accedi →
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
