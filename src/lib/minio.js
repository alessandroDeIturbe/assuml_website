// src/lib/minio.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const BUCKET = () => process.env.MINIO_BUCKET ?? 'assuml-notes'

/**
 * Endpoint effettivo da usare per le connessioni server → MinIO.
 * In dev forziamo sempre localhost:9000 perché Next.js gira fuori da Docker
 * e l'hostname "storage" non è risolvibile dall'host Mac.
 */
function resolveEndpoint() {
  const raw = process.env.MINIO_ENDPOINT ?? 'http://localhost:9000'
  if (process.env.NODE_ENV === 'development') {
    // Sostituisce qualsiasi hostname Docker interno con localhost
    return raw.replace(/http:\/\/[^:\/]+/, 'http://localhost')
  }
  return raw
}

function getS3() {
  return new S3Client({
    endpoint:    resolveEndpoint(),
    region:      'us-east-1',
    credentials: {
      accessKeyId:     process.env.MINIO_ACCESS_KEY ?? 'assuml_admin',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'supersecret',
    },
    forcePathStyle: true,
  })
}

/**
 * Le presigned URL generate dall'SDK contengono l'endpoint usato nella firma.
 * In dev riscriviamo l'host per renderle raggiungibili dal browser.
 */
function devRewriteUrl(url) {
  if (process.env.NODE_ENV !== 'development') return url
  try {
    const u = new URL(url)
    if (u.hostname !== 'localhost') {
      u.hostname = 'localhost'
      u.port     = '9000'
      u.protocol = 'http:'
    }
    return u.toString()
  } catch { return url }
}

/** Presigned PUT — upload diretto da browser (default 5 min) */
export async function presignedPut(key, contentType, expiresIn = 300) {
  const url = await getSignedUrl(
    getS3(),
    new PutObjectCommand({ Bucket: BUCKET(), Key: key, ContentType: contentType }),
    { expiresIn }
  )
  return devRewriteUrl(url)
}

/** Presigned GET — visualizzazione protetta (default 60s) */
export async function presignedGet(key, expiresIn = 60) {
  const url = await getSignedUrl(
    getS3(),
    new GetObjectCommand({ Bucket: BUCKET(), Key: key }),
    { expiresIn }
  )
  return devRewriteUrl(url)
}
