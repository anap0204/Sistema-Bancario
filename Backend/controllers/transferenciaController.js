const { db } = require('../models/database')
const { getCuentaByNumero, getCuentaByUsuarioId } = require('../models/cuentaModel')
const { crearTransferencia } = require('../models/transferenciaModel')

const realizarTransferencia = async (req, res) => {
  try {
    const { cuentaDestino, monto, concepto } = req.body
    const { uid } = req.user
    const montoParseado = parseFloat(monto)

    const cuentaEmisor = await getCuentaByUsuarioId(uid)
    const cuentaReceptor = await getCuentaByNumero(cuentaDestino)

    const nuevoSaldoEmisor = cuentaEmisor.saldo - montoParseado
    const nuevoSaldoReceptor = cuentaReceptor.saldo + montoParseado

    const usuarioDoc = await db.collection('usuarios').doc(uid).get()
    const nombreEmisor = usuarioDoc.exists ? usuarioDoc.data().nombreCompleto : ''

    const batch = db.batch()
    batch.update(db.collection('cuentas').doc(cuentaEmisor.docId), { saldo: nuevoSaldoEmisor })
    batch.update(db.collection('cuentas').doc(cuentaReceptor.docId), { saldo: nuevoSaldoReceptor })
    await batch.commit()

    const datos = {
      Fecha: new Date().toISOString(),
      Concepto: concepto,
      CuentaEmisora: cuentaEmisor.numeroCuenta,
      CuentaReceptora: cuentaDestino,
      NombreEmisor: nombreEmisor,
      Importe: montoParseado.toFixed(2),
      TipoEmisor: 'envío',
      TipoReceptor: 'depósito',
    }

    const idTransferencia = await crearTransferencia(datos)

    return res.status(201).json({
      message: 'Transferencia realizada con éxito',
      transferencia: {
        IdTransferencia: idTransferencia,
        Fecha: datos.Fecha,
        Importe: datos.Importe,
        CuentaReceptora: cuentaDestino,
        Concepto: concepto,
      },
    })
  } catch (error) {
    console.error('Error en transferencia:', error)
    return res.status(500).json({ message: 'Error al procesar la transferencia' })
  }
}

module.exports = { realizarTransferencia }
