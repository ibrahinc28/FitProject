const express = require('express')
const passport = require('./config/passport')
const { requireAuth } = require('./middleware/auth')
const authRouter = require('./routes/auth')
const { gestionProxy, usuariosProxy, ventasProxy } = require('./routes/proxy')

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(passport.initialize())

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }))

// Public: auth endpoints
app.use('/auth', authRouter)

// Protected: proxy to BFFs
app.use('/api/v1/projects',   requireAuth, gestionProxy)
app.use('/api/v1/evidence',   requireAuth, gestionProxy)
app.use('/api/v1/steps',      requireAuth, gestionProxy)
app.use('/api/v1/dashboard',  requireAuth, gestionProxy)
app.use('/api/v1/users',      requireAuth, usuariosProxy)
app.use('/api/v1/sales',      requireAuth, ventasProxy)
app.use('/api/v1/units',      requireAuth, ventasProxy)

app.listen(PORT, () => {
  console.log(`[Api-Gateway] Listening on port ${PORT}`)
})

module.exports = app
