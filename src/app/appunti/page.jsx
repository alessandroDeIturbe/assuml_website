import Link          from 'next/link'
import { prisma }    from '@/lib/prisma'
import { auth }      from '@/lib/auth'
import AppuntiClient from './AppuntiClient'

export const metadata = { title: 'Appunti & Dispense — ASSUML' }
export const dynamic  = 'force-dynamic'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

async function getNotes() {
  try {
    return await prisma.note.findMany({
      where:   { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, price: true, currency: true, description: true,
        author: { select: { name: true, email: true, paymentInfo: true } },
      },
    })
  } catch (e) {
    console.error('[appunti] getNotes:', e?.message)
    return []
  }
}

async function getPurchasedIds(userId) {
  if (!userId) return []
  try {
    // Usa una raw query minimale per evitare crash se la migration non è ancora applicata
    const rows = await prisma.$queryRaw`
      SELECT "noteId" FROM "Purchase"
      WHERE "userId" = ${userId}
        AND ("purchaseStatus" IS NULL OR "purchaseStatus" = 'ACTIVE')
    `
    return rows.map(r => r.noteId)
  } catch {
    // Fallback senza purchaseStatus (pre-migration)
    try {
      const rows = await prisma.purchase.findMany({
        where:  { userId },
        select: { noteId: true },
      })
      return rows.map(r => r.noteId)
    } catch { return [] }
  }
}

export default async function AppuntiPage() {
  const [notes, session] = await Promise.all([getNotes(), auth()])
  const userId  = session?.user?.id ?? null
  const isAdmin = !!(
    session?.user?.isAdmin ||
    session?.user?.email === ADMIN_EMAIL ||
    session?.user?.role  === 'ADMIN'
  )
  const purchasedIds = await getPurchasedIds(userId)

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="py-20 border-b border-neutral-200 dark:border-neutral-700">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D] mb-6" />
        <div className="flex items-end justify-between gap-8 flex-wrap">
          <h1 className="font-black text-6xl tracking-tight text-neutral-900 dark:text-white leading-none">
            Appunti<br />&amp; Dispense
          </h1>
          <Link
            href="/appunti/upload"
            className="shrink-0 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-75 transition"
          >
            + Carica materiale
          </Link>
        </div>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 text-base max-w-xl">
          Materiale didattico condiviso dagli studenti. DRM integrato: visualizzazione solo in-app, nessun download.
        </p>
      </section>
      <section className="py-16">
        <AppuntiClient notes={notes} isAdmin={isAdmin} purchasedIds={purchasedIds} />
      </section>
    </div>
  )
}
