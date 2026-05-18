const { Router } = require('express')
const { authMiddleware } = require('../controllers/roleMiddleware')
const { getSaldo, getHistorial } = require('../controllers/cuentaController')

const router = Router()

router.get('/saldo', authMiddleware, getSaldo)
router.get('/historial', authMiddleware, getHistorial)

module.exports = router
