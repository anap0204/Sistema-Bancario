const { Router } = require('express')
const { authMiddleware, requireRole } = require('../controllers/roleMiddleware')

const router = Router()


router.get(
  '/usuarios',
  authMiddleware,
  requireRole('admin'),
  (req, res) => res.status(501).json({ message: 'Pendiente' })
)

router.patch(
  '/usuario/:id/bloqueo',
  authMiddleware,
  requireRole('admin'),
  (req, res) => res.status(501).json({ message: 'Pendiente' })
)

module.exports = router