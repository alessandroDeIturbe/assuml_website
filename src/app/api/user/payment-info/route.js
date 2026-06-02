// PATCH — aggiorna paymentInfo dell'utente loggato
import { NextResponse } from 'next/server'
import { auth }         from '@/lib/auth'
import { prisma }       from '@/lib/prisma'

export async function PATCH(req) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { paymentInfo } = await req.json().catch(() => ({}))
  await prisma.user.update({
    where: { id: session.user.id },
    data:  { paymentInfo: (paymentInfo ?? '').trim() || null },
  })
  return NextResponse.json({ ok: true })
}
