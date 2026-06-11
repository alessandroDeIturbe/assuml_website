import { NextResponse } from 'next/server'
import { prisma }        from '@/lib/prisma'
import { requireAdmin }  from '@/lib/auth'

export async function PATCH(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { id } = await params
  const { titolo, corpo, order } = await req.json().catch(() => ({}))

  const data = {}
  if (titolo !== undefined) data.titolo = titolo.trim()
  if (corpo  !== undefined) data.corpo  = corpo.trim()
  if (order  !== undefined) data.order  = Number(order)

  const updated = await prisma.guidaSection.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { id } = await params
  await prisma.guidaSection.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
