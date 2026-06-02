export const metadata = { title: 'Festival Ramificazioni — ASSUML' }

export default function RamificazioniPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#A78BFA] mb-6" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4">Coproduzione ASSUML</p>
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Festival<br />Ramificazioni
        </h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-300 text-lg max-w-2xl leading-relaxed">
          Un festival dedicato alla musica contemporanea, elettroacustica e alle arti interdisciplinari.
          Nato dalla collaborazione tra ASSUML e il Conservatorio della Svizzera Italiana.
        </p>
      </section>

      {/* Prossima edizione */}
      <section className="py-16 border-b border-neutral-200 dark:border-neutral-800 grid md:grid-cols-[1fr_2fr] gap-16">
        <div>
          <h2 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white">Prossima edizione</h2>
          <p className="mt-2 font-mono text-sm text-neutral-400">Ottobre 2026</p>
        </div>
        <div className="space-y-4 text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">
          <p>
            Il Festival Ramificazioni 2026 si svolgerà in ottobre tra diversi spazi di Lugano.
            Il programma includerà concerti, installazioni sonore, workshop e talk aperti al pubblico.
          </p>
          <p>
            Artisti internazionali, studenti del Conservatorio e collaborazioni con istituzioni partner
            daranno vita a una settimana di eventi unici.
          </p>
          <a href="mailto:ramificazioni@assuml.ch"
            className="inline-block text-sm font-mono underline underline-offset-4 hover:text-[#A78BFA] transition">
            Proponi un progetto →
          </a>
        </div>
      </section>

      {/* Edizioni passate */}
      <section className="py-16">
        <h2 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white mb-10">Edizioni passate</h2>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {[2025, 2024, 2023].map(year => (
            <div key={year} className="py-6 flex items-center justify-between group">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">Ramificazioni {year}</p>
                <p className="text-xs font-mono text-neutral-400 mt-0.5">Lugano — Ottobre {year}</p>
              </div>
              <span className="text-xs font-mono text-neutral-400 group-hover:text-[#A78BFA] transition">Archivio</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
