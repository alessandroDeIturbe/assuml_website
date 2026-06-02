// GET — presigned GET URL (30s) per ProtectedNotesViewer
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { presignedGet } from '@/lib/minio'
import { auth }         from '@/lib/auth'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

export async function GET(req, { params }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { id: noteId } = params
  const userId  = session.user.id
  const isAdmin = session.user.isAdmin === true
               || session.user.email   === ADMIN_EMAIL
               || session.user.role    === 'ADMIN'

  const note = await prisma.note.findUnique({
    where:  { id: noteId },
    select: { id: true, fileKey: true, status: true, price: true },
  })
  if (!note) return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 })

  if (!isAdmin && note.status !== 'APPROVED')
    return NextResponse.json({ error: 'Contenuto non disponibile' }, { status: 403 })

  if (!isAdmin && note.price > 0) {
    const purchase = await prisma.purchase.findUnique({
      where:  { userId_noteId: { userId, noteId } },
      select: { id: true },
    })
    if (!purchase) return NextResponse.json({ error: 'Acquisto richiesto' }, { status: 403 })
  }

  try {
    const signedUrl = await presignedGet(note.fileKey, 60)
    return NextResponse.json({ signedUrl, expiresIn: 60 })
  } catch (e) {
    console.error('[view]', e?.message)
    return NextResponse.json({ error: `Storage error: ${e?.message}` }, { status: 502 })
  }
}
