// src/app/api/admin/notes/[id]/moderate/route.js
// PATCH — solo ADMIN. Body: { action: 'approve' | 'reject', reason?: string }

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const ACTION_MAP = {
  approve: 'APPROVED',
  reject:  'REJECTED',
}

export async function PATCH(req, { params }) {
  // 1. Auth admin
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { id: noteId } = await params

  // 2. Parse body
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Body non valido' }, { status: 400 }) }

  const { action, reason } = body

  if (!ACTION_MAP[action]) {
    return NextResponse.json({ error: 'action deve essere "approve" o "reject"' }, { status: 422 })
  }

  // 3. Verifica esistenza nota
  const note = await prisma.note.findUnique({ where: { id: noteId }, select: { id: true, status: true } })
  if (!note) return NextResponse.json({ error: 'Nota non trovata' }, { status: 404 })

  // 4. Aggiorna status
  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      status:      ACTION_MAP[action],
      moderatedAt: new Date(),
      rejectNote:  action === 'reject' ? (reason?.trim() ?? null) : null,
    },
    select: { id: true, status: true, moderatedAt: true },
  })

  return NextResponse.json(updated)
}
