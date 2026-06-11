import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session
  // BUG-10 FIX: params è una Promise in Next.js 15
  const { id } = await params
  await prisma.convention.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
