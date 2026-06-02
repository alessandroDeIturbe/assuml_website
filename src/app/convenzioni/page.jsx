export const metadata = { title: 'Convenzioni — ASSUML' }

const CONVENZIONI = [
  { partner: 'Biblioteca Cantonale di Lugano', sconto: 'Accesso gratuito fondi musicali',          categoria: 'Cultura' },
  { partner: 'Trasporti Pubblici Luganesi',    sconto: 'Riduzione 20% abbonamento mensile',        categoria: 'Mobilità' },
  { partner: 'Mensa Universitaria USI/SUPSI',  sconto: 'Tariffa studenti con tessera ASSUML',       categoria: 'Ristorazione' },
  { partner: 'Strumenti Musicali Steinway &amp; Sons Ticino', sconto: 'Sconto 15% su noleggio strumenti', categoria: 'Musica' },
  { partner: 'Palestra Cross Lugano',           sconto: 'Iscrizione annuale a tariffa ridotta',     categoria: 'Sport' },
  { partner: 'Farmacia Centrale Lugano',        sconto: 'Sconto 10% prodotti senza ricetta',        categoria: 'Salute' },
]

const CAT_COLOR = {
  'Cultura':     '#00CFCF',
  'Mobilità':    '#AAFF00',
  'Ristorazione':'#D4AF37',
  'Musica':      '#FF4D4D',
  'Sport':       '#A78BFA',
  'Salute':      '#2DD4BF',
}

export default function ConvenzioniPage() {
  return (
    <div className="max-w-6xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#AAFF00] mb-6" />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Convenzioni
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-base max-w-xl">
          Agevolazioni e sconti attivi per i soci ASSUML. Mostra la tua tessera o email istituzionale per usufruirne.
        </p>
      </section>

      <section className="py-16">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {CONVENZIONI.map(({ partner, sconto, categoria }) => (
            <div key={partner} className="py-7 flex flex-wrap items-center justify-between gap-4 group">
              <div className="space-y-1">
                <h2 className="font-semibold text-base text-neutral-900 dark:text-white group-hover:text-[#AAFF00] transition"
                  dangerouslySetInnerHTML={{ __html: partner }} />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{sconto}</p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border shrink-0"
                style={{ color: CAT_COLOR[categoria] ?? '#888', borderColor: (CAT_COLOR[categoria] ?? '#888') + '44' }}>
                {categoria}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs font-mono text-neutral-400">
          Per aggiungere una nuova convenzione scrivici a{' '}
          <a href="mailto:convenzioni@assuml.ch" className="underline hover:text-[#AAFF00] transition">
            convenzioni@assuml.ch
          </a>
        </p>
      </section>

    </div>
  )
}
