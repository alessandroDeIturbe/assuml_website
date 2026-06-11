// POST — crea annuncio bacheca
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const items = await prisma.announcement.findMany({
    where:   { active: true },
    orderBy: { createdAt: 'desc' },
    select:  { id: true, title: true, body: true, createdAt: true },
  })
  return NextResponse.json(items)
}

export async function POST(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { title, body } = await req.json().catch(() => ({}))
  if (!title?.trim() || !body?.trim())
    return NextResponse.json({ error: 'Titolo e testo obbligatori' }, { status: 422 })

  // BUG-13: session.user.id con JWT può essere il sub Google, non il CUID DB.
  // Risolvi sempre dal DB per email per garantire la FK.
  const dbUser = await prisma.user.findUnique({
    where:  { email: session.user.email },
    select: { id: true },
  })
  if (!dbUser) return NextResponse.json({ error: 'Utente non trovato nel DB' }, { status: 500 })

  const item = await prisma.announcement.create({
    data: { title: title.trim(), body: body.trim(), authorId: dbUser.id },
    select: { id: true, title: true, body: true, createdAt: true },
  })
  return NextResponse.json(item, { status: 201 })
}
