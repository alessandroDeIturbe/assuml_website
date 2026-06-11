// src/app/api/notes/upload/route.js
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { presignedPut } from '@/lib/minio'
import { auth } from '@/lib/auth'

const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

export async function POST(req) {
  // 1. Auth
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  // 2. Parse body
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Body non valido' }, { status: 400 }) }

  const { title, description = '', price = 0, currency = 'CHF', fileName, contentType } = body

  if (!title?.trim())               return NextResponse.json({ error: 'Titolo obbligatorio' }, { status: 422 })
  if (!fileName || !contentType)    return NextResponse.json({ error: 'fileName e contentType obbligatori' }, { status: 422 })
  if (!ALLOWED_TYPES.has(contentType)) return NextResponse.json({ error: 'Tipo file non supportato' }, { status: 422 })
  if (typeof price !== 'number' || price < 0) return NextResponse.json({ error: 'Prezzo non valido' }, { status: 422 })

  // 3. Risolvi CUID DB dalla email (BUG-13: session.user.id può non matchare User.id con JWT)
  const dbUser = await prisma.user.findUnique({
    where:  { email: session.user.email },
    select: { id: true },
  })
  if (!dbUser) return NextResponse.json({ error: 'Utente non trovato nel DB — rieffettua il login' }, { status: 401 })
  const dbUserId = dbUser.id

  // Object key univoco
  const ext     = fileName.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
  const fileKey = `notes/${dbUserId}/${nanoid(16)}.${ext}`

  // 4. Presigned PUT
  let uploadUrl
  try {
    uploadUrl = await presignedPut(fileKey, contentType, 300)
  } catch (e) {
    console.error('[upload] presignedPut error:', e?.message ?? e)
    return NextResponse.json(
      { error: `Errore storage: ${e?.message ?? 'verifica MINIO_ENDPOINT in .env'}` },
      { status: 502 }
    )
  }

  // 5. Crea record Note
  const note = await prisma.note.create({
    data: {
      title:       title.trim(),
      description: description.trim(),
      fileKey,
      mimeType:    contentType,
      price:       parseFloat(price.toFixed(2)),
      currency,
      status:      'PENDING_APPROVAL',
      authorId:    dbUserId,
    },
    select: { id: true, status: true },
  })

  // In sviluppo offre anche proxyUrl (same-origin, no CORS)
  const proxyUrl = process.env.NODE_ENV === 'development'
    ? `/api/storage/proxy?key=${encodeURIComponent(fileKey)}&type=${encodeURIComponent(contentType)}`
    : null

  return NextResponse.json({ noteId: note.id, uploadUrl, proxyUrl }, { status: 201 })
}
