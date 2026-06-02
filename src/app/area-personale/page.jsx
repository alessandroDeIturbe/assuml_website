import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Area Personale — ASSUML' }
export const dynamic = 'force-dynamic'

const STATUS_LABEL = {
  PENDING_APPROVAL: { label: 'In revisione', color: '#D4AF37' },
  APPROVED:         { label: 'Approvato',    color: '#AAFF00' },
  REJECTED:         { label: 'Rifiutato',    color: '#FF4D4D' },
}

export default async function AreaPersonalePage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')

  const [myNotes, myPurchases] = await Promise.all([
    prisma.note.findMany({
      where:   { authorId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select:  { id: true, title: true, status: true, price: true, currency: true, createdAt: true },
    }),
    prisma.purchase.findMany({
      where:   { userId: session.user.id },
      orderBy: { purchasedAt: 'desc' },
      include: { note: { select: { id: true, title: true } } },
    }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6">

      {/* Header profilo */}
      <section className="py-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-6">
        {session.user.image ? (
          <img src={session.user.image} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center text-2xl font-black text-white dark:text-neutral-900">
            {session.user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div>
          <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">{session.user.name ?? 'Utente'}</h1>
          <p className="text-sm font-mono text-neutral-400">{session.user.email}</p>
        </div>
      </section>

      {/* I miei appunti caricati */}
      <section className="py-12 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-bold text-xl text-neutral-900 dark:text-white">Appunti caricati</h2>
          <Link href="/appunti/upload" className="text-xs font-mono underline underline-offset-4 hover:text-[#FF4D4D] transition">
            + Carica nuovo
          </Link>
        </div>
        {myNotes.length === 0 ? (
          <p className="text-sm text-neutral-400 font-mono">Nessun materiale caricato.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {myNotes.map(n => {
              const s = STATUS_LABEL[n.status] ?? { label: n.status, color: '#888' }
              return (
                <div key={n.id} className="py-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{n.title}</p>
                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString('it-IT')} · {n.price === 0 ? 'Gratuito' : `${n.price} ${n.currency}`}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 border shrink-0"
                    style={{ color: s.color, borderColor: s.color + '55' }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Acquisti */}
      <section className="py-12">
        <h2 className="font-bold text-xl text-neutral-900 dark:text-white mb-8">Appunti acquistati</h2>
        {myPurchases.length === 0 ? (
          <p className="text-sm text-neutral-400 font-mono">Nessun acquisto effettuato.</p>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {myPurchases.map(p => (
              <div key={p.id} className="py-5 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{p.note.title}</p>
                <Link href={`/appunti/${p.note.id}`}
                  className="text-xs font-mono underline underline-offset-4 hover:text-[#00CFCF] transition shrink-0">
                  Leggi →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
