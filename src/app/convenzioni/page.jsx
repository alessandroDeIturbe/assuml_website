import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Convenzioni — ASSUML' }
export const dynamic  = 'force-dynamic'

async function getConvenzioni() {
  try {
    return await prisma.convention.findMany({
      where:   { active: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch { return [] }
}

export default async function ConvenzioniPage() {
  const items = await getConvenzioni()

  return (
    <div className="max-w-6xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#AAFF00] mb-6" />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Convenzioni
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-base max-w-xl">
          Agevolazioni e sconti attivi per i soci ASSUML presso i partner esterni.
          Mostra la tessera o l'email istituzionale per usufruirne.
        </p>
      </section>

      <section className="py-16">
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-neutral-400 dark:text-neutral-600 font-mono text-sm">
              Nessuna convenzione attiva al momento.
            </p>
            <p className="text-neutral-300 dark:text-neutral-700 font-mono text-xs mt-2">
              Le convenzioni vengono inserite dall'admin tramite il pannello di controllo.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="border border-neutral-200 dark:border-neutral-800 p-6 space-y-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition">
                {item.imageKey && (
                  <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden mb-4">
                    <img
                      src={`/api/storage/img?key=${encodeURIComponent(item.imageKey)}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#AAFF00]" />
                <h2 className="font-semibold text-base text-neutral-900 dark:text-white">{item.title}</h2>
                {item.subtitle && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-10 text-xs font-mono text-neutral-400">
          Per aggiungere una convenzione:{' '}
          <a href="mailto:convenzioni@assuml.ch" className="underline hover:text-[#AAFF00] transition">
            convenzioni@assuml.ch
          </a>
        </p>
      </section>
    </div>
  )
}
