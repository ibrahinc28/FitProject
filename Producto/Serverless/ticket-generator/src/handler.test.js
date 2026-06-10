const { handler } = require('./handler')

describe('ticket-generator Lambda', () => {
  it('returns 200 with base64 PDF for valid payload', async () => {
    const event = {
      saleId: 'SALE-001',
      modelName: 'FitPro',
      buyerName: 'Juan García',
      buyerEmail: 'juan@test.com',
      salePrice: 50000,
      saleDate: '2026-01-15T00:00:00Z',
    }
    const result = await handler(event)
    expect(result.statusCode).toBe(200)
    const body = JSON.parse(result.body)
    expect(body.saleId).toBe('SALE-001')
    expect(typeof body.ticketPdfBase64).toBe('string')
    expect(body.ticketPdfBase64.length).toBeGreaterThan(0)
  })

  it('returns 400 when required fields missing', async () => {
    const result = await handler({ buyerName: 'Juan' })
    expect(result.statusCode).toBe(400)
    const body = JSON.parse(result.body)
    expect(body.error).toContain('Missing required fields')
  })
})