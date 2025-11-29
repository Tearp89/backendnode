const router = require('express').Router()
const auth = require('../controllers/auth.controller')
const Authorize = require('../middlewares/auth.middleware')
const usuarios = require('../controllers/usuarios.controller')

// POST: api/auth
router.post('/', auth.login)

// GET: api/auth/tiempo
router.get('/tiempo', Authorize('Usuario,Administrador'), auth.tiempo)

router.post('/registro', usuarios.create)

module.exports = router
