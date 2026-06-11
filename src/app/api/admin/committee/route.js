// GET  /api/admin/committee — lista membri (pubblica, ordinata)
// POST /api/admin/committee — crea membro (solo admin)
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const members = await prisma.committeeMember.findMany({
    where:   { active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(members)
}

export async function POST(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { name, role, email, order } = await req.json().catch(() => ({}))
  if (!name?.trim() || !role?.trim())
    return NextResponse.json({ error: 'name e role obbligatori' }, { status: 422 })

  const member = await prisma.committeeMember.create({
    data: {
      name:  name.trim(),
      role:  role.trim(),
      email: email?.trim() || null,
      order: typeof order === 'number' ? order : 0,
    },
  })
  return NextResponse.json(member, { status: 201 })
}
