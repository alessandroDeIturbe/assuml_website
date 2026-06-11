// src/app/api/storage/proxy/route.js
// PUT — proxy server-side verso MinIO per upload da browser.
// Passa req.body come ReadableStream al SDK S3 — evita di bufferizzare
// file grandi (> 4 MB) in memoria e previene "Unexpected end of JSON input"
// causato dall'OOM / timeout del vecchio approccio arrayBuffer().

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
    forcePathStyle:          true,
    // Aumenta il timeout per file grandi (default 0 = nessun timeout SDK)
    requestHandler: undefined,
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

  const ownedPrefix = `notes/${session.user.id}/`
  if (!key.startsWith(ownedPrefix))
    return NextResponse.json({ error: 'Percorso non autorizzato' }, { status: 403 })

  try {
    // BUG-8 FIX: AWS SDK v3 non può calcolare l'hash SHA-256 di una Web ReadableStream
    // ("Unable to calculate hash for flowing readable stream") perché richiederebbe di
    // consumare lo stream prima di inviarlo. Soluzione: bufferizzare con arrayBuffer().
    // Per PDF notes (tipicamente < 50 MB) il consumo di memoria è accettabile.
    const buf = Buffer.from(await req.arrayBuffer())

    await getS3().send(new PutObjectCommand({
      Bucket:        BUCKET(),
      Key:           key,
      Body:          buf,
      ContentType:   contentType,
      ContentLength: buf.byteLength,   // esplicito: evita chunked transfer su MinIO
    }))

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    console.error('[proxy upload]', e?.Code ?? e?.name, e?.message, e?.$metadata)
    return NextResponse.json(
      { error: e?.message ?? 'Upload fallito' },
      { status: 502 }
    )
  }
}
