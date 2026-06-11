import { auth }             from '@/lib/auth'
import { prisma }           from '@/lib/prisma'
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { S3Client }         from '@aws-sdk/client-s3'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

function getS3() {
  const raw      = process.env.MINIO_ENDPOINT ?? 'http://localhost:9000'
  const endpoint = process.env.NODE_ENV === 'development'
    ? raw.replace(/http:\/\/[^:/]+/, 'http://localhost')
    : raw
  return new S3Client({
    endpoint,
    region:      'us-east-1',
    credentials: {
      accessKeyId:     process.env.MINIO_ACCESS_KEY ?? 'assuml_admin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'supersecret',
    },
    forcePathStyle: true,
  })
}

const BUCKET = () => process.env.MINIO_BUCKET ?? 'assuml-notes'

export async function GET(req, { params }) {
  const session = await auth()
  if (!session?.user) return new Response('Non autenticato', { status: 401 })

  const { id: noteId } = await params
  const userId  = session.user.id
  const isAdmin = !!(session.user.isAdmin || session.user.email === ADMIN_EMAIL)

  let note
  try {
    note = await prisma.note.findUnique({
      where:  { id: noteId },
      select: { fileKey: true, status: true, price: true, mimeType: true },
    })
  } catch (e) {
    console.error('[stream] prisma error:', e?.message)
    return new Response(`DB error: ${e?.message}`, { status: 500 })
  }

  if (!note) return new Response('Nota non trovata', { status: 404 })
  if (!isAdmin && note.status !== 'APPROVED')
    return new Response('Contenuto non disponibile', { status: 403 })

  if (!isAdmin && note.price > 0) {
    let purchase
    try {
      purchase = await prisma.$queryRaw`
        SELECT id FROM "Purchase"
        WHERE "userId" = ${userId} AND "noteId" = ${noteId}
          AND ("purchaseStatus" IS NULL OR "purchaseStatus" = 'ACTIVE')
        LIMIT 1
      `
    } catch {
      try {
        // BUG-5 FIX: fallback must also filter by ACTIVE — without this a PENDING_RECEIPT purchase grants access
        purchase = await prisma.purchase.findFirst({ where: { userId, noteId, purchaseStatus: 'ACTIVE' }, select: { id: true } })
      } catch (e) {
        console.error('[stream] purchase lookup error:', e?.message)
      }
    }
    if (!purchase || (Array.isArray(purchase) && purchase.length === 0))
      return new Response('Acquisto richiesto', { status: 403 })
  }

  const s3     = getS3()
  const bucket = BUCKET()

  // Verifica esistenza oggetto prima di streammare
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: note.fileKey }))
  } catch (e) {
    console.error('[stream] HeadObject failed:', e?.Code, e?.message)
    return new Response(
      JSON.stringify({ error: `File non trovato in storage: ${e?.Code ?? e?.message}` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const obj  = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: note.fileKey }))
    const mime = note.mimeType ?? 'application/pdf'
    // transformToWebStream() converte SdkStreamMixin in ReadableStream Web API.
    // Se non disponibile (env non-Node), bufferizza come fallback.
    let stream
    if (typeof obj.Body?.transformToWebStream === 'function') {
      stream = obj.Body.transformToWebStream()
    } else if (typeof obj.Body?.transformToByteArray === 'function') {
      stream = await obj.Body.transformToByteArray()
    } else {
      stream = obj.Body
    }

    return new Response(stream, {
      headers: {
        'Content-Type':           mime,
        'Content-Disposition':    'inline',
        'Cache-Control':          'no-store, max-age=0',
        'X-Frame-Options':        'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (e) {
    console.error('[stream] GetObject failed:', e?.Code, e?.message)
    return new Response(
      JSON.stringify({ error: `Storage error: ${e?.Code ?? e?.message}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
