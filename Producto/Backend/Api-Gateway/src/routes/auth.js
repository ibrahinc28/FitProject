const express = require('express')
const axios = require('axios')
const router = express.Router()

const BFF_USUARIOS_URL = process.env.BFF_USUARIOS_URL || 'http://localhost:8082'

router.post('/login', async (req, res) => {
  try {
    const { data } = await axios.post(`${BFF_USUARIOS_URL}/auth/login`, req.body, {
      headers: { 'Content-Type': 'application/json' },
    })
    res.json(data)
  } catch (err) {
    const status = err.response?.status ?? 500
    const message = err.response?.data ?? { error: 'Error de autenticación' }
    res.status(status).json(message)
  }
})

module.exports = router
