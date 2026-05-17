const { getAllUsuarios, updateUsuario } = require('../models/usuarioModel')

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await getAllUsuarios()
    return res.status(200).json({ usuarios })
  } catch (error) {
    console.error('Error en getUsuarios:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

const toggleBloqueo = async (req, res) => {
  try {
    const { id } = req.params
    const { bloqueado } = req.body

    if (typeof bloqueado !== 'boolean') {
      return res.status(400).json({ message: 'El campo "bloqueado" es requerido y debe ser booleano' })
    }

    const update = { cuentaBloqueada: bloqueado }
    if (!bloqueado) {
      update.intentosFallidos = 0
    }

    await updateUsuario(id, update)

    const accion = bloqueado ? 'bloqueada' : 'desbloqueada'
    return res.status(200).json({ message: `Cuenta ${accion} exitosamente` })
  } catch (error) {
    console.error('Error en toggleBloqueo:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

module.exports = { getUsuarios, toggleBloqueo }