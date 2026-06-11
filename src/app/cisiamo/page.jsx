'use client'
import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { useSession }          from 'next-auth/react'
import { useLang }             from '@/contexts/LanguageContext'

const SPOTIFY_URL = 'https://open.spotify.com/show/67aZjwavqo0YFM4he8NE4i'
const YOUTUBE_URL = 'https://www.youtube.com/@CiSIamoPodcast'
const ADMIN_EMAIL = 'studenti@conservatorio.ch'

const RSS_PROXY =
  'https://api.allorigins.win/get?url=' +
  encodeURIComponent('https://www.youtube.com/feeds/videos.xml?user=CiSIamoPodcast')

function IconSpotify() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.307a.75.75 0 01-1.031.25c-2.822-1.724-6.376-2.114-10.563-1.158a.75.75 0 01-.336-1.462c4.582-1.049 8.514-.597 11.68 1.34a.75.75 0 01.25 1.03zm1.47-3.27a.937.937 0 01-1.287.308c-3.228-1.984-8.15-2.56-11.97-1.401a.937.937 0 11-.545-1.792c4.363-1.326 9.79-.683 13.494 1.598a.937.937 0 01.308 1.287zm.126-3.404C15.348 8.39 8.89 8.174 5.37 9.237a1.125 1.125 0 11-.653-2.154c4.064-1.233 10.826-1 14.844 1.42a1.125 1.125 0 01-1.449 1.73z"/>
    </svg>
  )
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function parseRSS(xmlString) {
  try {
    const doc   = new DOMParser().parseFromString(xmlString, 'text/xml')
    const entries = Array.from(doc.querySelectorAll('entry'))
    return entries.slice(0, 8).map(entry => {
      const id      = entry.querySelector('id')?.textContent ?? ''
      const videoId = id.split(':').pop()
      const title   = entry.querySelector('title')?.textContent ?? '—'
      const published = entry.querySelector('published')?.textContent?.slice(0, 10) ?? ''
      const thumb   = entry.querySelector('thumbnail')?.getAttribute('url')
                   ?? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
      return { videoId, title, published, thumb, url: `https://www.youtube.com/watch?v=${videoId}` }
    })
  } catch { return [] }
}

