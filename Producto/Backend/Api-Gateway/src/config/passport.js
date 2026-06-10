const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')

const JWT_SECRET = process.env.JWT_SECRET || 'fitproject-secret-key-must-be-at-least-32-chars-long'

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
    algorithms: ['HS256', 'HS384', 'HS512'],
  },
  (payload, done) => {
    if (!payload) return done(null, false)
    return done(null, {
      userId: payload.userId,
      email: payload.sub,
      fullName: payload.fullName,
      role: payload.role,
    })
  }
))

module.exports = passport
