import Link  from 'next/link'
import Image from 'next/image'

const COLS = [
  {
    title: 'Portale',
    links: [
      { href: '/appunti',      label: 'Appunti & Dispense' },
      { href: '/appunti/upload', label: 'Carica materiale' },
      { href: '/shop',         label: 'Shop ASSUML' },
    ],
  },
  {
    title: 'Associazione',
    links: [
      { href: '/associazione', label: 'Chi siamo' },
      { href: '/eventi',       label: 'Eventi' },
      { href: '/ramificazioni',label: 'Festival Ramificazioni' },
      { href: '/convenzioni',  label: 'Convenzioni' },
    ],
  },
  {
    title: 'Risorse',
    links: [
      { href: '/guida',        label: 'Guida per lo studente' },
      { href: '/cisiamo',      label: 'CiSiamo Podcast' },
      { href: '/sostienici',   label: 'Sostienici' },
      { href: '/contatti',     label: 'Contatti' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <Image src="/imgs/logos/assuml_logo.png" alt="ASSUML" fill className="object-contain" sizes="40px" />
              </div>
              <span className="font-black text-xl tracking-tight" style={{
                background: 'linear-gradient(90deg,#FF4D4D,#00CFCF,#AAFF00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>ASSUML</span>
            </div>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Associazione Studenti<br />
              Conservatorio della<br />
              Svizzera Italiana
            </p>
            <a href="mailto:info@assuml.ch"
              className="text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition underline underline-offset-4">
              info@assuml.ch
            </a>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-mono text-neutral-400">
            © {new Date().getFullYear()} ASSUML — Tutti i diritti riservati
          </p>
          <div className="flex items-center gap-6">
            <Link href="/cisiamo" className="text-xs font-mono text-neutral-400 hover:text-[#00CFCF] transition">
              Podcast
            </Link>
            <a href="https://www.youtube.com/@CiSIamoPodcast" target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono text-neutral-400 hover:text-[#FF0000] transition">
              YouTube
            </a>
            <a href="https://open.spotify.com/show/67aZjwavqo0YFM4he8NE4i" target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono text-neutral-400 hover:text-[#1DB954] transition">
              Spotify
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
