import { NextResponse } from 'next/server'
import { requireAdmin }  from '@/lib/auth'
import { listObjects }   from '@/lib/minio'

export async function GET(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { searchParams } = new URL(req.url)
  const prefix = searchParams.get('prefix') ?? ''

  try {
    const objects = await listObjects(prefix, 500)
    return NextResponse.json(objects)
  } catch (e) {
    console.error('[admin/storage]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Errore MinIO' }, { status: 502 })
  }
}
