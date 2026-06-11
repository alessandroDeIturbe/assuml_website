import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export const metadata = { title: 'Pannello Admin — ASSUML' }
export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.email !== ADMIN_EMAIL) redirect('/')

  const [notes, announcements, pendingPurchases, events, convenzioni, committee] = await Promise.all([
    prisma.note.findMany({
      where:   { status: 'PENDING_APPROVAL' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, status: true, price: true, currency: true, createdAt: true,
        author: { select: { name: true, email: true } },
      },
    }),
    prisma.announcement.findMany({
      where:   { active: true },
      orderBy: { createdAt: 'desc' },
      select:  { id: true, title: true, body: true, createdAt: true },
    }),
    // BUG-1 FIX: purchases_q deve essere al posto [2], non events_q
    prisma.purchase.findMany({
      where:   { purchaseStatus: 'PENDING_APPROVAL' },
      orderBy: { purchasedAt: 'desc' },
      select: {
        id: true, amountPaid: true, currency: true, receiptKey: true, purchasedAt: true,
        user: { select: { name: true, email: true } },
        note: { select: { title: true } },
      },
    }),
    prisma.event.findMany({ where: { active: true }, orderBy: { date: 'asc' } }).catch(() => []),
    prisma.convention.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.committeeMember.findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }).catch(() => []),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="py-16 border-b border-neutral-200 dark:border-neutral-800">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FF4D4D] mb-4" />
        <h1 className="font-black text-5xl tracking-tight text-neutral-900 dark:text-white leading-none">
          Pannello Admin
        </h1>
        <p className="mt-3 text-sm font-mono text-neutral-400">
          Accesso riservato · {session.user.email}
        </p>
      </section>
      <div className="py-12">
        <AdminClient
          initialNotes={notes}
          initialAnnouncements={announcements}
          initialPurchases={pendingPurchases}
          initialEvents={events}
          initialConvenzioni={convenzioni}
          initialCommittee={committee}
        />
      </div>
    </div>
  )
}
