const express = require('express')
const router = express.Router()

const pedidos = require('../controllers/pedido.controller')
const Authorize = require('../middlewares/auth.middleware')

// Pedidos del usuario logueado
// GET /api/pedidos
router.get('/', Authorize('Usuario,Administrador'), pedidos.getMyOrders)

// Detalle de un pedido (solo si es suyo)
router.get('/:id', Authorize('Usuario,Administrador'), pedidos.getById)

// Todos los pedidos (solo admin)
router.get('/admin/todos', Authorize('Administrador'), pedidos.getAll)

module.exports = router
