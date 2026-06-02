// src/app/api/donate/checkout/route.js
// POST — crea sessione Stripe Checkout per donazioni esterne (no auth richiesta).
// Body: { amount: number (CHF, intero o decimale), name?: string, email?: string }

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

// Importi preset accettati (CHF). 0 = libero (min 1)
const MIN_AMOUNT = 1
const MAX_AMOUNT = 10_000

export async function POST(req) {
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Body non valido' }, { status: 400 }) }

  const { amount, name, email } = body
  const parsedAmount = parseFloat(amount)

  if (isNaN(parsedAmount) || parsedAmount < MIN_AMOUNT || parsedAmount > MAX_AMOUNT) {
    return NextResponse.json(
      { error: `Importo non valido (min ${MIN_AMOUNT} CHF, max ${MAX_AMOUNT} CHF)` },
      { status: 422 }
    )
  }

  // Crea record Donation PENDING prima del redirect (idempotente su webhook)
  const donation = await prisma.donation.create({
    data: {
      amount:   parsedAmount,
      currency: 'CHF',
      email:    email?.trim() || null,
      name:     name?.trim()  || null,
      status:   'PENDING',
    },
    select: { id: true },
  })

  // Crea sessione Stripe
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'chf',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'chf',
          unit_amount: Math.round(parsedAmount * 100), // centesimi
          product_data: {
            name:        'Donazione ASSUML',
            description: 'Sostieni gli studenti del Conservatorio della Svizzera Italiana',
            images:      [`${BASE_URL}/assets/quadrata.jpg`],
          },
        },
      },
    ],
    customer_email:    email?.trim() || undefined,
    metadata:          { donationId: donation.id },
    success_url:       `${BASE_URL}/sostienici/grazie?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:        `${BASE_URL}/sostienici?cancelled=1`,
    submit_type:       'donate',
    // Twint è disponibile automaticamente se abilitato nel Stripe Dashboard per CHF
    payment_method_types: ['card'],
  })

  return NextResponse.json({ url: session.url }, { status: 201 })
}
