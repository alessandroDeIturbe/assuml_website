import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const events = await prisma.event.findMany({
    where:   { active: true },
    orderBy: { date: 'asc' },
  }).catch(() => [])
  return NextResponse.json(events)
}

export async function POST(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { title, tipo, luogo, date, description } = await req.json().catch(() => ({}))
  if (!title?.trim() || !date) return NextResponse.json({ error: 'Titolo e data obbligatori' }, { status: 422 })

  const event = await prisma.event.create({
    data: { title: title.trim(), tipo: tipo ?? 'Evento', luogo: luogo ?? null, date: new Date(date), description: description ?? null },
  })
  return NextResponse.json(event, { status: 201 })
}
