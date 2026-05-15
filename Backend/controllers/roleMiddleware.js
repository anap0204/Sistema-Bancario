const jwt = require('jsonwebtoken')

const JWT_SECRET = 'banco-up-secret-2024'
const tokenBlacklist = new Set()

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token inválido' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { uid: decoded.uid, email: decoded.email, rol: decoded.rol }
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' })
  }
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ message: 'Acceso denegado: rol insuficiente' })
  }
  next()
}

module.exports = { authMiddleware, requireRole, tokenBlacklist }
