// DELETE /api/notes/delete?id=xxx — soft-delete (status → REJECTED)
// Solo admin. Il file MinIO non viene toccato.
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const noteId = new URL(req.url).searchParams.get('id')
  if (!noteId) return NextResponse.json({ error: 'id mancante' }, { status: 400 })

  const note = await prisma.note.findUnique({ where: { id: noteId }, select: { id: true } })
  if (!note) return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 })

  await prisma.note.update({
    where: { id: noteId },
    data:  { status: 'REJECTED', moderatedAt: new Date(), rejectNote: 'Rimosso dall\'admin' },
  })
  return NextResponse.json({ ok: true })
}
