const { db } = require('../models/database')
const { getCuentaByNumero, getCuentaByUsuarioId } = require('../models/cuentaModel')
const { crearTransferencia, getTotalDiario} = require('../models/transferenciaModel')

const LIMITE_DIARIO = 7000
const SALDO_MAXIMO = 50000

const realizarTransferencia = async (req, res) => {
  try {
    const { cuentaDestino, monto, concepto } = req.body
    const { uid } = req.user
    const montoParseado = parseFloat(monto)
 
    const cuentaReceptor = await getCuentaByNumero(cuentaDestino)
    if (!cuentaReceptor) {
      return res.status(404).json({
        message: 'La cuenta destino no existe. Verifica el número e intenta de nuevo.',
      })
    }
 
    const cuentaEmisor = await getCuentaByUsuarioId(uid)
    if (!cuentaEmisor) {
      return res.status(404).json({ message: 'No se encontró la cuenta del usuario.' })
    }
 
    if (cuentaEmisor.numeroCuenta === cuentaDestino) {
      return res.status(400).json({
        message: 'No puedes transferir dinero a tu propia cuenta.',
      })
    }
 
    if (cuentaEmisor.saldo < montoParseado) {
      return res.status(400).json({
        message: 'Saldo insuficiente. No cuentas con fondos suficientes para esta transferencia.',
      })
    }
 
    const nuevoSaldoReceptor = cuentaReceptor.saldo + montoParseado
    if (nuevoSaldoReceptor > SALDO_MAXIMO) {
      return res.status(400).json({
        message: `La cuenta destino superaría el saldo máximo permitido de $${SALDO_MAXIMO.toLocaleString('es-MX')} MXN.`,
      })
    }
 
    const totalDiario = await getTotalDiario(cuentaEmisor.numeroCuenta)
    if (totalDiario + montoParseado > LIMITE_DIARIO) {
      const disponible = Math.max(0, LIMITE_DIARIO - totalDiario)
      return res.status(400).json({
        message: `Has alcanzado el límite de transferencias diario de $${LIMITE_DIARIO.toLocaleString('es-MX')} MXN. Monto disponible hoy: $${disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.`,
      })
    }
 
    const nuevoSaldoEmisor = cuentaEmisor.saldo - montoParseado
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
