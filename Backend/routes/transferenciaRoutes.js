const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../controllers/roleMiddleware')
const { realizarTransferencia } = require('../controllers/transferenciaController')

router.post('/', authMiddleware, realizarTransferencia)

module.exports = router
