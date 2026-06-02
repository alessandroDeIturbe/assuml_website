// GET /api/notes/[id]/stream
// Proxy server-side: recupera il PDF da MinIO e lo trasferisce al browser.
// Risolve CORS e "connessione negata localhost" perché il browser scarica
// da localhost:3000 (same-origin) invece che da localhost:9000.

import { auth }           from '@/lib/auth'
import { prisma }         from '@/lib/prisma'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { S3Client }       from '@aws-sdk/client-s3'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

function getS3() {
  const raw = process.env.MINIO_ENDPOINT ?? 'http://localhost:9000'
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

export async function GET(req, { params }) {
  const session = await auth()
  if (!session?.user) return new Response('Non autenticato', { status: 401 })

  const { id: noteId } = params
  const userId  = session.user.id
  const isAdmin = session.user.isAdmin || session.user.email === ADMIN_EMAIL

  const note = await prisma.note.findUnique({
    where:  { id: noteId },
    select: { fileKey: true, status: true, price: true, mimeType: true },
  })
  if (!note) return new Response('Nota non trovata', { status: 404 })
  if (!isAdmin && note.status !== 'APPROVED')
    return new Response('Contenuto non disponibile', { status: 403 })

  // Verifica accesso
  if (!isAdmin && note.price > 0) {
    const purchase = await prisma.purchase.findUnique({
      where:  { userId_noteId: { userId, noteId } },
      select: { id: true, purchaseStatus: true },
    })
    if (!purchase || purchase.purchaseStatus !== 'ACTIVE')
      return new Response('Acquisto non verificato', { status: 403 })
  }

  // Recupera da MinIO e streamma
  try {
    const cmd  = new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET ?? 'assuml-notes',
      Key:    note.fileKey,
    })
    const obj  = await getS3().send(cmd)
    const body = obj.Body

    // Converti in ReadableStream Web
    const stream = body.transformToWebStream?.() ?? body

    return new Response(stream, {
      headers: {
        'Content-Type':        note.mimeType ?? 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control':       'no-store, max-age=0',
        // Impedisce embedding in iframe di altri siti
        'X-Frame-Options':     'SAMEORIGIN',
        // Niente download
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (e) {
    console.error('[stream]', e?.message)
    return new Response(`Storage error: ${e?.message}`, { status: 502 })
  }
}
