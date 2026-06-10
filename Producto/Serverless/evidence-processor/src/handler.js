/**
 * AWS Lambda handler — triggered by S3 PutObject events on the evidence bucket.
 * In production: validates image, generates thumbnail, stores metadata.
 *
 * S3 event trigger (configured in AWS console or serverless.yml):
 *   Bucket: fit-evidence-bucket
 *   Events: s3:ObjectCreated:*
 */
exports.handler = async (event) => {
  const records = event.Records || []

  const processed = []

  for (const record of records) {
    const bucket = record.s3?.bucket?.name
    const key = decodeURIComponent(record.s3?.object?.key?.replace(/\+/g, ' ') || '')
    const size = record.s3?.object?.size

    if (!bucket || !key) {
      console.warn('Skipping record with missing bucket/key:', record)
      continue
    }

    console.log(`Processing evidence image: s3://${bucket}/${key} (${size} bytes)`)

    const result = await processEvidence({ bucket, key, size })
    processed.push(result)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      processedCount: processed.length,
      results: processed,
    }),
  }
}

async function processEvidence({ bucket, key, size }) {
  // In production:
  // 1. Download image from S3
  // 2. Validate: check MIME type, file size limits
  // 3. Generate 200x200 thumbnail (e.g. with sharp library)
  // 4. Upload thumbnail to s3://fit-evidence-bucket/thumbnails/<key>
  // 5. Notify MS-Gestion via HTTP to update evidenceUrl

  const isValid = isValidImage(key)
  const thumbnailKey = `thumbnails/${key}`

  console.log(`[evidence-processor] validated=${isValid} thumbnail=${thumbnailKey}`)

  return {
    bucket,
    originalKey: key,
    thumbnailKey,
    valid: isValid,
    sizeBytes: size,
    processedAt: new Date().toISOString(),
  }
}

function isValidImage(key) {
  const ext = key.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')
}