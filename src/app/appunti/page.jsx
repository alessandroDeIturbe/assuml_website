import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth }   from '@/lib/auth'
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
        author: { select: { name: true, email: true } },
      },
    })
  } catch { return [] }
}

export default async function AppuntiPage() {
  const [notes, session] = await Promise.all([getNotes(), auth()])
  const isAdmin = session?.user?.isAdmin === true
               || session?.user?.email   === ADMIN_EMAIL
               || session?.user?.role    === 'ADMIN'

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
        <AppuntiClient notes={notes} isAdmin={isAdmin} />
      </section>
    </div>
  )
}
