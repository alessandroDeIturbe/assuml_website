export const metadata = { title: 'Associazione — ASSUML' }

const COMITATO = [
  { ruolo: 'Presidente',           nome: 'Nome Cognome' },
  { ruolo: 'Vicepresidente',       nome: 'Nome Cognome' },
  { ruolo: 'Segretario/a',         nome: 'Nome Cognome' },
  { ruolo: 'Responsabile Finanze', nome: 'Nome Cognome' },
  { ruolo: 'Resp. Comunicazione',  nome: 'Nome Cognome' },
]

export default function AssociazionePage() {
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
            href="mailto:info@assuml.ch?subject=Richiesta%20Statuto"
            className="inline-block text-sm font-mono underline underline-offset-4 hover:text-[#00CFCF] transition"
          >
            Richiedi copia dello statuto →
          </a>
        </div>
      </section>

      {/* Comitato */}
      <section className="py-16">
        <h2 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white mb-10">Comitato {new Date().getFullYear()}</h2>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {COMITATO.map(({ ruolo, nome }) => (
            <div key={ruolo} className="py-5 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-500">{ruolo}</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{nome}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
