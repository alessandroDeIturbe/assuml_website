'use client'
import { useState, useEffect } from 'react'
import Link           from 'next/link'
import { useSession } from 'next-auth/react'
import { useLang }    from '@/contexts/LanguageContext'
import BrandedImage   from '@/components/BrandedImage'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

export default function RamificazioniPage() {
  const { data: session } = useSession()
  const { t }             = useLang()
  const [dbContent, setDbContent] = useState({})
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.isAdmin

  useEffect(() => {
    fetch('/api/admin/projects/ramificazioni').then(r => r.ok ? r.json() : {}).then(setDbContent).catch(() => {})
  }, [])

  // Merge: DB sovrascrive i18n se presente
  const g = (key) => dbContent[key] || t(`ramificazioni.${key}`)
  const events          = Array.isArray(dbContent.events)          ? dbContent.events          : t('ramificazioni.events')
  const festivalPartners = Array.isArray(dbContent.festivalPartners) ? dbContent.festivalPartners : t('ramificazioni.festivalPartners')

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(135deg,#bfdbfe 0%,#e0f2fe 25%,#fef9c3 60%,#fde68a 100%)', color: '#1e1b4b' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20 relative">

        {isAdmin && (
          <Link href="/admin/projects/ramificazioni"
            className="absolute top-6 right-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono
              border border-indigo-950/20 text-indigo-950/50
              hover:text-indigo-950 hover:border-indigo-950/50 transition">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {t('common.edit')}
          </Link>
        )}

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            {/* Logo — nessun filtro, colori nativi */}
            <BrandedImage
              src="/imgs/logos/ramificazioni logo PNG.PNG"
              alt="Festival Ramificazioni"
              className="w-full max-w-[clamp(20rem,45vw,35rem)] md:max-w-[38rem] h-auto object-contain"
            />

            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">
                {t('ramificazioni.label')}
              </p>
              <h1 className="font-black leading-tight" style={{ fontSize: 'clamp(2.8rem,7vw,5rem)' }}>
                {t('ramificazioni.title1')}<br />{t('ramificazioni.title2')}
              </h1>
              <p className="font-mono text-sm opacity-60">{g('edition')}</p>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <p className="text-lg leading-relaxed opacity-80 max-w-md">{g('heroPara1')}</p>
            <p className="text-base leading-relaxed opacity-70 max-w-md">{g('heroPara2')}</p>
            <a href="mailto:ramificazioni@assuml.ch"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
              style={{ background: '#1e1b4b', color: '#fef9c3' }}>
              {t('ramificazioni.contactBtn')}
            </a>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ────────────────────────────────────────────────── */}
      <section style={{ background: 'rgba(30,27,75,0.06)', borderTop: '1px solid rgba(30,27,75,0.12)', borderBottom: '1px solid rgba(30,27,75,0.12)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1fr_2fr] gap-16">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50 mb-4">
              {t('ramificazioni.manifestoLabel')}
            </p>
            <h2 className="font-black text-4xl leading-tight" style={{ color: '#1e1b4b', whiteSpace: 'pre-line' }}>
              {g('manifestoTitle')}
            </h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'rgba(30,27,75,0.65)' }}>
            <p>{g('manifesto1')}</p>
            <p>{g('manifesto2')}</p>
          </div>
        </div>
      </section>

      {/* ── PROGRAMMA ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50 mb-12">
          {t('ramificazioni.programLabel')}
        </p>
        <div className="space-y-6">
          {Array.isArray(events) && events.map(({ titolo, desc, luogo }) => (
            <div key={titolo} className="p-6 space-y-2"
              style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(30,27,75,0.1)' }}>
              <h3 className="font-bold text-lg" style={{ color: '#1e1b4b' }}>{titolo}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(30,27,75,0.65)' }}>{desc}</p>
              <p className="text-xs font-mono opacity-50">◦ {luogo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FESTIVAL PARTNER ─────────────────────────────────────────── */}
      <section style={{ background: 'rgba(30,27,75,0.05)', borderTop: '1px solid rgba(30,27,75,0.1)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50 mb-8">
            {t('ramificazioni.partnersLabel')}
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.isArray(festivalPartners) && festivalPartners.map(p => (
              <div key={p} className="px-6 py-6"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(30,27,75,0.08)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full mb-3" style={{ background: '#6d28d9' }} />
                <p className="font-semibold" style={{ color: '#1e1b4b' }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
