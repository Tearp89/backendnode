const express = require('express')
const router = express.Router()

const carrito = require('../controllers/carrito.controller')
const Authorize = require('../middlewares/auth.middleware')

router.get('/', Authorize('Usuario,Administrador'), carrito.get)

router.patch('/', Authorize('Usuario,Administrador'), carrito.checkout)


router.post('/items', Authorize('Usuario,Administrador'), carrito.addItem)

router.put('/items/:id', Authorize('Usuario,Administrador'), carrito.updateItem)

router.delete('/items/:id', Authorize('Usuario,Administrador'), carrito.removeItem)
router.delete('/', Authorize('Usuario,Administrador'), carrito.clear)

module.exports = router
