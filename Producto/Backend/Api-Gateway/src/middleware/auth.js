const passport = require('../config/passport')

const requireAuth = passport.authenticate('jwt', { session: false })

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acceso denegado para el rol: ' + req.user.role })
  }
  next()
}

module.exports = { requireAuth, requireRole }
