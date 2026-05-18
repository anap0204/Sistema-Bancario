const { db } = require('./database')

// no opcion de actualizar o eliminar para transferencias, solo crear y consultar total diario
// asi se mantiene inmutabilidad y trazabilidad de las transferencias
const crearTransferencia = async (datos) => {
  const docRef = db.collection('transferencias').doc()
  const id = docRef.id
  await docRef.set({ ...datos, IdTransferencia: id })
  return id
}

const getTotalDiario = async (numeroCuentaEmisora) => {
  const ahora = new Date()
  // Inicio del día en UTC (00:00:00.000Z)
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

module.exports = { crearTransferencia, getTotalDiario }
