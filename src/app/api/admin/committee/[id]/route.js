// PATCH  /api/admin/committee/[id] — aggiorna membro
// DELETE /api/admin/committee/[id] — disattiva membro (soft delete)
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { id } = await params
  const body   = await req.json().catch(() => ({}))
  const data   = {}

  if (body.name  !== undefined) data.name  = body.name.trim()
  if (body.role  !== undefined) data.role  = body.role.trim()
  if (body.email !== undefined) data.email = body.email?.trim() || null
  if (body.order !== undefined) data.order = Number(body.order)

  const member = await prisma.committeeMember.update({ where: { id }, data })
  return NextResponse.json(member)
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { id } = await params
  await prisma.committeeMember.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
