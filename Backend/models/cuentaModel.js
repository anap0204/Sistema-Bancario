const { db } = require('./database')

const getCuentaByNumero = async (numeroCuenta) => {
  const doc = await db.collection('cuentas').doc(numeroCuenta).get()
  if (!doc.exists) return null
  return { docId: doc.id, ...doc.data() }
}

const getCuentaByUsuarioId = async (uid) => {
  const snapshot = await db.collection('cuentas').where('idUsuario', '==', uid).limit(1).get()
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { docId: doc.id, ...doc.data() }
}

const actualizarSaldo = async (docId, nuevoSaldo) => {
  await db.collection('cuentas').doc(docId).update({ saldo: nuevoSaldo })
}

const getCuentaByUid = getCuentaByUsuarioId

module.exports = { getCuentaByNumero, getCuentaByUsuarioId, getCuentaByUid, actualizarSaldo }
