const { db } = require('./database')

const crearTransferencia = async (datos) => {
  const docRef = db.collection('transferencias').doc()
  const id = docRef.id
  await docRef.set({ ...datos, IdTransferencia: id })
  return id
}

module.exports = { crearTransferencia }
