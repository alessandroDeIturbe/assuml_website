import { NextResponse } from 'next/server'
import { requireAdmin }  from '@/lib/auth'
import { presignedGet }  from '@/lib/minio'

export async function GET(req) {
  const session = await requireAdmin()
  if (session instanceof Response) return session

  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key mancante' }, { status: 400 })

  try {
    const url = await presignedGet(key, 120) // 2 min TTL per admin
    return NextResponse.json({ url })
  } catch (e) {
    return NextResponse.json({ error: e?.message ?? 'Errore' }, { status: 502 })
  }
}
