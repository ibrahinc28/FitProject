const axios = require('axios')

const BFF_GESTION_URL  = process.env.BFF_GESTION_URL  || 'http://localhost:8081'
const BFF_USUARIOS_URL = process.env.BFF_USUARIOS_URL || 'http://localhost:8082'
const BFF_VENTAS_URL   = process.env.BFF_VENTAS_URL   || 'http://localhost:8083'

function makeProxy(baseUrl) {
  return async (req, res) => {
    try {
      const url = baseUrl + req.originalUrl
      const headers = {
        'content-type':  req.headers['content-type']  || 'application/json',
        'authorization': req.headers['authorization'] || '',
      }
      if (req.user) {
        headers['x-user-id']    = req.user.userId   || ''
        headers['x-user-role']  = req.user.role     || ''
        headers['x-user-email'] = req.user.email    || ''
      }

      const response = await axios({
        method:  req.method,
        url,
        headers,
        data:    req.body && Object.keys(req.body).length ? req.body : undefined,
        validateStatus: () => true,
      })

      res.status(response.status).json(response.data)
    } catch (err) {
      res.status(502).json({ error: 'Bad Gateway', detail: err.message })
    }
  }
}

const gestionProxy  = makeProxy(BFF_GESTION_URL)
const usuariosProxy = makeProxy(BFF_USUARIOS_URL)
const ventasProxy   = makeProxy(BFF_VENTAS_URL)

module.exports = { gestionProxy, usuariosProxy, ventasProxy }
