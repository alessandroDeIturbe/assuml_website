import { auth }   from '@/lib/auth'
import { prisma }  from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AreaClient   from './AreaClient'

export const metadata = { title: 'Area Personale — ASSUML' }
export const dynamic  = 'force-dynamic'

export default async function AreaPersonalePage() {
  const session = await auth()
  if (!session?.user) redirect('/accedi')

  const [user, myNotes, myPurchases] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, paymentInfo: true },
    }),
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

  return <AreaClient user={user} myNotes={myNotes} myPurchases={myPurchases} />
}
