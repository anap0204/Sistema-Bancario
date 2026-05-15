const { db } = require('./database')

const getUserByEmail = async (email) => {
  const snapshot = await db.collection('usuarios').where('email', '==', email).limit(1).get()
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}

const updateUsuario = async (id, data) => {
  await db.collection('usuarios').doc(id).update(data)
}

module.exports = { getUserByEmail, updateUsuario }
