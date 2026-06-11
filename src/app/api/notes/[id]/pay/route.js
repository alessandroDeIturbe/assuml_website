// POST /api/notes/[id]/pay
// Flusso P2P: il compratore carica la ricevuta e crea un Purchase in PENDING_APPROVAL.
// Body: multipart/form-data con campo "receipt" (file) e campo "amount" (opzionale)

import { NextResponse }     from 'next/server'
import { auth }             from '@/lib/auth'
import { prisma }           from '@/lib/prisma'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid }           from 'nanoid'

const RECEIPT_BUCKET = process.env.MINIO_BUCKET ?? 'assuml-notes'
const RECEIPT_PREFIX = 'payment-receipts'

function getS3() {
  const raw = process.env.MINIO_ENDPOINT ?? 'http://localhost:9000'
  const endpoint = process.env.NODE_ENV === 'development'
    ? raw.replace(/http:\/\/[^:/]+/, 'http://localhost')
    : raw
  return new S3Client({
    endpoint, region: 'us-east-1',
    credentials: {
      accessKeyId:     process.env.MINIO_ACCESS_KEY ?? 'assuml_admin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'supersecret',
    },
    forcePathStyle: true,
  })
}

export async function POST(req, { params }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { id: noteId } = await params
  const userId = session.user.id

  // Carica nota + dati venditore
  const note = await prisma.note.findUnique({
    where:  { id: noteId },
    select: {
      id: true, status: true, price: true, currency: true,
      author: { select: { id: true, name: true, paymentInfo: true } },
    },
  })
  if (!note)                      return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 })
  if (note.status !== 'APPROVED') return NextResponse.json({ error: 'Nota non disponibile' }, { status: 403 })
  if (note.price === 0)           return NextResponse.json({ error: 'Usa /api/notes/purchase per note gratuite' }, { status: 400 })

  // Ricevuta obbligatoria
  let receiptKey = null
  try {
    const form = await req.formData()
    const file = form.get('receipt')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Ricevuta di pagamento obbligatoria' }, { status: 422 })
    }
    const ext = (file.name ?? 'receipt').split('.').pop().replace(/[^a-z0-9]/gi, '').toLowerCase()
    receiptKey = `${RECEIPT_PREFIX}/${userId}/${noteId}_${nanoid(10)}.${ext}`
    const buf  = Buffer.from(await file.arrayBuffer())
    await getS3().send(new PutObjectCommand({
      Bucket:      RECEIPT_BUCKET,
      Key:         receiptKey,
      Body:        buf,
      ContentType: file.type ?? 'application/octet-stream',
    }))
  } catch (e) {
    console.error('[pay receipt upload]', e?.message)
    return NextResponse.json({ error: `Errore caricamento ricevuta: ${e?.message}` }, { status: 502 })
  }

  // Crea/aggiorna Purchase in PENDING_APPROVAL
  const purchase = await prisma.purchase.upsert({
    where:  { userId_noteId: { userId, noteId } },
    update: { receiptKey, purchaseStatus: 'PENDING_APPROVAL', stripeId: `p2p_${Date.now()}` },
    create: {
      userId, noteId,
      stripeId:       `p2p_${Date.now()}`,
      amountPaid:     note.price,
      currency:       note.currency,
      purchaseStatus: 'PENDING_APPROVAL',
      receiptKey,
    },
    select: { id: true, purchaseStatus: true },
  })

  return NextResponse.json({
    ok:      true,
    status:  purchase.purchaseStatus,
    message: 'Ricevuta inviata. L\'accesso sarà sbloccato dopo verifica dell\'admin.',
  }, { status: 201 })
}
