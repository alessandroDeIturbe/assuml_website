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

  const item = await prisma.announcement.create({
    data: { title: title.trim(), body: body.trim(), authorId: session.user.id },
    select: { id: true, title: true, body: true, createdAt: true },
  })
  return NextResponse.json(item, { status: 201 })
}
