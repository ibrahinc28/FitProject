const { handler } = require('./handler')

const makeS3Event = (key, size = 1024) => ({
  Records: [{
    s3: {
      bucket: { name: 'fit-evidence-bucket' },
      object: { key, size },
    },
  }],
})

describe('evidence-processor Lambda', () => {
  it('processes a valid JPG image record', async () => {
    const event = makeS3Event('projects/p1/evidence.jpg', 204800)
    const result = await handler(event)
    expect(result.statusCode).toBe(200)
    const body = JSON.parse(result.body)
    expect(body.processedCount).toBe(1)
    expect(body.results[0].valid).toBe(true)
    expect(body.results[0].thumbnailKey).toBe('thumbnails/projects/p1/evidence.jpg')
  })

  it('marks non-image files as invalid', async () => {
    const event = makeS3Event('uploads/document.pdf', 512000)
    const result = await handler(event)
    const body = JSON.parse(result.body)
    expect(body.results[0].valid).toBe(false)
  })

  it('handles empty Records array gracefully', async () => {
    const result = await handler({ Records: [] })
    expect(result.statusCode).toBe(200)
    const body = JSON.parse(result.body)
    expect(body.processedCount).toBe(0)
  })

  it('skips records with missing s3 data', async () => {
    const result = await handler({ Records: [{}] })
    expect(result.statusCode).toBe(200)
    const body = JSON.parse(result.body)
    expect(body.processedCount).toBe(0)
  })
})