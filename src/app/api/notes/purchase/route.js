// POST /api/notes/purchase
// Avvia Stripe Checkout per l'acquisto di un appunto.
// In development bypassa Stripe e crea direttamente il Purchase sul DB (simulazione).

import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { auth }         from '@/lib/auth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function POST(req) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { noteId } = await req.json().catch(() => ({}))
  if (!noteId) return NextResponse.json({ error: 'noteId mancante' }, { status: 400 })

  const note = await prisma.note.findUnique({
    where:  { id: noteId },
    select: { id: true, title: true, price: true, currency: true, status: true },
  })
  if (!note)                       return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 })
  if (note.status !== 'APPROVED')  return NextResponse.json({ error: 'Nota non disponibile' }, { status: 403 })
  if (note.price === 0) {
    // Gratuita — crea acquisto diretto senza pagamento
    // BUG-2 FIX: purchaseStatus:'ACTIVE' obbligatorio, altrimenti /view nega accesso
    await prisma.purchase.upsert({
      where:  { userId_noteId: { userId: session.user.id, noteId } },
      update: { purchaseStatus: 'ACTIVE' },
      create: { userId: session.user.id, noteId, stripeId: `free_${Date.now()}`, amountPaid: 0, currency: note.currency, purchaseStatus: 'ACTIVE' },
    })
    return NextResponse.json({ ok: true, redirect: `/appunti/${noteId}` })
  }

  // ── SIMULAZIONE DEV ────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    // BUG-2 FIX: purchaseStatus:'ACTIVE' obbligatorio, altrimenti /view nega accesso
    await prisma.purchase.upsert({
      where:  { userId_noteId: { userId: session.user.id, noteId } },
      update: { purchaseStatus: 'ACTIVE' },
      create: {
        userId:         session.user.id,
        noteId,
        stripeId:       `sim_${Date.now()}`,
        amountPaid:     note.price,
        currency:       note.currency,
        purchaseStatus: 'ACTIVE',
      },
    })
    return NextResponse.json({
      ok:       true,
      sim:      true,
      redirect: `/appunti/${noteId}`,
      message:  `[DEV] Acquisto simulato: ${note.price} ${note.currency}`,
    })
  }

  // ── PRODUZIONE: Stripe Checkout ────────────────────────────────────────
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })

    const checkout = await stripe.checkout.sessions.create({
      mode:     'payment',
      currency: note.currency.toLowerCase(),
      line_items: [{
        quantity:   1,
        price_data: {
          currency:     note.currency.toLowerCase(),
          unit_amount:  Math.round(note.price * 100),
          product_data: { name: note.title },
        },
      }],
      metadata:    { noteId, userId: session.user.id },
      success_url: `${BASE_URL}/appunti/${noteId}?purchased=1`,
      cancel_url:  `${BASE_URL}/appunti`,
    })
    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    console.error('[purchase]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Errore Stripe' }, { status: 502 })
  }
}
