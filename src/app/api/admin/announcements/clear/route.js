// POST /api/admin/announcements/clear — disattiva tutti gli annunci attivi
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function POST(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  await prisma.announcement.updateMany({
    where: { active: true },
    data:  { active: false },
  })
  return NextResponse.json({ ok: true })
}
