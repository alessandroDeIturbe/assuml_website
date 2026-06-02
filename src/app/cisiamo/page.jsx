'use client'
import { useEffect, useState } from 'react'

const SPOTIFY_URL = 'https://open.spotify.com/show/67aZjwavqo0YFM4he8NE4i'
const YOUTUBE_URL = 'https://www.youtube.com/@CiSIamoPodcast'
const YT_RSS      = 'https://www.youtube.com/feeds/videos.xml?user=CiSIamoPodcast'

// Episodi statici di fallback (usati se il feed RSS non è raggiungibile)
const FALLBACK_EPISODES = [
  {
    id: 'fallback-1',
    title: 'CiSiamo — Episodio più recente',
    date:  '',
    num:   '01',
    thumb: null,
    url:   YOUTUBE_URL,
    spotifyUrl: SPOTIFY_URL,
  },
  {
    id: 'fallback-2',
    title: 'Elettroacustica e spazio sonoro',
    date:  '',
    num:   '02',
    thumb: null,
    url:   YOUTUBE_URL,
    spotifyUrl: SPOTIFY_URL,
  },
  {
    id: 'fallback-3',
    title: 'Festival Ramificazioni — Dietro le quinte',
    date:  '',
    num:   '03',
    thumb: null,
    url:   YOUTUBE_URL,
    spotifyUrl: SPOTIFY_URL,
  },
]

const TAG_COLORS = {
  default: '#2DD4BF',
}

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

function parseRSS(xmlText) {
  try {
    const parser = new DOMParser()
    const doc    = parser.parseFromString(xmlText, 'application/xml')
    const entries = Array.from(doc.querySelectorAll('entry')).slice(0, 8)
    return entries.map((e, i) => {
      const videoId  = e.querySelector('videoId')?.textContent ?? ''
      const thumb    = videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : null
      const pubDate  = e.querySelector('published')?.textContent ?? ''
      const date     = pubDate ? new Date(pubDate).toLocaleDateString('it-IT', { year:'numeric', month:'short', day:'numeric' }) : ''
      return {
        id:       videoId || String(i),
        title:    e.querySelector('title')?.textContent ?? 'Episodio',
        videoId,
        thumb,
        date,
        url:      `https://www.youtube.com/watch?v=${videoId}`,
        num:      String(entries.length - i).padStart(2, '0'),
      }
    })
  } catch { return [] }
}

export default function CisiamoPage() {
  const [episodes, setEpisodes] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    // Proxy via allorigins per evitare CORS sul client
    const rssUrl = encodeURIComponent(YT_RSS)
    fetch(`https://api.allorigins.win/get?url=${rssUrl}`)
      .then(r => r.json())
      .then(data => {
        const parsed = parseRSS(data.contents ?? '')
        setEpisodes(parsed)
      })
      .catch(() => setEpisodes(FALLBACK_EPISODES))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className="-mt-14 pt-14 min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #160F24 0%, #0E1A18 60%, #121212 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <section className="py-20" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-mono uppercase tracking-widest mb-8" style={{ color: '#D4AF37' }}>
            Hub Multimediale · ASSUML
          </p>
          <h1 className="font-black leading-none tracking-tight" style={{ fontSize: 'clamp(3rem,9vw,6.5rem)' }}>
            CiSiamo<br />
            <span style={{ background: 'linear-gradient(90deg,#6D28D9,#2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Podcast
            </span>
          </h1>
          <p className="mt-6 text-base max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Voci, suoni e storie dal Conservatorio della Svizzera Italiana.
            Interviste, live electronics, Erasmus e festival partner.
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold hover:opacity-80 transition"
              style={{ background: '#1DB954', color: '#000' }}>
              <IconSpotify /> Ascolta su Spotify
            </a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold hover:opacity-80 transition"
              style={{ background: '#FF0000', color: '#fff' }}>
              <IconYouTube /> Guarda su YouTube
            </a>
          </div>
        </section>

        {/* Episodi */}
        <section className="py-16">
          <h2 className="text-xs font-mono uppercase tracking-widest mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Ultimi episodi
          </h2>

          {loading && (
            <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Caricamento episodi…</p>
          )}

          {!loading && episodes.length === 0 && (
            <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Feed non disponibile. <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#2DD4BF' }}>Visita il canale YouTube →</a>
            </p>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {episodes.map((ep) => (
              <a
                key={ep.id}
                href={ep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-6 flex items-center justify-between gap-6 group transition block"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-start gap-5">
                  {/* Thumbnail */}
                  <div className="shrink-0 w-16 h-12 rounded overflow-hidden" style={{ background: 'linear-gradient(135deg,#6D28D9,#2DD4BF)' }}>
                    {ep.thumb && (
                      <img src={ep.thumb} alt={ep.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-base text-white leading-tight group-hover:opacity-70 transition line-clamp-2">
                      {ep.title}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{ep.date}</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="opacity-40 group-hover:opacity-100 transition" style={{ color: '#FF0000' }}>
                    <IconYouTube />
                  </span>
                  <span className="w-8 h-8 rounded-full border flex items-center justify-center text-xs"
                    style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                    ▶
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Festival partner */}
        <section className="py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-xs font-mono uppercase tracking-widest mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Festival Partner
          </h2>
          <div className="grid sm:grid-cols-2 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {[
              { name: 'Festival Ramificazioni', role: 'Partner principale', href: '/ramificazioni' },
              { name: 'Lugano Musica',           role: 'Festival partner',  href: '#' },
              { name: 'Ticino Musica',           role: 'Festival partner',  href: '#' },
              { name: 'Jazz Ascona',             role: 'Festival partner',  href: '#' },
            ].map(({ name, role, href }) => (
              <a key={name} href={href}
                className="p-8 transition block group"
                style={{ background: '#160F24' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(109,40,217,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background='#160F24'}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full mb-4" style={{ background: '#D4AF37' }} />
                <p className="font-semibold text-base text-white">{name}</p>
                <p className="text-xs font-mono mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{role}</p>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
