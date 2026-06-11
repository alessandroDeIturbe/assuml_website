import { NextResponse } from 'next/server'
import { prisma }        from '@/lib/prisma'
import { requireAdmin }  from '@/lib/auth'

export async function GET() {
  const sections = await prisma.guidaSection.findMany({
    where:   { active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(sections)
}

export async function POST(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { titolo, corpo, order = 0 } = await req.json().catch(() => ({}))
  if (!titolo?.trim() || !corpo?.trim())
    return NextResponse.json({ error: 'Titolo e corpo obbligatori' }, { status: 422 })

  const section = await prisma.guidaSection.create({
    data: { titolo: titolo.trim(), corpo: corpo.trim(), order: Number(order) },
  })
  return NextResponse.json(section, { status: 201 })
}
