import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getLatestAnnouncement() {
  try {
    return await prisma.announcement.findFirst({
      where:   { active: true },
      orderBy: { createdAt: 'desc' },
      select:  { title: true, body: true, createdAt: true },
    })
  } catch { return null }
}

export default async function HomePage() {
  const announcement = await getLatestAnnouncement()
  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* ── Banner bacheca istituzionale ──────────────────────────────── */}
      {announcement && (
        <div className="mt-6 px-5 py-4 border-l-2 border-[#FF4D4D] bg-neutral-50 dark:bg-neutral-900 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#FF4D4D] mb-1">Avviso ASSUML</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{announcement.title}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{announcement.body}</p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 shrink-0 mt-0.5">
            {new Date(announcement.createdAt).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="py-32 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-8">
          Associazione Studenti — Conservatorio della Svizzera Italiana
        </p>
        <h1 className="font-black text-[clamp(3.5rem,10vw,8rem)] leading-none tracking-tight text-neutral-900 dark:text-white max-w-4xl">
          Il portale degli studenti{' '}
          <span style={{
            background: 'linear-gradient(90deg,#FF4D4D,#00CFCF,#AAFF00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ASSUML
          </span>
          .
        </h1>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/appunti"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-700 transition"
          >
            Sfoglia appunti
            <span className="text-[#AAFF00]">→</span>
          </Link>
          <Link
            href="/cisiamo"
            className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-900 text-sm font-semibold hover:bg-neutral-50 transition"
          >
            CiSiamo Podcast
            <span className="text-[#00CFCF]">→</span>
          </Link>
        </div>
      </section>

      {/* ── Sezione Appunti ─────────────────────────────────────────────── */}
      <section className="py-24 border-b border-neutral-200 dark:border-neutral-800 grid md:grid-cols-[1fr_2fr] gap-16 items-start">
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D] mb-4" />
          <h2 className="font-bold text-4xl tracking-tight text-neutral-900 dark:text-white leading-tight">
            Appunti<br />& Dispense
          </h2>
        </div>
        <div className="space-y-6">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-prose">
            Carica i tuoi materiali didattici e mettili a disposizione dei colleghi.
            Ogni dispensa è protetta da DRM: nessun download, watermark dinamico,
            visualizzazione solo in-app.
          </p>
          <Link href="/appunti" className="text-sm font-mono underline underline-offset-4 text-neutral-900 hover:text-[#FF4D4D] transition">
            Accedi al marketplace →
          </Link>
        </div>
      </section>

      {/* ── Sezione Podcast ─────────────────────────────────────────────── */}
      <section className="py-24 border-b border-neutral-200 dark:border-neutral-800 grid md:grid-cols-[1fr_2fr] gap-16 items-start">
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-[#00CFCF] mb-4" />
          <h2 className="font-bold text-4xl tracking-tight text-neutral-900 dark:text-white leading-tight">
            CiSiamo<br />Podcast
          </h2>
        </div>
        <div className="space-y-6">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-prose">
            Interviste, live electronics, storie Erasmus e festival partner.
            Un archivio sonoro della vita culturale del Conservatorio.
          </p>
          <Link href="/cisiamo" className="text-sm font-mono underline underline-offset-4 text-neutral-900 hover:text-[#00CFCF] transition">
            Ascolta gli episodi →
          </Link>
        </div>
      </section>

      {/* ── Sezione Sostienici ──────────────────────────────────────────── */}
      <section className="py-24 grid md:grid-cols-[1fr_2fr] gap-16 items-start">
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-[#AAFF00] mb-4" />
          <h2 className="font-bold text-4xl tracking-tight text-neutral-900 dark:text-white leading-tight">
            Sostienici
          </h2>
        </div>
        <div className="space-y-6">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-prose">
            Donazioni libere e quote sostenitore per finanziare eventi, produzioni
            e borse di studio. Ogni contributo è tracciato e trasparente.
          </p>
          <Link href="/sostienici" className="text-sm font-mono underline underline-offset-4 text-neutral-900 hover:text-[#AAFF00] transition">
            Fai una donazione →
          </Link>
        </div>
      </section>

    </div>
  )
}
