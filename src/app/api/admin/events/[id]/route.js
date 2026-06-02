import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session
  await prisma.event.update({ where: { id: params.id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
