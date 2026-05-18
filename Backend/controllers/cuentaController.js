const { db } = require('../models/database')
const { getCuentaByUsuarioId } = require('../models/cuentaModel')
const { getMovimientosByNumeroCuenta } = require('../models/transferenciaModel')

const getSaldo = async (req, res) => {
  try {
    const { uid } = req.user
    const cuenta = await getCuentaByUsuarioId(uid)
    if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' })

    const usuarioDoc = await db.collection('usuarios').doc(uid).get()
    const nombreCompleto = usuarioDoc.exists ? usuarioDoc.data().nombreCompleto : ''

    return res.status(200).json({
      saldo: cuenta.saldo.toFixed(2),
      numeroCuenta: cuenta.numeroCuenta,
      nombreCompleto
    })
  } catch (error) {
    console.error('Error en getSaldo:', error)
    return res.status(500).json({ message: 'Error al obtener saldo' })
  }
}

const getHistorial = async (req, res) => {
  try {
    const { uid } = req.user
    const cuenta = await getCuentaByUsuarioId(uid)
    if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' })

    const { numeroCuenta } = cuenta
    const rawMovimientos = await getMovimientosByNumeroCuenta(numeroCuenta)

    const movimientos = rawMovimientos.map(doc => ({
      id: doc.IdTransferencia,
      fecha: doc.Fecha,
      concepto: doc.Concepto,
      monto: parseFloat(doc.Importe).toFixed(2),
      tipo: doc.CuentaEmisora === numeroCuenta ? 'envío' : 'depósito',
      otraCuenta: doc.CuentaEmisora === numeroCuenta ? doc.CuentaReceptora : doc.CuentaEmisora,
      otroActor: doc.NombreEmisor
    }))

    return res.status(200).json(movimientos)
  } catch (error) {
    console.error('Error en getHistorial:', error)
    return res.status(500).json({ message: 'Error al obtener historial' })
  }
}

module.exports = { getSaldo, getHistorial }
