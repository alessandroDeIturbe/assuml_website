// PATCH /api/admin/purchases/[id] — sblocca un acquisto P2P (PENDING_APPROVAL → ACTIVE)
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  // BUG-10 FIX: params è una Promise in Next.js 15 — deve essere awaited
  const { id } = await params

  const purchase = await prisma.purchase.update({
    where: { id },
    data:  { purchaseStatus: 'ACTIVE' },
    select: { id: true, purchaseStatus: true, userId: true, noteId: true },
  })
  return NextResponse.json(purchase)
}
