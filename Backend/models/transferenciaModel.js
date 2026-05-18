const { db } = require('./database')

// no opcion de actualizar o eliminar para transferencias, solo crear y consultar total diario
// asi se mantiene inmutabilidad y trazabilidad de las transferencias
const crearTransferencia = async (datos) => {
  const docRef = db.collection('transferencias').doc()
  const id = docRef.id
  await docRef.set({ ...datos, IdTransferencia: id })
  return id
}

const getMovimientosByNumeroCuenta = async (numeroCuenta) => {
  const [emisorSnap, receptorSnap] = await Promise.all([
    db.collection('transferencias').where('CuentaEmisora', '==', numeroCuenta).get(),
    db.collection('transferencias').where('CuentaReceptora', '==', numeroCuenta).get()
  ])
  const docs = [
    ...emisorSnap.docs.map(d => d.data()),
    ...receptorSnap.docs.map(d => d.data())
  ]
  docs.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))
  return docs
}

const getTotalDiario = async (numeroCuentaEmisora) => {
  const ahora = new Date()
  const inicioDia = new Date(
    Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate())
  )

  const snapshot = await db
    .collection('transferencias')
    .where('CuentaEmisora', '==', numeroCuentaEmisora)
    .get()
 
  let total = 0
  snapshot.forEach((doc) => {
    const fechaDoc = new Date(doc.data().Fecha)
    // Solo contar transferencias de hoy
    if (fechaDoc >= inicioDia) {
      total += parseFloat(doc.data().Importe || 0)
    }
  })
  return total
}

module.exports = { crearTransferencia, getMovimientosByNumeroCuenta, getTotalDiario }
