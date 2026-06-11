// GET /api/notes/[id]/view — verifica accesso e restituisce metadata
// Il PDF non viene mai esposto come signed URL: il client usa /stream per riceverlo
// tramite proxy server-side (nessun URL MinIO nel network tab).
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { auth }         from '@/lib/auth'

const ADMIN_EMAIL = 'studenti@conservatorio.ch'

export async function GET(req, { params }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { id: noteId } = await params
  const userId  = session.user.id
  const isAdmin = session.user.isAdmin === true
               || session.user.email   === ADMIN_EMAIL
               || session.user.role    === 'ADMIN'

  const note = await prisma.note.findUnique({
    where:  { id: noteId },
    select: { id: true, title: true, status: true, price: true },
  })
  if (!note) return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 })

  if (!isAdmin && note.status !== 'APPROVED')
    return NextResponse.json({ error: 'Contenuto non disponibile' }, { status: 403 })

  if (!isAdmin && note.price > 0) {
    const purchase = await prisma.purchase.findFirst({
      where: { userId, noteId, purchaseStatus: 'ACTIVE' },
      select: { id: true },
    })
    if (!purchase) return NextResponse.json({ error: 'Acquisto richiesto' }, { status: 403 })
  }

  // Restituisce solo metadata — nessuna signed URL esposta al client
  return NextResponse.json({ noteTitle: note.title })
}
