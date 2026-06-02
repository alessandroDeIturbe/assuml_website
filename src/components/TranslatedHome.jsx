'use client'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function TranslatedHome() {
  const { t } = useLang()
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="py-32 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-8">
          {t('home.tagline')}
        </p>
        <h1 className="font-black text-[clamp(3.5rem,10vw,8rem)] leading-none tracking-tight text-neutral-900 dark:text-white max-w-4xl">
          {t('home.hero')}{' '}
          <span style={{
            background: 'linear-gradient(90deg,#FF4D4D,#00CFCF,#AAFF00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>ASSUML</span>.
        </h1>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/appunti"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition">
            {t('home.ctaAppunti')} <span className="text-[#AAFF00]">→</span>
          </Link>
          <Link href="/cisiamo"
            className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-900 dark:border-neutral-200 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition">
            {t('home.ctaPodcast')} <span className="text-[#00CFCF]">→</span>
          </Link>
        </div>
      </section>

      {/* ── Sezioni ─────────────────────────────────────────────────── */}
      {[
        { titleKey: 'home.appuntiTitle', descKey: 'home.appuntiDesc', ctaKey: 'home.appuntiCta', href: '/appunti',    accent: '#FF4D4D' },
        { titleKey: 'home.podcastTitle', descKey: 'home.podcastDesc', ctaKey: 'home.podcastCta', href: '/cisiamo',   accent: '#00CFCF' },
        { titleKey: 'home.sostieniTitle',descKey: 'home.sostieniDesc',ctaKey: 'home.sostienicCta',href:'/sostienici', accent: '#AAFF00' },
      ].map(({ titleKey, descKey, ctaKey, href, accent }, i, arr) => (
        <section key={titleKey}
          className={`py-24 grid md:grid-cols-[1fr_2fr] gap-16 items-start ${i < arr.length-1 ? 'border-b border-neutral-200 dark:border-neutral-800' : ''}`}>
          <div>
            <span className="inline-block w-2 h-2 rounded-full mb-4" style={{ background: accent }} />
            <h2 className="font-bold text-4xl tracking-tight text-neutral-900 dark:text-white leading-tight"
              dangerouslySetInnerHTML={{ __html: t(titleKey).replace(' & ', '<br />&amp; ') }} />
          </div>
          <div className="space-y-6">
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-prose">{t(descKey)}</p>
            <Link href={href}
              className="text-sm font-mono underline underline-offset-4 text-neutral-900 dark:text-neutral-100 transition"
                onMouseEnter={e => (e.currentTarget.style.color = accent)}
              onMouseLeave={e => (e.currentTarget.style.color = '')}>
              {t(ctaKey)}
            </Link>
          </div>
        </section>
      ))}
    </>
  )
}
