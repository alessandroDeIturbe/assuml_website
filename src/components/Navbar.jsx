'use client'
import { useState, useRef, useEffect } from 'react'
import Link              from 'next/link'
import Image             from 'next/image'
import { useTheme }      from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import { useLang }       from '@/contexts/LanguageContext'

// ── Struttura menu ────────────────────────────────────────────────────────
const NAV_STRUCTURE = [
  { label: 'Chi siamo',  href: '/associazione' },
  { label: 'Eventi',     href: '/eventi' },
  {
    label: 'Progetti',
    dropdown: [
      { href: '/cisiamo',    label: 'CiSiamo Podcast', accent: '#00CFCF' },
      { href: '/ramificazioni', label: 'Ramificazioni', accent: '#FF4D4D' },
    ],
  },
  { label: 'Shop',       href: '/shop' },
  {
    label: 'Risorse',
    dropdown: [
      { href: '/appunti',    label: 'Appunti',              accent: '#FF4D4D' },
      { href: '/convenzioni',label: 'Convenzioni',          accent: '#D4AF37' },
      { href: '/guida',      label: 'Guida dello studente', accent: '#A78BFA' },
    ],
  },
  { label: 'Sostienici', href: '/sostienici' },
]

function initials(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (email?.[0] ?? '?').toUpperCase()
}

function AvatarBubble({ user }) {
  const [imgOk, setImgOk] = useState(true)
  const src = (user.image ?? '').replace(/^"+|"+$/g, '')
  if (src && imgOk) {
    return (
      <img src={src} alt={user.name ?? 'Avatar'} referrerPolicy="no-referrer"
        className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
        onError={() => setImgOk(false)} />
    )
  }
  return (
    <span className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold select-none">
      {initials(user.name, user.email)}
    </span>
  )
}

// Dropdown chevron icon
function Chevron({ open }) {
  return (
    <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 1l5 5 5-5" />
    </svg>
  )
}

