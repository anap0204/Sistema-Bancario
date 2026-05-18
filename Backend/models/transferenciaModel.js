const { db } = require('./database')

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

module.exports = { crearTransferencia, getMovimientosByNumeroCuenta }
