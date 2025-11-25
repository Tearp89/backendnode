const express = require('express')
const router = express.Router()

const carritoproducto = require('../controllers/carritoproducto.controller')
const Authorize = require('../middlewares/auth.middleware')

router.get('/', Authorize('Usuario,Administrador'), carritoproducto.getAll)
router.get('/:id', Authorize('Usuario,Administrador'), carritoproducto.getById)
router.post('/', Authorize('Usuario,Administrador'), carritoproducto.create)
router.put('/:id', Authorize('Usuario,Administrador'), carritoproducto.update)
router.delete('/:id', Authorize('Usuario,Administrador'), carritoproducto.delete)
module.exports = router
