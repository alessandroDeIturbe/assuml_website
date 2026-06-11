// DELETE /api/admin/announcements/[id] — disattiva un annuncio (active: false)
// PATCH  /api/admin/announcements/[id] — riattiva (active: true)
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session
  // BUG-10 FIX: params è una Promise in Next.js 15
  const { id } = await params
  await prisma.announcement.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session
  // BUG-10 FIX: params è una Promise in Next.js 15
  const { id } = await params
  await prisma.announcement.update({ where: { id }, data: { active: true } })
  return NextResponse.json({ ok: true })
}
