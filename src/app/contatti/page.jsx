export const metadata = { title: 'Contatti — ASSUML' }

export default function ContattiPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* Header */}
      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Contatti
        </h1>
        <p className="mt-6 text-neutral-600 dark:text-neutral-300 text-lg max-w-xl">
          Scrivici per collaborazioni, sponsor, press o per qualsiasi domanda sull'associazione.
        </p>
      </section>

      {/* Schede contatto */}
      <section className="py-20 grid md:grid-cols-3 gap-4">

        <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 p-10 space-y-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D]" />
          <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Studenti</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Per domande su upload di materiali, acquisti, account o problemi tecnici.
          </p>
          <a href="mailto:studenti@assuml.ch" className="block text-sm font-mono font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#FF4D4D] dark:hover:text-[#FF4D4D] transition">
            studenti@assuml.ch
          </a>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 p-10 space-y-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00CFCF]" />
          <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Sponsor & Partner</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Per proposte di sponsorizzazione, partnership istituzionali e collaborazioni con festival.
          </p>
          <a href="mailto:sponsor@assuml.ch" className="block text-sm font-mono font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#00CFCF] dark:hover:text-[#00CFCF] transition">
            sponsor@assuml.ch
          </a>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 p-10 space-y-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#AAFF00]" />
          <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Press & Media</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Per richieste di interviste, materiale stampa e comunicati ufficiali.
          </p>
          <a href="mailto:press@assuml.ch" className="block text-sm font-mono font-bold text-neutral-900 dark:text-neutral-100 hover:text-[#AAFF00] dark:hover:text-[#AAFF00] transition">
            press@assuml.ch
          </a>
        </div>

      </section>

      {/* Indirizzo */}
      <section className="py-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="grid md:grid-cols-[1fr_2fr] gap-16">
          <h2 className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-white">Sede</h2>
          <address className="not-italic text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed font-mono">
            ASSUML — Associazione Studenti<br />
            Conservatorio della Svizzera Italiana<br />
            Via Soldino 9<br />
            6900 Lugano — Ticino, CH<br />
            <a href="mailto:info@assuml.ch" className="underline hover:text-neutral-900 dark:hover:text-white transition mt-2 inline-block">
              info@assuml.ch
            </a>
          </address>
        </div>
      </section>

    </div>
  )
}
