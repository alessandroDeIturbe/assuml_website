// src/app/api/storage/proxy/route.js
// PUT — proxy server-side verso MinIO per upload da browser.
// Evita problemi CORS in sviluppo senza modificare config MinIO.
// Il client chiama: PUT /api/storage/proxy?key=notes/xxx.pdf&type=application%2Fpdf
// con il file nel body.

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

function devEndpoint() {
  const raw = process.env.MINIO_ENDPOINT ?? 'http://localhost:9000'
  if (process.env.NODE_ENV === 'development')
    return raw.replace(/http:\/\/[^:\/]+/, 'http://localhost')
  return raw
}

function getS3() {
  return new S3Client({
    endpoint:    devEndpoint(),
    region:      'us-east-1',
    credentials: {
      accessKeyId:     process.env.MINIO_ACCESS_KEY ?? 'assuml_admin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'supersecret',
    },
    forcePathStyle: true,
  })
}

const BUCKET = () => process.env.MINIO_BUCKET ?? 'assuml-notes'

export async function PUT(req) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const key         = searchParams.get('key')
  const contentType = searchParams.get('type') ?? 'application/octet-stream'

  if (!key) return NextResponse.json({ error: 'key mancante' }, { status: 400 })

  // Sicurezza: l'utente può caricare solo nella sua cartella
  const ownedPrefix = `notes/${session.user.id}/`
  if (!key.startsWith(ownedPrefix)) {
    return NextResponse.json({ error: 'Percorso non autorizzato' }, { status: 403 })
  }

  const body = await req.arrayBuffer()

  try {
    await getS3().send(new PutObjectCommand({
      Bucket:      BUCKET(),
      Key:         key,
      Body:        Buffer.from(body),
      ContentType: contentType,
    }))
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[proxy upload]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Upload fallito' }, { status: 502 })
  }
}
