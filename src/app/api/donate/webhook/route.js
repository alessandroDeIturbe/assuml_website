// src/app/api/donate/webhook/route.js
// POST — Stripe webhook: aggiorna Donation a COMPLETED o FAILED.
// Configurare in Stripe Dashboard: endpoint = https://<domain>/api/donate/webhook
// Event: checkout.session.completed

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req) {
  const rawBody = await req.text()
  const sig     = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (e) {
    console.error('[webhook] signature error', e.message)
    return NextResponse.json({ error: 'Firma webhook non valida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object
    const donationId = session.metadata?.donationId

    if (donationId) {
      await prisma.donation.update({
        where: { id: donationId },
        data: {
          status:   'COMPLETED',
          stripeId: session.id,
        },
      })
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session    = event.data.object
    const donationId = session.metadata?.donationId
    if (donationId) {
      await prisma.donation.updateMany({
        where: { id: donationId, status: 'PENDING' },
        data:  { status: 'FAILED' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
