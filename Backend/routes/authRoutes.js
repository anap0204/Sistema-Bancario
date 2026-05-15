const { Router } = require('express')
const { login, logout } = require('../controllers/authController')
const { authMiddleware } = require('../controllers/roleMiddleware')

const router = Router()

router.post('/login', login)
router.post('/logout', authMiddleware, logout)

module.exports = router
