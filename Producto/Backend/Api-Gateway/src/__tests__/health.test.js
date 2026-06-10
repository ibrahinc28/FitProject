const request = require('supertest')
const app = require('../index')

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('api-gateway')
  })
})

describe('POST /auth/login — missing body', () => {
  it('proxies to BFF and handles error gracefully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: '', password: '' })
    expect([400, 401, 500, 503]).toContain(res.status)
  })
})
