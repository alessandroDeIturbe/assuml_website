import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Eventi — ASSUML' }
export const dynamic  = 'force-dynamic'

async function getEvents() {
  try {
    return await prisma.event.findMany({
      where:   { active: true },
      orderBy: { date: 'asc' },
    })
  } catch { return [] }
}

export default async function EventiPage() {
  const eventi = await getEvents()

  return (
    <div className="max-w-6xl mx-auto px-6">

      <section className="py-20 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D] mb-6" />
        <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Eventi
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-base max-w-xl">
          Concerti, masterclass, assemblee e festival organizzati da ASSUML e dal Conservatorio della Svizzera Italiana.
        </p>
      </section>

      <section className="py-16">
        {eventi.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-neutral-400 dark:text-neutral-600 font-mono text-sm">
              Nessun evento in programma al momento.
            </p>
            <p className="text-neutral-300 dark:text-neutral-700 font-mono text-xs mt-2">
              Gli eventi vengono aggiunti dall'admin tramite il pannello di controllo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {eventi.map((ev) => {
              const d      = new Date(ev.date)
              const giorno = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).toUpperCase()
              const anno   = d.getFullYear()
              return (
                <div key={ev.id} className="py-8 grid grid-cols-[80px_1fr] gap-8 items-start group">
                  <div className="text-center">
                    <p className="font-black text-2xl leading-none text-neutral-900 dark:text-white">
                      {giorno.split(' ')[0]}
                    </p>
                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                      {giorno.split(' ')[1]} {anno}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#FF4D4D]/40 text-[#FF4D4D]">
                      {ev.tipo}
                    </span>
                    <h2 className="font-semibold text-lg text-neutral-900 dark:text-white leading-tight">
                      {ev.title}
                    </h2>
                    {ev.luogo && (
                      <p className="text-sm text-neutral-400 font-mono">{ev.luogo}</p>
                    )}
                    {ev.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{ev.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
