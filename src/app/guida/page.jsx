import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Guida per lo Studente — ASSUML' }
export const dynamic = 'force-dynamic'

// Fallback statico se il DB è vuoto (pre-seeding)
const SEZIONI_DEFAULT = [
  {
    titolo: '1. Iscrizione e immatricolazione',
    corpo: `Per iscriversi al Conservatorio della Svizzera Italiana è necessario superare un esame di ammissione.
Le domande vanno presentate entro marzo per l'anno accademico successivo.
Il modulo è disponibile sul sito ufficiale del CSI: conservatorio.ch.`,
  },
  {
    titolo: '2. Tessera ASSUML',
    corpo: `Tutti gli studenti regolarmente iscritti al CSI possono aderire ad ASSUML.
La quota associativa annuale è simbolica e dà accesso a tutte le convenzioni, eventi e al portale degli appunti.
Per iscriverti scrivi a studenti@assuml.ch con il tuo numero di matricola.`,
  },
  {
    titolo: '3. Portale Appunti',
    corpo: `Accedi con il tuo account istituzionale (@conservatorio.ch) per sfogliare o caricare materiali didattici.
Ogni file caricato è soggetto a revisione da parte dell'admin ASSUML prima di essere reso visibile.
I file sono protetti da DRM: nessun download, solo visualizzazione in-app con watermark.`,
  },
  {
    titolo: '4. Alloggio e trasporti',
    corpo: `Lugano offre diverse soluzioni abitative per studenti fuorisede.
Consulta il board USI/SUPSI per camere e appartamenti convenzionati.
ASSUML ha accordi con i Trasporti Pubblici Luganesi per abbonamenti a tariffa ridotta (vedi Convenzioni).`,
  },
  {
    titolo: '5. Borse di studio',
    corpo: `Il CSI mette a disposizione borse di studio per studenti meritevoli o in situazione economica difficile.
ASSUML supporta il processo e può fornire referenze. Contattaci per informazioni.`,
  },
  {
    titolo: '6. Supporto e contatti utili',
    corpo: `Segreteria CSI: segreteria@conservatorio.ch
ASSUML generale: studenti@assuml.ch
Problemi tecnici portale: tech@assuml.ch
Emergenze: 112 (Europa) / 117 (Polizia CH) / 144 (Ambulanza CH)`,
  },
]

export default async function GuidaPage() {
  const dbSections = await prisma.guidaSection
    .findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
    .catch(() => [])

  const sezioni = dbSections.length > 0 ? dbSections : SEZIONI_DEFAULT

  return (
    <div className="max-w-4xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#00CFCF] mb-6" />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Guida per<br />lo Studente
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-base max-w-xl">
          Tutto quello che devi sapere per orientarti al Conservatorio della Svizzera Italiana e in ASSUML.
        </p>
      </section>

      <section className="py-16 space-y-0 divide-y divide-neutral-200 dark:divide-neutral-800">
        {sezioni.map((s) => (
          <div key={s.titolo ?? s.id} className="py-10 grid md:grid-cols-[280px_1fr] gap-8">
            <h2 className="font-bold text-base text-neutral-900 dark:text-white leading-tight">
              {s.titolo}
            </h2>
            <div className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
              {s.corpo}
            </div>
          </div>
        ))}
      </section>

    </div>
  )
}
