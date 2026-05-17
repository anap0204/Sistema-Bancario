const { Router } = require('express')
const { authMiddleware, requireRole } = require('../controllers/roleMiddleware')
const { getUsuarios, toggleBloqueo } = require('../controllers/adminController')

const router = Router()


router.get(
  '/usuarios',
  authMiddleware,
  requireRole('admin'),
  getUsuarios
)
 
router.patch(
  '/usuario/:id/bloqueo',
  authMiddleware,
  requireRole('admin'),
  toggleBloqueo
)

module.exports = router