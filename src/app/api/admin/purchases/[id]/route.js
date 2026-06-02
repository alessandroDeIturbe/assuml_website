// PATCH /api/admin/purchases/[id] — sblocca un acquisto P2P (PENDING_APPROVAL → ACTIVE)
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const purchase = await prisma.purchase.update({
    where: { id: params.id },
    data:  { purchaseStatus: 'ACTIVE' },
    select: { id: true, purchaseStatus: true, userId: true, noteId: true },
  })
  return NextResponse.json(purchase)
}
