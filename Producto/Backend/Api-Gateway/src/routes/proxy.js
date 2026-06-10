const { createProxyMiddleware } = require('http-proxy-middleware')

const BFF_GESTION_URL  = process.env.BFF_GESTION_URL  || 'http://localhost:8081'
const BFF_USUARIOS_URL = process.env.BFF_USUARIOS_URL || 'http://localhost:8082'
const BFF_VENTAS_URL   = process.env.BFF_VENTAS_URL   || 'http://localhost:8083'

const addAuthHeader = (proxyReq, req) => {
  if (req.user) {
    proxyReq.setHeader('X-User-Id',   req.user.userId   || '')
    proxyReq.setHeader('X-User-Role', req.user.role     || '')
    proxyReq.setHeader('X-User-Email',req.user.email    || '')
  }
}

const gestionProxy = createProxyMiddleware({
  target: BFF_GESTION_URL,
  changeOrigin: true,
  on: { proxyReq: addAuthHeader },
})

const usuariosProxy = createProxyMiddleware({
  target: BFF_USUARIOS_URL,
  changeOrigin: true,
  on: { proxyReq: addAuthHeader },
})

const ventasProxy = createProxyMiddleware({
  target: BFF_VENTAS_URL,
  changeOrigin: true,
  on: { proxyReq: addAuthHeader },
})

module.exports = { gestionProxy, usuariosProxy, ventasProxy }
