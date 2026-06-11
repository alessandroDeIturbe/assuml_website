import { NextResponse } from 'next/server'
import { prisma }        from '@/lib/prisma'
import { requireAdmin }  from '@/lib/auth'

export async function GET(req, { params }) {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug } })
  return NextResponse.json(project?.content ?? {})
}

export async function PATCH(req, { params }) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { slug }  = await params
  const content   = await req.json().catch(() => ({}))

  const project = await prisma.project.upsert({
    where:  { slug },
    update: { content },
    create: { slug, content },
  })
  return NextResponse.json(project.content)
}
