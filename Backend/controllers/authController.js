const jwt = require('jsonwebtoken')
const { getUserByEmail, updateUsuario } = require('../models/usuarioModel')
const { verifyPassword } = require('../extraHelpers/hashHelper')
const { tokenBlacklist } = require('./roleMiddleware')

const JWT_SECRET = 'banco-up-secret-2024'

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' })
    }

    const usuario = await getUserByEmail(email)
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }

    if (usuario.cuentaBloqueada) {
      return res.status(403).json({ message: 'Cuenta bloqueada. Contacta al administrador.' })
    }

    const passwordValida = await verifyPassword(password, usuario.passwordHash)
    if (!passwordValida) {
      const intentos = (usuario.intentosFallidos || 0) + 1
      const update = { intentosFallidos: intentos }
      if (intentos >= 3) update.cuentaBloqueada = true
      await updateUsuario(usuario.id, update)
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }

    await updateUsuario(usuario.id, { intentosFallidos: 0 })

    const token = jwt.sign(
      { uid: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.status(200).json({
      token,
      user: {
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

const logout = (req, res) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    tokenBlacklist.add(token)
  }
  return res.status(200).json({ message: 'Sesión cerrada correctamente' })
}

module.exports = { login, logout }