export default function Navbar() {
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [dropOpen,    setDropOpen]    = useState(false)   // user avatar dropdown
  const [openMenu,    setOpenMenu]    = useState(null)    // quale dropdown nav è aperto (label)
  const [mobileExpanded, setMobileExpanded] = useState({}) // dropdown aperti nel mobile

  const dropRef = useRef(null)
  const navRef  = useRef(null)

  const { resolvedTheme, setTheme } = useTheme()
  const { data: session }           = useSession()
  const { lang, setLang, t }        = useLang()

  // Chiudi al click fuori
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
      if (navRef.current  && !navRef.current.contains(e.target))  setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggleMobileSection(label) {
    setMobileExpanded(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 dark:bg-[#121212]/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <nav ref={navRef} className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ───────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 select-none shrink-0">
          <div className="relative w-7 h-7">
            <Image src="/imgs/logos/assuml_logo.png" alt="ASSUML" fill className="object-contain" sizes="28px" priority />
          </div>
          <span className="font-black text-lg tracking-tight hidden sm:block" style={{
            background: 'linear-gradient(90deg,#FF4D4D,#00CFCF,#AAFF00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>ASSUML</span>
        </Link>

        {/* ── Desktop nav ────────────────────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-1 flex-1">
          {NAV_STRUCTURE.map(item => (
            <li key={item.label} className="relative">
              {item.href ? (
                <Link href={item.href}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors block">
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                    <Chevron open={openMenu === item.label} />
                  </button>
                  {openMenu === item.label && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg z-50 animate-fade-in">
                      {item.dropdown.map(({ href, label, accent }) => (
                        <Link key={href} href={href}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>

        {/* ── Right controls ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language */}
          <button onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
            className="hidden md:flex items-center text-[11px] font-mono font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition px-1.5">
            <span className={lang === 'it' ? 'text-neutral-900 dark:text-white' : ''}>IT</span>
            <span className="opacity-30 mx-0.5">|</span>
            <span className={lang === 'en' ? 'text-neutral-900 dark:text-white' : ''}>EN</span>
          </button>

          {/* Theme */}
          <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="hidden md:flex w-8 h-8 items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition text-sm"
            aria-label="Tema">
            {resolvedTheme === 'dark' ? '☀' : '◑'}
          </button>

          {/* User avatar / accedi */}
          {session?.user ? (
            <div className="relative hidden md:block" ref={dropRef}>
              <button onClick={() => setDropOpen(o => !o)} className="focus:outline-none">
                <AvatarBubble user={session.user} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{session.user.name ?? 'Utente'}</p>
                    <p className="text-[11px] font-mono text-neutral-400 truncate">{session.user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/area-personale" onClick={() => setDropOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                      {t('nav.areaPersonale')}
                    </Link>
                    {(session.user.isAdmin || session.user.email === 'studenti@conservatorio.ch') && (
                      <Link href="/admin" onClick={() => setDropOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-[#FF4D4D] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                        {t('nav.pannelloAdmin')}
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-neutral-100 dark:border-neutral-800 py-1">
                    <button onClick={() => { setDropOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                      {t('nav.esci')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/accedi"
              className="hidden md:inline-flex items-center px-4 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-75 transition">
              {t('nav.accedi')}
            </Link>
          )}

          {/* Hamburger */}
          <button className="md:hidden p-1.5 text-neutral-700 dark:text-neutral-300"
            onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            {mobileOpen
              ? <span className="text-lg leading-none">✕</span>
              : <span className="block space-y-1"><span className="block w-5 h-0.5 bg-current"/><span className="block w-5 h-0.5 bg-current"/><span className="block w-3 h-0.5 bg-current"/></span>
            }
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="px-6 py-5 space-y-1">

            {NAV_STRUCTURE.map(item => (
              item.href ? (
                <Link key={item.label} href={item.href}
                  className="block py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 border-b border-neutral-100 dark:border-neutral-800"
                  onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <div key={item.label} className="border-b border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => toggleMobileSection(item.label)}
                    className="flex items-center justify-between w-full py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {item.label}
                    <Chevron open={!!mobileExpanded[item.label]} />
                  </button>
                  {mobileExpanded[item.label] && (
                    <div className="pb-3 space-y-2 pl-3">
                      {item.dropdown.map(({ href, label, accent }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
                          onClick={() => setMobileOpen(false)}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}

            {/* Controls in mobile */}
            <div className="pt-4 flex items-center gap-4">
              <button onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
                className="text-[11px] font-mono font-bold text-neutral-400">
                <span className={lang === 'it' ? 'text-neutral-900 dark:text-white' : ''}>IT</span>
                <span className="opacity-30 mx-0.5">|</span>
                <span className={lang === 'en' ? 'text-neutral-900 dark:text-white' : ''}>EN</span>
              </button>
              <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="text-xs text-neutral-400">
                {resolvedTheme === 'dark' ? '☀ Chiaro' : '◑ Scuro'}
              </button>
            </div>

            {/* Auth mobile */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              {session?.user ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-mono text-neutral-400">{session.user.email}</p>
                  <Link href="/area-personale" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300" onClick={() => setMobileOpen(false)}>
                    {t('nav.areaPersonale')}
                  </Link>
                  {(session.user.isAdmin || session.user.email === 'studenti@conservatorio.ch') && (
                    <Link href="/admin" className="block text-sm font-semibold text-[#FF4D4D]" onClick={() => setMobileOpen(false)}>
                      {t('nav.pannelloAdmin')}
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    className="block text-sm text-neutral-500 dark:text-neutral-400">
                    {t('nav.esci')}
                  </button>
                </div>
              ) : (
                <Link href="/accedi" className="block text-sm font-semibold text-[#FF4D4D]" onClick={() => setMobileOpen(false)}>
                  {t('nav.accedi')} →
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  )
}