export default function CisiamoPage() {
  const { data: session }       = useSession()
  const { t }                   = useLang()
  const [episodes, setEpisodes] = useState([])
  const [rssStatus, setRssStatus] = useState('loading') // loading | ok | error
  const [dbContent, setDbContent] = useState({})
  const isAdmin = session?.user?.email === ADMIN_EMAIL || session?.user?.isAdmin

  // Merge: DB sovrascrive i18n se presente
  const g = (key) => dbContent[key] || t(`podcast.${key}`)
  const partners = Array.isArray(dbContent.partners) ? dbContent.partners : t('podcast.partners')

  useEffect(() => {
    fetch('/api/admin/projects/cisiamo').then(r => r.ok ? r.json() : {}).then(setDbContent).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(RSS_PROXY)
      .then(r => r.json())
      .then(({ contents }) => {
        if (cancelled) return
        const items = parseRSS(contents ?? '')
        setEpisodes(items)
        setRssStatus(items.length ? 'ok' : 'error')
      })
      .catch(() => { if (!cancelled) setRssStatus('error') })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="-mt-14 pt-14 min-h-screen transition-colors duration-300
      bg-gradient-to-br from-purple-100 via-blue-100 to-emerald-100
      dark:from-purple-950 dark:via-slate-950 dark:to-emerald-950
      text-indigo-950 dark:text-white">

      <div className="max-w-6xl mx-auto px-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <section className="py-20 relative border-b border-indigo-950/10 dark:border-white/[0.08]">

          {isAdmin && (
            <Link href="/admin/projects/cisiamo"
              className="absolute top-6 right-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono
                border border-indigo-950/20 dark:border-white/20
                text-indigo-950/60 dark:text-white/50
                hover:text-indigo-950 dark:hover:text-white
                hover:border-indigo-950/50 dark:hover:border-white/50
                transition">
              ✏ {t('common.edit')}
            </Link>
          )}

          <p className="text-xs font-mono uppercase tracking-widest mb-8 text-amber-600 dark:text-amber-400">
            {t('podcast.hubLabel')}
          </p>

          {/* Logo sopra al titolo — colori nativi, no filtri */}
          <img
            src="/imgs/logos/logo_cisiamo.png"
            alt="CiSiamo Podcast"
            className="w-full max-w-[clamp(20rem,45vw,35rem)] md:max-w-[38rem] h-auto object-contain mb-8 mx-auto md:mx-0"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />

          {/* "CiSIamo" solido · "Podcast" gradiente viola→smeraldo */}
          <h1 className="font-black leading-none tracking-tight text-slate-950 dark:text-white mb-6"
            style={{ fontSize: 'clamp(3rem,9vw,6.5rem)' }}>
            {t('podcast.title1')}<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-400 dark:from-purple-500 dark:to-teal-400">
              {t('podcast.title2')}
            </span>
          </h1>

          <p className="text-base max-w-xl leading-relaxed mb-10 text-indigo-950/60 dark:text-white/60">
            {g('subtitle')}
          </p>

          <div className="flex flex-wrap gap-3">
            <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold hover:opacity-80 transition"
              style={{ background: '#1DB954', color: '#000' }}>
              <IconSpotify /> {t('podcast.spotifyBtn')}
            </a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold hover:opacity-80 transition"
              style={{ background: '#FF0000', color: '#fff' }}>
              <IconYouTube /> {t('podcast.youtubeBtn')}
            </a>
          </div>
        </section>

        {/* ── Ultimi episodi (YouTube RSS) ───────────────────────────── */}
        <section className="py-16 border-b border-indigo-950/10 dark:border-white/[0.08]">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-10 text-indigo-950/60 dark:text-white/60">
            {t('podcast.episodesLabel')}
          </p>

          {rssStatus === 'loading' && (
            <p className="text-sm text-indigo-950/40 dark:text-white/40 font-mono">{t('common.loading')}</p>
          )}
          {rssStatus === 'error' && (
            <p className="text-sm text-indigo-950/40 dark:text-white/40 font-mono">
              {t('podcast.episodesError')}
              {' '}<a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-indigo-950 dark:hover:text-white transition">
                YouTube →
              </a>
            </p>
          )}
          {rssStatus === 'ok' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {episodes.map(ep => (
                <a key={ep.videoId} href={ep.url} target="_blank" rel="noopener noreferrer"
                  className="group block overflow-hidden transition hover:opacity-90">
                  <div className="relative aspect-video overflow-hidden bg-indigo-950/10 dark:bg-white/[0.06]">
                    <img src={ep.thumb} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                      <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="pt-3 pb-1">
                    <p className="text-xs font-mono text-indigo-950/40 dark:text-white/40 mb-1">{ep.published}</p>
                    <p className="text-sm font-semibold leading-snug line-clamp-2 text-indigo-950 dark:text-white">{ep.title}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ── Chi siamo ──────────────────────────────────────────────── */}
        <section className="py-16 border-b border-indigo-950/10 dark:border-white/[0.08]">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-3 text-indigo-950/60 dark:text-white/60">
                {t('podcast.projectLabel')}
              </p>
              <h2 className="font-black text-3xl leading-tight text-indigo-950 dark:text-white">
                {t('podcast.whoTitle')}
              </h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-indigo-950/60 dark:text-white/60">
              <p>{g('whoPara1')}</p>
              <p>{g('whoPara2')}</p>
            </div>
          </div>
        </section>

        {/* ── Festival partner ───────────────────────────────────────── */}
        <section className="py-16">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-10 text-indigo-950/60 dark:text-white/60">
            {t('podcast.partnersLabel')}
          </p>
          <div className="grid sm:grid-cols-2 gap-px bg-indigo-950/10 dark:bg-white/[0.08]">
            {Array.isArray(partners) && partners.map(({ name, role, href }) => (
              <Link key={name} href={href}
                className="p-8 block transition
                  bg-white/65 dark:bg-white/[0.04]
                  hover:bg-white/80 dark:hover:bg-white/[0.07]">
                <span className="inline-block w-1.5 h-1.5 rounded-full mb-4 bg-amber-500" />
                <p className="font-semibold text-base text-indigo-950 dark:text-white">{name}</p>
                <p className="text-xs font-mono mt-1 text-indigo-950/60 dark:text-white/60">{role}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
