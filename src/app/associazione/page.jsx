import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Associazione — ASSUML' }
export const dynamic = 'force-dynamic'

export default async function AssociazionePage() {
  const committee = await prisma.committeeMember
    .findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
    .catch(() => [])

  return (
    <div className="max-w-6xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full mb-6" style={{ background: '#00CFCF' }} />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Chi siamo
        </h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-300 text-lg max-w-2xl leading-relaxed">
          ASSUML è l'associazione che rappresenta gli studenti del Conservatorio della Svizzera Italiana.
          Promuove la vita culturale, studentesca e professionale all'interno e all'esterno del Conservatorio.
        </p>
      </section>

      {/* Visione */}
      <section className="py-16 border-b border-neutral-200 dark:border-neutral-800 grid md:grid-cols-[1fr_2fr] gap-16">
        <h2 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white">Visione</h2>
        <div className="space-y-4 text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">
          <p>
            Crediamo in una comunità musicale inclusiva, internazionale e interdisciplinare.
            Il nostro obiettivo è connettere gli studenti tra loro e con il tessuto culturale della Svizzera Italiana.
          </p>
          <p>
            Attraverso il portale ASSUML, il podcast CiSiamo e gli eventi organizzati durante l'anno accademico,
            costruiamo uno spazio di condivisione e crescita professionale.
          </p>
        </div>
      </section>

      {/* Statuto */}
      <section className="py-16 border-b border-neutral-200 dark:border-neutral-800 grid md:grid-cols-[1fr_2fr] gap-16">
        <h2 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white">Statuto</h2>
        <div className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed space-y-3">
          <p>Lo statuto ufficiale dell'associazione regola la governance, i diritti e i doveri dei soci.</p>
          <a
            href="/documents/statuto_AS_v151208_def.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-mono underline underline-offset-4 hover:text-[#00CFCF] transition"
          >
            Leggi lo statuto (PDF) →
          </a>
        </div>
      </section>

      {/* Comitato */}
      <section className="py-16">
        <h2 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white mb-10">
          Comitato {new Date().getFullYear()}
        </h2>
        {committee.length === 0 ? (
          <p className="text-sm font-mono text-neutral-400">Informazioni sul comitato in aggiornamento.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {committee.map(m => (
              <div key={m.id} className="py-5 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-500">
                  {m.role}
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white block">{m.name}</span>
                  {m.email && (
                    <a href={`mailto:${m.email}`}
                      className="text-[11px] font-mono text-neutral-400 hover:text-[#00CFCF] transition">
                      {m.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
