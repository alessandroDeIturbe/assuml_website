// POST — Stripe webhook per confermare acquisti note
import { NextResponse } from 'next/server'
import Stripe           from 'stripe'
import { prisma }       from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-04-10' })

export async function POST(req) {
  const raw = await req.text()
  const sig = req.headers.get('stripe-signature')
  let event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_NOTE_WEBHOOK_SECRET ?? '')
  } catch (e) {
    return NextResponse.json({ error: 'Firma non valida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const s      = event.data.object
    const noteId = s.metadata?.noteId
    const userId = s.metadata?.userId
    if (noteId && userId) {
      const note = await prisma.note.findUnique({ where: { id: noteId }, select: { price: true, currency: true } })
      await prisma.purchase.upsert({
        where:  { userId_noteId: { userId, noteId } },
        update: {},
        create: { userId, noteId, stripeId: s.id, amountPaid: note?.price ?? 0, currency: note?.currency ?? 'CHF' },
      })
    }
  }
  return NextResponse.json({ received: true })
}
