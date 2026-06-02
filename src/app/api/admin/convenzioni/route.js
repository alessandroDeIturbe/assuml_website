import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const items = await prisma.convention.findMany({
    where:   { active: true },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])
  return NextResponse.json(items)
}

export async function POST(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { title, subtitle, imageKey } = await req.json().catch(() => ({}))
  if (!title?.trim()) return NextResponse.json({ error: 'Titolo obbligatorio' }, { status: 422 })

  const item = await prisma.convention.create({
    data: { title: title.trim(), subtitle: subtitle?.trim() ?? null, imageKey: imageKey ?? null },
  })
  return NextResponse.json(item, { status: 201 })
}
